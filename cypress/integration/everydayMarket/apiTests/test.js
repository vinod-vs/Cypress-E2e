
/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import eventsRequest from '../../../fixtures/everydayMarket/events.json'
import search from '../../../fixtures/everydayMarket/search.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/orders/api/commands/amendOrder'
import * as lib from '../../../support/everydayMarket/api/commands/validationHelpers'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API] RP-5031 EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    after(() => {
      cy.clearAnyOrderAmendments()
    })

    it('[API] RP-5031 EM | Amend grocery order and verify Everyday Market order remains unchanged', () => {
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      cy.getCurrentlyAmendingOrder().then((response) => {
        cy.log(JSON.stringify(response))
        cy.log(response.OrderId)
      })

      // cancelAmendingOrder', (traderOrderId, revertExistingAmend) => {
    })
  })
})
