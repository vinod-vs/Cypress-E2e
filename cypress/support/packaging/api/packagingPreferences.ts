Cypress.Commands.add('getPackagingOptions', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('packagingPreferencesEndpoint')
  }).then((response: any) => {
    return response.body
  })
})

Cypress.Commands.add('setPackagingOption', (option) => {
  cy.getPackagingOptions().then((response: any) => {
    const preference = response.PackagingPreferences.filter((packingOption: any) => packingOption.Code === option)
    cy.api({
      method: 'POST',
      url: Cypress.env('packagingPreferencesEndpoint') + '/' + preference[0].Id
    }).then((response: any) => {
      return response.body
    })
  })
})