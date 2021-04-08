import HomePage from '../pageObjects/HomePage';
import SideCartPage from '../pageObjects/SideCartPage';
import SearchResultsPage from '../pageObjects/SearchResultsPage';

const homePage = new HomePage();
const sideCartPage = new SideCartPage();

Cypress.Commands.add('clearTrolley', (shopper) => {
    //clear cart if required
    //open cart if it has >0 amount and clear it
    homePage.getCartAmount().then(function (cartElement) {
        cy.log(cartElement.text())
        const cartAmount = cartElement.text();
        if (cartAmount.includes('$0')) {
            cy.log('Cart has no items. Cart Value: ' + cartAmount)
        } else {
            cy.log('Cart has some items.  Cart Value: ' + cartAmount + '. Removing them.')
            sideCartPage.getViewCartButton().click();
            sideCartPage.getClearEntireCartLink().click();
            cy.wait(1000);
            sideCartPage.getConfirmClearCartLink().click();
            cy.wait(1000);
            sideCartPage.getCloseSideCartButton().click();
            cy.wait(1000);
        }
    })
})

Cypress.Commands.add('viewCart', () => {
    //Click on View Cart button to Open the cart
    sideCartPage.getViewCartButton().click()
    cy.wait(1000);
})

Cypress.Commands.add('clickCheckout', () => {
    //Click on Checkout button on the opened side cart
    sideCartPage.getCheckoutButton().click()
    cy.url().should('include', '/checkout');
    cy.wait(1000);
})