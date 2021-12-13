export class MyOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
    }
    
    getMyOrdersLink () { 
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getMyOrdersListContainer(orderId: string) {
        return cy.get('wow-my-orders-list-container > div.my-orders-list-container').filter(`:contains(${orderId})`)
    }

    getMyOrdersListContainerItems(orderId: string) {
        return this.getMyOrdersListContainer(orderId).find('wow-my-orders-list-item > div')
    }

    getMyOrdersContainerHeader(orderId: string){
        return this.getMyOrdersListContainer(orderId).find('div.header')
    }

    getMyOrderNumber(orderId: string) {
        return this.getMyOrdersListContainerItems(orderId).should('be.visible').find('div.details-container.order > span.details-content').should('contain', orderId)
    }

    getOrderDateString(orderId: string, orderDate: string) {
       return this.getMyOrdersContainerHeader(orderId).find('section.date > span.content').should('contain.text', orderDate)
    }

    getOrderTotalString(orderId: string, orderValue: any) {
        return this.getMyOrdersContainerHeader(orderId).find('section.total > span.content').should('contain.text', orderValue)
    }

    getDeliveryDateString(orderId: string, deliveryDate: string) {
        return this.getMyOrdersListContainerItems(orderId).find('div.details-container.delivery > span.details-content').should('contain.text', deliveryDate)
    }

    getTrackMyOrderLink(orderId: string) {
        return this.getMyOrdersListContainerItems(orderId).find('div.order-links-container > a.auto_my-orders-tmo-link.button').should('contain.text', ' Track my order ') 
    }

    getViewOrderDetailsLink(orderId: string) {
        return this.getMyOrdersListContainerItems(orderId).find('div.order-links-container > a.order-links.view-order-link').should('contain.text', 'View order details')
    }
    // Actions - Click on the My account Button and then My orders Link

    myAccountActions () {
       cy.wait(500);
       this.getMyAccountButton().click()
       cy.wait(500);
       this.getMyOrdersLink().click()
    }
}
    
export const onMyOrderPage = new MyOrderPage() 