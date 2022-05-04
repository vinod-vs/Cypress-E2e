import { Notification } from '../../../shared/ui/components/Notification'
import moment from 'moment'

export class OrderConfirmationPage {
  private readonly marketplaceRestrictionNotification = 'shared-order-market-restriction-notification'

  getBackToHomeLink () {
    return cy.contains('Back to home')
  }

  getOrderConfirmationHeader () {
    return cy.get('.confirmation-container__header')
  }

  getMakeChangesToMyOrderButton () {
    return cy.contains('Make changes to my order')
  }

  getTrackMyOrderButton () {
    return cy.contains('Track my order')
  }

  getConfirmationFulfilmentDetailsContentElement () {
    return cy.get('.confirmation-fulfilment-details__content')
  }

  getOrderNumberElement () {
    return cy.get('.confirmation-fulfilment-details__section-inline-text')
  }

  getOrderFulfilmentTime () {
    return cy.get('.confirmation-fulfilment-details__time')
  }

  getOrderNotesElement () {
    return cy.get('.confirmation-fulfilment-details__section-notes')
  }

  restrictedNotification (): Notification {
    return new Notification(cy.get(this.marketplaceRestrictionNotification))
  }

  getOrderRestrictedNotification () {
    return cy.get('.notification-container p')
  }

  getOrderPaymentSummaryOrderCreatedDateElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Order created')
  }

  getOrderPaymentSummarySubtotalAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Subtotal')
  }

  getOrderPaymentSummaryBagsAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('bags')
  }

  getOrderPaymentSummaryServiceFeeAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Service fee')
  }

  getOrderPaymentSummaryTotalAmountElement () {
    return this.getOrderPaymentSummaryDetailInfoValue('Total')
  }

  getOrderSplitPaymentPaidWithGiftCardAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with Gift Card')
  }

  getOrderSplitPaymentPaidWithCreditCardAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with Credit Card')
  }

  getOrderSplitPaymentPaidWithPayPalAmount () {
    return this.getOrderSplitPaymentInstrumentPaidAmount('Paid with PayPal')
  }

  goBackToHomePage () {
    this.getBackToHomeLink().click()
  }

  goToMyOrderDetailsPage () {
    this.getMakeChangesToMyOrderButton().click()
  }

  goToTrackMyOrderPage () {
    this.getTrackMyOrderButton().click()
  }

  VerifyOrderConfirmationHeader(){
    this.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received');
    cy.url().should('include', '/confirmation');
  }

  VerifyFulfilmentAddress(expectedAddressAliasString: string){
    cy.get<string>('@' + expectedAddressAliasString).then(expectedAddress => {
      this.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedAddress);
    })
  }

  VerifyFulfilmentDay(expectedDayAliasString: string){
    cy.get<string>('@' + expectedDayAliasString).then(expectedFulfilmentDay => {

      // This is for handling the case when tests running on VM, the machine local time is one day back of woolworths app server time, 
      // if script selects same day window, the checkout page will show day of week of tomorrow but order confirmaiton page shows 'Tomorrow'
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      cy.getDayOfWeek(tomorrow).then((tomorrowDayOfWeek : string) => {
        if(expectedFulfilmentDay.includes(tomorrowDayOfWeek)){
          this.getConfirmationFulfilmentDetailsContentElement().should('contain.text', 'Tomorrow');
        }
        else{
          this.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentDay);
        }
      })
    })
  }

  VerifyFulfilmentTime(expectedTimeAliasString: string){
    cy.get<string>('@' + expectedTimeAliasString).then(expectedFulfilmentTime => {
      this.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentTime);
    })
  }

  VerifyDeliveryNowFulfilmentTime(expectedDNTimeAliasString: string){
    cy.get<string>('@' + expectedDNTimeAliasString).then(expectedDNFulfilmentTime => {
      this.checkIfGivenDeliveryNowTimeIsInFulfilmentTimeRange(expectedDNFulfilmentTime)
    })
  }

  VerifyTotalAmount(expectedTotalAmountAliasString: string){
    cy.get<string>('@' + expectedTotalAmountAliasString).then(expectedTotalAmount => {
      this.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount);
    })
  }

  VerifySplitPaymentGiftCardAmount(expectedGiftCardAmount: number){
    this.getOrderSplitPaymentPaidWithGiftCardAmount().should(giftCardAmountElement => {
      const giftCardPaidAmount = giftCardAmountElement.text().trim().substring(1)
      expect(Number(giftCardPaidAmount)).to.equal(expectedGiftCardAmount)
    })
  }

  VerifySplitPaymentCreditCardAmount(paidGiftCardAmount: number){
    this.getOrderSplitPaymentPaidWithCreditCardAmount().then(creditCardAmountElement => {
      const creditCardPaidAmount = creditCardAmountElement.text().trim().substring(1)
      this.getOrderPaymentSummaryTotalAmountElement().should(totalAmountElement => {
        const totalPaidAmount = totalAmountElement.text().trim().substring(1);
        expect(Number(creditCardPaidAmount)).to.equal(Number(totalPaidAmount) - paidGiftCardAmount)
      })
    })
  }

  VerifySplitPaymentPayPalAmount(paidGiftCardAmount: number){
    this.getOrderSplitPaymentPaidWithPayPalAmount().then(paypalAmountElement => {
      const paypalPaidAmount = paypalAmountElement.text().trim().substring(1)
      this.getOrderPaymentSummaryTotalAmountElement().should(totalAmountElement => {
        const totalPaidAmount = totalAmountElement.text().trim().substring(1);
        expect(Number(paypalPaidAmount)).to.equal(Number(totalPaidAmount) - paidGiftCardAmount)
      })
    })
  }

  private checkIfGivenDeliveryNowTimeIsInFulfilmentTimeRange (DNFulfilmentTimeString: string) {

    cy.log('Expect to find time string ' + DNFulfilmentTimeString + ' on confirmaiton page')

    this.getOrderFulfilmentTime().then(timeElement => {
      cy.log('Order fulfilment time is ' + timeElement.text()).then(()=>{
        if(timeElement.text().toLocaleLowerCase().includes(DNFulfilmentTimeString.toLocaleLowerCase())){
          assert.ok(DNFulfilmentTimeString + ' is on confirmation page')
        }
        else{
          // 5:55PM - 6:05PM
          let timeStringsArray = timeElement.text().split('-')

          // 5:55PM -> 17:55
          let startMoment = moment(timeStringsArray[0].trim(), ["h:mm A"])
          let endMoment = moment(timeStringsArray[1].trim(), ["h:mm A"])
          let expectedMoment = moment(DNFulfilmentTimeString, ["h:mm A"])

          assert.isTrue(expectedMoment.isBetween(startMoment, endMoment), 'Expected Time ' + DNFulfilmentTimeString + " is in estimated arrival time range " + timeElement.text())
        }
      })
    })
  }

  private getOrderPaymentSummaryDetailInfoValue (typeName: string) {
    return cy.contains(typeName).parents('.confirmation-order-information__row').find('.confirmation-order-information__highlight')
  }

  private getOrderSplitPaymentInstrumentPaidAmount (typeName: string) {
    return cy.contains(typeName).parents('.confirmation-order-information__label__row').find('.confirmation-order-information__highlight').eq(1)
  }
}

export const onOrderConfirmationPage = new OrderConfirmationPage()
