# toggl-to-google-calendar

[![Build Status](https://travis-ci.org/uu1t/gas-toggl-to-google-calendar.svg?branch=master)](https://travis-ci.org/uu1t/gas-toggl-to-google-calendar)

> :calendar: Sync Toggl time entries to Google Calendar events on Google Apps Script

## Usage

1. Build this script, which will generate `dist/bundle.js`.
   ```
   npm install
   npm run build
   ```
1. Upload `dist/index.js` and `dist/bundle.js` to Google Apps Script.  
   If you're using [@google/clasp](https://github.com/google/clasp), edit `scriptId` property in `.clasp.json` and run `npm run deploy`.
1. Set `CALENDAR_ID` and `TOGGL_API_TOKEN` script properties.
1. Create a Time-driven trigger to run `main` function periodically (e.g. every hour).

### Custom variables (script properties)

- `CALENDAR_ID` (required) - your Google Calendar ID
- `TOGGL_API_TOKEN` (required) - your Toggl API token
- `SYNC_PERIOD_IN_DAYS` (optional, default: `7`) - Toggl time entries in this period are synced to Google Calendar.

## How it works

1. Retrieve Toggl time entries and Google Calendar events in the past `SYNC_PERIOD_IN_DAYS` days
1. For each Toggl time entry, create a corresponding Calendar event or update the corresponding Calendar event if it changed.

## Limitations

Due to [Toggl API](https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md#get-time-entries-started-in-a-specific-time-range) and current implementation, there are 2 limitations:

- Time entries lasting beyond `SYNC_PERIOD_IN_DAYS` days are not synced.
- If there are more than 1000 time entries in the past `SYNC_PERIOD_IN_DAYS` days, some time entries may not be synced.

## Alternatives

- automate with [Zapier](https://zapier.com/) or [Integromat](https://www.integromat.com/)
  - cons: the number of executions per month are limited on the free plan (100 tasks on Zapier and 1000 operations on Integromat).
- Toggl iCal integration
  - cons: need to upgrade to the starter plan of Toggl.
