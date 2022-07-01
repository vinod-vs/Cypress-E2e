/// <reference types="cypress" />

import shoppers from '../../../fixtures/myAccount/myAccountShopper.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/ui/commands/login'
import '../../../support/myAccount/ui/commands/myAccount'
import '../../../support/logout/ui/commands/logout'
import '../../../support/utilities/ui/utility'
import { onMyAccountDetailsPage } from '../../../support/myAccount/ui/pageObjects/MyAccountDetailsPage'

const faker = require('faker/locale/en_AU')

const FirstName: any = faker.name.firstName()
const LastName: any = faker.name.lastName()
const SecondaryNumber: any = faker.phone.phoneNumber('04########')
const tempNumber: any = []
let DateOfBirthInput: any
const WrongDOB: any = ['12/25/1989', '32/12/2015', '29/02/2015']

TestFilter(['B2C', 'UI', 'P0'], () => {
  describe('[UI] Personal details are editable in myAccounts page', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
    })

    it('myAccount deatils page - Edit FirstName, LastName and DateOfBirth', () => {
      // Login
      cy.loginViaUi(shoppers[0])
      // Navigate to My account
      cy.navigateToMyAccountViaUi()
      // Validate that "personal details" tag is present in the page
      onMyAccountDetailsPage.getMyPersonalDetailsText().contains('Personal Details')
      // Click on edit, enter the Firstname and Lastname and save the details
      onMyAccountDetailsPage.getMyPersonalDetailsNameEditLink().click()
      onMyAccountDetailsPage.getMyPersonalDetailsFirstNameInput().clear().type(FirstName)
      onMyAccountDetailsPage.getMyPersonalDetailsLastNameInput().clear().type(LastName)
      onMyAccountDetailsPage.getSaveChangesButtonforName().click()
      // Validate the firstname and lastname are saved successfully
      onMyAccountDetailsPage.getUpdatedName().contains(FirstName)
      onMyAccountDetailsPage.getUpdatedName().contains(LastName)
      // Validate the message is displayed on the top after saving the firstName and LastName
      onMyAccountDetailsPage.getSuccessTittle().contains('You have successfully saved your changes ')
      // Click on edit, enter the date of birth and save the DOB
      onMyAccountDetailsPage.getMyPersonalDetailsDOBEditLink().click()
      cy.getDOB('personal').then((value) => {
        DateOfBirthInput = value
        onMyAccountDetailsPage.getSaveChangesButtonforName().click()
      })
      // Validate the message is displayed on the top after saving the dob
      onMyAccountDetailsPage.getSuccessTittle().contains('You have successfully saved your changes ')
    })

    it('myAccount details page - verify changes are not saved when update is cancelled', () => {
      onMyAccountDetailsPage.getMyPersonalDetailsNameEditLink().click()
      onMyAccountDetailsPage.getMyPersonalDetailsFirstNameInput().clear().type('CancelFN')
      onMyAccountDetailsPage.getMyPersonalDetailsLastNameInput().clear().type('CancelLN')
      onMyAccountDetailsPage.getCancelButtonName().click()
      onMyAccountDetailsPage.getUpdatedName().contains(FirstName)
      onMyAccountDetailsPage.getUpdatedName().contains(LastName)
    })

    it('myAccount details page - verify FN, LN and DOB can not be blank', () => {
      onMyAccountDetailsPage.getMyPersonalDetailsNameEditLink().click()
      onMyAccountDetailsPage.getMyPersonalDetailsFirstNameInput().clear()
      onMyAccountDetailsPage.getSaveChangesButtonforName().click()
      onMyAccountDetailsPage.getMyPersonalDetailsFirstNameError().contains('First name is required.')
      onMyAccountDetailsPage.getMyPersonalDetailsLastNameInput().clear()
      onMyAccountDetailsPage.getSaveChangesButtonforName().click()
      onMyAccountDetailsPage.getMyPersonalDetailsLastNameError().contains('Last name is required.')
      onMyAccountDetailsPage.getCancelButtonName().click()
      onMyAccountDetailsPage.getUpdatedName().contains(FirstName)
      onMyAccountDetailsPage.getUpdatedName().contains(LastName)
      onMyAccountDetailsPage.getMyPersonalDetailsDOBEditLink().click()
      onMyAccountDetailsPage.getMyPersonalDetailsDOBInput().clear()
      onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Date of birth is required.')
    })

    WrongDOB.forEach((DOB: any) => {
      it('Date(' + DOB + ') format apart from dd/mm/yyyy or invalid date should throw error', () => {
        onMyAccountDetailsPage.getMyPersonalDetailsDOBInput().clear().type(DOB)
        onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Is not a valid Date')
      })
    })

    it('Future Date should throw error', () => {
      onMyAccountDetailsPage.getMyPersonalDetailsDOBInput().clear().type('22/02/2035')
      onMyAccountDetailsPage.getMyPersonalDetailsDOBError().contains('Date of birth cannot be in future')
      cy.logoutViaUi(shoppers)
    })

    it('verify user is able to add secondary phone number ', () => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      Cypress.Cookies.preserveOnce('w-rctx')
      cy.loginViaUi(shoppers[0])
      // Navigate to My account
      cy.navigateToMyAccountViaUi()
      // Validate that "personal details" tag is present in the page
      onMyAccountDetailsPage.getMyPersonalDetailsText().contains('Personal Details')
      onMyAccountDetailsPage.addSecondaryPhoneNumber().click()
      onMyAccountDetailsPage.getMySecondaryPhoneNumberInput().type(SecondaryNumber)
      onMyAccountDetailsPage.getSaveChangesButtonforSecondaryPhoneNumber().click()
      tempNumber[0] = SecondaryNumber.slice(0, 4)
      tempNumber[1] = SecondaryNumber.slice(4, 7)
      tempNumber[2] = SecondaryNumber.slice(7, 10)
      onMyAccountDetailsPage.getUpdatedMySecondaryNumber().contains(tempNumber[0] + '-' + tempNumber[1] + '-' + tempNumber[2])
      onMyAccountDetailsPage.getMySecondaryNumberEditLink().contains('Edit')
      onMyAccountDetailsPage.getMySecondaryNumberEditLink().click()
      onMyAccountDetailsPage.getMySecondaryPhoneNumberInput().clear()
      onMyAccountDetailsPage.getSaveChangesButtonforSecondaryPhoneNumber().click()
    })

    it('verify primary phone number field is present in myAccounts page', () => {
      onMyAccountDetailsPage.getContactNumber().click()
    })

    it('verify email address field is present in myAccounts page', () => {
      onMyAccountDetailsPage.getEmailAddress().click()
    })
  })
})
