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

Cypress.Commands.add('getDOB', (element) => {
  let dob = new Date()
  if (element == 'senior') {
    dob.setFullYear(dob.getFullYear() + Math.floor(Math.random() * 28) - 90)
  } else {
    dob.setFullYear(dob.getFullYear() + Math.floor(Math.random() * 40) - 60)
  }
  dob = (appendZeroes(dob.getDay() + 1)) + '/' + appendZeroes(dob.getMonth() + 1) + '/' + dob.getFullYear()
  return cy.wrap(dob)
})

function appendZeroes (n) {
  if (n <= 9) {
    return '0' + n
  }
  return n
}

Cypress.Commands.add('writeTestDataUsed', (filepath, details) => {
  cy.readFile(filepath).then((data) => {
    data.push(details)
    cy.writeFile(filepath, data)
  })
})
