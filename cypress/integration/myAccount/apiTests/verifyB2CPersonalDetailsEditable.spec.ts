/// <reference types="cypress" />

import shoppers from '../../../fixtures/myAccount/b2cShoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/myAccount/api/commands/personalDetailsEdit'
import '../../../support/utilities/ui/utility'

const faker = require('faker/locale/en_AU')
const FirstName: any = faker.name.firstName()
const LastName: any = faker.name.lastName()
let DateOfBirthInput: any
// Below test data with incorrect date formats -mm/dd/yyyy : Invalid date : invalid leap year
const WrongDOB: any = ['12/25/1989', '32/12/2015', '29/02/2015']

TestFilter(['API', 'B2C', 'P1'], () => {
  describe('[API] personal details are editable from myAccounts page and email notification should be triggered for the change', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.loginViaApi(shoppers[0]).then((response: any) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })
      Cypress.Cookies.preserveOnce('w-rctx')
      Cypress.Cookies.preserveOnce('INGRESSCOOKIE')
      Cypress.Cookies.preserveOnce('w-8484730-uldtvc')
      Cypress.Cookies.preserveOnce('w-loggedin')
    })

    it('The user should  successfully edit firstname, lastname , DOB and save the details', () => {
      shoppers[1].FirstName = FirstName
      shoppers[1].LastName = LastName

      cy.getDOB('personal').then((value) => {
        DateOfBirthInput = value
        shoppers[1].DateOfBirthInput = DateOfBirthInput
      })

      cy.editPersonalDetails(shoppers[1]).then((response: any) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('FirstName', FirstName)
        expect(response.body).to.have.property('LastName', LastName)
        expect(response.body).to.have.property('DateOfBirthInput', DateOfBirthInput)
      })
    })
    WrongDOB.forEach((DOB: any) => {
      it('Date format apart from dd/mm/yyyy(' + DOB + ') or invalid date should throw error', () => {
        shoppers[1].DateOfBirthInput = DOB
        cy.editPersonalDetails(shoppers[1]).then((response: any) => {
          expect(response.status).to.eq(400)
          expect(response.body.ResponseStatus).to.have.property('ErrorCode', '500')
        })
      })
    })
    it('Saving future DOB should throw error', () => {
      shoppers[1].DateOfBirthInput = '08/12/2025'
      cy.editPersonalDetails(shoppers[1]).then((response: any) => {
        expect(response.status).to.eq(400)
        expect(response.body.ResponseStatus).to.have.property('ErrorCode', '500')
      })
    })

    it('Verify the notication email has been sent and validate the content', () => {
      cy.verifyEmailNotificationForPersonalDetails().then((response: any) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.contain('Personal details updated')
        expect(response.body).to.contain('Update to your Woolworths account')
        expect(response.body).to.contain('Your account details have been updated.')
        expect(response.body).to.contain("Your personal details have been successfully updated. To view these details, visit 'Account Details' in your My Account.")
      })
    })
  })
})
