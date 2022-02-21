import TestFilter from '../../../support/TestFilter'
import { orderPromotionsPage } from '../../../support/orderPromotions/ui/pageObjects/OrderPromotionsPage'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'
import { editOrderPromotionPage } from '../../../support/orderPromotions/ui/pageObjects/EditOrderPromotionPage'
import '../../../support/accessability/accessability'

var orderPromotionName: string
var timeStamp: string

TestFilter(['UI', 'B2C', 'Promotions', 'P3', 'OHNO'], () => {
    describe('[UI] Create, Update, Delete Order Promotions', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            orderPromotionsPage.open()
            cy.adminLoginViaUi(loginDetails)
            cy.injectAxe()
        })

        it('Create Order Promotion', () => {
            cy.injectAxe()
            timeStamp = new Date().toISOString().substr(0, 26)
            orderPromotionName = "OP " + timeStamp
            orderPromotionsPage.getAddNewOrderPromotion().click()
            editOrderPromotionPage.getNameInput().type(orderPromotionName)
            editOrderPromotionPage.getStartDateInput().type('27/01/2022{enter}')
            editOrderPromotionPage.getEndDateInput().type('30/01/2030{enter}')
            editOrderPromotionPage.getEligibleShoppersInput().select('JV Session Group 202110220832')
            editOrderPromotionPage.getQualifyingAmountInput().clear()
            editOrderPromotionPage.getQualifyingAmountInput().type('10000.00')
            editOrderPromotionPage.getTargetInput().select('Grocery Subtotal')
            editOrderPromotionPage.getDiscountTypeInput().select('% - Percent Off')
            editOrderPromotionPage.getAmountInput().clear()
            editOrderPromotionPage.getAmountInput().type('5.00')
            editOrderPromotionPage.getUpdateButton().click()
            orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('be.visible')
        })

        it('Update Order Promotion', () => {
            orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).click()
            timeStamp = new Date().toISOString().substr(0, 26)
            orderPromotionName = "OP Update " + timeStamp
            editOrderPromotionPage.getNameInput().clear()
            editOrderPromotionPage.getNameInput().type(orderPromotionName)
            editOrderPromotionPage.getEligibleShoppersInput().select('DO-NOT-DELETE-CYPRESS-UI-SESSION-GROUP')
            editOrderPromotionPage.getUpdateButton().click()
            orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('be.visible')
        })

        it('Delete Order Promotion', () => {
            orderPromotionsPage.getDeleteOrderPromotion(orderPromotionName).click()
            orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('not.exist')
        })
    })
})
