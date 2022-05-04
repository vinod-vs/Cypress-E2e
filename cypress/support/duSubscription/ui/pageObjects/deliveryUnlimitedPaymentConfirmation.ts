//
// This class will capture DOM elements on the delivery unlimited payments confirmation page
//

export class DeliveryUnlimitedPaymentsConfirmationPage {
  getPageURL () {
    return cy.url()
  }

  getDescription () {
    return cy.get('.u-flex.u-flexCenter.u-flexColumn > p')
  }

  getConfirmationPlanDetailSection () {
    return cy.get('wow-delivery-unlimited-confirmation-detail')
  }

  getConfirmedPlanName () {
    return cy.get('.\\.u-flexCenterCross h2')
  }

  getConfirmedPaymentSection () {
    return cy.get('.subscription-detail-section:nth-of-type(3) p')
  }

  getNextBillingDate () {
    return cy.get('.subscription-detail-section:nth-of-type(4) p')
  }

  getLinkToMyAccount () {
    return cy.get('[href="\/shop\/myaccount\/deliveryunlimited"]')
  }
}

export const onDeliveryUnlimitedPaymentConfirmation = new DeliveryUnlimitedPaymentsConfirmationPage()
