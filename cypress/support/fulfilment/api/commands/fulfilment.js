import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType.js'
import { windowType } from '../../../../fixtures/checkout/fulfilmentWindowType.js'

let addressId
let deliveryAddressId
let fulfilmentAreaId
let deliverySuburbId
let timeSlotId
let windowDate
let timeSlotParams
let fulfilmentRequest
let selectedFulfilmentType
let selectedWindow

Cypress.Commands.add('searchDeliveryAddress', (suburb) => {
  selectedFulfilmentType = fulfilmentType.DELIVERY
  cy.api({
    method: 'POST',
    url: Cypress.env('addressSearchEndpoint'),
    body: suburb
  }).then((response) => {
    const address = response.body.Response[0]
    deliveryAddressId = address.Id

    return address
  })
})

function getSuburbPostCode (searchTerm) {
  if (isNaN(searchTerm)) { // suburb
    cy.locateStores(searchTerm).then((response) => {
      return cy.wrap((response.Suburbs[0].PostCode))
    })
  }
  return cy.wrap(searchTerm) // postcode
}

Cypress.Commands.add('searchPickupDTBStores', (storeType, searchTerm) => {
  selectedFulfilmentType = storeType

  getSuburbPostCode(searchTerm).then((postCode) => {
    cy.api({
      method: 'GET',
      url: Cypress.env('pickupSearchEndpoint'),
      qs: { postcode: postCode, fulfilmentMethods: storeType }
    }).then((response) => {
      const store = response.body[0]
      addressId = store.AddressId
      fulfilmentAreaId = store.AreaId

      return store
    })
  })
})

Cypress.Commands.add('addDeliveryAddress', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressAutoEndpoint'),
    body: { AddressId: deliveryAddressId }
  }).then((response) => {
    addressId = response.body.Address.AddressId

    fulfilmentAreaId = response.body.Address.AreaId

    deliverySuburbId = response.body.Address.SuburbId

    return response.body
  })
})

Cypress.Commands.add('addDeliveryAddressForAddressId', (requiredAddressId) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressAutoEndpoint'),
    body: { AddressId: requiredAddressId }
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('getPreviousAddressesViaApi', () => {
  cy.api({
    method: 'GET',
    url: Cypress.env('addressEndpoint')
  }).then((response) => {
    return response.body
  })
})

function buildWindowRequest () {
  switch (selectedFulfilmentType) {
    case fulfilmentType.DELIVERY:
      timeSlotParams = {
        addressId: addressId,
        areaId: fulfilmentAreaId,
        suburbId: deliverySuburbId,
        fulfilmentMethod: 'Courier'
      }
      break
    case fulfilmentType.PICK_UP:
      timeSlotParams = {
        areaId: fulfilmentAreaId,
        fulfilmentMethod: 'Pickup'
      }
      break
    case fulfilmentType.DIRECT_TO_BOOT:
      timeSlotParams = {
        areaId: fulfilmentAreaId,
        fulfilmentMethod: 'DriveUp'
      }
      break
  }
  return timeSlotParams
}

function getAvailableWindowsByWindowType (windowResponse, selectedWindowType) {
  let x, y
  const timesArr = []
  let startTime

  const daysResp = windowResponse.body.Days
  if (daysResp.length === 0) {
    throw new Error('No windows found for window type: ' + selectedWindowType)
  }

  for (x = windowResponse.body.Days.length - 1; x >= 0; x--) {
    const day = daysResp[x]
    if (day.Available === true) {
      for (y in day.Times) {
        const time = daysResp[x].Times[y]
        switch (selectedWindowType) {
          case windowType.FLEET_DELIVERY:
            if (time.Available === true && time.IsExpress === false && time.IsCrowdSourced === false) {
              timesArr.push(time)
            }
            break
          case windowType.CROWD_DELIVERY:
            if (time.Available === true && time.IsCrowdSourced === true) {
              timesArr.push(time)
            }
            break
          case windowType.DELIVERY_NOW:
            if (time.Available === true && time.IsExpress === true) {
              timesArr.push(time)
            }
            break
          case windowType.ECO:
            if (time.Available === true && time.IsEcoWindow === true) {
              timesArr.push(time)
            }
            break
          case windowType.MORNING:
            startTime = new Date(time.StartDateTime).getHours()
            if (time.Available === true && time.IsCrowdSourced === false && (startTime < 12)) {
              timesArr.push(time)
            }
            break
          case windowType.EVENING:
            startTime = new Date(time.StartDateTime).getHours()
            if (time.Available === true && time.IsCrowdSourced === false && (startTime >= 17)) {
              timesArr.push(time)
            }
            break
          case windowType.LIQUOR_RESTRICTED:
            startTime = new Date(time.StartDateTime).getHours()
            if (time.Available === true && (startTime < 6)) {
              timesArr.push(time)
            }
            break
          default: // pick up/DTB - neither have window types
            if (time.Available === true) {
              timesArr.push(time)
            }
            break
        }
      }

      if (timesArr.length > 0) {
        windowDate = day.Date // for fulfilment request

        break
      }
    }
  }
  return cy.wrap(timesArr)
}

function selectRandomWindow (windowArr) {
  selectedWindow = windowArr[Math.floor(Math.random() * windowArr.length)]
  timeSlotId = selectedWindow.Id

  return cy.wrap(selectedWindow)
}

function formatFulfilmentLocationRequest (locationRequest) {
  let location
  if (typeof locationRequest === 'string') {
    location = ({ search: locationRequest })
  } else {
    location = locationRequest // should already be formatted correctly as object
  }
  return location
}

Cypress.Commands.add('setFulfilmentLocationWithoutWindow', (fulType, fulfilmentLocation) => {
  switch (fulType) {
    case fulfilmentType.DELIVERY:
      cy.searchDeliveryAddress(formatFulfilmentLocationRequest(fulfilmentLocation)).then(() => {
        cy.addDeliveryAddress()
      })
      break
    case fulfilmentType.PICK_UP:
    case fulfilmentType.DIRECT_TO_BOOT:
      cy.searchPickupDTBStores(fulType, fulfilmentLocation)
      break
  }
  cy.completeLocationFulfilmentViaApi()
})

Cypress.Commands.add('setFulfilmentLocationWithWindow', (fulType, fulfilmentLocation, windowType) => {
  switch (fulType) { // set Fulfilment
    case fulfilmentType.DELIVERY:
      cy.searchDeliveryAddress(formatFulfilmentLocationRequest(fulfilmentLocation)).then(() => {
        cy.addDeliveryAddress()
      })
      break
    case fulfilmentType.PICK_UP:
    case fulfilmentType.DIRECT_TO_BOOT:
      cy.searchPickupDTBStores(fulType, fulfilmentLocation)
      break
  }
  cy.getFulfilmentWindowViaApi(windowType).then(() => {
    cy.completeWindowFulfilmentViaApi()
  })
})

Cypress.Commands.add('setFulfilmentWithoutWindowForExistingAddress', (addressText) => {
  selectedFulfilmentType = fulfilmentType.DELIVERY

  cy.getPreviousAddressesViaApi().then((addresses) => {
    for (const address of addresses.Address) {
      if (address.AddressText === addressText) {
        addressId = address.AddressId
        fulfilmentAreaId = address.AreaId
        deliverySuburbId = address.SuburbId

        cy.completeLocationFulfilmentViaApi()

        return cy.wrap(address)
      }
    }
  })
})

Cypress.Commands.add('setFulfilmentWithWindowForExistingAddress', (addressText, windowType) => {
  cy.setFulfilmentWithoutWindowForExistingAddress(addressText).then(() => {
    cy.getFulfilmentWindowViaApi(windowType)
  })
  cy.completeWindowFulfilmentViaApi()
})

Cypress.Commands.add('getFulfilmentWindowViaApi', (selectedWindowType) => {
  buildWindowRequest()

  cy.buildQueryString(timeSlotParams).then((queryString) => {
    cy.api({
      method: 'GET',
      url: Cypress.env('windowsEndpoint') + queryString
    }).then((response) => {
      getAvailableWindowsByWindowType(response, selectedWindowType).then((availWindows) => {
        if (availWindows.length === 0) {
          throw new Error('No windows found for window type: ' + selectedWindowType)
        } else {
          return selectRandomWindow(availWindows)
        }
      })
    })
  })
})

Cypress.Commands.add('getRandomAvailableWindowViaApi', (addressId, areaId, suburbId, fulfilmentType, selectedWindowType) => {
  timeSlotParams = {
    addressId: addressId,
    areaId: areaId,
    suburbId: suburbId,
    fulfilmentMethod: fulfilmentType
  }
  cy.buildQueryString(timeSlotParams).then((queryString) => {
    cy.api({
      method: 'GET',
      url: Cypress.env('windowsEndpoint') + queryString
    }).then((response) => {
      getAvailableWindowsByWindowType(response, selectedWindowType).then((availWindows) => {
        if (availWindows.length === 0) {
          throw new Error('No windows found for window type: ' + selectedWindowType)
        } else {
          return selectRandomWindow(availWindows)
        }
      })
    })
  })
})

Cypress.Commands.add('deliveryTimeSlotForAddress', (deliveryAddressId, deliveryAreaId, deliverySuburbId) => {
  const queryParams = {
    addressId: deliveryAddressId,
    areaId: deliveryAreaId,
    suburbId: deliverySuburbId,
    fulfilmentMethod: 'Courier'
  }

  const queryString = Object.keys(queryParams).map(key => key + '=' + queryParams[key]).join('&')

  cy.api({
    method: 'GET',
    url: Cypress.env('timeSlotsEndpoint') + '?' + queryString
  }).then((response) => {
    return response.body
  })
})

function completeFulfilment (fulfilmentRequest) {
  cy.api({
    method: 'POST',
    url: Cypress.env('fulfilmentEndpoint'),
    body: fulfilmentRequest
  }).then((response) => {
    return response.body
  })
}

Cypress.Commands.add('completeLocationFulfilmentViaApi', () => {
  fulfilmentRequest = {
    AddressId: addressId,
    FulfilmentMethod: selectedFulfilmentType
  }
  return completeFulfilment(fulfilmentRequest)
})

Cypress.Commands.add('completeWindowFulfilmentViaApi', () => {
  fulfilmentRequest = {
    AddressId: addressId,
    FulfilmentMethod: selectedFulfilmentType,
    TimeSlotId: timeSlotId,
    windowDate: windowDate
  }
  return completeFulfilment(fulfilmentRequest)
})

Cypress.Commands.add('fulfilmentWithSpecificDeliveryDateAndTime', (deliveryAddressId, timeSlotId, windowDate) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('fulfilmentEndpoint'),
    body: { AddressId: deliveryAddressId, FulfilmentMethod: 'Courier', TimeSlotId: timeSlotId, windowDate: windowDate }
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('locateStores', (suburb) => {
  const locatorRequest = {
    SearchTerm: suburb
  }
  cy.buildQueryString(locatorRequest).then((queryString) => {
    cy.api({
      method: 'GET',
      url: Cypress.env('storeLocatorEndpoint') + queryString
    }).then((response) => {
      return response.body
    })
  })
})
