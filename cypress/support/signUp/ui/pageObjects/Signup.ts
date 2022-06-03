//
// This class will capture DOM elements on the sign up page(/shop/signup)
//

export class Signup {
  getPageTitle () {
    return cy.get('//form[@id="signupForm"]//h3[@class="signupForm-headerTitle"]'
    )
  }

  getFirstName () {
    return cy.get('#signupForm-FirstName [type]')
  }

  getLastName () {
    return cy.get('#signupForm-LastName [type]')
  }

  getEmail () {
    return cy.get('#signupForm-EmailAddress [type]')
  }

  getPassword () {
    return cy.get('input#signupForm-password')
  }

  getDateOfBirth () {
    return cy.get(
      'shared-textbox[name="DateOfBirth"] > input[name="DateOfBirth"]'
    )
  }

  getContactNumber () {
    return cy.get(
      'shared-textbox[name="MobilePhone"] > input[name="MobilePhone"]'
    )
  }

  getShoppingOnbehalfBusinessSelection () {
    return cy.get('.signupForm-shoppingOfBusinessCheckBox .checkbox-box')
  }

  getBusinessABN () {
    return cy.get('shared-textbox[label="ABN*"] > input[name="Abn"]')
  }

  getBusinessEntityName () {
    return cy.get('input#signupForm-EntityName')
  }

  getCompanyName () {
    return cy.get('input#signupForm-CompanyName')
  }

  getBusinessType () {
    return cy.get('select#shared-dropdown-input-0')
  }

  getBusinessTypeRetailService () {
    return cy.get('select#shared-dropdown-input-0').select('Retail Service')
  }

  getJobTitle () {
    return cy.get('input#signupForm-JobTitle')
  }

  getNumberOfEmployees () {
    return cy.get('#signupForm-NumberOfEmployees [type]')
  }

  getOrderCollectionOptionDeciceLater () {
    return cy.get('input#signupFulfilmentForm-fulfilmentRadio-DecideLater')
  }

  getOrderCollectionOptionDelivery () {
    return cy.get('input#signupFulfilmentForm-fulfilmentRadio-Courier')
  }

  getOrderCollectionOptionDeliveryAddress () {
    return cy.get('input#shared-address-selector-auto-2')
  }

  getOrderCollectionOptionClickAndCollect () {
    return cy.get('input#signupFulfilmentForm-fulfilmentRadio-Pickup')
  }

  getCommunicationPreferencesSMS () {
    return cy.get('shared-checkbox[name="promoSMS"]  .checkbox-box')
  }

  getCommunicationPreferencesEmail () {
    return cy.get('shared-checkbox[name="promoEmails"]  .checkbox-box')
  }

  getReceiveFreeSampleSelctionYes () {
    return cy.get('#signupForm-promoCatalogue-yes')
  }

  getReceiveFreeSampleSelctionNo () {
    return cy.get('#signupForm-promoCatalogue-no')
  }

  getRewarsMemberYes () {
    return cy.get('.button--large.signupForm-button.wow-col-6.yes')
  }

  getRewarsMemberNo () {
    return cy.get('.button--large.no.signupForm-button.wow-col-6')
  }

  getTermsAndConditions () {
    return cy.get('.signupForm-tsAndCs .checkbox-box')
  }

  getSubmitButton () {
    return cy.get('shared-button > .full-width.l.m.mobile-full-width.success')
  }

  getCancelButton () {
    return cy.get('.button.button--large.signupForm-cancel')
  }
}

export const onSignup = new Signup()
