export class OrderDetailsPage {
    
    private getMyOrderModalButton(){
        return cy.get('.checkbox-container.selected').parents('div').find('button.primary')
    }
    getOrderDetails(){
        return cy.get('.order-details')
    }
    getCancelMyOrderButton() {
       return this.getOrderDetails().find('.cancel-link')
      }

    getMyOrderModal() {
        return cy.get('.order-modal')
    }  

     getMyOrderModalCheckbox() {
      return this.getMyOrderModal().find('[type="checkbox"]')
     }

     getCancelMyOrderModalButton(){
     return this.getMyOrderModalButton().eq(1)
     }

     getCancelledStatus(){
         return cy.get('.fulfilment-details-panel').find('.cancelled-status')
     }

     getChangeOrderButton(){
        return cy.get('.your-groceries-panel').find('button.secondary')
     }
     
    // getChangeMyOrderModal() {
    //     return cy.get('.order-modal')
    // } 

    // getChangeMyOrderModalCheckbox() {
    //     return this.getChangeMyOrderModal().find('[type="checkbox"]')
    // }

    getChangeMyOrderModalButton(){
        return this.getMyOrderModalButton().eq(0)
    }

}
export const onOrderDetailsPage = new OrderDetailsPage()