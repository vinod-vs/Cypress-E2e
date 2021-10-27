export class CheckoutTimePanel{
    getChangeTimeButton(){
        return cy.get('#checkout-timePanel .panel-actions-change-button');
    }

    selectDayByKeyword (dayKeyword: string) {
        cy.get('.dates-container-inner button').contains(dayKeyword).click();
    }

    selectFirstAvailableFleetTimeWindow () {

        this.selectDayHavingFleetWindow(0);

        cy.get('#times-radio-group wow-time-slot-time').each(eachTimeSlot => {
            if(!eachTimeSlot.find('.badge').length)
            {
                cy.wrap(eachTimeSlot).click();
                return false;
            }
        })
    }

    //#region - Private methods
    private selectDayHavingFleetWindow (startIndex: number) {

        let found = false;

        cy.get(".dates-container-inner button").its('length').then(len => {
            if (startIndex >= len) {
                throw new Error('Test failed. Unable to find available day having fleet window')
              }
            
            cy.get(".dates-container-inner button").eq(startIndex).click().then(() => {
                var totalWindowLength = Cypress.$('#times-radio-group wow-time-slot-time').length
                var crowdWindowLength = Cypress.$('#times-radio-group wow-time-slot-time .crowd-sourced').length
                var deliveryNowWindowLength = Cypress.$('#times-radio-group wow-time-slot-time .delivery-now').length

                if(totalWindowLength != crowdWindowLength + deliveryNowWindowLength)
                {
                    found = true
                    return false
                }
            })
            .then(() => {
                if (!found) {
                    this.selectDayHavingFleetWindow(++startIndex)
                  }
            })
        })
    }
    //#region 
}

export const onCheckoutTimePanel = new CheckoutTimePanel();