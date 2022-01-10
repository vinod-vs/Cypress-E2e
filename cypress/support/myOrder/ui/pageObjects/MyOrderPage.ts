export class MyOrderPage {
    getMyAccountButton () {
        return cy.get('div.coreHeader-loginWrapper > span.coreHeader-loginText').contains('My Account')
    }
    
    getMyOrdersLink () { 
        return cy.get('nav.navigation-items').find('a').eq(2).contains('My orders')
    }

    getmyOrderListContainersOnPage(){
        return cy.get('wow-my-orders-list-container').find('.order > .details-content')
    }

    getMyOrdersListContainer(orderId: string) {
       return cy.get('wow-my-orders-list-container').filter(`:contains(${orderId})`)
    }


    getMyOrdersContainerHeader(orderId: string){
       return this.getMyOrdersListContainer(orderId).find('.header')
    }

    getMyOrderNumber(orderId: string) {
        return this.getMyOrdersListContainer(orderId).find('.order > .details-content')
    }

    getOrderDateString(orderId: string) {
      return this.getMyOrdersContainerHeader(orderId).find('section.date > .content')
    }

    getOrderTotalString(orderId: string) {
        return this.getMyOrdersContainerHeader(orderId).find('section.total > .content')
    }

    getDeliveryDateString(orderId: string) {
       return this.getMyOrdersListContainer(orderId).find('.delivery > .details-content')
    }

    getTrackMyOrderLink(orderId: string) {
        return this.getMyOrdersListContainer(orderId).find('.order-links-container > a.auto_my-orders-tmo-link.button')
    }

    getViewOrderDetailsLink(orderId: string) {
       return this.getMyOrdersListContainer(orderId).find('.order-links-container > a.order-links.view-order-link')
    }

    myAccountActions () {
       cy.visit("/shop/myaccount/myorders")
       cy.wait(1000);
    }
}
    
export const onMyOrderPage = new MyOrderPage() 