/// <reference types="cypress" />

import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'
import ccDetails from '../../../fixtures/duSubscription/duCreditCardDetails.json'
import payAndSubscribe from '../../../fixtures/duSubscription/payAndSubscribe.json'
import availablePlans from '../../../fixtures/duSubscription/availablePlansB2C.json'
import loginDetails from '../../../fixtures/duSubscription/login.json'
import searchAddress from '../../../fixtures/checkout/addressSearch.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/signUp/api/commands/signUp'
import '../../../support/login/api/commands/login'
import '../../../support/address/api/commands/searchSetValidateAddress'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/duSubscription/api/commands/checkPlanEligibility'
import '../../../support/duSubscription/api/commands/checkExistingPlan'
import '../../../support/duSubscription/api/commands/payAndSubscribe'
import '../../../support/logout/api/commands/logout'
import '../../../support/utilities/ui/utility'

const faker = require('faker/locale/en_AU')

TestFilter(['B2C-API'], () => {
  describe('[API] Subscribe for a new DU Senior plan', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    // Using faker to add ramdom values for the user

    availablePlans.seniorPlans.forEach((plan) => {
      it(`Should subscribe for a new delivery unlimited plan ${plan.Name} for ${plan.SubscriberType}`, () => {
        signUpDetails.firstName = faker.name.firstName()
        signUpDetails.lastName = faker.name.lastName()
        signUpDetails.emailAddress = faker.internet.email()
        signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')
        cy.getDOB('senior').then((value) => {
          signUpDetails.dateOfBirth = value
        })
        cy.logOutViaApi().then((response) => {
          expect(response.status).to.eq(200)
        })
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })

        // Signing Up as a new User
        cy.signUpViaApi(signUpDetails).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('Success', true)
          expect(response.body.ShopperId).to.be.above(0)
          const shopperId = response.body.ShopperId
          cy.log('This is the shopper id for the user : ' + shopperId)

          // logout successfully after signing up
          cy.logOutViaApi().then((response) => {
            expect(response.status).to.eq(200)
          })

          // Login with the newly created customer
          loginDetails.email = signUpDetails.emailAddress
          cy.loginViaApi(loginDetails).then((response) => {
            expect(response).to.have.property('LoginResult', 'Success')

            cy.getCookie('w-rctx').should('exist')
          })

          // Test a new user is eligible for a delivery saver plan
          cy.checkPlanEligibilityViaApi(shopperId).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body).to.have.property('HasActiveDeliverySaver', false)
            expect(response.body).to.have.property('IsDeliverySaverEnabled', true)
            expect(response.body).to.have.property('IsEligibleForDeliverySaver', true)
            expect(response.body).to.have.property('IsBusinessAccount', false)
          })
          // Test a new user has any existing subscription plan
          cy.checkExistingPlanViaApi(shopperId).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.Errors[0].ErrorMessage).to.contain('Could not find a subscriber for tenant WOOLWORTHSONLINE and externalId ' + shopperId)
          })
          // Search billing address
          cy.searchBillingAddressViaApi(searchAddress.search).then((response) => {
            expect(response.status).to.eq(200)
            expect(response.body.Response[0].Text).to.contain(searchAddress.search)
            const billingAddrID = response.body.Response[0].Id
            // set autobilling address
            cy.setBillingAddressViaApi(billingAddrID).then((response) => {
              expect(response.status).to.eq(200)
              const AddressId = response.body.Address.AddressId
              // validate set autobilling address
              cy.validateBillingAddressViaApi().then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.Address[0].AddressId).to.eq(AddressId)
              })
            })
          })

          cy.navigatingToCreditCardIframe().then((response) => {
            expect(response).to.have.property('Success', true)
            expect(response.IframeUrl).to.contain(Cypress.env('creditCardPaymentEndpoint').split('/')[2])
            const iframeURL = response.IframeUrl
            creditcardSessionHeader.creditcardSessionId = iframeURL.split('/').pop()
            cy.creditcardPayment(ccDetails.visa, creditcardSessionHeader).then((response) => {
              expect(response.status).to.have.property('responseText', 'ACCEPTED')
              expect(response.status).to.have.property('responseCode', '00')
              // expect(response.body.status).to.have.property('esResponse', null)
              payAndSubscribe.planId = plan.PlanId
              payAndSubscribe.paymentInstrumentId = response.paymentInstrument.itemId
              cy.payAndSubscribeViaApi(payAndSubscribe).then((response) => {
                expect(response.status).to.eq(200)
                expect(response.body.Subscription).to.have.property('PlanId', plan.PlanId)
                expect(response.body.Subscription).to.have.property('ServiceType', plan.ServiceType)
                expect(response.body.Subscription).to.have.property('Price', plan.Price)
                expect(response.body.Plan).to.have.property('Name', plan.Name)
                expect(response.body).to.have.property('Errors', null)
                expect(response.body).to.have.property('HttpStatusCode', 'OK')
                expect(response.body).to.have.property('ExternalId', shopperId)
              })
            })
          })
          signUpDetails.shopperId = shopperId
          signUpDetails.planId = plan.PlanId
          signUpDetails.planName = plan.Name
          signUpDetails.planPrice = plan.Price
          signUpDetails.createdTime = new Date().toLocaleString()
          cy.writeTestDataUsed(`${Cypress.env('duSubscriptionTestDataFilePath')}/seniorSubscriptionUsedData.json`, signUpDetails)
        })
      })
    })
  })
})
