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
    //#endregion

    //#region - general actions
    AddNewCreditCardDetails (cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string) {
        cy.iframe('.creditCardAdd-iframe').find('#card_number').type(cardNumber)
        cy.iframe('.creditCardAdd-iframe').find('#expiry_month').type(expiryMonth)
        cy.iframe('.creditCardAdd-iframe').find('#exp_year').type(expiryYear)
        cy.iframe('.creditCardAdd-iframe').find('#cvv_csv').type(cvv)
    }

    PayWithNewCreditCard (cardNumber: string, expiryMonth: string, expiryYear: string, cvv: string) {
        cy.checkIfElementExists('.creditCards-add-button').then((exist:boolean) => {
            if(!exist){
                this.getCreditCardInstrumentToggleButton().click()
            }
            else{
                this.getAddNewCreditCardButton().click()
            }
        })
        this.AddNewCreditCardDetails(cardNumber, expiryMonth, expiryYear, cvv)
        this.getPlaceOrderButton().click()
    }

    PayWithExistingCreditCard (cardNumberLast4Digit: string, cvv: string) {
        var iframeTitleSelectorString = '[title="CVV for card ending in ' + cardNumberLast4Digit + '"' + ']'
        var getiframeTitleSelectorString = 'iframe[title="CVV for card ending in ' + cardNumberLast4Digit + '"' + ']'
        cy.get('wow-credit-card-item .digitalPayListItem .creditCardItem-mainText', { timeout: 10000 }).should('be.visible');
        cy.checkIfElementExists(getiframeTitleSelectorString).then((existance:boolean) => {
            if(!existance){
                console.log("existance of iframe " + existance)
                cy.get('wow-credit-card-item .digitalPayListItem .creditCardItem-mainText').contains(cardNumberLast4Digit).click()        
            }
        })
        cy.iframe(iframeTitleSelectorString).find('#cvv_csv').type(cvv)
        this.getPlaceOrderButton().click()
    }

    PayWithExistingPayPal () {
        this.getExistingPaypalInstrumentItem()
        .invoke('attr', 'class')
        .then(classValue => {
            if(!classValue?.includes('selected')){
                this.getExistingPaypalInstrumentItem().click()
            }   
        })
        this.getPlaceOrderButton().click()
    }

    RedeemRewardsDollars (dollarAmount: number) {
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

    AddPromoCode (promoCode: string) {
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