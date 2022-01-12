import { onHomePage } from "../../../homePage/ui/pageObjects/HomePage";

Cypress.Commands.add("navigateToMyAccountViaUi", () => {
  onHomePage.getLogoLink().click();
  onHomePage.getMyAccount().contains("My Account").click();
});
