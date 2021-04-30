let addressId
let deliveryAddressId
let deliveryAreaId
let deliverySuburbId
let timeSlotId
let windowDate

Cypress.Commands.add('searchDeliveryAddress', (suburb) => {
  cy.request('POST', Cypress.env('addressSearchEndpoint'), suburb).then((response) => {
    addressId = response.body.Response[0].Id

    return response.body
  })
})

Cypress.Commands.add('addDeliveryAddress', () => {
  cy.request('POST', Cypress.env('addressAutoEndpoint'), { AddressId: addressId }).then((response) => {
    deliveryAddressId = response.body.Address.AddressId

    deliveryAreaId = response.body.Address.AreaId

    deliverySuburbId = response.body.Address.SuburbId

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

  cy.request('GET', Cypress.env('timeSlotsEndpoint') + '?' + queryString).then((response) => {
    timeSlotId = response.body[2].Times[1].Id

    windowDate = response.body[2].Date

    return response.body
  })
})

Cypress.Commands.add('fulfilment', () => {
  cy.request('POST', Cypress.env('fulfilmentEndpoint'), { AddressId: deliveryAddressId, FulfilmentMethod: 'Courier', TimeSlotId: timeSlotId, windowDate: windowDate }).then((response) => {
    return response.body
  })
})
