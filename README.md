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
1. Run `npm run allure:open` this will spin up a local webserver to host the allure results generated during the latest run

# Contribute
If you wish to contribute, please create a feature branch under https://wowonline.visualstudio.com/Woolworths%20Online/_git/WOW-E2E-API-Automation and create a pull request for review.

We use [javascript stardard style](https://standardjs.com/) as our inforced coding standard.
Before creating a pull request, make sure that `npm test` runs without any errors.

 
# ToDo:
1. ~~Running test with multiple set of data and iterate through it.~~ - Amit
2. Executing tests in parallel and get the test report consolidated. - Ara
3. CI/CD pipeline variables with smart selection for Browser, Run Env. variable and Base URL. - Kristian
4. Slack integration - Kristian
5. Custom commands to be used across multiple tests. - Ara
6. Update readme file to include info. about using the cypress test automation project and running tests. - Amit, Kristian, Ara
7. ~~Having custom command files for specific functional modules.~~ - Amit
8. Allure reporting implementation. - Ara
