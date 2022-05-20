export const searchForNewAddress = (addressSelectorTexFieldLocator: string, addressResultListLocator: string, searchKeyword: string) => {
  cy.get(addressSelectorTexFieldLocator).type(searchKeyword)

  cy.get(addressResultListLocator).each(resultOption => {
    const suggestedAddressText = resultOption.find('span').text().replace(/ {2}/g, ' ').trim()
    const trimmedAddressKeyword = searchKeyword.replace(/ {2}/g, ' ').trim()

    if (suggestedAddressText.toLowerCase().includes(trimmedAddressKeyword.toLowerCase())) {
      cy.wrap(resultOption).click()
      return false
    }
  })
}
