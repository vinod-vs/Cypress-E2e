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
  cy.api({
    method: 'POST',
    url: Cypress.env('addressAutoEndpoint'),
    body: { AddressId: requiredAddressId }
  }).then((response) => {
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
    return response.body
  })
})














Cypress.Commands.add('getRegularDeliveryTimeSlot', (testData) => {

  let addressId
  let deliveryAddressId
  let deliveryAreaId
  let deliverySuburbId
  let timeSlotId
  let windowDate
  let dateText
  let timeText

  cy.searchDeliveryAddress(testData.address).then((response) => {
    expect(response.Response[0].Id).to.not.be.empty
    expect(response.Response[0].Id).to.not.be.null
    addressId = response.Response[0].Id
    cy.log('addressId: ' + addressId)

    cy.addDeliveryAddressForAddressId(addressId).then((response) => {
      expect(response.Address.AddressId).to.greaterThan(0)
      expect(response.Address.AddressId).to.not.be.null
      expect(response.Address.AreaId).to.greaterThan(0)
      expect(response.Address.AreaId).to.not.be.null
      expect(response.Address.SuburbId).to.greaterThan(0)
      expect(response.Address.SuburbId).to.not.be.null
      deliveryAddressId = response.Address.AddressId
      deliveryAreaId = response.Address.AreaId
      deliverySuburbId = response.Address.SuburbId
      cy.log('deliveryAddressId: ' + deliveryAddressId + ", deliveryAreaId: " + deliveryAreaId + ", deliverySuburbId: " + deliverySuburbId)

      cy.deliveryTimeSlotForAddress(deliveryAddressId, deliveryAreaId, deliverySuburbId).then((response) => {
        expect(response).to.have.length.greaterThan(0)

        let x, y
        for (x in response) {
          let found = false
          if (response[x].Available === true) {
            cy.log(response[x].AbsoluteDateText + " AVAILABLE FOR DELIVERY")
            let y
            for (y in response[x].Times) {
              if (response[x].Times[y].Available === true &&
                response[x].Times[y].IsReserved === false &&
                response[x].Times[y].IsExpress === false &&
                response[x].Times[y].IsKeptOpenForRewardsPlus === false &&
                response[x].Times[y].EligibleForDeliverySaver === false &&
                response[x].Times[y].IsCrowdSourced === false &&
                response[x].Times[y].IsExclusive === false &&
                response[x].Times[y].IsEcoWindow === false) {
                timeSlotId = response[x].Times[y].Id
                windowDate = response[x].Date
                cy.log(response[x].Times[y].TimeWindow + " IS A REGULAR AVAILABLE SLOT")
                found = true
                testData.deliveryDateText = response[x].AbsoluteDateText
                testData.deliveryTimeText = response[x].Times[y].TimeWindow
                cy.log('deliveryDateText: ' + testData.deliveryDateText + " , deliveryTimeText: " + testData.deliveryTimeText)
                break
              } else {
                cy.log(response[x].Times[y].TimeWindow + " IS A REGULAR NON-AVAILABLE SLOT")
              }
            }
          } else {
            cy.log(response[x].AbsoluteDateText + " NOT AVAILABLE FOR DELIVERY")
          }
          if (found === true)
            break
        }
        cy.log('deliveryTimeSlotForAddress: timeSlotId: ' + timeSlotId + ", windowDate: " + windowDate)
        // return {
        //   dateText: dateText,
        //   timeText: timeText
        // }
      })
    })
  })
})