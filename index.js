/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/**
 * Sample application that tried to demonstrate many of the different ways of using the
 * keycloak middleware.
 */

// Load in configuration file information 
require('dotenv').config();

const path = require('path');
const express = require('express');
const app = express();
const fs = require('fs');
const http = require('http');
const https = require('https');

// Follow this process to generate your own certificate, if
// needed: https://letsencrypt.org/docs/certificates-for-localhost/
//
// openssl req -x509 -out localhost.crt -keyout localhost.key \
//  -newkey rsa:2048 -nodes -sha256 \
//  -subj '/CN=localhost' -extensions EXT -config <( \
//   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
//
// If running under MinGW on Windows, change the -subj argument to '//CN=localhost'
//  see: https://stackoverflow.com/a/31990313/332406
const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const credentials = { key: privateKey, cert: certificate };

const httpPort = process.env.HTTP_PORT;
const httpsPort = process.env.HTTPS_PORT;

// When keycloak responds, don't refuse due to self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0

// Initialize the Keycloak middleware
const session = require('express-session');
const Keycloak = require('keycloak-connect');

const keycloakConfigPath = path.join(process.cwd(), 'keycloak-backend.json');
const memoryStore = new session.MemoryStore();
const keycloak = new Keycloak({ store: memoryStore }, keycloakConfigPath);

// Use the PUG templating engine
app.set('view engine', 'pug');

// Set the environment variables to be available in all views
app.locals.env = process.env;

// Register express middleware
app.use( express.static(path.join(__dirname, 'static')) );

app.use( session({
    secret:'b48e6e5c670aab6475e640909d046ebf',
    resave: false,
    saveUninitialized: true,
    store: memoryStore
}));

// Enable keycloak middleware and specify a logout redirect URL
app.use( keycloak.middleware( { logout: '/logout'} ));

// Main page
app.get('/', (req, res) => {
    res.render('index-ss');
});

app.get('/index', (req, res) => {
    res.render('index');
});

// Special page for iframe-login
app.get('/iframe-login', (req, res) => {
    res.render('iframe-login');
});

// The actual content loaded into the iframe for login
app.get('/iframe-login-frame', (req, res) => {
    res.render('iframe-login-frame');
});

// To check that a user is authenticated before accessing a resource, simply use keycloak.checkSso().
// It will only authenticate if the user is already logged-in. If the user is not logged-in, the browser
// will be redirected back to the originally-requested URL and remain unauthenticated:
app.get('/check-sso', keycloak.checkSso(), (req, res) => {
    res.render('check-sso-page');
});


// Simple authentication
//
// To enforce that a user must be authenticated before accessing a resource, simply use a no-argument
// version of keycloak.protect():
app.get( '/complain', keycloak.protect(), (req, res) => {
    res.render('complain-page');
});

// Role-based authorization
//
// To secure a resource with an application role for the current app:
app.get( '/special', keycloak.protect('special'), (req, res) => {
    res.render('special-page');
});

// To secure a resource with an realm role for a different app:
app.get( '/extra-special', keycloak.protect('demo:admin'), (req, res) => {
    res.render('extra-special-page');
});

// Resource-Based Authorization
//
//
app.get('/apis/me-token', keycloak.enforcer('user:profile', { response_mode: 'token' }), (req, res) => {
    const token = req.kauth.grant.access_token.content;
    const permissions = token.authorization ? token.authorization.permissions : undefined;

    res.send({
        action: 'success',
        permissions: permissions
    });
});

app.get('/apis/me', keycloak.enforcer('user:profile', { response_mode: 'permissions' }), (req, res) => {
    const permissions = req.permissions;

    res.send({
        action: 'success',
        permissions: permissions
    });
});


// Explicit user-triggered logout
//
// By default, the middleware catches calls to /logout to send the user through a Keycloak-centric logout
// workflow. This can be changed by specifying a logout configuration parameter to the middleware() call:


// Set up HTTPS since we're doing security stuff...
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(httpPort);
httpsServer.listen(httpsPort);
