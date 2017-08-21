toggl-to-google-calendar
====
> :calendar: Create Google Calendar events from Toggl time entries on Google Apps Script

Usage
----
1. Build this script, which will generate `out/index.js`.
    ```
    npm run install
    npm run build
    ```
1. Create a standalone Google Apps Script, and copy and paste `out/index.js` (or upload with [node-google-apps-script](https://www.npmjs.com/package/node-google-apps-script)).
1. Set script properties `CALENDAR_ID` and `TOGGL_API_TOKEN`.
1. Create a Time-driven trigger to run function `main` periodically (e.g. every hour).

### Custom variables (script properties)
- `CALENDAR_ID` (required)
	- your Google Calendar ID
- `TOGGL_API_TOKEN` (required)
	- your Toggl API token
- `SYNCED_ENTRY_TAG` (optional, default: `.syncedToGcal`)
	- name of the tag which will be added to the synced entries

Functionality
----
- Retrieve Toggl time entries which started during the past 1 day and are not yet synced to Google Calendar, and create Google Calendar events of them.
- `SYNCED_ENTRY_TAG` tag will be added to synced time entries, which is used to check whether time entries are synced.

Limitations
----
Due to [Toggl API](https://github.com/toggl/toggl_api_docs/blob/master/chapters/time_entries.md#get-time-entries-started-in-a-specific-time-range) and current implementation, there are 2 limitations:

- Time entries lasting beyond 1 day are not synced.
- If there are more than 1000 time entries in 1 day, some time entries may not be synced.

Alternatives
----
- automate with [Zapier](https://zapier.com/)
  - cons: can run only 100 tasks per month on the free plan of Zapier
- Toggl iCal integration
  - cons: need to upgrade to the starter plan of Toggl
