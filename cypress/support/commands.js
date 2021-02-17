Cypress.Commands.add('loginb2c', (creds = {}) => {
    cy.request({
        url: Cypress.env('b2cLogin'),
        method: 'POST',
        body: {
            email: creds.b2c.email,
            password: creds.b2c.password
        }
    })
})

Cypress.Commands.add('LoginViaApi', (shopper) => {
    cy.request('POST', Cypress.env('b2cLogin'), shopper).then((response) => {
        expect(response.body).to.have.property('LoginResult', 'Success')
    })
})

Cypress.Commands.add('LoginViaUi', (shopper) => {
    cy.visit('shop/securelogin')

    cy.get('#loginForm-Email').type(shopper.email)

    cy.get('#loginForm-Password').type(shopper.password)

    cy.get('.primary-legacy').click()

    cy.get('#header-panel a.coreHeader-signupButton').contains('My Account').click()

    cy.get('shared-navigation-menu a[queryparamshandling]').contains('Logout').click()

    cy.url().should('eq', Cypress.config().baseUrl)
})