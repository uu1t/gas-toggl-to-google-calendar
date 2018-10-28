import { update } from '../calendar';
import { TimeEntry } from '../toggl';

const CalendarEvent = jest.fn<GoogleAppsScript.Calendar.CalendarEvent>(
  (title: string, startTime: Date, endTime: Date, tag: string) => ({
    getTitle: () => title,
    setTitle: (t: string) => {
      title = t;
    },
    getStartTime: () => startTime,
    getEndTime: () => endTime,
    setTime: (s: Date, e: Date) => {
      startTime = s;
      endTime = e;
    },
    getTag: (_key: string) => tag,
    setTag: (_key: string, t: string) => {
      tag = t;
    }
  })
);

describe('CalendarEventMock', () => {
  test('title getter/setter', () => {
    const event = new CalendarEvent('title1');
    expect(event.getTitle()).toBe('title1');

    event.setTitle('title2');
    expect(event.getTitle()).toBe('title2');
  });

  test('time getter/setter', () => {
    const event = new CalendarEvent(
      '',
      new Date('2018-10-28'),
      new Date('2018-10-29')
    );
    expect(event.getStartTime()).toEqual(new Date('2018-10-28'));
    expect(event.getEndTime()).toEqual(new Date('2018-10-29'));

    event.setTime(new Date('2018-12-30'), new Date('2018-12-31'));
    expect(event.getStartTime()).toEqual(new Date('2018-12-30'));
    expect(event.getEndTime()).toEqual(new Date('2018-12-31'));
  });

  test('tag getter/setter', () => {
    const event = new CalendarEvent('', new Date(), new Date(), 'tag1');
    expect(event.getTag('')).toBe('tag1');

    event.setTag('', 'tag2');
    expect(event.getTag('')).toBe('tag2');
  });
});

describe('update()', () => {
  it("sets time entries' changes", () => {
    const events = [
      ['title1', new Date('2018-10-01'), new Date('2018-10-02'), '1'],
      ['title2', new Date('2018-10-03'), new Date('2018-10-04'), '2'],
      ['title3', new Date('2018-10-05'), new Date('2018-10-06'), '3'],
      ['title4', new Date('2018-10-07'), new Date('2018-10-08'), '4']
    ].map(e => new CalendarEvent(...e));

    const entries = {
      '1': new TimeEntry(
        1,
        'title1',
        '2018-10-01T00:00:00.000Z',
        86400,
        '2018-10-02T00:00:00.000Z'
      ),
      '2': new TimeEntry(
        2,
        'title2-changed',
        '2018-10-03T00:00:00.000Z',
        86400,
        '2018-10-04T00:00:00.000Z'
      ),
      '3': new TimeEntry(
        3,
        'title3',
        '2018-10-05T12:00:00.000Z',
        43200,
        '2018-10-06T00:00:00.000Z'
      ),
      '4': new TimeEntry(
        4,
        'title4',
        '2018-10-07T00:00:00.000Z',
        43200,
        '2018-10-07T12:00:00.000Z'
      ),
      '5': new TimeEntry(
        5,
        'title5',
        '2018-10-09T00:00:00.000Z',
        86400,
        '2018-10-10T00:00:00.000Z'
      )
    };

    update(events, entries);

    expect(events[1].getTitle()).toBe('title2-changed');
    expect(events[2].getStartTime()).toEqual(new Date('2018-10-05 12:00Z'));
    expect(events[3].getEndTime()).toEqual(new Date('2018-10-07 12:00Z'));

    expect(Object.keys(entries)).toHaveLength(1);
    expect(entries).toHaveProperty('5');
  });
});
