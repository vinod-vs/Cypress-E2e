class EditSessionGroupV2Page {

    getNameInput () {
        return cy.get('#Name')
    }

    getDescriptionInput () {
        return cy.get('#Description')
    }

    getDomainInput () {
        return cy.get('#Domain')
    }

    getUpdateButton () {
        return cy.get('input[value="Update"]')
    }

    getAddAttribute () {
        return cy.get('a:contains("Add Attribute")')
    }

    getAttributeGroupOption (groupName:string) {
        return cy.get('[value="' + groupName + '"]')
    }

    getAttributeNameOption (attributeName:string) {
        return cy.get('[value="' + attributeName + '"]')
    }

    getAddedAttribute(groupName:string, attributeName:string) {
        return cy.contains(groupName + '.' + attributeName)
    }

}

export const editSessionGroupV2Page = new EditSessionGroupV2Page();