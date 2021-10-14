declare namespace Cypress {
  interface Chainable {
    // Cypress custom commands
    clearCookies(value: any): void;
    clearLocalStorage(value: any): void;
    loginViaApi(value: any): void;
    searchPickupDTBStores(fulfilmentType: String, arg1: any): any;
    getFulfilmentWindowViaApi(windowType: String): any;
    completeWindowFulfilmentViaApi(): any;
    clearTrolley(): void;
    addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(searchTerm: String, priceThreshold: Number): void;
    navigateToCheckout(): any;
    navigatingToCreditCardIframe(): any;
    creditcardPayment(cardDetails: any, sessionHeader: any): any;
    digitalPay(digiPayRequest: any): any;
    confirmOrder(orderDetails: any): any;  
  }
}