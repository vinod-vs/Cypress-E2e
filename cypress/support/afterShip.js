/* eslint-disable no-unused-expressions */
/// <reference types="cypress" />

import './utilities/api/apiUtilities'
import getConsignmentWebhook from '../fixtures/afterShip.json'

Cypress.Commands.add('invokeconsignmentwebhook', (postageTrackingnumber, status) => {  
  const requestBody = getConsignmentWebhook
  const secret = String(Cypress.env('consignmentaftershipAPIKey'))  
  requestBody.msg.tracking_number = postageTrackingnumber   
  requestBody.msg.tag = status  
  var signatureRawData = JSON.stringify(requestBody)
  var CryptoJS = require('crypto-js');
  var signature = CryptoJS.enc.Utf8.parse(signatureRawData)
  var secretByteArray = CryptoJS.enc.Utf8.parse(secret)
  var signatureBytes = CryptoJS.HmacSHA256(signature,secretByteArray)
  var requestSignatureBase64String = CryptoJS.enc.Base64.stringify(signatureBytes)
  var messageSignature = requestSignatureBase64String  
  cy.api({
    method: 'POST',
    headers: {
      'Aftership-Hmac-Sha256': messageSignature,
      'Content-Type': 'application/json'  
    },
    url: Cypress.env('consignmentEndpoint') ,
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    return response.body
  })
})



