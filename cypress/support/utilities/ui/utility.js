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

Cypress.Commands.add('getDateTime', () => {
  const today = new Date()
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds() + ':' + today.getMilliseconds() + 'Z'
  const currentTime = date + 'T' + time
  return cy.wrap(currentTime)
})

Cypress.Commands.add('getDayOfWeek', (dateObject) => {
  const dayOfWeek = dateObject.getDay()

  return cy.wrap(isNaN(dayOfWeek)? null :
    ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek])
})

Cypress.Commands.add('generateRandomString', () => {
  let text = ''
  const alpha = 'abcdefghijklmnopqrstuvwxyz'

  for (let i = 0; i < alpha.length; i++) {
    text += alpha.charAt(Math.floor(Math.random() * alpha.length))
  }

  return cy.wrap(text)
})

Cypress.Commands.add('getBootstrapResponse', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('bootstrapEndpoint')
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('formatToAmPm', (date) => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm

  return cy.wrap(strTime)
})

Cypress.Commands.add('removeNewLineCarriageReturn', (text) => {
  return text.replace("(\\r?\\n)+", " ")
})

