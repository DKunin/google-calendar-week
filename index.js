'use strict';
const google = require('googleapis');
const express = require('express');
const authFunction = require('./calendar');
const app = express();
const PORT = 5252;
const { CALENDAR_ID } = process.env;

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});

let auth = {};

authFunction().then(authObj => {
    auth = authObj;
});

function getMonday(d) {
    var day = d.getDay();
    if (day === 1) {
        d.setHours(0, 0, 0);
        return d;
    }
    var diff = d.getDate() - day + (day == 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0);
    return monday;
}

function getSunday(d) {
    const monday = getMonday(d);
    var diff = monday.getDate() + 6;
    const sunday = new Date(d.setDate(diff));
    sunday.setHours(23, 55, 55);
    return sunday;
}

function getWeekDates(monday) {
    return Array(7).fill(1).reduce(function(newArray, singleItem, index) {
        const mondayClone = new Date(monday);
        var diff = mondayClone.getDate() + index;
        return newArray.concat(new Date(mondayClone.setDate(diff)));
    }, []);
}

function listWeekEvents(date) {
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

function listCalendars() {
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

app.get('/api/week', function(req, res) {
    listWeekEvents(req.query.date).then(result => {
        res.json(result);
    });
});

app.get('/api/calendars', function(req, res) {
    listCalendars().then(result => {
        res.json(result);
    });
});

app.get('/api/auth', function(req, res) {
    authFunction(true).then(authObj => {
        res.json(authObj);
        auth = authObj;
    });
});

app.listen(PORT);

console.log(`Started service on port http://localhost:${PORT}/api/week`);
