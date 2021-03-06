export class MyOrderPage {
  private readonly orderId: string
  myOrdersList: string
  myOrdersListB2B: string
  private readonly detailsContent = '.details-content'

  constructor(orderId: string) {
    this.myOrdersList = 'wow-my-orders-list-container'
    this.myOrdersListB2B = 'wow-my-orders-container'
    this.orderId = orderId
    this.waitandReload()
  }

  // Logic to wait and reload my order page and check if order exists
  private waitandReload() {
    let reloadCount = 0
    const reloadLimit = 10
    const checkAndReload = (orderId: any) => {
      if (Cypress.env('b2bPlatform')) {
        cy.checkIfElementExists('wow-my-orders-container').then(
          (orderExists: boolean) => {
            cy.log('the flag', orderExists)
            if (orderExists) {
              this.getmyOrderListContainersOnPage()
                .invoke('text')
                .then((text) => {
                  if (text.includes(this.orderId)) {
                    cy.log('Order loaded', orderId)
                  }
                })
            } else {
              cy.wait(15000, { log: false })
              reloadCount += 1
              cy.log(`reload **${reloadCount} / ${reloadLimit}**`)
              if (reloadCount > reloadLimit) {
                throw new Error('Reload limit reached')
              }
              cy.reload()
              checkAndReload(this.orderId)
            }
          }
        )
      } else {
        cy.checkIfElementExists('wow-my-orders-list-container').then(
          (orderExists: boolean) => {
            cy.log('the flag', orderExists)
            if (orderExists) {
              this.getmyOrderListContainersOnPage()
                .invoke('text')
                .then((text) => {
                  if (text.includes(this.orderId)) {
                    cy.log('Order loaded', orderId)
                  }
                })
            } else {
              cy.wait(15000, { log: false })
              reloadCount += 1
              cy.log(`reload **${reloadCount} / ${reloadLimit}**`)
              if (reloadCount > reloadLimit) {
                throw new Error('Reload limit reached')
              }
              cy.reload()
              checkAndReload(this.orderId)
            }
          }
        )
      }
    }
  }

  private getmyOrderListContainersOnPage() {
    if (Cypress.env('b2bPlatform')) {
      return cy.get(this.myOrdersListB2B).find('.order >' + this.detailsContent)
    } else {
      return cy.get(this.myOrdersList).find('.order >' + this.detailsContent)
    }
  }

  private getMyOrdersListContainer(orderId: string) {
    if (Cypress.env('b2bPlatform')) {
      return cy.get(this.myOrdersListB2B).filter(`:contains(${orderId})`)
    } else {
      return cy.get(this.myOrdersList).filter(`:contains(${orderId})`)
    }
  }

  private getMyOrdersContainerHeader() {
    return this.getMyOrdersListContainer(this.orderId).find('.header')
  }

  getMyOrderNumber() {
    return this.getMyOrdersListContainer(this.orderId).find(
      '.order >' + this.detailsContent
    )
  }

  getOrderDate() {
    return this.getMyOrdersContainerHeader().find('section.date > .content')
  }

  getOrderTotal() {
    return this.getMyOrdersContainerHeader().find('section.total > .content')
  }

  getDeliveryDate() {
    return this.getMyOrdersListContainer(this.orderId).find(
      '.delivery >' + this.detailsContent
    )
  }

  getTrackMyOrderLink() {
    return this.getMyOrdersListContainer(this.orderId).find(
      '.auto_my-orders-tmo-link.button'
    )
  }

  getViewOrderDetailsLink() {
    return this.getMyOrdersListContainer(this.orderId)
      .find('.view-order-link')
      .first()
  }
}
