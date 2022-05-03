import TestFilter from '../../../support/TestFilter'
import {orderPromotionsPage} from '../../../support/orderPromotions/ui/pageObjects/OrderPromotionsPage'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'

var sessionGroupName:string
var timeStamp:string

TestFilter(['UI', 'B2C', 'OrderPromotions', 'P3', 'OHNO'], () => {
    describe('[UI] Navigate to Order Promotions Page', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            orderPromotionsPage.open()
            cy.adminLoginViaUi(loginDetails)
        })

        it('List Order Promotions', () => {
            orderPromotionsPage.getAddNewOrderPromotion().should('be.visible')
            orderPromotionsPage.getTableFrame().should('be.visible')
            orderPromotionsPage.getIdHeader().should('be.visible')
            orderPromotionsPage.getNameHeader().should('be.visible')
        })

    })
})