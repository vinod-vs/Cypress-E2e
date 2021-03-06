import TestFilter from '../../../support/TestFilter'
import { sessionGroupsV2Page } from '../../../support/sessionGroupsV2/ui/pageObjects/SessionGroupsV2Page'
import loginDetails from '../../../fixtures/siteManagement/loginDetails.json'
import '../../../support/siteManagement/ui/commands/login'
import { editSessionGroupV2Page } from '../../../support/sessionGroupsV2/ui/pageObjects/EditSessionGroupV2Page'

let sessionGroupName: string
let timeStamp: string

const sessionGroupCount: number = 2
const sessionGroupNames: string[] = new Array(sessionGroupCount)
const itemsPerPage: number = 5000

TestFilter(['UI', 'B2C', 'SessionGroupsV2', 'P0', 'CONWAY'], () => {
  describe('[UI] Create, Update, Delete, Sort Session Groups V2', () => {
    beforeEach(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      sessionGroupsV2Page.open()
      cy.adminLoginViaUi(loginDetails)
      sessionGroupsV2Page.getShowSelect().select(itemsPerPage.toString())
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

    it('Session Groups v2 Sorting by Default', () => {
      for (let i = 0; i < sessionGroupCount; i++) {
        timeStamp = new Date().toISOString().substr(0, 26)
        sessionGroupNames[i] = 'SG ' + timeStamp
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
        sessionGroupsV2Page.getTableRowName(1).should('contain', sessionGroupNames[i])
      }
    })

    it('Session Groups v2 Sorting by Name', () => {
      sessionGroupsV2Page.getNameHeader().click()
      cy.wait(1000)
      sessionGroupsV2Page.getTableRowName(1).invoke('text').as('firstRowName')
      sessionGroupsV2Page.getNameHeader().click()
      cy.wait(1000)
      cy.get('@firstRowName').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
      sessionGroupsV2Page.getTableRowName(1).invoke('text').as('lastRowName')
      sessionGroupsV2Page.getNameHeader().click()
      cy.wait(1000)
      cy.get('@lastRowName').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
    })

    it('Session Groups v2 Sorting by Description', () => {
      cy.wait(1000)
      sessionGroupsV2Page.getDescriptionHeader().click()
      cy.wait(1000)
      sessionGroupsV2Page.getTableRowDescription(1).invoke('text').as('firstRowDescription')
      sessionGroupsV2Page.getDescriptionHeader().click()
      cy.wait(1000)
      cy.get('@firstRowDescription').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
      sessionGroupsV2Page.getTableRowDescription(1).invoke('text').as('lastRowDescription')
      sessionGroupsV2Page.getDescriptionHeader().click()
      cy.wait(1000)
      cy.get('@lastRowDescription').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
    })

    it('Session Groups v2 Sorting by Domain', () => {
      sessionGroupsV2Page.getDomainHeader().click()
      cy.wait(1000)
      sessionGroupsV2Page.getTableRowDomain(1).invoke('text').as('firstRowDomain')
      sessionGroupsV2Page.getDomainHeader().click()
      cy.wait(1000)
      cy.get('@firstRowDomain').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
      sessionGroupsV2Page.getTableRowDomain(1).invoke('text').as('lastRowDomain')
      sessionGroupsV2Page.getDomainHeader().click()
      cy.wait(1000)
      cy.get('@lastRowDomain').then(($value) => {
        cy.get('tr').last().should('contain', $value)
      })
    })

    it('Delete Session Groups v2', () => {
      for (let i = 0; i < sessionGroupCount; i++) {
        sessionGroupsV2Page.getDeleteSessionGroup(sessionGroupNames[i]).click()
        sessionGroupsV2Page.getSessionGroupEntry(sessionGroupNames[i]).should('not.exist')
      }
    })
  })
})
