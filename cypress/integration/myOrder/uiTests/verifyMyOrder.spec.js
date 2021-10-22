/// <reference types="Cypress" />

import shoppers from '../../../fixtures/login/b2cShoppers.json'
import { myOrderPage, onMyOrderPage } from '../../../support/myOrder/ui/myOrderPage'
import '../../../support/login/ui/commands/login'

describe('Sample test for page objects', () => {

    before('open application', () => {
        
        cy.clearCookies({ domain: null })
        cy.clearLocalStorage({ domain: null })
    })

    it('verify the selectors', () => {

        cy.loginViaUi(shoppers[0])

        onMyOrderPage.getMyAccountButton()
        onMyOrderPage.getMyOrdersLink()


    })

})