import signUpDetails from '../../../../fixtures/signUp/signUpDetails.json'
import '../../../utilities/ui/utility'

Cypress.Commands.add('signUpViaApi', (userInfo) => {
  cy.api({ url: '/' }).then((response) => {
    expect(response.status).to.eq(200)
  })

  cy.api({
    method: 'POST',
    url: Cypress.env('signUpEndpoint'),
    body: userInfo
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('setSignUpDetails', () => {
  const faker = require('faker')

  signUpDetails.firstName = faker.name.firstName()
  signUpDetails.lastName = faker.name.lastName()
  cy.generateRandomString().then((response) => {
    signUpDetails.emailAddress = response + '@mailinator.com'
  })
  signUpDetails.mobilePhone = '0400000000',
  cy.getDOB('personal').then((value) => {
    signUpDetails.dateOfBirth = value
  })
  return cy.wrap(signUpDetails)  
})
