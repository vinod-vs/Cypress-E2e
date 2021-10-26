import {loginPage} from '../pageObjects/LoginPage';

Cypress.Commands.add('adminLoginViaUi', (loginDetails) => {
    loginPage.getEmailAddress().type(loginDetails.email)
    loginPage.getPassword().type(loginDetails.password)
    loginPage.getLoginButton().click()
})