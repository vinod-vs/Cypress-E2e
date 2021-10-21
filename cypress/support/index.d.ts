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
    placeOrderViaApiWithAddedCreditCard(creditCardDetails: any): any;
    api(request: any): any;
    navigateExpressionOfInterestPage(expressionOfInterestPageEndPoint: string): any;
    searchBillingAddressViaApi(address: string): any;
    setBillingAddressViaApi(addressId: number): any;
    loginWithNewShopperViaApi(): any;
  }
}
