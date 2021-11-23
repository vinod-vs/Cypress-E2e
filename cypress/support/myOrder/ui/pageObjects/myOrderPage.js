export class myOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
      }
    
    getMyOrdersLink () { 
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getMyOrdersListContainer() {//new method
        return cy.get('wow-my-orders-list-container > div.my-orders-list-container')
    }

    getMyOrdersListContainerItems(orderId) {//changed
        //return cy.get('wow-my-orders-list-container > div.my-orders-list-container > wow-my-orders-list-item > div')
        return this.getMyOrdersListContainer().find('wow-my-orders-list-item > div').filter(`:contains(${orderId})`)
    }

    getMyOrdersContainerHeader(){//changed
        return this.getMyOrdersListContainer().find('div.header')
    }

    getMyOrderNumber(orderId) { // new change
        return this.getMyOrdersListContainerItems(orderId).find('div.details-container.order > span.details-content').contains(orderId)
    }

    getOrderDateString(orderDate) {
       return this.getMyOrdersContainerHeader().find('section.date > span.content').should('contain.text', orderDate)
    }

    getOrderTotalString(orderValue) {
        return this.getMyOrdersContainerHeader().find('section.total > span.content').should('contain.text', orderValue)
    }

    getDeliveryDateString(orderId, deliveryDate) {
        return this.getMyOrdersListContainerItems(orderId).find('div.details-container.delivery > span.details-content').should('contain.text', deliveryDate)
    }

    getTrackMyOrderLink() {
        return this.getMyOrdersListContainerItems().find('div.order-links-container > a.auto_my-orders-tmo-link.button').should('contain.text', ' Track my order ') 
    }

    getViewOrderDetailsLink() {
        return this.getMyOrdersListContainerItems().find('div.order-links-container > a.order-links.view-order-link').should('contain.text', 'View order details')
    }
    // general actions
    myAccountActions () {
       cy.wait(Cypress.config("fiveSecondWait"));// new change
       this.getMyAccountButton().click()
       cy.wait(Cypress.config("fiveSecondWait"));// new change
       this.getMyOrdersLink().click()
    }

    }
    
    export const onMyOrderPage = new myOrderPage() // make the interaction public