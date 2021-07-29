# Introduction 
This project will be used to automate the End to End Web and API scenarios for Woolworths at Work website.

# Getting Started
1. Installation process, including dependancies. 
    * NodeJs and Npm (most recent LTS version) [download here](https://nodejs.org/en/)
    * run from cmdline / terminal in the local repo: `npm install` 
2. Running example test
    * from cmd/bash run: `npm run cypress:open`
    * cypress front end will open and you will be able to inspect and run test cases from there.

# Build and Test
TBA

# View local allure results
After running a test, run `npm run allure:trend` in the terminal to generate allure results during the latest test run.

This will generate an allure html report and serve it to localhost where the HTML results can be viewed. Note that the HTML file can't be directly opened in the browser unless it is served.

If there is an existing allure-report in your local, then historic trends of the test cases can also be viewed on the HTML report. Click on the test case and select the History tab to view past run results.

# View test reports from CI

There are two reports generated as a result of the CI run. One is the VSTS test result, which can be seen in the `Tests` tab in the pipeline.
Another report is in allure, hosted in Azure Blob storage: https://wowe2eautomation.z8.web.core.windows.net/

# Running in parallel via Docker Locally
1. Ensure the docker daemon is running. 
2. If this is the first time building the image, then in the terminal, run `docker-compose up --build`. This should create the image from the DockerFile. 
3. If the docker image has been built previously, the `--build` command can be skipped and simply execute `docker-compose up`
4. After the test runs, check the `cypress/allure-reports` folder. The json reports should be there.
5. To generate the HTML report, simply run `npm run allure:trend`.

# Contributing / PR Guidelines
If you wish to contribute, please create a feature branch under https://wowonline.visualstudio.com/Woolworths%20Online/_git/WOW-E2E-API-Automation and create a pull request for review. 

Before creating a pull request, make sure that `npx standard && npm run cypress:run` runs without any errors.

All PRs will start a build that runs existing and new CI tests as well as coding standards, any test failures will fail your PR build. All tests need to pass before merge can be completed. 

We are using standard js as our coding standards, any code that doesn't follow these rules will fail the build.
To quickly fix code guideline errors run: `npx standard --fix` this will automatically make style adjustments to the repo. 
More info can be found at the [standard js docs](https://standardjs.com/)

# Framework structure
* integration -> All tests go here under the respective feature folders uiTests and apiTests sub folders.
* fixtures -> All test data go here under the respective feature folders uiTests and apiTests sub folders.
* support -> All support files like cypress commands, pageObjects etc go here under the respective feature folder.
    * subfolder featureName/api/commands -> All api related cypress commands of the feature go here.
    * subfolder featureName/ui/commands -> All ui related cypress commands of the feature go here.
    * subfolder featureName/ui/pageObjects -> All ui related pageObjects of the feature go here.
* support/utilities -> All useful/reusuable utilities can be placed here. 

# For having request and response written in the test runner, please follow the steps in your API tests (https://github.com/bahmutov/cy-api)
* Use cy.api() instead of cy.request() in your custome commands js files.
* The structure of the request should be like this:
    cy.api({
      method: 'POST',
      url: Cypress.env('loginEndpoint'),
      body: shopper
    }).then((response) => {
      return response.body
    })

# For having TAGS in your test suite, please use the steps below:
* Write the test suite within this:
    TestFilter(['API'], () => {
        describe('[API] Place a delivery order in B2C platform using Credit Card', () => {}
    }
Here "API" is the tag for this test suite mentioned inside the 'TestFilter'.
* For running the tests with tags, use the CLI parameter like this:
    --env tags=API/UI (this example will run test suits having 'API' or 'UI' tags)
    
# For dynamically modifying configuration values and environment variables from your plugins file (https://docs.cypress.io/api/plugins/configuration-api#Usage)
* Create a new configuration file under "../cypress/config-files" folder
* For running the tests use environment variable like this:
    --env fileConfig=b2b

# ToDo:
1. ~~Running test with multiple set of data and iterate through it.~~
2. Executing tests in parallel and get the test report consolidated. - Ara
3. ~~CI/CD pipeline variables with smart selection for Browser, Run Env. variable and Base URL.~~
4. Slack integration - Kristian
5. ~~Custom commands to be used across multiple tests.~~
6. Update readme file to include info. about using the cypress test automation project and running tests. - Amit, Kristian, Ara
7. ~~Having custom command files for specific functional modules.~~ - Amit
8. ~~Allure reporting implementation.~~
