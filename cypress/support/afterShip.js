/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import './utilities/api/apiUtilities'
import getConsignmentWebhook from '../fixtures/afterShip.json'

Cypress.Commands.add('invokeconsignmentwebhook', (postageTrackingnumber, status) => {
  const requestBody = getConsignmentWebhook
  const secret = String(Cypress.env('consignmentaftershipAPIKey'))
  requestBody.msg.tracking_number = postageTrackingnumber
  requestBody.msg.tag = status
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
