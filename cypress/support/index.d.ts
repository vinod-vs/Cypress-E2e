declare namespace Cypress {
  interface Chainable {
    // Cypress custom commands
    clearCookies(value: any): void;
    clearLocalStorage(value: any): void;
    loginViaApi(value: any): void;
    searchPickupDTBStores(fulfilmentType: string, searchValue: any): any;
    getFulfilmentWindowViaApi(windowType: string): any;
    completeWindowFulfilmentViaApi(): any;
    clearTrolley(): void;
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
    placeOrderViaApiWithAddedCreditCard(creditCardDetails: any): any;
    api(request: any): any;
    navigateExpressionOfInterestPage(expressionOfInterestPageEndPoint: string): any;
  }
}
