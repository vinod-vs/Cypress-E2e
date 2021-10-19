Cypress.Commands.add('navigateExpressionOfInterestPage', (endPoint) => {
  cy.api({
    method: 'POST',
    body: {
      FormatObject: '{}',
      IsSpecial: false,
      PageType: 'Discover',
      UrlPath: '/shop/page/expression-of-interest'
    },
    url: Cypress.env(endPoint)
  }).then((response) => {
    expect(response.status).to.eq(200)

    return response.body
  })
})
