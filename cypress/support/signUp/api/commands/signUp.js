import signUpDetails from '../../../../fixtures/signUp/signUpDetails.json'
import '../../../utilities/ui/utility'

Cypress.Commands.add('signUpViaApi', (userInfo) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('signUpEndpoint'),
    body: userInfo
  }).then((response) => {
    return response
  })
})

Cypress.Commands.add('signUpViaApiWith2FA', (userInfo) => {
  userInfo.enableEmailVerificationFE = true
  userInfo.hasOptSent = null
  userInfo.oneTimePin = null
  cy.signUpViaApi(userInfo).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body).to.have.property('ShopperId', 0)
  }).then(() => {
    cy.getMailosaurEmailByEmailAddress(userInfo.emailAddress).then(email => {
      cy.log('Your otp is: ' + email.subject.substr(0, 6))
      userInfo.hasOptSent = true
      userInfo.oneTimePin = email.subject.substr(0, 6)
      cy.signUpViaApi(userInfo).then((response) => {
        return response
      })
    })
  })
})

// This command will retrieve the one time pin using the given email address
Cypress.Commands.add('get2FACode', (userInfo) => {
  cy.getMailosaurEmailByEmailAddress(userInfo.emailAddress).then(email => {
    cy.log('Your otp is: ' + email.subject.substr(0, 6))
    userInfo.hasOptSent = true
    userInfo.oneTimePin = email.subject.substr(0, 6)
    return cy.wrap(userInfo.oneTimePin)
  })
})

Cypress.Commands.add('setSignUpDetails', () => {
  const faker = require('faker/locale/en_AU')

  signUpDetails.firstName = faker.name.firstName()
  signUpDetails.lastName = faker.name.lastName()
  cy.generateRandomString(6).then((value) => {
    signUpDetails.emailAddress = faker.internet.userName() + value + '@' + Cypress.env('mailosaur_serverDomain')
  })
  signUpDetails.mobilePhone = faker.phone.phoneNumber('0400000000')
  signUpDetails.idLikeToReceiveEmailsAboutProductsAndServices = true
  cy.getDOB('personal').then((value) => {
    signUpDetails.dateOfBirth = value
  })

  return cy.wrap(signUpDetails)
})
