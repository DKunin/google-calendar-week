'use strict';

const fs = require('fs');
const readline = require('readline');
const googleAuth = require('google-auth-library');
const SCOPES = [ 'https://www.googleapis.com/auth/calendar.readonly' ];
const TOKEN_DIR = '.credentials/';
const TOKEN_PATH = TOKEN_DIR + 'calendar.json';
let credentials = null;
try {
    credentials = JSON.parse(
        fs.readFileSync(TOKEN_DIR + 'client_secret.json').toString()
    );
} catch (err) {}

function getOauth2Client() {
    if (!credentials) {
        try {
            credentials = JSON.parse(
                fs.readFileSync(TOKEN_DIR + 'client_secret.json').toString()
            );
        } catch (err) {}
    }
    var clientSecret = credentials.web.client_secret;
    var clientId = credentials.web.client_id;
    var redirectUrl = credentials.web.redirect_uris[0];
    var auth = new googleAuth();
    return new auth.OAuth2(clientId, clientSecret, redirectUrl);
}

function getTokenAuthPath() {
    const oauth2Client = getOauth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES
    });
}

function acceptToken(newToken) {
    return new Promise(function(resolve, reject) {
        const oauth2Client = getOauth2Client();
        oauth2Client.getToken(newToken, function(err, token) {
            if (err) {
                console.log('Error while trying to retrieve access token', err);
                reject(err);
                return;
            }
            oauth2Client.credentials = token;
            storeToken(token);
            resolve(oauth2Client);
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

function authorize() {
    if (!credentials) {
        return new Promise(function(resolve, reject) {
            reject({ error: 'Authorization needed' });
        });
    }
    const oauth2Client = getOauth2Client();
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
}

function saveClientSecret(newCredentials) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(TOKEN_DIR + 'client_secret.json', newCredentials, function(
            err
        ) {
            if (err) {
                reject(err);
                return;
            }
            resolve('ok');
        });
    });
}

module.exports = {
    authorize: authorize,
    getTokenAuthPath: getTokenAuthPath,
    acceptToken: acceptToken,
    saveClientSecret: saveClientSecret
};
