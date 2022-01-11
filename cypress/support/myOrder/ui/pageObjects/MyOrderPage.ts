export class MyOrderPage {
    
    private orderId: string
    myOrdersList: string
    private detailsContent = '.details-content'

    constructor(orderId: string) {
        this.myOrdersList = 'wow-my-orders-list-container';
        this.orderId = orderId;
        this.waitandReload();

    }
    // Logic to wait and reload my order page and check if order exists
    private waitandReload(){
        let reloadCount = 0
        const reloadLimit = 10
        const checkAndReload = (orderId: any) => {
        this.getmyOrderListContainersOnPage().invoke('text').then((text) => {
            if (text.includes(this.orderId)) {
                cy.log('Order loaded', orderId)
            } 
            else {
                cy.wait(15000, { log: false })
                reloadCount += 1
                cy.log(`reload **${reloadCount} / ${reloadLimit}**`)
                if (reloadCount > reloadLimit) {
                   throw new Error('Reload limit reached')
                }
                cy.reload()
                checkAndReload(this.orderId)
                }
            })
        }
        
        cy.checkIfElementExists('wow-my-orders-list-container').then((orderExists: boolean) => {
        cy.log('the flag', orderExists)
        if (orderExists === true){
            checkAndReload(this.orderId)
        }
        else {
            cy.wait(15000, { log: false })
            reloadCount += 1
            cy.log(`reload **${reloadCount} / ${reloadLimit}**`)
            if (reloadCount > reloadLimit) {
            throw new Error('Reload limit reached')
            }
            cy.reload()
            checkAndReload(this.orderId)
            }
          
        })
    }
    private getmyOrderListContainersOnPage(){
        return cy.get(this.myOrdersList).find('.order >' + this.detailsContent)
    }

    private getMyOrdersListContainer(orderId: string) {
        return cy.get(this.myOrdersList).filter(`:contains(${orderId})`)
    }

   private getMyOrdersContainerHeader(){
        return this.getMyOrdersListContainer(this.orderId).find('.header')
    }

    getMyOrderNumber() {
        return this.getMyOrdersListContainer(this.orderId).find('.order >' + this.detailsContent)
    }

    getOrderDateString() {
        return this.getMyOrdersContainerHeader().find('section.date > .content')
    }

    getOrderTotalString() {
        return this.getMyOrdersContainerHeader().find('section.total > .content')
    }

    getDeliveryDateString() {
        return this.getMyOrdersListContainer(this.orderId).find('.delivery >' + this.detailsContent)
    }

    getTrackMyOrderLink() {
        return this.getMyOrdersListContainer(this.orderId).find('.auto_my-orders-tmo-link.button')
    }

    getViewOrderDetailsLink() {
        return this.getMyOrdersListContainer(this.orderId).find('.view-order-link')
    }

}
