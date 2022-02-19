const baseUrl = 'https://api.track.toggl.com/api/v8/';

export interface Project {
  id: number;
  name: string;
}

interface TimeEntryJSON {
  id: number;
  description: string;
  pid?: number;
  start: string;
  stop?: string;
  duration: number;
}

export class TimeEntry implements TimeEntryJSON {
  constructor(
    public id: number,
    public description: string,
    public start: string,
    public duration: number,
    public stop?: string,
    public pid?: number,
    // populated
    public project?: Project
  ) {}

  get startTime(): Date {
    return new Date(this.start);
  }

  get endTime(): Date {
    return new Date(this.stop!);
  }

  get title(): string {
    return this.description + (this.project ? ` [${this.project!.name}]` : '');
  }

  get isRunning(): boolean {
    return this.duration < 0;
  }

  static fromJSON(json: TimeEntryJSON): TimeEntry {
    const entry = Object.create(TimeEntry.prototype);
    for (const key in json) {
      entry[key] = (json as any)[key];
    }
    return entry;
  }
}

export class Client {
  projects: { [key: number]: Project } = {};

  constructor(public token: string) {}

  getProject(pid: number): Project {
    if (this.projects[pid]) {
      return this.projects[pid];
    }
    const path = `projects/${pid}`;
    const { data } = this.get<{ data: Project }>(path);
    this.projects[pid] = data;
    return data;
  }

  getTimeEntries(startTime: Date, endTime: Date): TimeEntry[] {
    const path =
      'time_entries?' +
      [
        `start_date=${encodeURIComponent(startTime.toISOString())}`,
        `end_date=${encodeURIComponent(endTime.toISOString())}`
      ].join('&');
    const entries = this.get<TimeEntryJSON[]>(path).map(TimeEntry.fromJSON);
    for (const entry of entries) {
      if (entry.pid) {
        entry.project = this.getProject(entry.pid);
      }
    }
    return entries;
  }

  private get<T>(path: string): T {
    const url = baseUrl + path;
    const params = {
      contentType: 'application/json',
      headers: {
        Authorization:
          'Basic ' + Utilities.base64Encode(`${this.token}:api_token`)
      },
      method: 'get' as 'get'
    };
    const contentText = UrlFetchApp.fetch(url, params).getContentText();
    return JSON.parse(contentText);
  }
}
