export class MyAccountDetailsPage {
  getMyPersonalDetailsText () {
    return cy.get('#personal-details-title')
  }

  getMyPersonalDetailsNameEditLink () {
    return cy.get('#edit-link-full-name')
  }

  getMyPersonalDetailsDOBEditLink () {
    return cy.get('#edit-link-dob')
  }

  getMyPersonalDetailsFirstNameInput () {
    return cy.get('#personalDetails-firstName')
  }

  getMyPersonalDetailsFirstNameError () {
    return cy.get('#personalDetails-firstName~shared-validation-messages div')
  }

  getMyPersonalDetailsLastNameInput () {
    return cy.get('#personalDetails-lastName')
  }

  getMyPersonalDetailsLastNameError () {
    return cy.get('#personalDetails-lastName~shared-validation-messages div')
  }

  getMyPersonalDetailsDOBInput () {
    return cy.get('#personalDetailsDOB-dateOfBirth')
  }

  getMyPersonalDetailsDOBError () {
    return cy.get('#personalDetailsDOB-dateOfBirth~shared-validation-messages div')
  }

  getSaveChangesButtonforName () {
    return cy.get('.success.l.m.full-width.mobile-full-width')
  }

  getSaveChangesButtonforDOB () {
    return cy.get('.success.l.m.full-width.mobile-full-width')
  }

  getCancelButtonName () {
    return cy.get('#cancel-link-full-name')
  }

  getCancelButtonDOB () {
    return cy.get('#cancel-link-dob')
  }

  getUpdatedName () {
    return cy.get('#fullNameLabel')
  }

  getSuccessTittle () {
    return cy.get('p.title')
  }

  addSecondaryPhoneNumber () {
    return cy.get('#addSecondaryPhoneLink')
  }

  getMySecondaryPhoneNumberInput () {
    return cy.get('#personalDetails-firstName')
  }

  getCancelButtonSecondaryPhoneNumber () {
    return cy.get('#cancelButton')
  }

  getSaveChangesButtonforSecondaryPhoneNumber () {
    return cy.get('#saveDetailsButton')
  }

  getMySecondaryNumberEditLink () {
    return cy.get('#editSecondaryPhoneLink')
  }

  getUpdatedMySecondaryNumber () {
    return cy.get('#secondaryPhoneLabel')
  }

  getEmailAddressField () {
    return cy.get('#emailLabel')
  }

  getContactNumber () {
    return cy.get('#phoneLabel')
  }

  getEmailAddress () {
    return cy.get('#emailLabel')
  }
}

export const onMyAccountDetailsPage = new MyAccountDetailsPage()
