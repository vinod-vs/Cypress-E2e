Cypress.Commands.add('LoginViaApi', (shopper) => {
    cy.request('POST', Cypress.env('b2cLogin'), shopper).then((response) => {
        expect(response.body).to.have.property('LoginResult', 'Success')
    })

    cy.getCookie('w-rctx').should('exist')
})