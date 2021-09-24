import { onHomePage } from '../../../homePage/ui/pageObjects/HomePage'
import { onSearchResultsPage } from '../../../search/ui/pageObjects/SearchResultsPage'
import { onListsPage } from '../pageObjects/ListsPage'

Cypress.Commands.add('searchAndAddProductToNewList', (listName, searchTerm) => {
  onHomePage.getSearchHeader().type(searchTerm).type('{enter}')

  // Save the Product name to verify in the created list later
  cy.get('shared-product-tile')
    .first()
    .find('a')
    .invoke('text').as('ProductName')

  onSearchResultsPage.getSaveToListButton().first().click()

  onSearchResultsPage.getCreateANewListButton().click()

  onSearchResultsPage.getNewListNameTextInput().type(listName)

  onSearchResultsPage.getCreateNewListActionButton().click()

  onSearchResultsPage.getTheListnameCheckBox(listName).should('be.checked')

  onSearchResultsPage.getProductSaveToNewListButton().click()

  onSearchResultsPage.getProductSavedNotification().should('be.visible')

  onSearchResultsPage.getProductSavedNotification().find('a').should('contain.text', listName)
})

Cypress.Commands.add('verifyProductInList', (listName) => {
  onHomePage.getListsLink().click()

  cy.url().should('include', 'shop/mylists')

  onListsPage.gettheList(listName).click()
  onListsPage.getListHeader().should('contain.text', listName)
  onListsPage.getLayoutButtons().first().check({ force: true })
  onListsPage.getProductInList().invoke('text').then((ProductName) => {
    cy.get('@ProductName').then((savedProduct) => {
      expect(ProductName).to.eq(savedProduct)
    })
  })
})

Cypress.Commands.add('deleteList', (listName) => {
  onHomePage.getListsLink().click()
  onListsPage.getDeleteButtonOfList(listName).click()
  onListsPage.getDeleteButtonOnConfirmationModal().click()
  onListsPage.gettheList(listName).should('not.exist')
})
