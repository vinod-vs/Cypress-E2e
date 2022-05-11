Cypress.Commands.add('removeItem', (removeItemsRequestBody) => {
  cy.request('POST', Cypress.env('removeItemEndpoint'), removeItemsRequestBody).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('removeItems', (removeItemsRequestBody) => {
  cy.request('POST', Cypress.env('removeItemsEndpoint'), removeItemsRequestBody).then((response) => {
    return response.body
  })
})

Cypress.Commands.add('removeUnavailableItemsFromTrolley', () => {
  cy.viewTrolley().then((response: any) => {
    const unavailableGroceryItems = response.UnavailableItems

    if (unavailableGroceryItems.length > 0) {
      const unavailableStockCodes: number[] = []
      for (const item of unavailableGroceryItems) {
        cy.log('Grocery Items are unavailable by location')
        unavailableStockCodes.push(item.Stockcode)
      }

      if (unavailableStockCodes.length === 0) {
        return cy.removeItem({ Stockcode: unavailableStockCodes[0], evaluateRewardPoints: false })
      } else {
        return cy.removeItems({ StockCodes: unavailableStockCodes, evaluateRewardPoints: false })
      }
    }
  })
})

Cypress.Commands.add('removeRestrictedItemsFromTrolley', () => {
  cy.viewTrolley().then((response: any) => {
    const restictedByDeliveryMethodItems = response.RestrictedByDeliveryMethodItems
    const restrictedByDeliPlattersItems = response.RestrictedByDeliPlattersItems
    const restrictedItems = response.RestrictedItems
    const availableItems = response.AvailableItems

    if (restictedByDeliveryMethodItems.length > 0) {
      cy.log('Restricted By Delivery Method Items exist')
      removeAvailableGroupRestrictedItems(restictedByDeliveryMethodItems)
    }

    if (restrictedByDeliPlattersItems.length > 0) {
      cy.log('Restricted By Deli Platter Items exist')
      removeAvailableGroupRestrictedItems(restrictedByDeliPlattersItems)
    }

    if (restrictedItems.length > 0) {
      cy.log('Restricted Items exist')
      removeAvailableGroupRestrictedItems(restrictedItems)
    }

    if (availableItems.length > 0) {
      removeAvailableNonGroupRestrictedItems(availableItems)
    }
  })
})

function removeAvailableGroupRestrictedItems (property: any) {
  const restrictedItems: number[] = []
  for (const item of property) {
    restrictedItems.push(item.Stockcode)
  }

  if (restrictedItems.length === 1) {
    cy.removeItem({ Stockcode: restrictedItems[0], evaluateRewardPoints: false })
  } else {
    cy.removeItems({ Stockcodes: restrictedItems, evaluateRewardPoints: false })
  }
}

function removeAvailableNonGroupRestrictedItems (availableItems: any) {
  for (const item of availableItems) {
    const ageRestrictedStockCodes: number[] = []
    if (item.AgeRestricted === true) {
      cy.log('Age Restricted Items exist')
      ageRestrictedStockCodes.push(item.Stockcode)

      if (ageRestrictedStockCodes.length === 1) {
        return cy.removeItem({ Stockcode: ageRestrictedStockCodes[0], evaluateRewardPoints: false })
      } else {
        return cy.removeItems({ StockCodes: ageRestrictedStockCodes, evaluateRewardPoints: false })
      }
    }
  }
}
