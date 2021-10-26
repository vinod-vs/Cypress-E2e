class SessionGroupsV2Page {
    open() {
        cy.visit('manage/sessiongroupsv2')
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
        return cy.get('a:contains("'+ sessionGroupName +'")')
    }

}

export const sessionGroupsV2Page = new SessionGroupsV2Page();