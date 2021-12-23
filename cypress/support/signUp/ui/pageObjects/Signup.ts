//
// This class will capture DOM elements on the sign up page(/shop/signup)
//

export class Signup {
  
  getPageTitle () {
    return cy.get('.signupForm-headerTitle')
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
    return cy.get('#signupForm .signupForm-inputWrapper:nth-child(6) .ng-invalid:nth-of-type(1) [type]')
  }

  getContactNumber () {
    return cy.get('input[name="mobilePhone"]')
  }

  getShoppingOnbehalfBusinessSelection () {
    return cy.get('.signupForm-isBusiness .iconNoti-Confirmation_Tick_Thick')
  }

  getBusinessABN () {
    return cy.get('shared-abn [type]')
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

  getTermsAndConditions () {
    return cy.get('.signupForm-tsAndCs .checkbox-box')
  }

  getSubmitButton () {
    return cy.get('.primary-legacy')
  }
}

export const onSignup = new Signup()
