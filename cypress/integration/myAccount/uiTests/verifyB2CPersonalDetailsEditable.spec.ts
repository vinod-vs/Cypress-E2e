/// <reference types="cypress" />

import shoppers from "../../../fixtures/myAccount/myAccountShopper.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/login/ui/commands/login";
import "../../../support/myAccount/ui/commands/myAccount";
import "../../../support/myAccount/ui/commands/myAccountEditPersonalDetails";
import "../../../support/logout/ui/commands/logout";
import '../../../support/utilities/ui/utility'

const faker = require('faker/locale/en_AU')
let FirstName:any = faker.name.firstName()
let LastName:any = faker.name.lastName()
let DateOfBirthInput:any

let WrongDOB:any = ["12/25/1989","32/12/2015","29/02/2015"]

TestFilter(["B2C", "UI", "P0"], () => {
    describe("[UI] Personal details are editable in myAccounts page", () => {
      before(() => {
        cy.clearCookies({ domain: null });
        cy.clearLocalStorage({ domain: null });
        Cypress.Cookies.preserveOnce("w-rctx");

      });

    it("myAccount deatils page - Edit FirstName, LastName and DateOfBirth", () => {
        // Login
        cy.loginViaUi(shoppers[0]);
        //Navigate to My account
        cy.navigateToMyAccountViaUi();
        //Validate that "personal details" tag is present in the page 
        cy.verifyPersonalDetailsPageViaUi();
        //Click on edit, enter the Firstname and Lastname and save the details 
        cy.clickToEditName();
        cy.editFirstName(FirstName);
        cy.editLastName(LastName);
        cy.saveName();

        //Validate the firstname and lastname are saved successfully 

        cy.validateNamesUpdation(FirstName,LastName)

        //Validate the message is displayed on the top after saving the firstName and LastName 
        cy.validateTheSuccessMessage()

        //Click on edit, enter the date of birth and save the DOB
        cy.clickToEditDOB();

        cy.getDOB('personal').then((value) => {
          DateOfBirthInput = value
          cy.editDOB(DateOfBirthInput);
        })

        //Validate the message is displayed on the top after saving the dob 
        cy.validateTheSuccessMessage();

       
      });

      it("myAccount deatils page - verify changes are not saved when update is cancelled", () => {

        cy.clickToEditName();
        cy.editFirstName('CancelFN');
        cy.editLastName('CancelLN');
        cy.cancelNameChanges();
        cy.validateNamesUpdation(FirstName,LastName)

      });

      it("myAccount deatils page - verify FN, LN and DOB can not be blank", () => {
        cy.clickToEditName();
        cy.editFirstName('');
        cy.saveName();
        cy.verifyBlankFirstNameErrorMessage();
        cy.editLastName('');
        cy.saveName();
        cy.verifyBlankLastNameErrorMessage();
        cy.cancelNameChanges();
        cy.validateNamesUpdation(FirstName,LastName)
        cy.clickToEditDOB();
        cy.editDOB('');
        cy.verifyBlankDOBErrorMessage();

      });

      WrongDOB.forEach((DOB:any) => {
        it("Date("+DOB+") format apart from dd/mm/yyyy or invalid date should throw error", () => {
          cy.editDOB(DOB);
          cy.verifyIncorrectDOBErrorMessage('invalid');
        });
      });
      it("Future Date should throw error", () => {
        cy.editDOB('22/02/2035');
        cy.verifyIncorrectDOBErrorMessage('future');
        cy.logoutViaUi();
      });



      

    })
})
