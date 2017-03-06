#!/usr/local/bin/node

const fs = require('fs');
const readline = require('readline');
const googleAuth = require('google-auth-library');
const SCOPES = [ 'https://www.googleapis.com/auth/calendar.readonly' ];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar.json';
const credentials = JSON.parse(
    fs.readFileSync(TOKEN_DIR + 'client_secret.json').toString()
);

function getNewToken(oauth2Client, callback) {
    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here: ', function(code) {
        rl.close();
        oauth2Client.getToken(code, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            callback(oauth2Client);
        });
    });
}

function storeToken(token) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}

module.exports = function authorize(firstTime) {
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

    if (firstTime) {
        return new Promise(function(resolve) {
            getNewToken(oauth2Client, resolve);
        });
    }
    return new Promise(function(resolve) {
        fs.readFile(TOKEN_PATH, function(err, token) {
            if (err) {
                resolve({ error: 'Authorization needed ' });
            } else {
                oauth2Client.credentials = JSON.parse(token);
                resolve(oauth2Client);
            }
        });
    });
};
