'use strict';

const google = require('googleapis');
const authFunction = require('./calendar');
let auth = {};

authFunction().then((authObj) => {
    auth = authObj;
})

function getMonday(d) {
    var day = d.getDay();
    var diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
function getSunday(d) {
    const monday = getMonday(d);
    var diff = monday.getDate() + 6;
    return new Date(d.setDate(diff));
}

function listWeekEvents() {
    google.calendar('v3').events.list(
        {
            auth: auth,
            calendarId: 'h0sf346i354326apmf00lmapgo@group.calendar.google.com',
            timeMin: getMonday(new Date()).toISOString(),
            timeMax: getSunday(new Date()).toISOString(),
            singleEvents: true,
            showHiddenInvitations: true,
            orderBy: 'startTime'
        },
        function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                return;
            }
            var events = response.items;
            if (events.length == 0) {
                console.log('No upcoming events found.');
            } else {
                console.log(events);
            }
        }
    );
}

function listCalendar() {
    google.calendar('v3').calendarList.list({ auth: auth }, function(
        err,
        response
    ) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        console.log(response);
    });
}

setTimeout(function(){
    listWeekEvents();
}, 3000)