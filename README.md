# hmpps-book-video-link
Allows court users to book video link hearing with people in prison.
Allows probation pilot users to book video link meetings with people in prison.

Application can be built with for dev mode

```bash
npm run compile-sass 
npm run start:dev
```

The application will restart if there are any changes in /backend or /views.
Other changes will require a manual restart.

Run locally as docker

```bash
docker run -p 3000:3000 -d \
     --name hmpps-book-video-link \
     quay.io/hmpps/hmpps-book-video-link
```

## Cypress integration tests

The `integration-tests` directory contains a set of Cypress integration tests for the `book-video-link` application.
These tests use WireMock to stub the application's dependencies on the prisonApi, oauth, token-verification and whereabouts RESTful APIs.

### Running the Cypress tests

You need to fire up the wiremock server first:
```docker-compose -f docker-compose-test.yaml up```

This will give you useful feedback if the app is making requests that you haven't mocked out. You can see
the request log at `localhost:9091/__admin/requests/` and a JSON representation of the mocks `localhost:9091/__admin/mappings`.

### Linting and unit tests

to run typescript typechecking:
```npm run typecheck```

to run linting:
```npm run lint```

to run jest unit tests:
```npm test```


### Starting feature tests node instance

A separate node instance needs to be started for the feature tests. This will run on port 3008 and won't conflict
with any of the api services, e.g. prison-api or oauth.

```npm run start-feature```

### Running the tests

With the UI:
```
npm run int-test-ui
```

Just on the command line (any console log outputs will not be visible, they appear in the browser the Cypress UI fires up):
```
npm run int-test
```

### Route Map
Generated using a Graphviz online editor. Raw file is present [here](./route-map.dot)

![Route map](./routes.svg?raw=true "Routes")

### Useful links
- WireMock: http://wiremock.org/
