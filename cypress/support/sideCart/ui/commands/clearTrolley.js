import HomePage from '../../../homePage/ui/pageObjects//HomePage';
import SideCartPage from '../../../sideCart/ui/pageObjects/SideCartPage';
import CheckoutPage from '../../../checkout/ui/pageObjects/CheckoutPage';

const homePage = new HomePage();
const sideCartPage = new SideCartPage();
const checkoutPage = new CheckoutPage();

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

            //Verify the cart is empty
            cy.verifyEmptyCart()

            //Close cart
            cy.closeCart()
        }
    })
})

Cypress.Commands.add('viewCart', () => {
    //Click on View Cart button to Open the cart
    sideCartPage.getViewCartButton().click()
    cy.wait(1000);

    //Verify the cart is open
    sideCartPage.getCheckoutButton().should('be.visible')
})

Cypress.Commands.add('closeCart', () => {
    //Click Close cart
    sideCartPage.getCloseSideCartButton().click();
    cy.wait(1000);

    //Verify the cart is closed
    homePage.getCartAmount().should('be.visible')
})

Cypress.Commands.add('clickCheckout', () => {
    //Click on Checkout button on the opened side cart
    sideCartPage.getCheckoutButton().click()
    cy.url().should('include', '/checkout');
    cy.wait(1000);

    //Verify checkout page is open
    checkoutPage.getPaymentInstructionsFrame().should('be.visible')
})

Cypress.Commands.add('verifyEmptyCart', () => {
    //Verify the cart is empty
    sideCartPage.getEmptyCartImage().should('be.visible')
    sideCartPage.getEmptyCartTitle().should('be.visible')
})
