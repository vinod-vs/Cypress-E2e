import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/admin/loginDetails.json'
import '../../../support/adminLogin/ui/commands/login'
import {editSessionGroupV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/EditSessionGroupV2Page'

var sessionGroupName:string
var timeStamp:string

beforeEach(() => {
    cy.clearCookies({ domain: null })
    cy.clearLocalStorage({ domain: null })
  })

it('List Session Groups V2', function() {
    sessionGroupsV2Page.open()
    cy.adminLoginViaUi(loginDetails)
    sessionGroupsV2Page.getCreateNewSessionGroup().should('be.visible')
    sessionGroupsV2Page.getTableFrame().should('be.visible')
    sessionGroupsV2Page.getIdHeader().should('be.visible')
    sessionGroupsV2Page.getNameHeader().should('be.visible')
    sessionGroupsV2Page.getDescriptionHeader().should('be.visible')
    sessionGroupsV2Page.getDomainHeader().should('be.visible')
    sessionGroupsV2Page.getDeleteHeader().should('be.visible')
})

it('Create Session Group v2', function() {
    sessionGroupsV2Page.open()
    cy.adminLoginViaUi(loginDetails)
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
    sessionGroupsV2Page.open()
    cy.adminLoginViaUi(loginDetails)
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
    sessionGroupsV2Page.open()
    cy.adminLoginViaUi(loginDetails)
    //to do
})

   

