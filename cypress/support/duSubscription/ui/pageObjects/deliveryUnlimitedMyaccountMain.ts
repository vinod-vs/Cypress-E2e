//
// This class will capture DOM elements on the delivery unlimited landing page under My account
// This page is only accessible to only delivery unlimited subscribers
//

export class DeliveryUnlimitedMyaccountMain {
  getPageURL () {
    return cy.url()
  }

  getManageSubscriptionSection () {
    //return cy.get('[class="symbol ng-tns-c188-17 ng-star-inserted"]')
    return cy.contains('Manage Subscription')
  }

  getCancelSubscriptionButton () {
    return cy.get('wow-delivery-unlimited-subscription .shared-card:nth-of-type(2) .button--large')
  }

  getRevertOptOutMessageTitle () {
    return cy.get('.ng-star-inserted.notificationMessage-title')
  }

  getSubscriptionMainInfoSection () {
    return cy.get('.deliverySaverSubscriptionDetail-rows.shared-card')
  }

}

export const onDeliveryUnlimitedMyaccountMain = new DeliveryUnlimitedMyaccountMain()
