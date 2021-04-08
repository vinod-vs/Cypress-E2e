class SideCartPage {

    getCloseSideCartButton() {
        return cy.get(".close-button > .iconAct-Close_Cancel")
    }

    getViewCartButton() {
        return cy.get('.headerCheckout-orderHeader button')
    }

    getClearEntireCartLink() {
        return cy.get('.product-actionsClearCart > span')
    }

    getConfirmClearCartLink() {
        return cy.get('.primary')
    }

    getCheckoutButton() {
        return cy.get('.cart-checkout-button > .button')
    }
}

export default SideCartPage;