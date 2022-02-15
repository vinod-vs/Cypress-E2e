import { onSignup } from '../pageObjects/Signup'
import { onTwoStepAuthPageSignUp } from '../../../signUp/ui/pageObjects/TwoStepAuthPageSignUp'
import '../../../utilities/ui/utility'
import '../../../../fixtures/signUp/signUpDetails.json'
import '../../api/commands/signUp'
import { values } from 'cypress/types/lodash'

/*
** This command will sign up new user to Woolworths online
** Age of the user can be either less than 60 or greater than 60
*/
Cypress.Commands.add('signUpPersonalUser', (userinfo) => {

  cy.visit((Cypress.env('uat') + '/shop/signup/one-login'))

  Cypress.env('url')
  
  // Assign values to the 'userinfo' data structure and submit the sign-up form
  onSignup.getFirstName().type(userinfo.firstName)
  onSignup.getLastName().type(userinfo.lastName)
  onSignup.getEmail().type(userinfo.emailAddress)
  onSignup.getPassword().type(userinfo.password)
  onSignup.getDateOfBirth().type(userinfo.dateOfBirth)
  onSignup.getContactNumber().type(userinfo.mobilePhone)

  onSignup.getTermsAndConditions().click()
  onSignup.getSubmitButton().click()

  cy.get2FACode(userinfo).then((value)=> {
    const oneTimePin = value
    onTwoStepAuthPageSignUp.VerifyCode(oneTimePin)
  })  

})
