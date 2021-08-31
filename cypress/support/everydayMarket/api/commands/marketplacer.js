/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />
import fullDispatchAnInvoiceRequest from '../../../../fixtures/everydaymarket/marketplacer/fullDispatchAnInvoice.json'
import partialDispatchOfLineItemsInInvoice from '../../../../fixtures/everydaymarket/marketplacer/partialDispatchOfLineItemsInInvoice.json'

Cypress.Commands.add('fullDispatchAnInvoice', (decodedInvoiceId, postageTrackingnumber, postageCarrier, sellerName) => {
  const apiKey = getApiKeyForSeller(sellerName)
  const endPoint = String(Cypress.env('marketplacerFullDispatchInvoiceEndpoint')).replace('INVOICE_ID', decodedInvoiceId)
  const requestBody = fullDispatchAnInvoiceRequest
  requestBody.data.attributes.postage_tracking = postageTrackingnumber
  requestBody.data.attributes.postage_carrier = postageCarrier

  cy.api({
    method: 'PUT',
    headers: {
      'Content-Type': 'application/vnd.api+json'
    },
    auth: {
      bearer: apiKey
    },
    url: Cypress.env('marketplacerApiEndpoint') + endPoint,
    body: requestBody
  }).then((response) => {
    expect(response.status).to.be.within(200, 201)
    return response.body
  })
})

const getApiKeyForSeller = (sellerName) => {
  if (sellerName === 'Pet Culture') { return Cypress.env('marketplacerPetCultureAPIKey') } else if (sellerName === 'BigWTest') { return Cypress.env('marketplacerBigWTestAPIKey') }
}

/*
      Usage
      Single item dispatch
      const data1 = [{line_item_id: 32422, quantity: 1}]
      cy.partialDispatchOfLineItemsInInvoice(27208, data1, "123456", "Australia Post", "Pet Culture")
      Multiple items dispatch
      const data2 = [{line_item_id: 32423, quantity: 1}, {line_item_id: 32424, quantity: 1}]
      cy.partialDispatchOfLineItemsInInvoice(27208, data2, "123456", "Australia Post", "Pet Culture")

*/
Cypress.Commands.add('partialDispatchOfLineItemsInInvoice', (decodedInvoiceId, decodedLineAndquantityDetails, postageTrackingnumber, postageCarrier, sellerName) => {
  const apiKey = getApiKeyForSeller(sellerName)
  const requestBody = partialDispatchOfLineItemsInInvoice
  requestBody.data.attributes.shipment_tracking_number = postageTrackingnumber
  requestBody.data.attributes.shipment_carrier = postageCarrier
  requestBody.data.attributes.shipped_items = decodedLineAndquantityDetails
  const endPoint = String(Cypress.env('marketplacerPartialDispatchInvoiceEndpoint')).replace('INVOICE_ID', decodedInvoiceId)
  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json'
    },
    auth: {
      bearer: apiKey
    },
    url: Cypress.env('marketplacerApiEndpoint') + endPoint,
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

/*
  Usage: cy.cancelLineItemInInvoice("SW52b2ljZS0yNzI5OQ==", "TGluZUl0ZW0tMzI1MTU=", 1)
*/
Cypress.Commands.add('cancelLineItemInInvoice', (encodedInvoiceId, encodedLineItemId, quantity) => {
  let encodedRefundRequestId
  cy.refundRequestCreate(encodedInvoiceId, encodedLineItemId, quantity).then((response) => {
    encodedRefundRequestId = response.data.refundRequestCreate.refundRequest.id
    cy.log('encodedRefundRequestId: ' + encodedRefundRequestId)
    cy.refundRequestReturn(encodedRefundRequestId)
  })
})

Cypress.Commands.add('refundRequestCreate', (encodedInvoiceId, encodedLineItemId, quantity) => {
  let mutation = String(`mutation{
        refundRequestCreate(input: 
          {
            invoiceId: "ENCODED_INVOICE_ID",
            lineItems: {
              lineItemId: "ENCODED_LINEITEM_ID"
              reason: "Automation Reason: I don't want this"
              quantity: QUANTITY
            }
            notes: [{
              note: "Automation refundRequestCreate note: I don't want this"
            }]
          })
        {
          refundRequest{
            id
            status
            cashAmountCents
            refundAmountCents
            cashAmountFormatted
          }errors{
            field
            messages
          }
        }
      }`).replace('ENCODED_INVOICE_ID', encodedInvoiceId)
  mutation = String(mutation).replace('ENCODED_LINEITEM_ID', encodedLineItemId)
  mutation = String(mutation).replace('QUANTITY', quantity)

  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      bearer: Cypress.env('marketplacerGQLApiKey')

    },
    url: Cypress.env('marketplacerGQLEndpoint'),
    body: {
      query: mutation
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.data.refundRequestCreate.errors).to.be.null
    expect(response.body.data.refundRequestCreate.refundRequest.status).to.equals('AWAITING')
    return response.body
  })
})

Cypress.Commands.add('refundRequestReturn', (encodedRefundRequestId) => {
  const mutation = String(`mutation{
        refundRequestReturn(input: {
          refundRequestId: "ENCODED_REFUND_REQUEST_ID"
          notes: [{
            note: "Automation refundRequestReturn note: I don't want this"
          }]
          returnedConsignments:[{
            sourceUrl: "https://en.wikipedia.org/wiki/Receipt#/media/File:US-BEP-Receipt_for_currency_(23_July_1915).jpg"
          }
            
          ]
        })
        {
          refundRequest{
            id
            status
            cashAmountCents
            refundAmountCents
            cashAmountFormatted
          }errors{
            field
            messages
          }
        }
      }`).replace('ENCODED_REFUND_REQUEST_ID', encodedRefundRequestId)

  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      bearer: Cypress.env('marketplacerGQLApiKey')

    },
    url: Cypress.env('marketplacerGQLEndpoint'),
    body: {
      query: mutation
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.data.refundRequestReturn.refundRequest.status).to.equals('RETURNED')
    expect(response.body.data.refundRequestReturn.errors).to.be.null
    return response.body
  })
})

Cypress.Commands.add('refundRequestRefund', (encodedRefundRequestId, refundAmountCents) => {
  let mutation = String(`mutation{
        refundRequestRefund(input: {
          refundRequestId: "ENCODED_REFUND_REQUEST_ID"
          cashAmountCents: REFUND_AMOUNT_IN_CENTS
          
          notes: [{
            note: "Automation refundRequestRefund note: I don't want this"
          }]
          receipts: [{
            sourceUrl: "https://en.wikipedia.org/wiki/Receipt#/media/File:US-BEP-Receipt_for_currency_(23_July_1915).jpg"
          }]
        })
        {
          refundRequest{
            id
            status
            cashAmountCents
            refundAmountCents
            cashAmountFormatted
          }errors{
            field
            messages
          }
        }
      }`).replace('ENCODED_REFUND_REQUEST_ID', encodedRefundRequestId)
  mutation = String(mutation).replace('REFUND_AMOUNT_IN_CENTS', refundAmountCents)

  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    auth: {
      bearer: Cypress.env('marketplacerGQLApiKey')

    },
    url: Cypress.env('marketplacerGQLEndpoint'),
    body: {
      query: mutation
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.data.refundRequestRefund.errors).to.be.null
    return response.body
  })
})
