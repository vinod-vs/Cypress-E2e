let addressId
let deliveryAddressId
let deliveryAreaId
let deliverySuburbId
let timeSlotId
let windowDate

Cypress.Commands.add('searchDeliveryAddress', (suburb) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('addressSearchEndpoint'),
    body: suburb
  })
    .then((response) => {
      addressId = response.body.Response[0].Id

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

    deliveryAreaId = response.body.Address.AreaId

    deliverySuburbId = response.body.Address.SuburbId

    return response.body
  })
})

Cypress.Commands.add('addDeliveryAddressForAddressId', (requiredAddressId) => {
  console.log('requiredAddressId: ' + requiredAddressId)
  cy.api({
    method: 'POST',
    url: Cypress.env('addressAutoEndpoint'),
    body: { AddressId: requiredAddressId }
  }).then((response) => {
    console.log('addDeliveryAddressForAddressId: ' + response.body)
    // deliveryAddressId = response.body.Address.AddressId

    // deliveryAreaId = response.body.Address.AreaId

    // deliverySuburbId = response.body.Address.SuburbId

    return response.body
  })
})

Cypress.Commands.add('deliveryTimeSlot', () => {
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
    timeSlotId = response.body[2].Times[1].Id

    windowDate = response.body[2].Date

    return response.body
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
    console.log('deliveryTimeSlotForAddress: ' + response)
    // timeSlotId = response.body[2].Times[1].Id

    // windowDate = response.body[2].Date

    return response.body
  })
})

Cypress.Commands.add('fulfilment', () => {
  cy.api({
    method: 'POST',
    url: Cypress.env('fulfilmentEndpoint'),
    body: { AddressId: deliveryAddressId, FulfilmentMethod: 'Courier', TimeSlotId: timeSlotId, windowDate: windowDate }
  }).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('fulfilmentWithSpecificDeliveryDateAndTime', (deliveryAddressId, timeSlotId, windowDate) => {
  cy.api({
    method: 'POST',
    url: Cypress.env('fulfilmentEndpoint'),
    body: { AddressId: deliveryAddressId, FulfilmentMethod: 'Courier', TimeSlotId: timeSlotId, windowDate: windowDate }
  }).then((response) => {
    console.log('fulfilmentWithSpecificDeliveryDateAndTime: ' + JSON.stringify(response))
    return response.body
  })
})
