// cypress/integration/my-spec.js
/// <reference types="@bahmutov/cy-api" />
import queryRequest from '../../../../fixtures/rewards/query.json'

Cypress.Commands.add('getRewardsCardDetails', (partnerId, siteId, posId, loyaltySiteType, cardNo) => {
  let requestBody = queryRequest
  requestBody.queryCardDetailsReq.partnerId = Number(partnerId)
  requestBody.queryCardDetailsReq.siteId = Number(siteId)
  requestBody.queryCardDetailsReq.posId = Number(posId)
  requestBody.queryCardDetailsReq.loyaltySiteType = String(loyaltySiteType)
  requestBody.queryCardDetailsReq.transDateTime = (new Date()).toJSON()
  requestBody.queryCardDetailsReq.transId = Number(Math.floor(Math.random() * 1000))
  requestBody.queryCardDetailsReq.uniqueTransId = String(Date.now())
  requestBody.queryCardDetailsReq.cardNo = Number(cardNo)

  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      client_id: 'p9AqIhwoNaCmb3iJrEjONWknSCPfOU3J',
      'x-correlation-id': 'test',
      'x-woolies-internal': 'test'
    },
    url: Cypress.env('rpgEndpoint') + Cypress.env('rpgQueryEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.queryCardDetailsStatus.returnCode).to.eq(0)
    return response.body
  })
})
