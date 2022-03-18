import { onHomePage } from "../../../homePage/ui/pageObjects/HomePage";

Cypress.Commands.add("navigateToB2BMyAccountViaUi", () => {
  onHomePage.getLogoLink().click();
  onHomePage.getB2BMyAccount().contains("My Account").click();
});

Cypress.Commands.add("navigateToMyAccountViaUi", () => {
  onHomePage.getLogoLink().click();
  onHomePage.getMyAccount().contains("My Account").click();
});