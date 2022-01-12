import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'
import {editSessionGroupV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/EditSessionGroupV2Page'

var sessionGroupName: string
var timeStamp: string
var sessionGroupCount: number = 2
var sessionGroupNames: string[] = new Array(sessionGroupCount)
var itemsPerPage: number = 5000

TestFilter(['UI', 'B2C', 'SessionGroupsV2', 'P1', 'CONWAY'], () => {
    describe('[UI] Sorting of Session Groups V2', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            sessionGroupsV2Page.open()
            cy.adminLoginViaUi(loginDetails)
            sessionGroupsV2Page.getShowSelect().select(itemsPerPage.toString())
        })

        it('Session Groups v2 Sorting by Default', () => {

            for(let i = 0; i < sessionGroupCount; i++) {
                timeStamp = new Date().toISOString().substr(0, 26)
                sessionGroupNames[i] = "SG " + timeStamp
                sessionGroupsV2Page.getCreateNewSessionGroup().click()
                editSessionGroupV2Page.getNameInput().type(sessionGroupNames[i])
                editSessionGroupV2Page.getDescriptionInput().type('Session group created by test automation')
                editSessionGroupV2Page.getDomainInput().type('Test Automation Domain ' + i)
                editSessionGroupV2Page.getGroupList().select('DigitalPayData')
                editSessionGroupV2Page.getAttributeList().select('IsMigratedToDigitalPay')
                editSessionGroupV2Page.getAddAttribute().click()
                editSessionGroupV2Page.getAddedAttribute('DigitalPayData', 'IsMigratedToDigitalPay').should('be.visible')
                editSessionGroupV2Page.getUpdateButton().click()
                sessionGroupsV2Page.getSessionGroupEntry(sessionGroupNames[i]).should('be.visible')
                sessionGroupsV2Page.getTableRowName(1).should('have.text', sessionGroupNames[i])
            }
  
        })

        //it('Session Groups v2 Sorting by Default', () => {
            //sessionGroupsV2Page.getTableRowName(1).should('have.text', sessionGroupNames[1])
            //sessionGroupsV2Page.getTableRowName(2).should('have.text', sessionGroupNames[0])
        //})

        it('Session Groups v2 Sorting by Name', () => {
            sessionGroupsV2Page.getNameHeader().click()
            cy.wait(1000)
            sessionGroupsV2Page.getTableRowName(1).invoke('text').as("firstRowName")
            sessionGroupsV2Page.getNameHeader().click()
            cy.wait(1000)
            cy.get("@firstRowName").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })
            sessionGroupsV2Page.getTableRowName(1).invoke('text').as("lastRowName")
            sessionGroupsV2Page.getNameHeader().click()
            cy.wait(1000)
            cy.get("@lastRowName").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })
        })

        it('Session Groups v2 Sorting by Description', () => {
            sessionGroupsV2Page.getDescriptionHeader().click()
            cy.wait(1000)
            sessionGroupsV2Page.getTableRowDescription(1).invoke('text').as("firstRowDescription")
            sessionGroupsV2Page.getDescriptionHeader().click()
            cy.wait(1000)
            cy.get("@firstRowDescription").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })
            sessionGroupsV2Page.getTableRowDescription(1).invoke('text').as("lastRowDescription")
            sessionGroupsV2Page.getDescriptionHeader().click()
            cy.wait(1000)
            cy.get("@lastRowDescription").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })
        })

        it('Session Groups v2 Sorting by Domain', () => {
            sessionGroupsV2Page.getDomainHeader().click()
            cy.wait(1000)
            sessionGroupsV2Page.getTableRowDomain(1).invoke('text').as("firstRowDomain")
            sessionGroupsV2Page.getDomainHeader().click()
            cy.wait(1000)
            cy.get("@firstRowDomain").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })
            sessionGroupsV2Page.getTableRowDomain(1).invoke('text').as("lastRowDomain")
            sessionGroupsV2Page.getDomainHeader().click()
            cy.wait(1000)
            cy.get("@lastRowDomain").then(($value) => {
                cy.get('tr').last().should('contain', $value)
            })   
        })

        it('Delete Session Groups v2', () => {
            for(let i = 0; i < sessionGroupCount; i++) { 
                sessionGroupsV2Page.getDeleteSessionGroup(sessionGroupNames[i]).click()
                sessionGroupsV2Page.getSessionGroupEntry(sessionGroupNames[i]).should('not.exist')
            }
        })

    })
})
