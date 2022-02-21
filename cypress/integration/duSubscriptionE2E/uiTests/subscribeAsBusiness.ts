/// <reference types="Cypress" />

import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/ui/commands/signUpUsers'
import '../../../support/myAccount/ui/commands/myAccount'
import '../../../support/duSubscription/ui/commands/subscribePersonalMothly'
import '../../../support/duSubscription/ui/commands/subscribePersonalYearly'
import '../../../support/utilities/ui/utility'
import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'

const faker = require('faker/locale/en_AU')

TestFilter(['UI', 'B2C', 'Delivery Unlimited Subscriptions - Business', 'P0'], () => {
  describe('[UI] Business user - Subscribe to Delivery unlimited', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearCookie('w-rctx')
      cy.clearLocalStorage({ domain: null })
  
    })

    it('Subscribe to Delivery Unlimited monthly plan - Business user', () => {

      signUpDetails.firstName = faker.name.firstName()
      signUpDetails.lastName = faker.name.lastName()
      signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
      signUpDetails.password = 'Test1234'
      signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
      cy.getDOB('personal').then((value)=> {
          signUpDetails.dateOfBirth = value
      })
      signUpDetails.abn = "88000014675"
      signUpDetails.companyName = "WOOLWORTHS GROUP LIMITED"
      cy.signUpBusinessUser(signUpDetails)
      cy.subscribeToDUMonthlyBusiness(signUpDetails)
    })

    it('Subscribe to Delivery Unlimited yearly plan - Business user', () => {

      signUpDetails.firstName = faker.name.firstName()
      signUpDetails.lastName = faker.name.lastName()
      signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
      signUpDetails.password = 'Test1234'
      signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
      cy.getDOB('personal').then((value)=> {
          signUpDetails.dateOfBirth = value
      })
      signUpDetails.abn = "88000014675"
      signUpDetails.companyName = "WOOLWORTHS GROUP LIMITED"

      cy.signUpBusinessUser(signUpDetails)
      cy.subscribeToDUYearlyBusiness(signUpDetails)

    })

  })

})