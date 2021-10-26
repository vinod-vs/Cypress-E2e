import TestFilter from '../../../support/TestFilter'
import {sessionGroupsV2Page} from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page';
import {loginPage} from '../../../support/adminLogin/ui/pageObjects/LoginPage';
import loginDetails from '../../../fixtures/admin/loginDetails.json';



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

   

