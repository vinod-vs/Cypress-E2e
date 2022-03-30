import 'cypress-iframe'

export class CheckoutPaymentPanel{
    getPlaceOrderButton () {
        return cy.get('.payment-placeOrderButtonContainer button')
    }
    //#region - Everyday Rewards
    getRewardsContainer () {
        return cy.get('wow-checkout-rewards-container')
    }

    getRewardsDollarsToggleButton () {
        return this.getRewardsContainer().find('.toggle-button')
    }

    getRewardsDollarsBalanceAmountElement () {
        return this.getRewardsDollarsToggleButton().contains('Balance')
    }

    getRewardsDollarsDecreaseButton () {
        return this.getRewardsContainer().find('button.increment')
    }

    getRewardsDollarsIncreaseButton () {
        return this.getRewardsContainer().find('button.decrement')
    }

    getRewardsDollarsStepperAmountElement () {
        return this.getRewardsContainer().find('.stepper-content')
    }

    getRewardsDollarsResetLink () {
        return this.getRewardsContainer().find('a')
    }

    getRewardsDollarUseButton () {
        return this.getRewardsContainer().find('.submit-button button')
    }
    //#endregion

    //#region  - promo code
    getPromoCodeContainer () {
        return cy.get('wow-checkout-promo-code-container')
    }

    getPromoCodeToggleButton () {
        return this.getPromoCodeContainer().find('.toggle-button')
    }

    getPromoCodeEnterTextbox () {
        return this.getPromoCodeContainer().find('.promo-code-input')
    }

    getPromoCodeApplyButton () {
        return this.getPromoCodeContainer().find('.promo-code-apply-button button')
    }

    getPromoCodeDollarsAmount () {
        return this.getPromoCodeContainer().find('.promo-amount')
    }

    getPromoCodeRemoveButton () {
        return this.getPromoCodeContainer().find('.promo-remove-button')
    }
    //#endregion

    //#region - payment details
    getPaymentDetailsContainer () {
        return cy.get('wow-checkout-payment-details')
    }
    
    getPaymentYouHaveSavedAmountElement () {
        return this.getPaymentDetailsContainer().find('.payment-save-earn .rewards-credits-redeemed')
    }

    getPaymentRewardsPointElement () {
        return this.getPaymentDetailsContainer().find('.rewards span')
    }

    getPaymentSubtotalAmountElement () {
        return this.getPaymentDetailsContainer().find('#checkout-items-subtotal .payment-amount')
    }

    getOrderDiscountAmountElement () {
        return this.getAmountElementByPaymentTitle('Order discount')
    }

    getPaymentPaperBagsAmountElement () {
        return this.getAmountElementByPaymentTitle('bags')
    }

    getPaymentServiceFeeAmountElement () {
        return this.getAmountElementByPaymentTitle('Service fee')
    }

    getPaymentServiceFeeDiscountAmountElement () {
        return this.getAmountElementByPaymentTitle('Service fee discount')
    }

    getPaymentDeliveryFeeAmountElement () {
        return this.getAmountElementByPaymentTitle('Delivery fee')
    }

    getPaymentDeliveryFeeDiscountAmountElement () {
        return this.getAmountElementByPaymentTitle('Delivery fee discount')
    }
    
    getPaymentTotalAmountElement () {
        return this.getAmountElementByPaymentTitle('Total')
    }

    getPaymentRewardsDollarsRedeemedAmountElement () {
        return this.getAmountElementByPaymentTitle('Everyday Rewards dollars')
    }

    getPaymentStillToPayAmountElement() {
        return this.getAmountElementByPaymentTitle('Still to pay')
    }
    //#endregion

    //#region - credit card 
    getCreditCardInstrumentToggleButton () {
        return cy.get('wow-credit-card-instruments .toggle-button')
    }

    getSaveCreditCardForLaterCheckbox () {
        return cy.get('.auto_credit-card-save-for-later .checkbox-box')
    }

    getCreditCardManagementLink () {
        return cy.get('.digitalPayInstruments-manage')
    }

    getAddNewCreditCardButton () {
        return cy.get('.creditCards-add-button')
    }
    //#endregion

    //#region - paypal
    getLinkNewPaypalInstrumentButton () {
        return cy.get('wow-paypal-instrument .paypal-manage-action')
    }

    getExistingPaypalInstrumentItem () {
        return cy.get('.paypal-list-item .digitalPayListItem')
    }
    //#endregion

    //#region - gift card
    getGiftCardInstrumentToggleButton () {
        return cy.get('wow-gift-card-instruments .toggle-button')
    }

    getNewGiftCardNumberTextbox () {
        return cy.get('wow-gift-card-add-payment #newGiftCardNumber')
    }

    getNewGiftCardPinTextbox () {
        return cy.get('wow-gift-card-add-payment #newGiftCardPin')
    }

    getNewGiftCardAmountTextBox() {
        return cy.get('wow-gift-card-add-payment #newGiftCardAmount')
    }

    getNewGiftCardBalanceElement() {
        return cy.get('wow-gift-card-add-payment #newGiftCardBalance')
    }
    //#endregion

    //#region - general actions
    inputNewCreditCardDetails (cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string) {
        cy.checkIfElementExists('.creditCards-add-button').then((exist:boolean) => {
            if(!exist){
                this.getCreditCardInstrumentToggleButton().click()
            }
            else{
                this.getAddNewCreditCardButton().click()
            }
        })

        cy.iframe('.creditCardAdd-iframe').find('#card_number').type(cardNumber)
        cy.iframe('.creditCardAdd-iframe').find('#expiry_month').type(expiryMonth)
        cy.iframe('.creditCardAdd-iframe').find('#exp_year').type(expiryYear)
        cy.iframe('.creditCardAdd-iframe').find('#cvv_csv').type(cvv)
    }

    payWithNewCreditCard (cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string) {
        this.inputNewCreditCardDetails(cardNumber, expiryMonth, expiryYear, cvv)
        this.getPlaceOrderButton().click()
    }

    inputExistingCreditCardDetails(cardNumberLast4Digit: string, cvv: string){
        var iframeTitleSelectorString = '[title="CVV for card ending in ' + cardNumberLast4Digit + '"' + ']'
        var getiframeTitleSelectorString = 'iframe[title="CVV for card ending in ' + cardNumberLast4Digit + '"' + ']'
        cy.get('wow-credit-card-item .digitalPayListItem .creditCardItem-mainText', { timeout: 10000 }).should('be.visible');
        cy.checkIfElementExists(getiframeTitleSelectorString).then((existance:boolean) => {
            if(!existance){
                cy.get('wow-credit-card-item .digitalPayListItem .creditCardItem-mainText').contains(cardNumberLast4Digit).click()        
            }
        })
        cy.iframe(iframeTitleSelectorString).find('#cvv_csv').type(cvv)
    }

    payWithExistingCreditCard (cardNumberLast4Digit: string, cvv: string) {
        this.inputExistingCreditCardDetails(cardNumberLast4Digit, cvv)
        this.getPlaceOrderButton().click()
    }

    selectExistingPaypal () {
        this.getExistingPaypalInstrumentItem()
        .invoke('attr', 'class')
        .then(classValue => {
            if(!classValue?.includes('selected')){
                this.getExistingPaypalInstrumentItem().click()
            }   
        })
    }

    payWithExistingPayPal () {
        this.selectExistingPaypal()
        this.getPlaceOrderButton().click()
    }

    inputNewGiftCardDetails(giftCardNumber: string, pin: string, amount: number) {
        this.getGiftCardInstrumentToggleButton()
        .invoke('attr', 'aria-pressed')
        .then(attributeValue => {
            if(attributeValue?.includes('false')){
                this.getGiftCardInstrumentToggleButton().click()
            }
        })

        cy.intercept(Cypress.env('unsavedGiftCardBalanceEndpoint')).as('checkNewGiftCardBalance')
        this.getNewGiftCardNumberTextbox().type(giftCardNumber)
        this.getNewGiftCardPinTextbox().type(pin)
        cy.wait('@checkNewGiftCardBalance')

        this.getNewGiftCardBalanceElement()
        .should('not.be.disabled')
        .then(element=> {
            cy.wrap(element).find('div').then(availableBalanceEle => {
                var balanceText = availableBalanceEle.text().substring(1)
                expect(amount).not.greaterThan(Number(balanceText))
            })
        })

        this.getNewGiftCardAmountTextBox().clear().type(String(amount))
    }

    payWithNewGiftCard (giftCardNumber: string, pin: string, amount: number) {
        this.inputNewGiftCardDetails(giftCardNumber, pin, amount)
        this.getPlaceOrderButton().click()
    }

    splitPayWithNewCreditCardAndNewGiftCard(cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string, giftCardNumber: string, pin: string, amount: number){
        this.inputNewCreditCardDetails(cardNumber, expiryMonth, expiryYear, cvv)
        this.inputNewGiftCardDetails(giftCardNumber, pin, amount)
        this.getPlaceOrderButton().click()
    }

    splitPayWithExistingPaypalAndNewGiftCard(giftCardNumber: string, pin: string, amount: number){
        this.selectExistingPaypal()
        this.inputNewGiftCardDetails(giftCardNumber, pin, amount)
        this.getPlaceOrderButton().click()
    }

    redeemRewardsDollars (dollarAmount: number) {
        this.getRewardsDollarsToggleButton()
        .invoke('attr', 'aria-pressed')
        .then(attributeValue => {
            if(attributeValue?.includes('false')){
                this.getRewardsDollarsToggleButton().click()
            }
        })

        var currentAmount = 0
        while(currentAmount < dollarAmount) {
            this.getRewardsDollarsIncreaseButton().click()
            currentAmount = currentAmount + 10
        }

        this.getRewardsDollarUseButton().click()
    }

    addPromoCode (promoCode: string) {
        this.getPromoCodeToggleButton()
        .invoke('attr', 'aria-pressed')
        .then(attributeValue => {
            if(attributeValue?.includes('false')){
                this.getPromoCodeToggleButton().click()
            }
        })
        this.getPromoCodeEnterTextbox().type(promoCode)
        this.getPromoCodeApplyButton().click()
    }
    //#endregion

    //#region - private methods
    private getAmountElementByPaymentTitle (titleText: string) {
        return this.getPaymentDetailsContainer().find('.payment-row')
                .contains(titleText)
                .parent()
                .children('.payment-amount')
    }
    //#endregion
}

export const onCheckoutPaymentPanel = new CheckoutPaymentPanel()