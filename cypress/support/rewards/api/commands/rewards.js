// cypress/integration/my-spec.js
/// <reference types="@bahmutov/cy-api" />
import queryRequest from '../../../../fixtures/rewards/query.json'
import finaliseRequest from '../../../../fixtures/rewards/finalise.json'

Cypress.Commands.add('getRewardsCardDetails', (partnerId, siteId, posId, loyaltySiteType, cardNo) => {
  const requestBody = queryRequest
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
      'client_id': 'p9AqIhwoNaCmb3iJrEjONWknSCPfOU3J',
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

/*
  This cypress command can be used to rewards points to a test card. The points will be added instantaneously.
  However, the points will be converted to the corresponding reward dollards ONLY at the end of the day by LMS.
*/
Cypress.Commands.add('addRewardPoints', (partnerId, siteId, posId, loyaltySiteType, cardNo, numberOfPointsToAdd) => {
  const requestBody = finaliseRequest
  requestBody.finaliseTransactionReq.partnerId = Number(partnerId)
  requestBody.finaliseTransactionReq.siteId = Number(siteId)
  requestBody.finaliseTransactionReq.posId = Number(posId)
  requestBody.finaliseTransactionReq.loyaltySiteType = String(loyaltySiteType)
  requestBody.finaliseTransactionReq.transDateTime = (new Date()).toJSON()
  requestBody.finaliseTransactionReq.transId = Number(Math.floor(Math.random() * 1000))
  requestBody.finaliseTransactionReq.uniqueTransId = String(Date.now())
  requestBody.finaliseTransactionReq.cardNo = Number(cardNo)
  requestBody.finaliseTransactionReq.WOWRewards.earnedBonusPoints = Number(numberOfPointsToAdd)
  requestBody.finaliseTransactionReq.WOWRewards.redeemedOffers[0].earnedBonusPoints = Number(numberOfPointsToAdd)

  cy.api({
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'client_id': 'p9AqIhwoNaCmb3iJrEjONWknSCPfOU3J',
      'x-correlation-id': 'test',
      'x-woolies-internal': 'test'
    },
    url: Cypress.env('rpgEndpoint') + Cypress.env('rpgFinaliseEndpoint'),
    body: requestBody
  }).then((response) => {
    expect(response.status).to.eq(200)
    expect(response.body.finaliseTransactionStatus.returnCode).to.eq(0)
    return response.body
  })
})
