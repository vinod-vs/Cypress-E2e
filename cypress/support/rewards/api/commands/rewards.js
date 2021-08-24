// cypress/integration/my-spec.js
/// <reference types="@bahmutov/cy-api" />

Cypress.Commands.add('getRewardsCardDetails', (partnerId, siteId, posId, loyaltySiteType, cardNo) => {
  let requestBody = `{
        "queryCardDetailsReq": {
            "partnerId": PARTNERID,
            "siteId": SITEID,
            "posId": POSID,
            "loyaltySiteType": "LOYALTY_SITE_TYPE",
            "transDateTime": "TRANS_DATE_TIME",
            "transId": TRANSID,
            "uniqueTransId": "UNIQUE_TRAN_ID",
            "cardNo": CARD_NO
        }
    }`
  requestBody = String(requestBody).replace('PARTNERID', Number(partnerId))
  requestBody = String(requestBody).replace('SITEID', Number(siteId))
  requestBody = String(requestBody).replace('POSID', Number(posId))
  requestBody = String(requestBody).replace('LOYALTY_SITE_TYPE', loyaltySiteType)
  requestBody = String(requestBody).replace('TRANS_DATE_TIME', (new Date()).toJSON())
  requestBody = String(requestBody).replace('TRANSID', Number(Math.floor(Math.random() * 1000)))
  requestBody = String(requestBody).replace('UNIQUE_TRAN_ID', Date.now())
  requestBody = String(requestBody).replace('CARD_NO', Number(cardNo))

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
