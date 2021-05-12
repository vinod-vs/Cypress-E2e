Cypress.Commands.add('getTextFromElement', (element) => {
  cy.get(element).then(function (textElement) {
    // cy.log('getTextFromElement -> Element: ' + element + ' , Text: ' + text)
    return textElement.text()
  })
})

Cypress.Commands.add('checkIfElementExists', (element) => {
  cy.get('body').then($body => {
    if ($body.find(element).length > 0) {
      // cy.log('checkIfElementExists: Element: ' + element + ' , Exist: True')
      return true
    } else {
      // cy.log('checkIfElementExists: Element: ' + element + ' , Exist: False')
      return false
    }
  })
})
