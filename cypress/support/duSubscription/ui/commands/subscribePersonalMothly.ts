import { onDeliveryUnlimitedLanding } from '../pageObjects/deliveryUnlimitedLanding'
import { onDeliveryUnlimitedPayment } from '../pageObjects/deliveryUnlimitedPayment'
import { onDeliveryUnlimitedPaymentConfirmation } from '../pageObjects/deliveryUnlimitedPaymentConfirmation'
import { onMyAccountPage } from '../../../myAccount/ui/pageObjects/MyAccountPage'

/*
** This command will subscribe a user to Delivery Unlimited monthly plan
** Age of the user will be less than 60
*/
Cypress.Commands.add('subscribeToDUMonthlyPersonal', () => {
    onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
    onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

    // On DU landing page
    onDeliveryUnlimitedLanding.getMonthlyPlanName().contains('Monthly')
    onDeliveryUnlimitedLanding.getMonthlyPlanSection().contains('Monthly').click()
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
    onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text','Free Delivery Unlimited Trial has successfully started')
    onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text','30 Day Free trial')
    
})


/*
** This command will subscribe a user to Delivery Unlimited monthly plan
** Age of the user will be greater than 60
*/
Cypress.Commands.add('subscribeToDUMonthlySenior', () => {
    onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
    onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

    // On DU landing page
    onDeliveryUnlimitedLanding.getMonthlyPlanNameSenior().contains('Monthly')
    onDeliveryUnlimitedLanding.getMonthlyPlanSection().contains('Monthly').click()
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
    onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text','Free Delivery Unlimited Trial has successfully started')
    onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text','30 Day Free trial')
    
})


/*
** This command will subscribe a business user to Delivery Unlimited monthly plan
*/
Cypress.Commands.add('subscribeToDUMonthlyBusiness', () => {
    onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
    onMyAccountPage.getDeliveryUnlimitedSideNavLink().click()

    // On DU landing page
    onDeliveryUnlimitedLanding.getMonthlyPlanNameBusiness().contains('Monthly')
    onDeliveryUnlimitedLanding.getMonthlyPlanSection().contains('Monthly').click()
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
    onDeliveryUnlimitedPaymentConfirmation.getDescription().should('contain.text','Free Delivery Unlimited Trial has successfully started')
    onDeliveryUnlimitedPaymentConfirmation.getConfirmedPlanName().should('contain.text','30 Day Free trial')
    
})
