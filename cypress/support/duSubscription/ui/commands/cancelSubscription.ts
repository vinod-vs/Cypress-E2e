import { onDeliveryUnlimitedPaymentConfirmation } from '../pageObjects/deliveryUnlimitedPaymentConfirmation'
import { onDeliveryUnlimitedMyaccountMain } from '../pageObjects/deliveryUnlimitedMyaccountMain'
import { onDeliveryUnlimitedMyaccountCancel } from '../pageObjects/deliveryUnlimitedMyaccountCancel'

/*
** This command will cancel  a Delivery Unlimited subscription
*/
Cypress.Commands.add('cancelSubscription', () => {
  // Visit DU page under My account
  onDeliveryUnlimitedPaymentConfirmation.getLinkToMyAccount().click()
  onDeliveryUnlimitedMyaccountMain.getManageSubscriptionSection().click()
  onDeliveryUnlimitedMyaccountMain.getCancelSubscriptionButton().click()

  // Cancel the subscriptipn
  onDeliveryUnlimitedMyaccountCancel.getWhyCancelOption01().click()
  onDeliveryUnlimitedMyaccountCancel.getConfirmCancellationButton().click()
  onDeliveryUnlimitedMyaccountCancel.getBackToMyAccountButton().click()

  // On DU landing page, confirm if the subscription has been cancelled(Opted out)
  onDeliveryUnlimitedMyaccountMain.getRevertOptOutMessageTitle().should('contain.text', 'Delivery Unlimited cancelled')
  onDeliveryUnlimitedMyaccountMain.getSubscriptionMainInfoSection().should('contain.text', 'End date')
})


