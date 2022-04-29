import TestFilter from '../../../support/TestFilter'
import { sessionGroupsV2Page } from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'
import { editSessionGroupV2Page } from '../../../support/sessionGroupsV2/ui/pageObjects/EditSessionGroupV2Page'

let sessionGroupName: string
let timeStamp: string

TestFilter(['UI', 'B2C', 'SessionGroupsV2', 'P0', 'CONWAY'], () => {
  describe('[UI] Create, Update, Delete Session Groups V2', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      sessionGroupsV2Page.open()
      cy.adminLoginViaUi(loginDetails)
    })

    it('Create Session Group v2', function () {
      timeStamp = new Date().toISOString().substr(0, 26)
      sessionGroupName = 'SG ' + timeStamp
      sessionGroupsV2Page.getCreateNewSessionGroup().click()
      editSessionGroupV2Page.getNameInput().type(sessionGroupName)
      editSessionGroupV2Page.getDescriptionInput().type('Session group created by test automation')
      editSessionGroupV2Page.getDomainInput().type('Test Automation Domain')
      editSessionGroupV2Page.getGroupList().select('DigitalPayData')
      editSessionGroupV2Page.getAttributeList().select('IsMigratedToDigitalPay')
      editSessionGroupV2Page.getAddAttribute().click()
      editSessionGroupV2Page.getAddedAttribute('DigitalPayData', 'IsMigratedToDigitalPay').should('be.visible')
      editSessionGroupV2Page.getUpdateButton().click()
      sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('be.visible')
    })

    it('Update Session Group v2', function () {
      sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).click()
      timeStamp = new Date().toISOString().substr(0, 26)
      sessionGroupName = 'SG Update ' + timeStamp
      editSessionGroupV2Page.getNameInput().clear()
      editSessionGroupV2Page.getNameInput().type(sessionGroupName)
      editSessionGroupV2Page.getDescriptionInput().clear()
      editSessionGroupV2Page.getDescriptionInput().type('Update session group created by test automation')
      editSessionGroupV2Page.getDomainInput().clear()
      editSessionGroupV2Page.getDomainInput().type('Update Test Automation Domain')
      editSessionGroupV2Page.getGroupList().select('FulfilmentData')
      editSessionGroupV2Page.getAttributeList().select('IsNonServicedAddress')
      editSessionGroupV2Page.getAddAttribute().click()
      editSessionGroupV2Page.getAddedAttribute('FulfilmentData', 'IsNonServicedAddress').should('be.visible')
      editSessionGroupV2Page.getUpdateButton().click()
      sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('be.visible')
    })

    it('Delete Session Group v2', function () {
      sessionGroupsV2Page.getDeleteSessionGroup(sessionGroupName).click()
      sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('not.exist')
    })
  })
})
