//
// This class will capture DOM elements on the delivery unlimited cancalation page under My account
// This page is only accessible to only delivery unlimited subscribers
//

export class DeliveryUnlimitedMyaccountCancel {
  getPageURL () {
    return cy.url()
  }

  getWhyCancelOption01 () {
    return cy.get('[for="du-cancel-QUALFRESH"]')
  }

  getConfirmCancellationButton () {
    return cy.get('[buttonclass="primary"]')
  }

  getBackToMyAccountButton () {
    return cy.get('.iconAct-Chevron_Left')
  }

}

export const onDeliveryUnlimitedMyaccountCancel = new DeliveryUnlimitedMyaccountCancel()
