type RetryOptions = import('cypress/types/utilities/retryOptions').RetryOptions;

declare namespace Cypress {
  interface Chainable {
    // Cypress custom commands
    clearCookies(value: any): void;
    clearLocalStorage(value: any): void;
    loginViaApi(value: any): any;
    searchPickupDTBStores(fulfilmentType: string, searchValue: any): any;
    addDeliveryAddress(): any;
    searchDeliveryAddress(addressSearchBody: any): any;
    getFulfilmentWindowViaApi(windowType: string): any;
    completeWindowFulfilmentViaApi(): any;
    clearTrolley(): any;
    viewTrolley(): any;
    addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm: string, priceThreshold: number): any;
    addAvailableQuantityLimitedItemsToTrolley(searchTerm: string, quantity:number):any;
    navigateToCheckout(): any;
    navigatingToCreditCardIframe(): any;
    creditcardTokenisation(cardDetails: any, sessionHeader: any): any;
    digitalPay(digiPayRequest: any): any;
    confirmOrder(orderDetails: any): any;
    logOutViaApi(): void;
    setSignUpDetails(): any;
    signUpViaApi(signUpDetails: any): any;
    signUpViaApiWith2FA(signUpDetails: any): any;
    setDeliveryOptionsViaApi(deliveryOptions: any): any;
    setFulfilmentLocationWithWindow(fulfilmentType: string, addressSearchBody: any, windowType: string): any;
    placeOrderViaApiWithAddedCreditCard(creditCardDetails: any, platform: string): any;
    api(request: any): any;
    navigateExpressionOfInterestPage(expressionOfInterestPageEndPoint: string): any;
    setFulfilmentLocationWithoutWindow(fulfilmentType: string, location: any): any;
    checkIfElementExists(element: any): any;
    selectRandomElement(): any;
    getBootstrapResponse(): any;
    getRandomAvailableWindowViaApi(addressId: string, areaId: string, suburbId: string, fulfilmentType: string, windowType: string): any;
    getDayOfWeek(date: Date): any;
    formatToAmPm(time: any): any;
    loginViaUi(shopper: any): any;
    searchBillingAddressViaApi(address: string): any;
    setBillingAddressViaApi(addressId: number): any;
    loginWithNewShopperViaApi(): any;
    adminLoginViaUi(loginDetails: any): any;
    setFulfilmentLocationWithoutWindow(fulfilmentType: string, locationSearch: string | number): any;
    selectRandomWindowInCheckout(fulfilmentType: string, fulfilmentWindow: string): any;
    removeNewLineCarriageReturn(initialText: string): Cypress.Chainable<string>;
    prepareAnySingleLineItemEdmOrder(searchTerm: string, purchaseQty: number): void;
    redeemRewardsDollars(redeemAmount: number): any;
    redeemRewardsCredits(enabled: boolean): any;
    addPromotionCode(promoCode: string): any;
    removePromotionCode(promoCode: string): any;
    placeOrderUsingCreditCard(): any;
    placeOrderUsingCreditCardAndGiftCard(): any;
    ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId: number, orderId: number, retryOptions: RetryOptions): any;
    cancelLineItemInInvoice(encodedInvoiceId: string, encodedLineItemId: string, quantity: number, dispatched: boolean): any;
    getAllRefundsByOrderId(traderOrderId: number): any;
    getAllRefundPaymentsByRefundId(refundId: number): any;
    getAllRefundsByOrderIdWithRetry(traderOrderId: number, retryOptions: any): any;
    getAllRefundPaymentsByRefundIdWithRetry(refundId: number, retryOptions: any): any;
    findCCRefundPayment(refundPaymentsDetails: any, refundAmount: number): any;
    findSCRefundPayment(refundPaymentsDetails: any, refundAmount: number): any;
    removeDateOrdinals(text: string): string;
    addAvailableRestrictedWowItemsToTrolley(type: string, count: number): void;
    loginViaUI(email: string, password: string): any;
    selectTopMenu(menuToSelect: string): any;
    selectOrderManagementSubMenu(menuToSelect: string): any;
    searchOrder(orderId: string): any;
    loginToSMAndSearchOrder(loginDetails: any, orderId: string): any;
    validateOrderDetailsOnSM(isMarketOnly: boolean): any;
    addAvailableEDMItemsToTrolley(searchTerm: string, quantity: number): void;
    addAvailableNonRestrictedWowItemsToTrolley(searchTerm: string): void;
    amendOrder(traderOrderId: number): any;
    getExpectedCCCardDetails(): void;
    getCCPaymentInstrumentId(creditCardPaymentResponse: any): any;
    addGiftCardToAccount(giftCardRequest: any): any;
    getGCPaymentInstrumentId(giftCardPaymentResponse: any): any;
    zero(): any;
    removeItems(unavailableItemsArr: any): any;
    orderEventsApiWithRetry(orderReference: string, retryOptions: RetryOptions): any;
    cancelOrder(orderId: number): any;
    completeOrderAmendment(orderId: number): any;
    getUnavailableStockCodes(): any;
    addGiftingDetails(message: string, sender: string, recipient: string): any;
    setPackagingOption(option: string): any;
    getPackagingOptions(): any;
    postOneTimePasswordRequest(oneTimePassword: string): any;
    validate2FALoginStatus(userCredentialLoginResponse: any, otpValidationSwitch: boolean, otpCode: string): any;
    loginViaApiWith2FA(shopper: any, otpValidationSwitch: boolean, otpCode: string): any;
    createARefund(stockcode: any, refundReason: string, refundComment: string, refundQuantity: number): any;
    refundShippingFee(refundReason: string, refundComment: string): any;
    setPurchaseOrderCode(purchaseOrderCode: any): any;
    openPayDigitalPay(openPayPayment: any): any;
    createARefund(stockcode: any, refundReason: string, refundComment: string, refundQuantity: number, goodwillAmount: number): any;
    refundShippingFee(refundReason: string, refundComment: string, goodwillAmount: number): any;
    getMailosaurEmailByEmailAddress(mailosaurEmailAddress: string): any;
    searchOrder(orderId: string): any;
    searchAnOrderOnSM(orderId: string): any;
    authorizeGiftingService(): any;
    generateANewGiftCard(giftCardAmount: number): any;
    getDigitalPaymentInstruments(): any;
    addCreditCardViaApi(creditCardDetails: Object): any;
    removePaymentInstrument(paymentInstrumentId: string | Cypress.Chainable<string>): any;
    verifySelfServiceReturnOnSM(returnType: string): any;
    clickEDMTab(): any;
    productSearch(searchRequest: any): any;
    loginViaApiAndHandle2FA(shopper: any): any;
  }
}
