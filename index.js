'use strict';

const google = require('googleapis');
const authFunction = require('./calendar');
const express = require('express');
const app = express();
const PORT = 5252;

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

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
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(23, 55, 55);
    return sunday;
}

function listWeekEvents() {
    return new Promise((resolve, reject) => {
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
                    resolve(err);
                    return;
                }
                resolve(response.items);
            }
        );
    });
}

function listCalendar() {
    return new Promise((resolve, reject) => {
        google.calendar('v3').calendarList.list({ auth: auth }, function(
            err,
            response
        ) {
            if (err) {
                resolve(err);
                return;
            }
            resolve(response);
        });
    })
}

app.get('/api/week', function(req, res) {
    listWeekEvents().then(result => {
        res.json(result)
    })
});

app.listen(PORT);

console.log(`Started service on port http://localhost:${PORT}/api/week`);