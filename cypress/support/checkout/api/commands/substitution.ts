Cypress.Commands.add(
  'setItemSubstitutionviaAPI',
  (substitutionRequest: any) => {
    cy.api({
      method: 'POST',
      url: Cypress.env('substitutionEndpoint'),
      body: substitutionRequest,
    }).then((response: any) => {
      expect(response.body.Success, 'Substitution endpoint Success value').to.be
        .true
      return response.body
    })
  }
)
