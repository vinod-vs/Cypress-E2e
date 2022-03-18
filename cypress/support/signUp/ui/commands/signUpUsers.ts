import { onSignup } from '../pageObjects/Signup'
import { onTwoStepAuthPageSignUp } from '../../../signUp/ui/pageObjects/TwoStepAuthPageSignUp'
import { onMyAccountPage } from '../../../myAccount/ui/pageObjects/MyAccountPage'
import '../../../utilities/ui/utility'
import '../../../../fixtures/signUp/signUpDetails.json'
import '../../api/commands/signUp'
import { values } from 'cypress/types/lodash'

/*
** This command will sign up new user to Woolworths online
** Age of the user can be either less than 60 or greater than 60
*/
Cypress.Commands.add('signUpUser', (userinfo) => {

  cy.visit((Cypress.env('uat') + '/shop/signup/one-login'))

  Cypress.env('url')
  
  // Assign values to the 'userinfo' data structure and submit the sign-up form
  onSignup.getEmail().type(userinfo.emailAddress)
  onSignup.getPassword().type(userinfo.password)
  onSignup.getFirstName().type(userinfo.firstName)
  onSignup.getLastName().type(userinfo.lastName)
  onSignup.getDateOfBirth().type(userinfo.dateOfBirth)
  onSignup.getContactNumber().type(userinfo.mobilePhone)
  onSignup.getRewarsMemberNo().click()
  onSignup.getTermsAndConditions().click()
  onSignup.getSubmitButton().click()

  cy.get2FACode(userinfo).then((value)=> {
    const oneTimePin = value
    onTwoStepAuthPageSignUp.VerifyCode(oneTimePin)
  })  

})


/*
** This command will sign up new business user to Woolworths online
*/
Cypress.Commands.add('signUpBusinessUser', (userinfo) => {

  cy.visit((Cypress.env('uat') + '/shop/signup/one-login'))

  Cypress.env('url')
  
  // Assign values to the 'userinfo' data structure and submit the sign-up form
  onSignup.getEmail().type(userinfo.emailAddress)
  onSignup.getPassword().type(userinfo.password)
  onSignup.getFirstName().type(userinfo.firstName)
  onSignup.getLastName().type(userinfo.lastName)
  onSignup.getDateOfBirth().type(userinfo.dateOfBirth)
  onSignup.getContactNumber().type(userinfo.mobilePhone)
  onSignup.getShoppingOnbehalfBusinessSelection().click()
  onSignup.getBusinessABN().type(userinfo.abn)
  onSignup.getBusinessTypeRetailService()
  onSignup.getCompanyName().type(userinfo.companyName)
  onSignup.getTermsAndConditions().click()
  onSignup.getSubmitButton().click()
  onMyAccountPage.getMyAccountHeaderLink().contains('My Account').click()
})
