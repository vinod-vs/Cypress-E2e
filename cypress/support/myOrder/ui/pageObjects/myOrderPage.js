export class myOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
    }
    
    getMyOrdersLink () {
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getMyOrderNumber() {
        return cy.get('wow-my-orders-list-container').eq(0).find('wow-my-orders-list-item > div > div.details-container.order > span.details-content')
    }

    getOrderDateString() {
       // return cy.get('div.content transparent > wow-my-orders-list-container').eq(0).find('section.date').contains('span.content')
       return cy.get('wow-my-orders-list-container').eq(0).find('div> div.header > section.date > span.content')
    }

    getOrderTotalString() {
        return cy.get('wow-my-orders-list-container').eq(0).find('div> div.header > section.total > span.content')
    }

    getDeliveryDateString() {
        return cy.get('wow-my-orders-list-container').eq(0).find('wow-my-orders-list-item > div > div.details-container.delivery > span.details-content')
    }

    getTrackMyOderLink() {
        return cy.get('wow-my-orders-list-container').eq(0).find('wow-my-orders-list-item > div > div.order-links-container > a.auto_my-orders-tmo-link.button')
    }

    getViewOrderDetailsLink() {
        return cy.get('wow-my-orders-list-container').eq(0).find('wow-my-orders-list-item > div > div.order-links-container > a.order-links.view-order-link')
    }

    }
    
    export const onMyOrderPage = new myOrderPage()