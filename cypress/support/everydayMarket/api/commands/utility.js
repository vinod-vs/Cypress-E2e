/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import addItemsBodyWow from '../../../../fixtures/sideCart/addItemsToTrolley.json'
import addItemsBodyMp from '../../../../fixtures/sideCart/addItemsToTrolley1.json'

Cypress.Commands.add('getRegularDeliveryTimeSlot', (testData) => {
  let addressId
  let deliveryAddressId
  let deliveryAreaId
  let deliverySuburbId
  let timeSlotId
  let windowDate

  cy.searchDeliveryAddress(testData.address).then((response) => {
    expect(response.Response[0].Id).to.not.be.empty
    expect(response.Response[0].Id).to.not.be.null
    addressId = response.Response[0].Id
    testData.addressId = addressId
    cy.log('addressId: ' + addressId)

    cy.addDeliveryAddressForAddressId(addressId).then((response) => {
      expect(response.Address.AddressId).to.greaterThan(0)
      expect(response.Address.AddressId).to.not.be.null
      expect(response.Address.AreaId).to.greaterThan(0)
      expect(response.Address.AreaId).to.not.be.null
      expect(response.Address.SuburbId).to.greaterThan(0)
      expect(response.Address.SuburbId).to.not.be.null
      deliveryAddressId = response.Address.AddressId
      testData.deliveryAddressId = deliveryAddressId
      deliveryAreaId = response.Address.AreaId
      testData.deliveryAreaId = deliveryAreaId
      deliverySuburbId = response.Address.SuburbId
      testData.deliverySuburbId = deliverySuburbId
      cy.log('deliveryAddressId: ' + deliveryAddressId + ', deliveryAreaId: ' + deliveryAreaId + ', deliverySuburbId: ' + deliverySuburbId)

      cy.deliveryTimeSlotForAddress(deliveryAddressId, deliveryAreaId, deliverySuburbId).then((response) => {
        expect(response).to.have.length.greaterThan(0)

        let x
        for (x in response) {
          let found = false
          if (response[x].Available === true) {
            cy.log(response[x].AbsoluteDateText + ' AVAILABLE FOR DELIVERY')
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
                cy.log(response[x].Times[y].TimeWindow + ' IS A REGULAR AVAILABLE SLOT')
                found = true
                timeSlotId = response[x].Times[y].Id
                testData.timeSlotId = timeSlotId
                windowDate = response[x].Date
                testData.windowDate = windowDate
                testData.deliveryDateText = response[x].AbsoluteDateText
                testData.deliveryTimeText = response[x].Times[y].TimeWindow
                testData.wowDeliveryCharges = response[x].Times[y].SalePrice
                cy.log('deliveryDateText: ' + testData.deliveryDateText + ' , deliveryTimeText: ' + testData.deliveryTimeText + ' , wowDeliveryCharges: ' + testData.wowDeliveryCharges)
                break
              } else {
                cy.log(response[x].Times[y].TimeWindow + ' IS A REGULAR NON-AVAILABLE SLOT')
              }
            }
          } else {
            cy.log(response[x].AbsoluteDateText + ' NOT AVAILABLE FOR DELIVERY')
          }
          if (found === true) { break }
        }
        cy.log('deliveryTimeSlotForAddress: timeSlotId: ' + timeSlotId + ', windowDate: ' + windowDate)
      })
    })
  })
})

Cypress.Commands.add('getTestProductFromProductSearchResponse', (productSearchResponse, testData) => {
  const response = productSearchResponse
  const items = testData.items
  let totalQuantity = new Number(0)
  let totalWowQuantity = new Number(0)
  let totalEdmQuantity = new Number(0)
  let wowTotal = new Number(0)
  let edmTotal = new Number(0)
  items.forEach(item => {
    let x
    if (item.isEDMProduct === 'false') {
      let wowStockCode = 0
      let wowQuantity = 0
      const minWowOrderThreshold = item.minWowOrderThreshold
      const bufferWowQuantity = item.bufferWowQuantity

      for (x in response.Products) {
        if (response.Products[x].Products[0].Price !== null &&
                    response.Products[x].Products[0].IsInStock === true &&
                    response.Products[x].Products[0].IsMarketProduct === false &&
                    response.Products[x].Products[0].SupplyLimit >= 50) {
          if (item.quantity > 0) {
            wowQuantity = item.quantity
            cy.log('Using wowQuantity from testdata: ' + wowQuantity)
          } else {
            wowQuantity = minWowOrderThreshold / response.Products[x].Products[0].Price
            wowQuantity = Math.floor(wowQuantity) + bufferWowQuantity
            cy.log('Using Calculated wowQuantity: ' + wowQuantity)
          }
          if (response.Products[x].Products[0].Price !== null &&
                        response.Products[x].Products[0].IsInStock === true &&
                        response.Products[x].Products[0].IsMarketProduct === false &&
                        response.Products[x].Products[0].SupplyLimit >= wowQuantity) {
            wowStockCode = response.Products[x].Products[0].Stockcode
            cy.log('WOWProduct: ' + wowStockCode + ' , SupplyLimit: ' + response.Products[x].Products[0].SupplyLimit + ' , PerItemPrice: ' + response.Products[x].Products[0].Price + ' , Quantity: ' + wowQuantity)
            addItemsBodyWow.StockCode = wowStockCode
            addItemsBodyWow.Quantity = wowQuantity
            item.stockCode = wowStockCode
            item.quantity = wowQuantity
            item.pricePerItem = response.Products[x].Products[0].Price
            totalWowQuantity = totalWowQuantity + wowQuantity
            totalQuantity = totalQuantity + wowQuantity
            wowTotal = Number(item.quantity) * Number(item.pricePerItem)

            cy.log('Adding WOW Item to Cart. Stockcode: ' + wowStockCode + ' , of quantity: ' + wowQuantity)
            cy.addItemsToTrolley(addItemsBodyWow).then((response) => {
              expect(response.TotalTrolleyItemQuantity).to.be.equal(Number(totalQuantity))
              expect(response.Totals.WoolworthsSubTotal).to.be.equal(Number(wowTotal))
              // expect(response.Totals.MarketSubTotal).to.be.equal(Number(edmTotal))
            })
            break
          }
        }
      }
      expect(wowStockCode).to.be.greaterThan(0)
    }
    let y
    if (item.isEDMProduct === 'true') {
      let mpStockCode = 0
      const mpQuantity = item.quantity
      for (y in response.Products) {
        if (response.Products[y].Products[0].Price !== null &&
                    response.Products[y].Products[0].IsInStock === true &&
                    response.Products[y].Products[0].IsMarketProduct === true &&
                    response.Products[y].Products[0].SupplyLimit >= mpQuantity) {
          mpStockCode = response.Products[y].Products[0].Stockcode
          cy.log('MarketProduct: ' + mpStockCode + ' , SupplyLimit: ' + response.Products[y].Products[0].SupplyLimit + ' , PerItemPrice: ' + response.Products[y].Products[0].Price + ' , Quantity: ' + mpQuantity)
          addItemsBodyMp.StockCode = mpStockCode
          addItemsBodyMp.Quantity = mpQuantity
          item.stockCode = mpStockCode
          item.pricePerItem = response.Products[y].Products[0].Price
          totalEdmQuantity = totalEdmQuantity + mpQuantity
          totalQuantity = totalQuantity + mpQuantity
          edmTotal = Number(item.quantity) * Number(item.pricePerItem)
          cy.log('Adding MP Item to Cart. Stockcode: ' + mpStockCode + ' , of quantity: ' + mpQuantity)
          cy.addItemsToTrolley(addItemsBodyMp).then((response) => {
            expect(response.TotalTrolleyItemQuantity).to.be.equal(Number(item.quantity))
            // expect(response.Totals.WoolworthsSubTotal).to.be.equal(Number(wowTotal))
            // expect(response.Totals.WoolworthsSubTotal).to.be.greaterThan(0)
            expect(response.Totals.MarketSubTotal).to.be.equal(Number(edmTotal))
          })
          break
        }
      }
      expect(mpStockCode).to.be.greaterThan(0)
    }
  })
  testData.wowTotal = wowTotal
  testData.edmTotal = edmTotal
  testData.totalQuantity = totalQuantity
  testData.totalWowQuantity = totalWowQuantity
  testData.totalEdmQuantity = totalEdmQuantity
  cy.log('wowTotal: ' + wowTotal + ' , edmTotal: ' + edmTotal + ' , totalQuantity: ' + totalQuantity + ' , totalWowQuantity: ' + totalWowQuantity + ' , totalEdmQuantity: ' + totalEdmQuantity)
})
