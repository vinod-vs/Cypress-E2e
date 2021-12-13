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
* Use cy.api() instead of cy.request() in your custom commands js files.
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
    TestFilter(['API', 'B2C'], () => {
        describe('[API] Place a delivery order in B2C platform using Credit Card', () => {}
    }
Here "API", "B2C" are the tags for this test suite mentioned inside the 'TestFilter'.
* For running the tests with tags, use the CLI parameter like this:
    --env tags=API/UI (this example will run test suits having 'API' or 'UI' tags)
    --env tags=API-B2C/UI-B2B (this example will run test suits having both 'API' and 'B2C' tags, or run tests having both 'UI' and 'B2B' tags)
    --env tags=B2C-UI-P0 (this example will run test suites having all 'B2C', 'UI' and 'P0' tags)
    
# For dynamically modifying configuration values and environment variables from your plugins file (https://docs.cypress.io/api/plugins/configuration-api#Usage)
* Create a new configuration file under "../cypress/config-files" folder
* For running the tests use environment variable like this:
    --env fileConfig=b2b

# Setting fulfilment (type + window)
From your test, use fulfilment fixture files (fulfilmentType.js & fulfilmentWindowType.js) to specify the fulfilment selection type (i.e. Delivery, Pick up, DTB) &
fulfilment window type (i.e. Fleet, Delivery Now etc.)
Call appropriate commands in 'Fulfilment' module support files. To verify API responses, you can use e.g. 'searchDeliveryAddress', 'addDeliveryAddress' & 'getFulfilmentWindowViaApi', whereas if you do no not need a response value, and just need to set fulfilment as part of a broader test, use e.g. 'setFulfilmentLocationWithWindow' (passing appropriate fulfilment selection & window types defined in the fulfilment fixture files)

# BrowserStack integration
We are running only UI tests in BrowserStack for both B2C and B2B. BrowserStack config can be found in 'browserstack.json' file.\
Locally if you want to run your test(s) in BrowserStack, please use this command:\
`npx browserstack-cypress run --sync --env "fileConfig=b2b,tags=B2B-API" --spec "cypress/integration/login/apiTests/login.spec.js"`\
More info: [Run your Cypress tests] (https://www.browserstack.com/docs/automate/cypress)

# For 2FA validation on UAT
Since 2FA feature has been turned on in UAT env globally, framework has been updated to allow entering static or dynamic one time password via API or UI login.
Below 2 settings are added to cypress.json 
  - "otpValidationSwitch": true 
  - "otpStaticCode": "123456"  
Test scripts will do 2FA validation based on setting 'otpValidationSwitch' value.
* while writing API tests for any existing b2c user login, simply call cy.loginViaApiWith2FA() by passing in shopperdetails, otpValidationSwitch value and static code value.
* for any new b2c user sign up and login via API, simply call cy.loginWithNewShopperViaApi()
* for UI tests remains the same still using cy.loginViaUi() by passing in the shopper details

# Mailosaur email service integration
Now we have integrated with Mailosaur email service. If your tests need get email information (like subject, content, etc), highly suggest to create your test account with given Mailosaur server domain address.
Below 3 settings are added to cypress.json
  - "mailosaur_serverId": "82f8rhkb"
  - "mailosaur_serverDomain": "82f8rhkb.mailosaur.net"
  - "MAILOSAUR_API_KEY": "MQfxmYlGMOb00wv0"
For your email related test, you might want
  1. register your test account on test environment with mailosaur domain (eg, john.hawkins@82f8rhkb.mailosaur.net)
  2. use command like below to get email infor or validation: 
    cy.getMailosaurEmailByEmailAddress(emailAddress).then(email => {
        expect(email.subject).to.equal('Reset your password')
    })
More info: [How to test email and SMS with Cypress] (https://mailosaur.com/docs/frameworks-and-tools/cypress/)

