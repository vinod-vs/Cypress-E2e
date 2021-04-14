Cypress.Commands.add('getTextFromElement', (element) => {
  cy.get(element).then(function (textElement) {
    const text = textElement.text()
    cy.log('getTextFromElement -> Element: ' + element + ' , Text: ' + text)
    return text
  })
})
