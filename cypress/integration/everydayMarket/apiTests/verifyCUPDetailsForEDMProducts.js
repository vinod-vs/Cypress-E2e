/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import searchBody from '../../../fixtures/search/productSearch.json'
import creditCardPayment from '../../../fixtures/payment/creditcardPayment.json'
import digitalPayment from '../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderParameter from '../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/deliveryDateAndWindow/api/commands/deliveryDateAndWindow'
import '../../../support/sideCart/api/commands/clearTrolley'
import '../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../support/checkout/api/commands/navigateToCheckout'
import '../../../support/checkout/api/commands/confirmOrder'
import '../../../support/payment/api/commands/creditcard'
import '../../../support/payment/api/commands/digitalPayment'
import '../../../support/rewards/api/commands/rewards'
import '../../../support/refunds/api/commands/commands'
import '../../../support/everydayMarket/api/commands/orderApi'
import '../../../support/everydayMarket/api/commands/marketplacer'
import '../../../support/everydayMarket/api/commands/utility'
import tests from '../../../fixtures/everydayMarket/apiTests.json'
import * as lib from '../../../support/everydayMarket/api/commands/commonHelpers'
import cup from '../../../fixtures/everydayMarket/searchEDMCUPItems.json'

TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API]  MPPF-954 | EM | Verify CUP details for a product for measure type-Weight', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-954 | EM | Verify CUP details for a product for measure type-Weight', () => {
      const testData = tests.VerifyFullyDispatchedEDMOrder   
      const shopperId = shoppers.emAccount2.shopperId
     
      // Login
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      // clear the trolley before placing an order
      cy.clearTrolley().then((response) => {
        expect(response).to.have.property('TrolleyItemCount', 0)
        expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
      })

      // Select a regular delivery slot
      cy.getRegularDeliveryTimeSlot(testData).then((response) => {
        cy.fulfilmentWithSpecificDeliveryDateAndTime(testData.deliveryAddressId, testData.timeSlotId, testData.windowDate).then((response) => {
          expect(response).to.have.property('IsSuccessful', true)
          expect(response).to.have.property('IsNonServiced', false)
        })
      })

      //1.weight
      // Search for the desired products and add them to cart
      const cupTestdata = cup.weightGtoKG
      searchBody.SearchTerm = cupTestdata.searchTerm
      cy.productSearch(searchBody).then((response) => {
        expect(response.SearchResultsCount).to.be.greaterThan(0)
        cy.getEDMProductFromProductSearchResponse(response, testData, cupTestdata)
        let expCupPrice
        expCupPrice = returnCUPprice(cupTestdata)
        cy.log('expectedCUPPrice: ' + expCupPrice)
        cy.log('actualCUPPrice: ' + cupTestdata.cupString)
        // cy.log('cupStringfinalactualCUPPrice: ' + cupStringfinal)
        // expect(expCupPrice).to.be.equal(Number(cupTestdata.cupString))
        // expect(response.invoices[0].lineItems[0].quantity).to.be.equal(Number(testData.items[0].quantity))

        //2.weight
      })

    })
  })
})

//this function calculate based on the CUP details set and returns the calculated CUP
function returnCUPprice(cupTestdata) {

  let productPrice
  //find out cup prrice needs to calculated based on base price or sale price
  if (cupTestdata.CupCalcBasedOn == "basePrice") {
    productPrice = Number(cupTestdata.basePrice)
  }
  else {
    productPrice = Number(cupTestdata.salePrice)
  }

  cy.log('productPrice:'+productPrice)
  //calculate cup price
  let expectedCupPrice = new Number(0)
  if (cupTestdata.itemUnit == cupTestdata.comparativeUnit) {
    expectedCupPrice = (Number(cupTestdata.comparativeSize) * productPrice) / Number(cupTestdata.itemSize)
  }
  else if (cupTestdata.itemUnit != cupTestdata.comparativeUnit) {
    expectedCupPrice = (Number(cupTestdata.comparativeSize) * productPrice * adjustItemsizToComprativeSizeForDiffWeightComb(cupTestdata)) / Number(cupTestdata.itemSize)
  }

  return round(expectedCupPrice);
}

function adjustItemsizToComprativeSizeForDiffWeightComb(cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: '+ cupTestdata.itemUnit  + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == "G" && cupTestdata.comparativeUnit == "KG") {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == "G" && cupTestdata.comparativeUnit == "MG") {
    adjustmentValue = 100
  }

  if (cupTestdata.itemUnit == "MG" && cupTestdata.comparativeUnit == "G") {
    adjustmentValue = 0.01
  }

  if (cupTestdata.itemUnit == "MG" && cupTestdata.comparativeUnit == "KG") {
    adjustmentValue = 10000
  }

  if (cupTestdata.itemUnit == "KG" && cupTestdata.comparativeUnit == "G") {
    adjustmentValue = 0.0001
  }

  if (cupTestdata.ItemUnit == "KG" && cupTestdata.ComparativeUnit == "MG") {
    adjustmentValue = 0.00001
  }
  cy.log('adjustmentValue:'+adjustmentValue)

  return adjustmentValue;
}

function adjustItemsizToComprativeSizeForDiffVolumeComb(cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: '+ cupTestdata.itemUnit  + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == "ML" && cupTestdata.comparativeUnit == "L") {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == "ML" && cupTestdata.comparativeUnit == "KL") {
    adjustmentValue = 10000
  }

  if (cupTestdata.itemUnit == "L" && cupTestdata.comparativeUnit == "ML") {
    adjustmentValue = 0.001
  }

  if (cupTestdata.itemUnit == "L" && cupTestdata.comparativeUnit == "KL") {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == "KL" && cupTestdata.comparativeUnit == "L") {
    adjustmentValue = 0.01
  }

  if (cupTestdata.ItemUnit == "KL" && cupTestdata.ComparativeUnit == "ML") {
    adjustmentValue = 0.00001
  }
  cy.log('adjustmentValue:'+adjustmentValue)

  return adjustmentValue;
}

function adjustItemsizToComprativeSizeForDiffLengthComb(cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: '+ cupTestdata.itemUnit  + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == "MM" && cupTestdata.comparativeUnit == "CM") {
    adjustmentValue = 100
  }

  if (cupTestdata.itemUnit == "MM" && cupTestdata.comparativeUnit == "M") {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == "CM" && cupTestdata.comparativeUnit == "MM") {
    adjustmentValue = 0.001
  }

  if (cupTestdata.itemUnit == "CM" && cupTestdata.comparativeUnit == "M") {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == "M" && cupTestdata.comparativeUnit == "CM") {
    adjustmentValue = 0.0001
  }

  if (cupTestdata.ItemUnit == "M" && cupTestdata.ComparativeUnit == "MM") {
    adjustmentValue = 0.00001
  }
  cy.log('adjustmentValue:'+adjustmentValue)

  return adjustmentValue;
}

function round(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return Math.round(m) / 100 * Math.sign(num);
}
