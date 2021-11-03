export class myOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
    }
    
    getMyOrdersLink () {
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getMyOrderNumber() {

    }

    getOrderDateString() {
        return cy.get('span.content')
    }

    getOrderTotalString() {

    }

    getDeliveryDateString() {

    }

    getTrackMyOderLink() {

    }

    getViewOrderDetailsLink() {

    }

    }
    
    export const onMyOrderPage = new myOrderPage()