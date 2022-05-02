import TestFilter from '../../../support/TestFilter'
import { orderPromotionsPage } from '../../../support/orderPromotions/ui/pageObjects/OrderPromotionsPage'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'
import { editOrderPromotionPage } from '../../../support/orderPromotions/ui/pageObjects/EditOrderPromotionPage'

let orderPromotionName: string
let timeStamp: string
const startDate: string = '27/01/2022'
const endDate: string = '30/01/2030'
const qualifyingAmount: string = '10000.00'
const target: string = 'Grocery Subtotal'
const discountType: string = '% - Percent Off'
const discountAmount: string = '5.00'
const sessionGroup: string = 'DO-NOT-DELETE-CYPRESS-UI-SESSION-GROUP'

TestFilter(['UI', 'B2C', 'Promotions', 'P3', 'OHNO'], () => {
  describe('[UI] Create, Update, Delete Order Promotions', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      orderPromotionsPage.open()
      cy.adminLoginViaUi(loginDetails)
    })

    it('Create Order Promotion', () => {
      timeStamp = new Date().toISOString().substr(0, 26)
      orderPromotionName = 'OP ' + timeStamp
      orderPromotionsPage.getAddNewOrderPromotion().click()
      editOrderPromotionPage.getNameInput().type(orderPromotionName)
      editOrderPromotionPage.getStartDateInput().type(startDate + '{enter}')
      editOrderPromotionPage.getEndDateInput().type(endDate + '{enter}')
      editOrderPromotionPage.getEligibleShoppersInput().select(sessionGroup)
      editOrderPromotionPage.getQualifyingAmountInput().clear()
      editOrderPromotionPage.getQualifyingAmountInput().type(qualifyingAmount)
      editOrderPromotionPage.getTargetInput().select(target)
      editOrderPromotionPage.getDiscountTypeInput().select(discountType)
      editOrderPromotionPage.getAmountInput().clear()
      editOrderPromotionPage.getAmountInput().type(discountAmount)
      editOrderPromotionPage.getUpdateButton().click()
      orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('be.visible')
    })

    it('Update Order Promotion', () => {
      orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).click()
      timeStamp = new Date().toISOString().substr(0, 26)
      orderPromotionName = 'OP Update ' + timeStamp
      editOrderPromotionPage.getNameInput().clear()
      editOrderPromotionPage.getNameInput().type(orderPromotionName)
      editOrderPromotionPage.getEligibleShoppersInput().select(sessionGroup)
      editOrderPromotionPage.getUpdateButton().click()
      orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('be.visible')
    })

    it('Delete Order Promotion', () => {
      orderPromotionsPage.getDeleteOrderPromotion(orderPromotionName).click()
      orderPromotionsPage.getOrderPromotionEntry(orderPromotionName).should('not.exist')
    })
  })
})
