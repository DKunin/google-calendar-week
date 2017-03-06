'use strict';
const google = require('googleapis');
const { getMonday, getSunday, getWeekDates } = require('./date-functions');
const { CALENDAR_ID } = process.env;

function listWeekEvents(auth, date) {
    const originalMonday = date ? new Date(date) : new Date();
    const monday = getMonday(originalMonday).toISOString();
    const sunday = getSunday(originalMonday).toISOString();
    const weekDays = getWeekDates(getMonday(originalMonday));
    return new Promise((resolve, reject) => {
        google.calendar(
            'v3'
        ).events.list({ auth: auth, calendarId: CALENDAR_ID, timeMin: monday, timeMax: sunday, singleEvents: true, showHiddenInvitations: true, orderBy: 'startTime' }, function(err, response) {
            if (err) {
                reject(err);
                return;
            }
            resolve({ items: response.items, days: weekDays });
        });
    });
}

function listCalendars(auth) {
    return new Promise((resolve, reject) => {
        google.calendar(
            'v3'
        ).calendarList.list({ auth: auth }, function(err, response) {
            if (err) {
                reject(err);
                return;
            }
            resolve(response);
        });
    });
}

module.exports = {
    listWeekEvents: listWeekEvents,
    listCalendars: listCalendars
};
