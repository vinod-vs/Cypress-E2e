export class OrderDetailsPage {

  getOrderDetails () {
    return cy.get('.order-details')
  }

  getCancelMyOrderButton () {
    return this.getOrderDetails().find('.cancel-link')
  }

  getCancelMyOrderModal () {
    return cy.get('.order-modal')
  }

  getMyOrderModalCheckbox () {
    return this.getCancelMyOrderModal().find('[type="checkbox"]')
  }

  getCancelMyOrderModalButton () {
    return this.getMyOrderModalButton().eq(1)
  }

  getCancelledStatus () {
    return cy.get('.fulfilment-details-panel').find('.cancelled-status')
  }

  getChangeOrderButton () {
    return cy.get('.your-groceries-panel').find('button.secondary')
  }

  getChangeMyOrderModalButton () {
    return this.getMyOrderModalButton().eq(0)
  }

  private getMyOrderModalButton () {
    return cy.get('.checkbox-container.selected').parents('div').find('button.primary')
  }
}

export const onOrderDetailsPage = new OrderDetailsPage()
