type RetryOptions = import('cypress/types/utilities/retryOptions').RetryOptions

declare namespace Cypress {
  interface Chainable {
    // Cypress custom commands
    clearCookies(value: any): void
    clearLocalStorage(value: any): void
    loginViaApi(value: any): any
    searchPickupDTBStores(fulfilmentType: string, searchValue: any): any
    addDeliveryAddress(): any
    searchDeliveryAddress(addressSearchBody: any): any
    getFulfilmentWindowViaApi(windowType: string): any
    completeWindowFulfilmentViaApi(): any
    clearTrolley(): any
    viewTrolley(): any
    addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm: string, priceThreshold: number): any
    addAvailableQuantityLimitedItemsToTrolley(searchTerm: string, quantity: number): any
    navigateToCheckout(): any
    navigatingToCreditCardIframe(): any
    creditcardTokenisation(cardDetails: any, sessionHeader: any): any
    digitalPay(digiPayRequest: any): any
    confirmOrder(orderDetails: any): any
    logOutViaApi(): Cypress.Chainable<string>
    setSignUpDetails(): any
    signUpViaApi(signUpDetails: any): any
    signUpViaApiWith2FA(signUpDetails: any): any
    setDeliveryOptionsViaApi(deliveryOptions: any): any
    setFulfilmentLocationWithWindow(fulfilmentType: string, addressSearchBody: any, windowType: string): any
    placeOrderViaApiWithAddedCreditCard(platform: string, creditCardDetails?: any): any
    api(request: any): any
    navigateExpressionOfInterestPage(expressionOfInterestPageEndPoint: string): any
    setFulfilmentLocationWithoutWindow(fulfilmentType: string, location: any): any
    checkIfElementExists(elementLocatorString: any): any
    selectRandomElement(): any
    getBootstrapResponse(): any
    getRandomAvailableWindowViaApi(addressId: string, areaId: string, suburbId: string, fulfilmentType: string, windowType: string): any
    getDayOfWeek(date: Date): any
    formatToAmPm(time: any): any
    loginViaUi(shopper: any): any
    searchBillingAddressViaApi(address: string): any
    setBillingAddressViaApi(addressId: number): any
    loginWithNewShopperViaApi(): any
    adminLoginViaUi(loginDetails: any): any
    setFulfilmentLocationWithoutWindow(fulfilmentType: string, locationSearch: string | number): any
    selectRandomWindowInCheckout(fulfilmentType: string, fulfilmentWindow: string): any
    removeNewLineCarriageReturn(initialText: string): Cypress.Chainable<string>
    prepareAnySingleLineItemEdmOrder(searchTerm: string, purchaseQty: number): void
    redeemRewardsDollars(redeemAmount: number): any
    redeemRewardsCredits(enabled: boolean): any
    addPromotionCode(promoCode: string): any
    removePromotionCode(promoCode: string): any
    placeOrderUsingCreditCard(): any
    placeOrderUsingCreditCardAndGiftCard(): any
    ordersApiByShopperIdAndTraderOrderIdWithRetry(shopperId: number, orderId: number, retryOptions: RetryOptions): any
    cancelLineItemInInvoice(encodedInvoiceId: string, encodedLineItemId: string, quantity: number, dispatched: boolean): any
    getAllRefundsByOrderId(traderOrderId: number): any
    getAllRefundPaymentsByRefundId(refundId: number): any
    getAllRefundsByOrderIdWithRetry(traderOrderId: number, retryOptions: any): any
    getAllRefundPaymentsByRefundIdWithRetry(refundId: number, retryOptions: any): any
    findCCRefundPayment(refundPaymentsDetails: any, refundAmount: number): any
    findSCRefundPayment(refundPaymentsDetails: any, refundAmount: number): any
    removeDateOrdinals(text: string): any
    addAvailableRestrictedWowItemsToTrolley(type: string, count: number): void
    siteManagementLoginViaUi(email: string, password: string): any
    selectTopMenu(menuToSelect: string): any
    selectOrderManagementSubMenu(menuToSelect: string): any
    searchOrder(orderId: string): any
    loginToSMAndSearchOrder(loginDetails: any, orderId: string): any
    validateOrderDetailsOnSM(isMarketOnly: boolean): any
    addAvailableEDMItemsToTrolley(searchTerm: string, quantity: number): void
    addAvailableNonRestrictedWowItemsToTrolley(searchTerm: string): void
    getNonRestrictedWowItemSetFromApiSearch(searchRequestPayload: any): any
    amendOrder(traderOrderId: number): any
    getExpectedCCCardDetails(): void
    getCCPaymentInstrumentId(creditCardPaymentResponse: any): any
    addGiftCardToAccount(giftCardRequest: any): any
    getGCPaymentInstrumentId(giftCardPaymentResponse: any): any
    zero(): any
    removeItem(unavailableItem: any): any
    removeItems(unavailableItemsArr: any): any
    orderEventsApiWithRetry(orderReference: string, retryOptions: RetryOptions): any
    cancelOrder(orderId: number): any
    completeOrderAmendment(orderId: number): any
    getUnavailableStockCodes(): any
    addGiftingDetails(message: string, sender: string, recipient: string): any
    setPackagingOption(option: string): any
    getPackagingOptions(): any
    postOneTimePasswordRequest(oneTimePassword: string): any
    validate2FALoginStatus(otpCode: string): any
    loginViaApiWith2FA(shopper: any, otpValidationSwitch?: boolean, otpCode?: string): any
    createARefund(stockcode: any, refundReason: string, refundComment: string, refundQuantity: number): any
    refundShippingFee(refundReason: string, refundComment: string): any
    setPurchaseOrderCode(purchaseOrderCode: any): any
    openPayDigitalPay(openPayPayment: any): any
    createARefund(stockcode: any, refundReason: string, refundComment: string, refundQuantity: number, goodwillAmount: number): any
    refundShippingFee(refundReason: string, refundComment: string, goodwillAmount: number): any
    getMailosaurEmailByEmailAddress(mailosaurEmailAddress: string): any
    searchOrder(orderId: string): any
    searchAnOrderOnSM(orderId: string): any
    authorizeGiftingService(): any
    generateANewGiftCard(giftCardAmount: number): any
    getDigitalPaymentInstruments(): any
    addCreditCardViaApi(creditCardDetails: Object): any
    removePaymentInstrument(paymentInstrumentId: string | Cypress.Chainable<string>): any
    verifySelfServiceReturnOnSM(returnType: string): any
    clickEDMTab(): any
    productSearch(searchRequest: any): any
    loginViaApiAndHandle2FA(shopper: any): any
    getDOB(type: string): Cypress.Chainable<string>
    signUpUser(signupdetails: any): any
    subscribeToDUMonthlyPersonal(userinfor: any): any
    get2FACode(shopper: any): Cypress.Chainable<string>
    performReIssueOnWowOrderOnSM(): any
    wowDispatchUpdateCompletedOrder(shopperId: any, orderId: any, WoolworthsSubtotal: any, testData: any): any
    checkForOrderPlacementErrorsAndThrow(paymentResponse: any): any
    availableDigitalPaymentInstruments(): any
    navigateToB2BMyAccountViaUi(): any
    navigateToMyPaymentMethodsViaUi(): any
    verifyMyPaymentMethodsPage(): any
    verifyMyPaymentMethodsNotVisible(): any
    logoutViaUi(shopper: any): any
    saveNewCreditCardViaUi(creditCard: any): any
    deleteCreditCardViaUi(creditCard: any): any
    subscribeToDUYearlyPersonal(userinfor: any): any
    subscribeToDUMonthlySenior(userinfor: any): any
    subscribeToDUYearlySenior(userinfor: any): any
    checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(balance: any): any
    placeOrderViaApiWithPaymentRequest(request: any): Cypress.Chainable<number>
    fetchProductDataOnPDP(searchTerm: any): any
    generateGiftCards(expectedGiftCardBalance: any): any
    payWithGiftCard(digitalPaymentRequest: any): any
    addEDMItemsBasedOnMinCartValueToTrolley(testData: any): any
    editPersonalDetails(personalDetails: any): any
    verifyEmailNotificationForPersonalDetails(): any
    signUpBusinessUser(signupdetails: any): any
    subscribeToDUMonthlyBusiness(userinfor: any): any
    subscribeToDUYearlyBusiness(userinfor: any): any
    convertShortWeekDayToLong(shortWeekday: string): any
    addAvailableNonRestrictedItemCountLimitedWowItemsToTrolley(searchTerm: string, count: number): any
    removeUnavailableItemsFromTrolley(): any
    removeRestrictedItemsFromTrolley(): any
    payWithLinkedPaypalAccount(digitalPayment: any): any
    getDigitalPaymentInstruments(): any
    getLinkedPayPalAccountInstrumentId(): any
    getCountryOfOrigin(coolServiceData: Object): any
    removeSavedCreditAndGiftCardsViaAPI(): any
    getRtlOffers(rtlGetOffersData: Object): any
    patchRtlUnboost(rtlPatchData: Object): any
    navigateToMyAccountViaUi(): any
    logoutViaUi(): any
    productSearchByStockCode(rtlGetOffersData: Object): any
    addToCart(rtlAddToCartData: Object): any
    removeSavedCreditAndGiftCardsViaAPI(): void
    addGiftCardAndCompleteSplitPaymentOrderViaAPI(giftCard: any, giftCardAmount: number, splitPaymentRequest: any): void
    navigateToMyAccountViaUi(): any
    logoutViaUi(): any
    checkPlanEligibilityViaApi(value: any): any
    checkExistingPlanViaApi(value: any): any
    validateBillingAddressViaApi(): any
    payAndSubscribeViaApi(value: any): any
    writeTestDataUsed(filepath: string, signupdetails: any): any
    addProductNoteViaApi(productNote: any): any
    setItemSubstitutionviaAPI(subsRequest: any): any
    prepareAnyMultiSellerLineItemEdmOrder(searchTerm: string, purchaseQty: number): void
    addMultiSellerAvailableEDMItemsToTrolley(searchTerm: string, quantity: number): void
    addYearsToCurrentDate(noOfYearsToAdd: any): any
    evaluateSessionGroup(requestBody: any): any
    evaluateMultipleSessionGroups(requestBody: any): any
    generateRandomString(numChars?: number): Cypress.Chainable<string>
    changeDateFormatToAddSlash(date: any): any
    searchCustomerByEmailInSM(email: any): void
    getEmailDetails(emailId: string, expectedEmailSubject: string, sentFrom: string): any
    getCurrentlyAmendingOrder(): any;
    cancelAmendingOrder(orderId: Cypress.Chainable<number>, revertAmend: boolean): any;
    selectAvailableDeliveryDetailsOnFms():any;
    clearCartViaUi(): any;
    searchItemsAndAddToCartTillGivenLimit(data:any): any;
    openSideCart(): any;
    goToCheckout(): any;
    fillCreditCardPaymentDetails(details: any): any;
    selectAvailablePickUpDetailsOnFms():any;
    cancelSubscription(): any
  }
}
