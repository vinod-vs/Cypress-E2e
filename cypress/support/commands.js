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
    cy.request('POST', '/apis/ui/Login/loginwithcredential', shopper).then((response) => {
        expect(response.body).to.have.property('LoginResult', 'Success')
    })
})