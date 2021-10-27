import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/admin/loginDetails.json'
import '../../../support/adminLogin/ui/commands/login'

var sessionGroupName:string
var timeStamp:string

TestFilter(['B2C-UI'], () => {
    describe.skip('[UI] Navigate to Session Groups V2 Page', () => {

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
    })
})