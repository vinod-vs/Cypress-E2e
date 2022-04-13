Cypress.Commands.add('getTextFromElement', (element) => {
  cy.get(element).then(function (textElement) {
    // cy.log('getTextFromElement -> Element: ' + element + ' , Text: ' + text)
    return textElement.text()
  })
})

Cypress.Commands.add('checkIfElementExists', (elementLocatorString) => {
  cy.get('body').then($body => {
    if ($body.find(elementLocatorString).length > 0) {
      return true
    } else {
      return false
    }
  })
})

Cypress.Commands.add('checkIfElementVisible', (element) => {
  cy.get("body").then($body => {
    if ($body.find(element).length > 0) {   
      cy.get(element).then($el => {
        if ($el.is(':visible')){
          return true
        } else {
          return false
        }
      })
    } else {
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
  let dobStr = (appendZeroes(dob.getDay() + 1)) + '/' + appendZeroes(dob.getMonth() + 1) + '/' + dob.getFullYear()
  return cy.wrap(dobStr)
})

function appendZeroes (n: number) {
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

Cypress.Commands.add('convertShortWeekDayToLong', (shortWeekday) => {
  switch(shortWeekday){
    case 'Mon':
      return 'Monday'
    case 'Tue':
      return 'Tuesday'
    case 'Wed':
      return 'Wednesday'
    case 'Thu':
      return 'Thursday'
    case 'Fri':
      return 'Friday'
    case 'Sat':
      return 'Saturday'
    case 'Sun':
      return 'Sunday'
    default:
      return shortWeekday
  }
})

Cypress.Commands.add('generateRandomString', (numChars?: number) => {
  let strLength
  let text = ''
  const alpha = 'abcdefghijklmnopqrstuvwxyz'

  if (typeof numChars !== undefined) {
    strLength = numChars!
  } else {
    strLength = alpha.length
  }

  for (let i = 0; i < strLength; i++) {
    text += alpha.charAt(Math.floor(Math.random() * alpha.length))
  }
  return cy.wrap(text)
})

Cypress.Commands.add('formatToAmPm', (date) => {
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12 // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+ minutes : minutes
  let strTime = hours + ':' + minutes + ' ' + ampm

  return cy.wrap(strTime)
})

Cypress.Commands.add('removeNewLineCarriageReturn', (text) => {
 return cy.wrap(text.replace('(\\r?\\n)+',  ''))
})

Cypress.Commands.add('removeDateOrdinals', (text) => {
  return text.replace(/st|nd|rd|th/g, '')
})

Cypress.Commands.add('addYearsToCurrentDate', (noOfYearsToAdd:any) => {
  let today = new Date()
  let todayPlusYears = new  Date(today.getFullYear()+parseInt(noOfYearsToAdd), today.getMonth(), today.getDate())
  let monthNames =["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep", "Oct","Nov","Dec"]
  let date = todayPlusYears.getDate()
  let monthName = monthNames[todayPlusYears.getMonth()]
  let year = todayPlusYears.getFullYear()
  return cy.wrap(date.toString()+' '+monthName+' '+year.toString())
})

/*
 * TODO: Look into why this isn't working as a Custom Command. For now, implement as a standard function 
*/
export function setComponentBase(elLocator: Cypress.Chainable<JQuery<HTMLElement>>, tagName: string) {
  return elLocator.then(($locator) => {
    console.log('$Loc is: ' , $locator)
    if ($locator.prop('tagName').toLowerCase() !== tagName) {
      cy.log('IN IF')
      return elLocator.find(tagName);
    } else { 
      cy.log('IN ELSE')
      return elLocator;
    }  
  })
}



