/// <reference types="cypress" />

import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/logout/api/commands/logout'
import '../../../support/utilities/ui/utility'
const faker = require('faker/locale/en_AU')

TestFilter(['B2C-API'], () => {
  describe('[API] Signup as a new user', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    signUpDetails.firstName = faker.name.firstName()
    signUpDetails.lastName = faker.name.lastName()
    signUpDetails.EmailAddress = faker.internet.email()
    signUpDetails.MobilePhone = faker.phone.phoneNumber('04########')

    // Signing Up as a new User
    it('Should sign up with a new user', () => {
      cy.logOutViaApi()
      cy.getDOB('personal').then((value) => {
        signUpDetails.dateOfBirth = value
      })
      cy.signUpViaApi(signUpDetails).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('Success', true)
        cy.log('This is the shopper id for the user : ' + response.body.ShopperId)
      })
      // Loggin Out as the seesion is still active and subsequent run fails
      cy.logOutViaApi().then((response) => {
        expect(response.status).to.eq(200)
      })
    })
  })
})
