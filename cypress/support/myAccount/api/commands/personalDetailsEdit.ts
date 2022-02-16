  Cypress.Commands.add('editPersonalDetails', (personalDetails) => {
    cy.api({ url: '/' }).then((response:any) => {
      expect(response.status).to.eq(200)
    })
    cy.api({
      method: 'POST',
      url: Cypress.env('editPersonalDetails'),
      failOnStatusCode: false,
      body: personalDetails
    }).then((response:any) => {
      return response
    })
  }) 

  Cypress.Commands.add('verifyEmailNotificationForPersonalDetails',() => {
    cy.api({
      method: 'GET',
      url: Cypress.env('verifyEmailNotificationForPersonalDetailsEndPoint')
    }).then((response: any) => {
      return response
    })
  })

  