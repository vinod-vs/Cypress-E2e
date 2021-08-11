import HomePage from '../../../homePage/ui/pageObjects/HomePage'
import SearchResultsPage from '../../../search/ui/pageObjects/SearchResultsPage'
import ListsPage from '../pageObjects/listsPage'
import listInput from '../../../../fixtures/lists/listUITest.json'
const homePage = new HomePage()
const searchResultsPage = new SearchResultsPage()
const listsPage = new ListsPage()

Cypress.Commands.add('searchAndAddProductToNewList', (listName) => {

  homePage.getSearchHeader().type(listInput.searchTerm).type('{enter}')

  //Save the Product name to verify in the created list later
  cy.get('shared-product-tile')
    .first()
    .find('a')
    .invoke('text').as('ProductName')
 
  searchResultsPage.getSaveToListButton().first().click()

  searchResultsPage.getCreateANewListButton().click()

  searchResultsPage.getNewListNameTextInput().type(listName)

  searchResultsPage.getCreateNewListActionButton().click()

  searchResultsPage.getTheListnameCheckBox(listName).should('be.checked')

  searchResultsPage.getProductSaveToNewListButton().click()

  searchResultsPage.getProductSavedNotification().should('be.visible')
  
  searchResultsPage.getProductSavedNotification().find('a').should('contain.text',listName)
})

Cypress.Commands.add('verifyProductInList', (listName) => {
    
  homePage.getListsLink().click()

  cy.url().should('include', 'shop/mylists')

  listsPage.gettheList(listName).click()
  listsPage.getListHeader().should('contain.text',listName)
  listsPage.getProductInList().invoke('text').then(( ProductName) => {
    cy.get('@ProductName').then((savedProduct) => {
      expect(ProductName).to.eq(savedProduct)
     })
  })  
})



Cypress.Commands.add('deleteList', (listName) => {
  homePage.getListsLink().click()
  listsPage.getDeleteButtonOfList(listName).click()
  listsPage.getDeleteButtonOnConfirmationModal().click()
  listsPage.gettheList(listName).should('not.exist')
})
