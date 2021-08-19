Cypress.Commands.add('fullDispatchAnInvoice', (decodedInvoiceId, postageTrackingnumber, postageCarrier, sellerName) => {
  const apiKey = getApiKeyForSeller(sellerName)
  const endPoint = String(Cypress.env('marketplacerFullDispatchInvoiceEndpoint')).replace('INVOICE_ID', decodedInvoiceId)
  const requestBody = {
    data: {
      type: 'invoices',
      attributes: {
        postage_tracking: postageTrackingnumber,
        postage_carrier: postageCarrier
      }
    }
  }
  cy.request({
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
    return response.body
  })
})

const getApiKeyForSeller = (sellerName) => {
  if (sellerName === 'Pet Culture') { return Cypress.env('marketplacerPetCultureAPIKey') } else if (sellerName === 'BigWTest') { return Cypress.env('marketplacerBigWTestAPIKey') }
}

Cypress.Commands.add('partialDispatchOfLineItemsInInvoice', (decodedInvoiceId, decodedLineItemId, quantity, postageTrackingnumber, postageCarrier, sellerName) => {
  const apiKey = getApiKeyForSeller(sellerName)
  const requestBody = {
    data: {
      type: 'shipments',
      attributes: {
        shipment_tracking_number: postageTrackingnumber,
        shipment_carrier: postageCarrier,
        line_items_ids: [
          decodedLineItemId
        ],
        shipped_items: [
          {
            line_item_id: decodedLineItemId,
            quantity: quantity
          }
        ]
      }
    }
  }

  const endPoint = String(Cypress.env('marketplacerPartialDispatchInvoiceEndpoint')).replace('INVOICE_ID', decodedInvoiceId)
  cy.request({
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
    return response.body
  })
})

Cypress.Commands.add('cancelLineItemInInvoice', (encodedInvoiceId, encodedLineItemId, quantity) => {
  let encodedRefundRequestId
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

  cy.request({
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
    encodedRefundRequestId = response.body.data.refundRequestCreate.refundRequest.id
    cy.log('encodedRefundRequestId: ' + encodedRefundRequestId)
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

    cy.request({
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
      return response.body
    })
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

  cy.request({
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

  cy.request({
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

  cy.request({
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
    return response.body
  })
})
