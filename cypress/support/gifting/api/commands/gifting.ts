/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

/*
  Usage: cy.addGiftingDetails('Merry Christmas to you and your family!', 'Scott Morrison', 'John Smith')
*/
Cypress.Commands.add(
  'addGiftingDetails',
  (message: string, sender: string, recipient: string) => {
    const request = {
      MarketOrderGiftingDetails: { Message: '', Sender: '', Recipient: '' }
    }
    request.MarketOrderGiftingDetails.Message = message
    request.MarketOrderGiftingDetails.Sender = sender
    request.MarketOrderGiftingDetails.Recipient = recipient
    const endpoint = String(Cypress.env('giftingEndPoint'))
    cy.api({
      method: 'POST',
      url: endpoint,
      body: request
    }).as('giftingResponse').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.Message).to.eq(message)
      expect(response.body.Sender).to.eq(sender)
      expect(response.body.Recipient).to.eq(recipient)
      expect(response.body.Enabled).to.be.true
      expect(response.body.LastUpdated).to.not.be.null
      return response.body
    })
  }
)
