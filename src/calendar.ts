import { TimeEntry } from './toggl';

const tagPrefix = 'gas-toggl-to-google-calendar_';
const teidTag = tagPrefix + 'teid';

export type EntriesHash = { [id: string]: TimeEntry };

export function sync(
  calendar: GoogleAppsScript.Calendar.Calendar,
  startTime: Date,
  endTime: Date,
  entries: EntriesHash
) {
  const events = calendar.getEvents(startTime, endTime);
  update(events, entries);
  create(calendar, entries);
}

export function update(
  events: GoogleAppsScript.Calendar.CalendarEvent[],
  entries: EntriesHash
) {
  for (const event of events) {
    const teid = event.getTag(teidTag);
    const entry = entries[teid];
    if (!entry) {
      continue;
    }

    if (event.getTitle() !== entry.title) {
      event.setTitle(entry.title);
    }
    if (
      event.getStartTime().getTime() !== entry.startTime.getTime() ||
      event.getEndTime().getTime() !== entry.endTime.getTime()
    ) {
      event.setTime(entry.startTime, entry.endTime);
    }

    delete entries[teid];
  }
}

export function create(
  calendar: GoogleAppsScript.Calendar.Calendar,
  entries: EntriesHash
) {
  for (const id of Object.keys(entries)) {
    const entry = entries[id];
    calendar
      .createEvent(entry.title, entry.startTime, entry.endTime)
      .setTag(teidTag, id);
  }
}
