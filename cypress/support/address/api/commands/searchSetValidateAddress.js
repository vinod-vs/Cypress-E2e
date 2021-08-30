Cypress.Commands.add('searchBillingAddressViaApi', (billingAddress) => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'POST',
      url: Cypress.env('addressSearchEndpoint'),
      body:{
          "Search": billingAddress
      }
     
    }).then((response) => {
      return response
    })
  })

  Cypress.Commands.add('setBillingAddressViaApi', (billingAddrID) => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'POST',
      url: Cypress.env('setBillingAddressEndpoint'),
      body:{
          "addressId": billingAddrID
      }
     
    }).then((response) => {
      return response
    })
  })

  Cypress.Commands.add('validateBillingAddressViaApi', () => {
    cy.api({ url: '/' }).then((response) => {
      expect(response.status).to.eq(200)
    })
  
    cy.api({
      method: 'GET',
      url: Cypress.env('addressEndpoint')
     
    }).then((response) => {
      return response
    })
  })

