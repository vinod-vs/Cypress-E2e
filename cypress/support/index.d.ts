declare namespace Cypress {
  interface Chainable {
    // Cypress custom commands
    clearCookies(value: any): void;
    clearLocalStorage(value: any): void;
    loginViaApi(value: any): void;
    searchPickupDTBStores(arg0: any, arg1: any): any;
    getFulfilmentWindowViaApi(arg0: any): any;
    completeWindowFulfilmentViaApi(): any;
    clearTrolley(): void;
    addAvailableNonRestrictedPriceLimitedWowItemsToTrolley(arg0: any, arg1: any): void;
    navigateToCheckout(): any;
    navigatingToCreditCardIframe(): any;
    creditcardPayment(arg0: any, arg1: any): any;
    digitalPay(arg0: any): any;
    confirmOrder(arg0: any): any;  
  }
}