import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'

var sessionGroupName:string
var timeStamp:string

TestFilter(['B2C-UI'], () => {
    describe('[UI] Navigate to Session Groups V2 Page', () => {

        beforeEach(() => {
            cy.clearCookies({ domain: null })
            cy.clearLocalStorage({ domain: null })
            sessionGroupsV2Page.open()
            cy.adminLoginViaUi(loginDetails)
        })

        it('List Session Groups V2', function() {
            sessionGroupsV2Page.getCreateNewSessionGroup().should('be.visible')
            sessionGroupsV2Page.getTableFrame().should('be.visible')
            sessionGroupsV2Page.getIdHeader().should('be.visible')
            sessionGroupsV2Page.getNameHeader().should('be.visible')
            sessionGroupsV2Page.getDescriptionHeader().should('be.visible')
            sessionGroupsV2Page.getDomainHeader().should('be.visible')
            sessionGroupsV2Page.getDeleteHeader().should('be.visible')
            sessionGroupsV2Page.getShowSelect().should('be.visible')
        })

        it('List 5 Session Groups per page', function() {
            sessionGroupsV2Page.getShowSelect().select('5')
            sessionGroupsV2Page.getCreateNewSessionGroup().should('be.visible')
            sessionGroupsV2Page.getTableFrame().should('be.visible')
            sessionGroupsV2Page.getIdHeader().should('be.visible')
            sessionGroupsV2Page.getNameHeader().should('be.visible')
            sessionGroupsV2Page.getDescriptionHeader().should('be.visible')
            sessionGroupsV2Page.getDomainHeader().should('be.visible')
            sessionGroupsV2Page.getDeleteHeader().should('be.visible')
            sessionGroupsV2Page.getTableRow(6).should('not.exist')
            
        })

        it('List 200 Session Groups per page', function() {
            sessionGroupsV2Page.getShowSelect().select('200')
            sessionGroupsV2Page.getCreateNewSessionGroup().should('be.visible')
            sessionGroupsV2Page.getTableFrame().should('be.visible')
            sessionGroupsV2Page.getIdHeader().should('be.visible')
            sessionGroupsV2Page.getNameHeader().should('be.visible')
            sessionGroupsV2Page.getDescriptionHeader().should('be.visible')
            sessionGroupsV2Page.getDomainHeader().should('be.visible')
            sessionGroupsV2Page.getDeleteHeader().should('be.visible')
            sessionGroupsV2Page.getTableRow(201).should('not.exist')
        })

        it('List 5000 Session Groups per page', function() {
            sessionGroupsV2Page.getShowSelect().select('5000')
            sessionGroupsV2Page.getCreateNewSessionGroup().should('be.visible')
            sessionGroupsV2Page.getTableFrame().should('be.visible')
            sessionGroupsV2Page.getIdHeader().should('be.visible')
            sessionGroupsV2Page.getNameHeader().should('be.visible')
            sessionGroupsV2Page.getDescriptionHeader().should('be.visible')
            sessionGroupsV2Page.getDomainHeader().should('be.visible')
            sessionGroupsV2Page.getDeleteHeader().should('be.visible')
            sessionGroupsV2Page.getTableRow(5001).should('not.exist')
        })

    })
})