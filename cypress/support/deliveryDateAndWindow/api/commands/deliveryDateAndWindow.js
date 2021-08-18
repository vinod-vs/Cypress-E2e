let addressId
let deliveryAddressId
let fulfilmentAreaId
let deliverySuburbId
let timeSlotId
let windowDate
let areaId
let timeSlotParams
let fulfilmentRequest
let queryString

Cypress.Commands.add('searchDeliveryAddress', (suburb) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressSearchEndpoint'),
    body: suburb
  }).then((response) => {
      addressId = response.body.Response[0].Id

      return response.body
    })
})

Cypress.Commands.add('searchPickupDTBStores', (postCode, storeType) => {
  cy.api({
    method: 'GET',
    url: Cypress.env('pickupSearchEndpoint'),
    qs: { postcode: postCode, fulfilmentMethods: storeType } })
  .then((response) => {
    addressId = response.body[0].AddressId
    fulfilmentAreaId = response.body[0].AreaId

    return response.body
   })
})

Cypress.Commands.add('addDeliveryAddress', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressAutoEndpoint'),
    body: { AddressId: addressId }
  }).then((response) => {
    deliveryAddressId = response.body.Address.AddressId

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

Cypress.Commands.add('deliveryTimeSlot', () => {
  timeSlotParams = {
    addressId: deliveryAddressId,
    areaId: fulfilmentAreaId,
    suburbId: deliverySuburbId,
    fulfilmentMethod: 'Courier'
  }

  cy.buildQueryString(timeSlotParams).then((queryString) => {
    return selectTimeSlot(queryString);
  })
})

Cypress.Commands.add('pickupTimeSlot', () => {
  timeSlotParams = {
    areaId: fulfilmentAreaId,
    fulfilmentMethod: 'Pickup',
    getMergedResults: false  
  }
  
  cy.buildQueryString(timeSlotParams).then((queryString) => {
    return selectTimeSlot(queryString)
  })
})

Cypress.Commands.add('directToBootTimeSlot', () => {
  timeSlotParams = {
    areaId: fulfilmentAreaId,
    fulfilmentMethod: 'DriveUp',
    getMergedResults: false  
  }

  cy.buildQueryString(timeSlotParams).then((queryString) => {
    return selectTimeSlot(queryString);
  })
})

function selectTimeSlot(queryString) {
  cy.api({
    method: 'GET',
    url: Cypress.env('timeSlotsEndpoint') + queryString
  }).then((response) => {

    let x, y
    outer:
    for (x in response.body) {
      
      if (response.body[x].Available === true) {
      
        for (y in response.body[x].Times) {
          if (response.body[x].Times[y].Available === true && response.body[x].Times[y].IsExpress === false) {
            timeSlotId = response.body[x].Times[y].Id

            windowDate = response.body[x].Date

            break outer;
          } 
        }
      }
    }
    
    return response.body
  })
}

function postFulfilment(fulfilmentRequest) {
  cy.api({
    method: 'POST',
    url: Cypress.env('fulfilmentEndpoint'),
    body: fulfilmentRequest
  }).then((response) => {
    return response.body  
  })
}

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

Cypress.Commands.add('deliveryFulfilment', () => {

  fulfilmentRequest = {
    AddressId: deliveryAddressId,
    FulfilmentMethod: 'Courier', 
    TimeSlotId: timeSlotId, 
    windowDate: windowDate
  }
  
  return postFulfilment(fulfilmentRequest) 
})

Cypress.Commands.add('pickupFulfilment', () => {

  fulfilmentRequest = {
    AddressId: addressId,
    FulfilmentMethod: 'Pickup',
    TimeSlotId: timeSlotId, 
    windowDate: windowDate
  }
  
  return postFulfilment(fulfilmentRequest)
})

Cypress.Commands.add('directToBootFulfilment', () => {

  fulfilmentRequest = {
    AddressId: addressId,
    FulfilmentMethod: 'DriveUp',
    TimeSlotId: timeSlotId, 
    windowDate: windowDate
  }
  
  return postFulfilment(fulfilmentRequest)
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
