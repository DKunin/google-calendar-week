'use strict';
const fs = require('fs');
const express = require('express');

const authModule = require('./lib/calendar-auth');
const cors = require('./lib/cors');
const { listWeekEvents, listCalendars } = require(
    './lib/google-calendar-functions'
);

const fileUpload = require('express-fileupload');
const app = express();
const PORT = 5252;
let auth = null;

app.use(fileUpload());
app.use(express.static('public'));
app.use(cors);

app.use(function(req, res, next) {
    if (req.method === 'POST' || req.path === '/api/auth') {
        next();
        return;
    }

    if (req.headers.referer && req.headers.referer.includes('code')) {
        const code = req.headers.referer.split('code=')[1];
        authModule.acceptToken(code).then(function(newAuth) {
            res.redirect('/?new=true');
        });
        return;
    }

    if (!auth) {
        authModule
            .authorize()
            .then(authObj => {
                auth = authObj;
                next();
            })
            .catch(error => {
                const form = `<form ref="uploadForm" id="uploadForm" method="post" action="/api/client_auth" enctype="multipart/form-data">
                        <input type="file" name="clientFile" />
                        <button type="submit">Load client.js</button>
                    </form>`;
                res.send(
                    `
                    <a href="/api/auth">Get Access Code</a>
                    ${form}
                `
                );
            });
        return;
    }
    next();
});

app.get('/api/week', function(req, res) {
    listWeekEvents(auth, req.query.date).then(result => {
        res.json(result);
    });
});

app.get('/api/calendars', function(req, res) {
    listCalendars(auth).then(result => {
        res.json(result);
    });
});

app.get('/api/auth', function(req, res) {
    res.send(`<a href="${authModule.getTokenAuthPath()}">Get Approved</a>`);
});

app.post('/api/client_auth', function(req, res, next) {
    authModule
        .saveClientSecret(req.files.clientFile.data.toString())
        .then(function() {
            res.redirect('/api/auth');
        })
        .catch(function(err) {
            res.send(err);
        });
});

app.listen(PORT);

console.log(`Started service on port http://localhost:${PORT}/api/week`);
