# Running Locally

1. Start up a local keycloak server `docker run -p 8080:8080 -p 8443:8443 -e KEYCLOAK_USER=admin -e KEYCLOAK_PASSWORD=admin quay.io/keycloak/keycloak:10.0.2`
2. Log into the keycloak admin console (https://localhost:8443) and import the `demo-realm.json` file
3. Run the application using `node .\index.js` and open at https://localhost:3443

You will need to create users in the keycloak instance and assign them roles to actually enable access to the protected resources.
