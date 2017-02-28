#!/usr/local/bin/node
var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');

var SCOPES = [ 'https://www.googleapis.com/auth/calendar.readonly' ];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) +
    '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
var credentials = JSON.parse(fs.readFileSync('./client_secret.json').toString());

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

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
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

module.exports = function authorize() {
    return new Promise(function(resolve, reject){
        var clientSecret = credentials.web.client_secret;
        var clientId = credentials.web.client_id;
        var redirectUrl = credentials.web.redirect_uris[0];
        var auth = new googleAuth();
        var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
        oauth2Client.credentials = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
        resolve(oauth2Client);
    });

    // fs.readFile(TOKEN_PATH, function(err, token) {
    //     if (err) {
    //         getNewToken(oauth2Client, callback);
    //     } else {
    //         oauth2Client.credentials = JSON.parse(token);
    //         callback(oauth2Client);
    //     }
    // });
}
