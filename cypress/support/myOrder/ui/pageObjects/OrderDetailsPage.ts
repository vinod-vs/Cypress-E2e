export class OrderDetailsPage {
    
    getOrderDetails(){
        return cy.get('.order-details')
    }
    getCancelMyOrderButton() {
       return this.getOrderDetails().find('.cancel-link')
      }

    getCancelMyOrderModal() {
        return cy.get('.order-modal')
    }  

     getCancelMyOrderModalCheckbox() {
      return this.getCancelMyOrderModal().find('[type="checkbox"]')
     }

     getCancelMyOrderModalButton(){
     return cy.get('.checkbox-container.selected').parents('div').find('button.primary').eq(1)
     }

     getCancelledStatus(){
         return cy.get('.fulfilment-details-panel').find('.cancelled-status')
     }

     getChangeOrderButton(){
        return cy.get('.your-groceries-panel').find('button.secondary')
     }
     
    getChangeMyOrderModal() {
        return cy.get('.order-modal')
    } 

    getChangeMyOrderModalCheckbox() {
        return this.getChangeMyOrderModal().find('[type="checkbox"]')
    }

    getChangeMyOrderModalButton(){
        return cy.get('.checkbox-container.selected').parents('div').find('button.primary').eq(0)
    }

}
export const onOrderDetailsPage = new OrderDetailsPage()