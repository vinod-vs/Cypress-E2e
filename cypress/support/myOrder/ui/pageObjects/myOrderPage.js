export class myOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
      }
    
    getMyOrdersLink () { 
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getMyOrdersListContainer(orderId) {//new method
        return cy.get('wow-my-orders-list-container > div.my-orders-list-container').filter(`:contains(${orderId})`)
    }

    getMyOrdersListContainerItems(orderId) {//changed
        //return cy.get('wow-my-orders-list-container > div.my-orders-list-container > wow-my-orders-list-item > div')
        return this.getMyOrdersListContainer(orderId).find('wow-my-orders-list-item > div')
    }

    getMyOrdersContainerHeader(orderId){//changed
        return this.getMyOrdersListContainer(orderId).find('div.header')
    }

    getMyOrderNumber(orderId) { // new change
        return this.getMyOrdersListContainerItems(orderId).find('div.details-container.order > span.details-content').should('contain', orderId)
    }

    getOrderDateString(orderId, orderDate) {
       return this.getMyOrdersContainerHeader(orderId).find('section.date > span.content').should('contain.text', orderDate)
    }

    getOrderTotalString(orderId, orderValue) {
        return this.getMyOrdersContainerHeader(orderId).find('section.total > span.content').should('contain.text', orderValue)
    }

    getDeliveryDateString(orderId, deliveryDate) {
        return this.getMyOrdersListContainerItems(orderId).find('div.details-container.delivery > span.details-content').should('contain.text', deliveryDate)
    }

    getTrackMyOrderLink(orderId) {
        return this.getMyOrdersListContainerItems(orderId).find('div.order-links-container > a.auto_my-orders-tmo-link.button').should('contain.text', ' Track my order ') 
    }

    getViewOrderDetailsLink(orderId) {
        return this.getMyOrdersListContainerItems(orderId).find('div.order-links-container > a.order-links.view-order-link').should('contain.text', 'View order details')
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