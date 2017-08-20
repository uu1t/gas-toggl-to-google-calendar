interface TimeEntry {
  description: string;
  duration: number;
  id: number;
  pid?: number;
  start: string;
  tags?: string[];
  wid: number;
}

interface Project {
  cid: number;
  id: number;
  name: string;
}

class Toggl {
  static BASE_URL = 'https://www.toggl.com/api/v8/';
  projects: { [key: number]: Project } = {};

  static entryIsRunning(entry: TimeEntry): boolean {
    return entry.duration < 0;
  }

  static entryHasTag(entry: TimeEntry, needle: string): boolean {
    if (entry.tags) {
      for (const tag of entry.tags) {
        if (tag === needle) {
          return true;
        }
      }
    }
    return false;
  }

  constructor(public token: string) {
  }

  getTimeEntries(startTime: Date, endTime: Date): TimeEntry[] {
    const path = `time_entries`
      + `?start_date=${encodeURIComponent(startTime.toISOString())}`
      + `&end_date=${encodeURIComponent(endTime.toISOString())}`;

    const entries: TimeEntry[] = JSON.parse(this.request('get', path));
    Logger.log({ entries, message: 'got time entries' });
    return entries;
  }

  getProject(pid: number): Project {
    if (this.projects[pid]) {
      return this.projects[pid];
    }
    const path = `projects/${pid}`;
    const project: { data: Project } = JSON.parse(this.request('get', path));
    Logger.log({ project, message: 'got project' });
    this.projects[pid] = project.data;
    return project.data;
  }

  addTagToTimeEntries(tag: string, entries: TimeEntry[]) {
    const path = 'time_entries/' + entries.map(entry => entry.id).join(',');
    const payload = JSON.stringify({
      time_entry: {
        tags: [tag],
        tag_action: 'add',
      },
    });
    this.request('put', path, payload);
  }

  private request(method: string, path: string, payload?: string): string {
    const url = Toggl.BASE_URL + path;
    const params = {
      method,
      payload,
      contentType: 'application/json',
      headers: {
        Authorization: 'Basic ' + Utilities.base64Encode(`${this.token}:api_token`),
      },
    };
    Logger.log({ url, method, payload, message: 'fetching URL...' });
    return UrlFetchApp.fetch(url, params).getContentText();
  }
}

class TogglToGoogleCalendar {
  toggl: Toggl;
  calendar: GoogleAppsScript.Calendar.Calendar;

  titleFn: (entry: TimeEntry) => string = (entry) => {
    let title = entry.description;
    if (entry.pid) {
      title += ` [${this.toggl.getProject(entry.pid).name}]`;
    }
    return title;
  }

  constructor(public togglAPIToken: string, public calendarID: string) {
    this.toggl = new Toggl(togglAPIToken);
    this.calendar = CalendarApp.getCalendarById(calendarID);
  }

  run(startTime: Date, endTime: Date, syncedEntryTag: string) {
    const entries = this.toggl.getTimeEntries(startTime, endTime);
    const syncedEntries: TimeEntry[] = [];
    for (const entry of entries) {
      if (Toggl.entryIsRunning(entry) || Toggl.entryHasTag(entry, syncedEntryTag)) {
        continue;
      }
      const title = this.titleFn(entry);
      const startTime = new Date(entry.start);
      const endTime = new Date(startTime.getTime() + entry.duration * 1000);
      Logger.log({ title, startTime, endTime, message: 'creating calendar event...' });
      this.calendar.createEvent(title, startTime, endTime);
      syncedEntries.push(entry);
    }
    if (syncedEntries.length > 0) {
      Logger.log({ message: 'adding tag...' });
      this.toggl.addTagToTimeEntries(syncedEntryTag, syncedEntries);
    }
  }
}

function main() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const togglAPIToken = scriptProperties.getProperty('TOGGL_API_TOKEN');
  const calendarID = scriptProperties.getProperty('CALENDAR_ID');
  const syncedEntryTag = scriptProperties.getProperty('SYNCED_ENTRY_TAG');

  const now = new Date();
  const startTime = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1); // 1 day ago
  new TogglToGoogleCalendar(togglAPIToken, calendarID).run(startTime, now, syncedEntryTag);
}
