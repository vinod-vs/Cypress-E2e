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
    addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm: string, priceThreshold: number): void;
    navigateToCheckout(): any;
    navigatingToCreditCardIframe(): any;
    creditcardPayment(cardDetails: any, sessionHeader: any): any;
    digitalPay(digiPayRequest: any): any;
    confirmOrder(orderDetails: any): any;
    logOutViaApi(): void;
    setSignUpDetails(): any;
    signUpViaApi(signUpDetails: any): any;
    setDeliveryOptionsViaApi(deliveryOptions: any): any;
    setFulfilmentLocationWithWindow(fulfilmentType: string, addressSearchBody: any, windowType: string): any;
    placeOrderViaApiWithAddedCreditCard(creditCardDetails: any, platform: string): any;
    api(request: any): any;
    navigateExpressionOfInterestPage(expressionOfInterestPageEndPoint: string): any;
    setFulfilmentLocationWithoutWindow(fulfilmentType: string, location: any): any;
    checkIfElementExists(element: any): any;
    selectRandomElement(): any;
    getBootstrapResponse(): any;
    getRandomAvailableWindowViaApi(addressId: string, areaId: string, suburbId: string, fulfilmentType: string, windowType: string): any
    getDayOfWeek(date: Date): any;
    formatToAmPm(time: any): any;
    loginViaUi(shopper: any): any;
    searchBillingAddressViaApi(address: string): any;
    setBillingAddressViaApi(addressId: number): any;
    loginWithNewShopperViaApi(): any;
    adminLoginViaUi(loginDetails: any): any;
    selectRandomWindowInCheckout(fulfilmentType: string, fulfilmentWindow: string): any;
    removeNewLineCarriageReturn(initialText: string): string;
    loginViaUI(email: string, password: string): any;
    selectTopMenu(menuToSelect: string): any;
    selectOrderManagementSubMenu(menuToSelect: string): any;
    searchOrder(orderId: string): any;
    loginToSMAndSearchOrder(loginDetails: any, orderId: string): any
    validateOrderDetailsOnSM(isMarketOnly: boolean): any
  }
}