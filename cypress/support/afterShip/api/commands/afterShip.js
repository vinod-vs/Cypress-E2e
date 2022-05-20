/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import '../../../utilities/api/apiUtilities'
import getConsignmentWebhook from '../../../../fixtures/afterShip.json'

Cypress.Commands.add('invokeConsignmentWebhook', (postageTrackingnumber, status) => {
  const requestBody = getConsignmentWebhook
  const secret = String(Cypress.env('consignmentAfterShipAPIKey'))
  const idVal = Math.floor(Math.random() * (9 * (Math.pow(10, 5)))) + (Math.pow(10, 5))
  const eventIdVal = Math.floor(Math.random() * (9 * (Math.pow(10, 5)))) + (Math.pow(10, 5))
  const tsVal = Math.floor(Math.random() * (9 * (Math.pow(10, 10)))) + (Math.pow(10, 10))
  requestBody.event_id = '17e03e7d-a969-455b-99eb-' + eventIdVal
  requestBody.msg.id = idVal
  requestBody.msg.tracking_number = postageTrackingnumber
  requestBody.msg.tag = status
  requestBody.ts = tsVal
  const signatureRawData = JSON.stringify(requestBody)
  const CryptoJS = require('crypto-js')
  const signature = CryptoJS.enc.Utf8.parse(signatureRawData)
  const secretByteArray = CryptoJS.enc.Utf8.parse(secret)
  const signatureBytes = CryptoJS.HmacSHA256(signature, secretByteArray)
  const requestSignatureBase64String = CryptoJS.enc.Base64.stringify(signatureBytes)
  const messageSignature = requestSignatureBase64String
  cy.api({
    method: 'POST',
    headers: {
      'Aftership-Hmac-Sha256': messageSignature,
      'Content-Type': 'application/json'
    },
    url: Cypress.env('consignmentEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})
