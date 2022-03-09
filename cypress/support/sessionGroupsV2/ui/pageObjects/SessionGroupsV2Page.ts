class SessionGroupsV2Page {
    open() {
        cy.visit(Cypress.env('siteAdminUat') + 'manage/sessiongroupsv2')
    }

    getTableFrame () {
        return cy.get('.table-frame')
    }

    getLogOffButton () {
        return cy.get('a:contains("Log Off")')
    }

    getIdHeader () {
        return cy.get('a:contains("Id")')
    }

    getNameHeader () {
        return cy.get('a:contains("Name")')
    }

    getDescriptionHeader () {
        return cy.get('a:contains("Description")')
    }

    getDomainHeader () {
        return cy.get('a:contains("Domain")')
    }

    getDeleteHeader () {
        return cy.get('a:contains("Delete")')
    }
    
    getCreateNewSessionGroup () {
        return cy.get('a:contains("Create New Session Group")')
    }
    
    getSessionGroupEntry (sessionGroupName:string) {
        return cy.get('a:contains("'+ sessionGroupName +'")')
    }

    getDeleteSessionGroup (sessionGroupName:string) {
        return cy.xpath('//a[text()=\'' + sessionGroupName + '\']/../..//td[@class=\'delete\']')
    }

    getShowSelect() {
        return cy.get('.selectwrap > select')
    }

    getSelectOption(option:string) {
        return cy.xpath('//select/option[@value=\' + option + \']')
    }

    getTableRow(row:number) {
        row = row + 1    
        return cy.xpath('//tbody/tr[' + row + ']')
    }

    getTableRowName(row:number) {
        row = row + 1    
        return cy.xpath('//tbody/tr[' + row + ']/td[2]/a')
    }

    getTableRowDescription(row:number) {
        row = row + 1    
        return cy.xpath('//tbody/tr[' + row + ']/td[3]')
    }

    getTableRowDomain(row:number) {
        row = row + 1    
        return cy.xpath('//tbody/tr[' + row + ']/td[4]')
    }

    getLastRowName() {
        return cy.get('tr').last().get('td').eq(1).get('a')
    }

}

export const sessionGroupsV2Page = new SessionGroupsV2Page();