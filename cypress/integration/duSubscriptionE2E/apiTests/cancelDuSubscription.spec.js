/// <reference types="cypress" />

import signUpDetails from '../../../fixtures/signUp/signUpDetails.json'
import ccDetails from '../../../fixtures/duSubscription/duCreditCardDetails.json'
import payAndSubscribe from '../../../fixtures/duSubscription/payAndSubscribe.json'
import availablePlans from '../../../fixtures/duSubscription/availablePlansB2C.json'
import businessUserData from '../../../fixtures/duSubscription/businessUserDetails.json'
import loginDetails from '../../../fixtures/duSubscription/login.json'
import cancelSubscription from '../../../fixtures/duSubscription/cancelSubscription.json'
import cancelSubscriptionFields from '../../../fixtures/duSubscription/cancelSubscriptionFields.json'
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
import '../../../support/duSubscription/api/commands/cancelSubscription'
import '../../../support/duSubscription/api/commands/setDateTime'
import '../../../support/logout/api/commands/logout'
import '../../../support/utilities/ui/utility'
import { isBreakStatement } from 'typescript'

const faker = require('faker/locale/en_AU')

TestFilter(['B2C', 'API', 'P0'], () => {
  describe('[API] Subscribe and cancel DU personal plan', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })
    // Using faker to add random values for the user

    availablePlans.cancelPlans.forEach((plan) => {
      it(`Should subscribe for a new delivery unlimited plan for ${plan.SubscriberType}`, () => {

        let shopperId = '';

        signUpDetails.firstName = faker.name.firstName()
        signUpDetails.lastName = faker.name.lastName()
        signUpDetails.emailAddress = faker.internet.userName() + '@' + Cypress.env('mailosaur_serverDomain')
        signUpDetails.mobilePhone = faker.phone.phoneNumber('04########')

        switch (plan.SubscriberType) {
          case 'senior':
          cy.getDOB('senior').then((value) => {
            signUpDetails.dateOfBirth = value
          })
          break;

          case 'personal':
            cy.getDOB('personal').then((value) => {
              signUpDetails.dateOfBirth = value
            })
            break;

          case 'business':
            cy.getDOB('personal').then((value) => {
              signUpDetails.dateOfBirth = value
            })

            signUpDetails.abn = businessUserData.abn
            signUpDetails.companyName = businessUserData.companyName
            signUpDetails.businessType = businessUserData.businessType
            signUpDetails.isBusinessPurchase = businessUserData.isBusinessPurchase
            break;
        }

        cy.logOutViaApi().then((response) => {
          expect(response.status).to.eq(200)
        })
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })

        // Signing Up as a new User
        switch (plan.SubscriberType) {
          case 'senior':
          case 'personal':
            cy.signUpViaApiWith2FA(signUpDetails).then((response) => {
              expect(response.status).to.eq(200)
              expect(response.body).to.have.property('Success', true)
              expect(response.body.ShopperId).to.be.above(0)
              shopperId = response.body.ShopperId
              cy.log('This is the shopper id for the user : ' + shopperId)
            })
            break;
          case 'business':
            cy.signUpViaApi(signUpDetails).then((response) => {
              expect(response.status).to.eq(200)
              expect(response.body).to.have.property('Success', true)
              expect(response.body.ShopperId).to.be.above(0)
              shopperId = response.body.ShopperId
              cy.log('This is the shopper id for the user : ' + shopperId)
            })
            break;
        }

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
          if (plan.SubscriberType == 'business') {
expect(response.body).to.have.property('IsBusinessAccount', true)
} else {
expect(response.body).to.have.property('IsBusinessAccount', false)
}
        })
        // Test a new user has any existing subscription plan
        cy.checkExistingPlanViaApi(shopperId).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body.Errors[0].ErrorMessage).to.contain('Could not find a subscriber for tenant WOOLWORTHSONLINE and customerIdentifier ' + shopperId)
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

        // Payment via Credit Card
        cy.navigatingToCreditCardIframe().then((response) => {
          expect(response).to.have.property('Success', true)
          expect(response.IframeUrl).to.contain(Cypress.env('creditCardTokenisationEndpoint').split('/')[2])
          const iframeURL = response.IframeUrl
          creditcardSessionHeader.creditcardSessionId = iframeURL.split('/').pop()
          cy.creditcardTokenisation(ccDetails.mastercard, creditcardSessionHeader).then((response) => {
            expect(response.status).to.have.property('responseText', 'ACCEPTED')
            expect(response.status).to.have.property('responseCode', '00')
            payAndSubscribe.planId = plan.PlanId
            payAndSubscribe.paymentInstrumentId = response.paymentInstrument.itemId
            cy.payAndSubscribeViaApi(payAndSubscribe).then((response) => {
              expect(response.status).to.eq(200)
              expect(response.body.Subscription).to.have.property('PlanId', plan.PlanId)
              expect(response.body.Subscription).to.have.property('ServiceType', plan.ServiceType)
              expect(response.body.Subscription).to.have.property('Price', plan.Price)
              expect(response.body).to.have.property('Errors', null)
              expect(response.body).to.have.property('HttpStatusCode', 'OK')
              expect(response.body).to.have.property('ExternalId', shopperId)
            })
          })

          // Test User is able to cancel the subscription
          cy.cancelPerSubscription(cancelSubscription).then((response) => {
            // Verify all the keys for subscription object
            expect(response.body.Subscription).to.includes.keys(cancelSubscriptionFields.SubscriptionFields)
            expect(response.body.Subscription.FreeTrial).to.eql(true)
            expect(response.body.Subscription.Status).to.eql('Active')

            const nextBillingDate = response.body.Subscription.NextBillingDate
            cy.log('Next billing date is : ' + nextBillingDate)

            // Get the current time
            cy.getDateTime().then((value) => {
              const currentDateTime = value
              cy.log('Current date is : ' + currentDateTime)

              // Set the Date as Next Billing Date(1 month) to confirm cancellation (Subscription remains active for 30 days)
              cy.setDateTime(nextBillingDate).then((response) => {
                expect(response.status).to.eq(200)

                // Check the eligibility of subscription when current date is set as next billing Date
                cy.checkPlanEligibilityViaApi(shopperId).then((response) => {
                  expect(response.status).to.eq(200)
                  expect(response.body).to.have.property('IsDeliverySaverEnabled', true)
                  expect(response.body).to.have.property('IsEligibleForDeliverySaver', false)
                  if (plan.SubscriberType == 'business') {
expect(response.body).to.have.property('IsBusinessAccount', true)
} else {
expect(response.body).to.have.property('IsBusinessAccount', false)
}

                  // Set the Date back to current Date & Time after cancellation is confirmed
                  cy.setDateTime(currentDateTime).then((response) => {
                    expect(response.status).to.eq(200)
                  })
                })
              })
            })
          })

          signUpDetails.shopperId = shopperId
          signUpDetails.planId = plan.PlanId
          signUpDetails.planPrice = plan.Price
          signUpDetails.createdTime = new Date().toLocaleString()
          signUpDetails.status = 'Subscription cancelled'
          cy.writeTestDataUsed(`${Cypress.env('duSubscriptionTestDataFilePath')}/personalSubscriptionUsedData.json`, signUpDetails)

          // Reset values
          signUpDetails.shopperId = ''
          signUpDetails.planId = ''
          signUpDetails.planPrice = ''
          signUpDetails.createdTime = ''
          signUpDetails.status = ''
        })
      })
    })
  })
})
