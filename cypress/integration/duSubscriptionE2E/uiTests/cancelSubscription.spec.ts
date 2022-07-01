/// <reference types="Cypress" />

import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/ui/commands/signUpUsers'
import '../../../support/myAccount/ui/commands/myAccount'
import '../../../support/duSubscription/ui/commands/subscribeMothly'
import '../../../support/duSubscription/ui/commands/subscribeYearly'
import '../../../support/duSubscription/ui/commands/cancelSubscription'
import '../../../support/utilities/ui/utility'
import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'

const faker = require('faker/locale/en_AU')

TestFilter(['B2C', 'UI', 'P1', 'TOFFEE'], () => {
  describe('[UI] Cancel Delivery unlimited subscription', () => {
    // pre-requisite to clear all cookies before login
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearCookie('w-rctx')
      cy.clearLocalStorage({ domain: null })
  
    })

    
  it('Cancel Delivery unlimited subscription - Personal user', () => {

    // Sign up a user to WOW
    signUpDetails.firstName = faker.name.firstName()
    signUpDetails.lastName = faker.name.lastName()
    signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
    signUpDetails.password = 'Test1234'
    signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
    cy.getDOB('personal').then((value)=> {
        signUpDetails.dateOfBirth = value
    })
    
    // Sign up to Delivery Unlimited
    cy.signUpUser(signUpDetails)
    cy.subscribeToDUMonthlyPersonal(signUpDetails)

    // Cancel the subscription
    cy.cancelSubscription()
  })

    
  it('Cancel Delivery unlimited subscription - Senior user', () => {

    // Sign up a user to WOW
    signUpDetails.firstName = faker.name.firstName()
    signUpDetails.lastName = faker.name.lastName()
    signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
    signUpDetails.password = 'Test1234'
    signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
    cy.getDOB('senior').then((value)=> {
        signUpDetails.dateOfBirth = value
    })
    
    // Sign up to Delivery Unlimited
    cy.signUpUser(signUpDetails)
    cy.subscribeToDUMonthlySenior(signUpDetails)

    // Cancel the subscription
    cy.cancelSubscription()
  })

  it('Cancel Delivery unlimited subscription - Business user', () => {

    // Sign up a user to WOW
    signUpDetails.firstName = faker.name.firstName()
    signUpDetails.lastName = faker.name.lastName()
    signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
    signUpDetails.password = 'Test1234'
    signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
    cy.getDOB('personal').then((value)=> {
        signUpDetails.dateOfBirth = value
    })
    signUpDetails.abn = '88000014675'
    signUpDetails.companyName = 'WOOLWORTHS GROUP LIMITED'
    
    // Sign up to Delivery Unlimited
    
    cy.signUpBusinessUser(signUpDetails)
    cy.subscribeToDUMonthlyBusiness(signUpDetails)

    // Cancel the subscription
    cy.cancelSubscription()
  })

  })

})
