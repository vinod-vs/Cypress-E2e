/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/login/api/commands/login'
import '../../../support/search/api/commands/search'
import '../../../support/fulfilment/api/commands/fulfilment'
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
import cup from '../../../fixtures/everydayMarket/searchEDMitemWithCUP.json'
import searchRequest from '../../../fixtures/search/productSearch.json'




TestFilter(['B2C-API', 'EDM-API'], () => {
  describe('[API]  MPPF-954 | EM | Verify CUP details for a product for measure type-Weight', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('MPPF-954 | EM | Verify CUP details for measure type-Weight G and KG', () => {
      const testData = tests.VerifyFullyDispatchedEDMOrder
      const shopperId = shoppers.emAccount2.shopperId

      //login 
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      const cupTestdataGtoKG = cup.weightGtoKG
      serachorForEDMproductWithCUPAndVerfiyCUP(testData, cupTestdataGtoKG)


    })
    //2
    it('MPPF-954 | EM | Verify CUP details for measure type-Weight-G and G', () => {
      const testData = tests.VerifyFullyDispatchedEDMOrder
      //login 
      cy.loginViaApi(shoppers.emAccount2).then((response) => {
        expect(response).to.have.property('LoginResult', 'Success')
      })

      const cupTestdataGtoG = cup.weightGtoG
      serachorForEDMproductWithCUPAndVerfiyCUP(testData, cupTestdataGtoG)

    })

  })
})


function serachorForEDMproductWithCUPAndVerfiyCUP(testData, cupTestdata)
{
  searchRequest.SearchTerm = cupTestdata.searchTerm
  cy.productSearch(searchRequest).then((response) => {
    expect(response.SearchResultsCount).to.be.greaterThan(0)
    cy.getEDMProductFromProductSearchResponse(response, testData, cupTestdata).then((response) => {
      verifyCupValues(cupTestdata)
    })
  })
}
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

  cy.log('productPrice:' + productPrice)
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
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
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
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue;
}

function adjustItemsizToComprativeSizeForDiffVolumeComb(cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
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
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue;
}

function adjustItemsizToComprativeSizeForDiffLengthComb(cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
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
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue;
}

function round(num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return Math.round(m) / 100 * Math.sign(num);
}

function roundOfValue(num) {
  return (Math.round(num * 100) / 100).toFixed(2);
}

function verifyCupValues(cupTestdata) {
  let expCupPrice
  expCupPrice = returnCUPprice(cupTestdata)
  cy.log('expectedCUPPrice: ' + expCupPrice)

  //cup price
  expect(Number(cupTestdata.cupPrice)).to.be.equal(expCupPrice)
  //CUPhas true
  expect(cupTestdata.hasCupPrice).to.be.equal(true)
  //CupMeasure
  let expComparativeSize = cupTestdata.comparativeSize
  let expComparativeUnit = cupTestdata.comparativeUnit
  let expCUPMeasure = expComparativeSize + expComparativeUnit
  cy.log('expCUPMeasure: ' + expCUPMeasure)
  expect(cupTestdata.cupMeasure).to.be.equal(expCUPMeasure)
  //CupString
  let roundofActualCUPprice
  roundofActualCUPprice = roundOfValue(cupTestdata.cupPrice)
  let expCUPString = '$' + roundofActualCUPprice + ' / ' + expCUPMeasure
  cy.log('expCUPString: ' + expCUPString)
  expect(cupTestdata.cupString).to.be.equal(expCUPString)

}