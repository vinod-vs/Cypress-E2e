import { onDeliveryUnlimitedLanding } from '../pageObjects/deliveryUnlimitedLanding'
import { onDeliveryUnlimitedPayment } from '../pageObjects/deliveryUnlimitedPayment'
import { onDeliveryUnlimitedPaymentConfirmation } from '../pageObjects/deliveryUnlimitedPaymentConfirmation'
import { onMyAccountPage } from '../../../myAccount/ui/pageObjects/MyAccountPage'

/*
** This command will subscribe a user to Delivery Unlimited yearly plan
** Age of the user will be less than 60
*/
Cypress.Commands.add('subscribeToDUYearlyPersonal', () => {
  onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
  onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

  // On DU landing page
  onDeliveryUnlimitedLanding.getAnnualPlanName().contains('Annual')
  onDeliveryUnlimitedLanding.getAnnualPlanSection().contains('Annual').click()
  onDeliveryUnlimitedLanding.getStartTrialButton().click()

  // On DU payments page
  onDeliveryUnlimitedPayment.getPageHeading().contains('Summary')
  onDeliveryUnlimitedPayment.getCreditCardSelection().click()
  cy.wait(5000)
  onDeliveryUnlimitedPayment.setDUPaymentDetails()
  onDeliveryUnlimitedPayment.getBillingAddress().type('1 York St, SYDNEY')
  cy.wait(1000)
  onDeliveryUnlimitedPayment.getBillingAddressFirstEntry().click()
  onDeliveryUnlimitedPayment.getTermAndConditions().click()
  onDeliveryUnlimitedPayment.getSubmitButton().click()

  // On DU payments confirmation page
  onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text', 'Free Delivery Unlimited Trial has successfully started')
  onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text', '30 Day Free trial')
})

/*
** This command will subscribe a user to Delivery Unlimited yearly plan
** Age of the user will be greater than 60
*/
Cypress.Commands.add('subscribeToDUYearlySenior', () => {
  onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
  onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

  // On DU landing page
  onDeliveryUnlimitedLanding.getAnnualPlanNameSenior().contains('Annual')
  onDeliveryUnlimitedLanding.getAnnualPlanSection().contains('Annual').click()
  onDeliveryUnlimitedLanding.getStartTrialButton().click()

  // On DU payments page
  onDeliveryUnlimitedPayment.getPageHeading().contains('Summary')
  onDeliveryUnlimitedPayment.getCreditCardSelection().click()
  cy.wait(5000)
  onDeliveryUnlimitedPayment.setDUPaymentDetails()
  onDeliveryUnlimitedPayment.getBillingAddress().type('1 York St, SYDNEY')
  cy.wait(1000)
  onDeliveryUnlimitedPayment.getBillingAddressFirstEntry().click()
  onDeliveryUnlimitedPayment.getTermAndConditions().click()
  onDeliveryUnlimitedPayment.getSubmitButton().click()

  // On DU payments confirmation page
  onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text', 'Free Delivery Unlimited Trial has successfully started')
  onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text', '30 Day Free trial')
})

/*
** This command will subscribe a business user to Delivery Unlimited yearly plan
*/
Cypress.Commands.add('subscribeToDUYearlyBusiness', () => {
  onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
  onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

  // On DU landing page
  onDeliveryUnlimitedLanding.getAnnualPlanNameBusiness().contains('Annual')
  onDeliveryUnlimitedLanding.getAnnualPlanSection().contains('Annual').click()
  onDeliveryUnlimitedLanding.getStartTrialButton().click()

  // On DU payments page
  onDeliveryUnlimitedPayment.getPageHeading().contains('Summary')
  onDeliveryUnlimitedPayment.getCreditCardSelection().click()
  cy.wait(5000)
  onDeliveryUnlimitedPayment.setDUPaymentDetails()
  onDeliveryUnlimitedPayment.getBillingAddress().type('1 York St, SYDNEY')
  cy.wait(1000)
  onDeliveryUnlimitedPayment.getBillingAddressFirstEntry().click()
  onDeliveryUnlimitedPayment.getTermAndConditions().click()
  onDeliveryUnlimitedPayment.getSubmitButton().click()

  // On DU payments confirmation page
  onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text', 'Free Delivery Unlimited Trial has successfully started')
  onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text', '30 Day Free trial')
})
