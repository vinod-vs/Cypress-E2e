import { loginPage } from "../pageObjects/LoginPage";

Cypress.Commands.add("adminLoginViaUi", (loginDetails) => {
  loginPage.getEmailAddress().type(loginDetails.email);
  loginPage.getPassword().type(loginDetails.password);
  loginPage.getLoginButton().click();
});

Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.visit("Manage/Login");
  cy.url().should("include", "/Login");
  loginPage.getEmailAddress().type(email);
  loginPage.getPassword().type(password);
  loginPage.getLoginButton().click();
  cy.url().should("not.include", "/Login");
});
