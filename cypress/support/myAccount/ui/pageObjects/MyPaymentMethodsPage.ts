export class MyPaymentMethodsPage {
  getPageHeading() {
    return cy.get("#center-panel h1");
  }

  getPageSubHeading() {
    return cy.get("h2.paymentmethods-subHeading");
  }

  getButtonNewCard() {
    return cy.get("button.shopper-action .button-content");
  }

  getDigitalPayitems() {
    return cy.get(".digitalPayListItem");
  }

  getButtonSave() {
    return cy
      .get(".add-credit-card-button-group button[type='submit']")
      .contains("Save");
  }

  getButtonSaveLocatorString() {
    return '.add-credit-card-button-group button[type="submit"]';
  }

  getSavedCardNumbers() {
    return cy.get(".creditCardItem-mainText");
  }

  getButtonRemoveCreditCard() {
    return cy.get(".creditCardItem-content button.auto_remove-button");
  }

  getButtonRemoveCreditCardConfirm() {
    return cy.get(".modal-button").contains("Delete Card ")
  }

  getButtonRetryLocatorString() {
    return '.digitalPayError Button';
  }

  getCreditCardIframeLocatorString() {
    return ".add-credit-card-iframe";
  }

  getCreditCardNumberLocatorString() {
    return "#card_number";
  }

  getCreditCardExpMonthLocatorString() {
    return "#expiry_month";
  }

  getCreditCardExpYearLocatorString() {
    return "#exp_year";
  }

  getCreditCardCVVLocatorString() {
    return "#cvv_csv";
  }
  
  getSpinner() {
    return cy.get(".spinner-container.container3");
  }
}
export const onMyPaymentMethodsPage = new MyPaymentMethodsPage();
