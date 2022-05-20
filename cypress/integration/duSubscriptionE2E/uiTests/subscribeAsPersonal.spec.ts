/// <reference types="Cypress" />

import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/ui/commands/signUpUsers'
import '../../../support/duSubscription/ui/commands/subscribeMothly'
import '../../../support/duSubscription/ui/commands/subscribeYearly'
import '../../../support/utilities/ui/utility'
import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'

const faker = require('faker/locale/en_AU')

TestFilter(['B2C', 'UI', 'Delivery Unlimited Subscriptions - Personal', 'P0'], () => {
  describe('[UI] User who is less than 60 years old - Subscribe to Delivery unlimited', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearCookie('w-rctx')
      cy.clearLocalStorage({ domain: null })
    })

    it('Subscribe to Delivery Unlimited monthly plan - Age less than 60', () => {
      signUpDetails.firstName = faker.name.firstName()
      signUpDetails.lastName = faker.name.lastName()
      signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
      signUpDetails.password = 'Test1234'
      signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
      cy.getDOB('personal').then((value) => {
        signUpDetails.dateOfBirth = value
      })

      cy.signUpUser(signUpDetails)
      cy.subscribeToDUMonthlyPersonal(signUpDetails)
    })

    it('Subscribe to Delivery Unlimited yearly plan - Age less than 60', () => {
      signUpDetails.firstName = faker.name.firstName()
      signUpDetails.lastName = faker.name.lastName()
      signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
      signUpDetails.password = 'Test1234'
      signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
      cy.getDOB('personal').then((value) => {
        signUpDetails.dateOfBirth = value
      })

      cy.signUpUser(signUpDetails)
      cy.subscribeToDUYearlyPersonal(signUpDetails)
    })
  })
})
