/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
var keycloak = new Keycloak('/keycloak-frontend.json');

function refreshKeycloakInfo() {
    console.log('Updating keycloak information...');
    const simpleProps = [
        'token',
        'subject',
        'idToken',
        'refreshToken',
        'timeSkew',
        'responseMode',
        'flow',
        'adapter',
        'responseType'
    ];

    const jsonProps = [
        'tokenParsed',
        'idTokenParsed',
        'refreshTokenParsed',
        'realmAccess',
        'resourceAccess',
    ];

    simpleProps.forEach(key => {
        const value = typeof keycloak[key] !== undefined ? keycloak[key] : '<undefined>';
        const strValue = '' + value;

        document.getElementById('k_' + key).innerText = strValue;
    });

    jsonProps.forEach(key => {
        const value = typeof keycloak[key] !== undefined ? JSON.stringify(keycloak[key], null, 2) : '<undefined>';
        const strValue = '' + value;

        document.getElementById('k_' + key).innerText = strValue;
    });
}

function authCallback(authenticated) {
    alert(authenticated ? 'authenticated' : 'not authenticated');
    refreshKeycloakInfo();
}

function authErrback() {
    alert('failed to initialize');
    refreshKeycloakInfo();
}

// A series of initialization function to run keycloak in different ways
function initKeycloakLoginRequired() {
    keycloak.init({
        onLoad: 'login-required'
    }).then(authCallback, authErrback);
}

function initKeycloakCheckSSO() {
    keycloak.init({
        onLoad: 'check-sso'
    }).then(authCallback, authErrback);
}

function initKeycloakSilentSSO() {
    keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    }).then(authCallback, authErrback);
}
