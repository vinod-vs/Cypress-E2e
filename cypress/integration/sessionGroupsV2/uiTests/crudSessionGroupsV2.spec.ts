import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/admin/loginDetails.json'
import '../../../support/adminLogin/ui/commands/login'
import {editSessionGroupV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/EditSessionGroupV2Page'

var sessionGroupName:string
var timeStamp:string

TestFilter(['B2C-UI'], () => {
    describe('[UI] Create, Update, Delete Session Groups V2', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            sessionGroupsV2Page.open()
            cy.adminLoginViaUi(loginDetails)
        })

        it('Create Session Group v2', function() {
            timeStamp = new Date().toISOString().substr(0, 26)
            sessionGroupName = "SG " + timeStamp
            sessionGroupsV2Page.getCreateNewSessionGroup().click()
            editSessionGroupV2Page.getNameInput().type(sessionGroupName)
            editSessionGroupV2Page.getDescriptionInput().type('Session group created by test automation')
            editSessionGroupV2Page.getDomainInput().type('Test Automation Domain')
            editSessionGroupV2Page.getAttributeGroupOption('DigitalPayData').click()
            editSessionGroupV2Page.getAttributeNameOption('IsMigratedToDigitalPay').click()
            editSessionGroupV2Page.getAddAttribute().click()
            editSessionGroupV2Page.getUpdateButton().click()
            sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('be.visible')
        })

        it('Update Session Group v2', function() {
            sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).click()
            timeStamp = new Date().toISOString().substr(0, 26)
            sessionGroupName = "SG Update " + timeStamp
            editSessionGroupV2Page.getNameInput().clear()
            editSessionGroupV2Page.getNameInput().type(sessionGroupName)
            editSessionGroupV2Page.getDescriptionInput().clear()
            editSessionGroupV2Page.getDescriptionInput().type('Update session group created by test automation')
            editSessionGroupV2Page.getDomainInput().clear()
            editSessionGroupV2Page.getDomainInput().type('Update Test Automation Domain')
            editSessionGroupV2Page.getUpdateButton().click()
            sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('be.visible')
        })

        it('Delete Session Group v2', function() {
            sessionGroupsV2Page.getDeleteSessionGroup(sessionGroupName).click()
            sessionGroupsV2Page.getSessionGroupEntry(sessionGroupName).should('not.exist')
        })
    })
})
