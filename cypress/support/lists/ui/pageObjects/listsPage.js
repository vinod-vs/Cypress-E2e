class ListsPage {
  gettheList(listName) {
    return cy.get('shared-list-item').find('h3').contains(listName)
  }

  getListHeader() {
    return cy.get('h2.savedListDetail-header')
  }

  getProductInList() {
    return cy.get('shared-product-list-item').find('a h2')
  }
 
  getDeleteButtonOfList(listName) {
    return cy.get('button[aria-label= "Delete list named ' + listName + '"]')
  }

  getDeleteButtonOnConfirmationModal() {
    return cy.get('button.deleteListModal-button').contains('Delete')
  }

}

export default ListsPage