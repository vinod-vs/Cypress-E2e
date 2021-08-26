Cypress.Commands.add('subscriptionCCPaymentViaApi', (ccDetails, iframeToken) => {
  
    cy.api({
      method: 'POST',
      url: Cypress.env('iframeURL')+Cypress.env('iframeURLEndpoint'),
      headers:{
        Authorization: "Bearer "+iframeToken
      },
      body: ccDetails
    }).then((response) => {
      return response
    })
  })
  