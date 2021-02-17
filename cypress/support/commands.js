Cypress.Commands.add('LoginViaApi', (shopper) => {
    cy.request('POST', '/apis/ui/Login/loginwithcredential', shopper).then((response) => {
        expect(response.body).to.have.property('LoginResult', 'Success')
    })
})