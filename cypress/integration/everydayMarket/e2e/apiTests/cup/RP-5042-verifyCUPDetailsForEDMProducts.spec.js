/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import shoppers from '../../../../../fixtures/everydayMarket/shoppers.json'
import TestFilter from '../../../../../support/TestFilter'
import '../../../../../support/login/api/commands/login'
import '../../../../../support/search/api/commands/search'
import '../../../../../support/fulfilment/api/commands/fulfilment'
import '../../../../../support/sideCart/api/commands/clearTrolley'
import '../../../../../support/sideCart/api/commands/addItemsToTrolley'
import '../../../../../support/checkout/api/commands/navigateToCheckout'
import '../../../../../support/checkout/api/commands/confirmOrder'
import '../../../../../support/payment/api/commands/creditcard'
import '../../../../../support/payment/api/commands/digitalPayment'
import '../../../../../support/rewards/api/commands/rewards'
import '../../../../../support/refunds/api/commands/commands'
import '../../../../../support/everydayMarket/api/commands/orderApi'
import '../../../../../support/everydayMarket/api/commands/marketplacer'
import '../../../../../support/everydayMarket/api/commands/utility'
import cup from '../../../../../fixtures/everydayMarket/searchEDMitemWithCUP.json'
import searchRequest from '../../../../../fixtures/search/productSearch.json'

TestFilter(['EDM', 'API', 'EDM-E2E-API'], () => {
  describe('[API]  RP-5042 | EM | Verify CUP details for a product for measure type-Weight', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
    })

    it('RP-5042 | EM | Verify CUP details for different measure type', () => {
      cup.forEach(cupdetails => {
        cy.log('=====VERIFYING CUP DETAILS FOR PRODUCT:' + cupdetails.searchTerm + ' ========')
        cy.loginViaApiAndHandle2FA(shoppers.emAccountWithRewards14).then((response) => {
          serachForEDMproductWithCUPAndVerfiy(cupdetails)
        })
      })
    })
  })
})

function serachForEDMproductWithCUPAndVerfiy (cupTestdata) {
  searchRequest.SearchTerm = cupTestdata.searchTerm
  cy.productSearch(searchRequest).then((response) => {
    expect(response.SearchResultsCount).to.be.greaterThan(0)
    cy.searchEMProductAndStashTheResponse(response, cupTestdata, 'CUP').then((response) => {
      verifyCupValues(cupTestdata)
    })
  })
}

function returnCUPprice (cupTestdata) {
  let productPrice
  // find out cup prrice needs to calculated based on base price or sale price
  if (cupTestdata.cupCalcBasedOn == 'basePrice') {
    productPrice = Number(cupTestdata.basePrice)
  } else {
    productPrice = Number(cupTestdata.salePrice)
  }

  // calculate cup price
  let expectedCupPrice = new Number(0)
  if (cupTestdata.itemUnit == cupTestdata.comparativeUnit) {
    expectedCupPrice = (Number(cupTestdata.comparativeSize) * productPrice) / Number(cupTestdata.itemSize)
  } else if (cupTestdata.itemUnit != cupTestdata.comparativeUnit) {
    let adjustmentValue
    switch (cupTestdata.measureType) {
      case 'weight':
        adjustmentValue = adjustItemsizeToComparativeSizeForDiffWeightComb(cupTestdata)
        break
      case 'volume':
        adjustmentValue = adjustItemsizeToComparativeSizeForDiffVolumeComb(cupTestdata)
        break
      case 'length':
        adjustmentValue = adjustItemsizeToComparativeSizeForDiffLengthComb(cupTestdata)
        break
      default:
        adjustmentValue = 1
    }
    expectedCupPrice = (Number(cupTestdata.comparativeSize) * productPrice * adjustmentValue) / Number(cupTestdata.itemSize)
  }

  return round(expectedCupPrice)
}

function adjustItemsizeToComparativeSizeForDiffWeightComb (cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == 'G' && cupTestdata.comparativeUnit == 'KG') {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == 'G' && cupTestdata.comparativeUnit == 'MG') {
    adjustmentValue = 100
  }

  if (cupTestdata.itemUnit == 'MG' && cupTestdata.comparativeUnit == 'G') {
    adjustmentValue = 0.01
  }

  if (cupTestdata.itemUnit == 'MG' && cupTestdata.comparativeUnit == 'KG') {
    adjustmentValue = 10000
  }

  if (cupTestdata.itemUnit == 'KG' && cupTestdata.comparativeUnit == 'G') {
    adjustmentValue = 0.0001
  }

  if (cupTestdata.itemUnit == 'KG' && cupTestdata.comparativeUnit == 'MG') {
    adjustmentValue = 0.00001
  }
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue
}

function adjustItemsizeToComparativeSizeForDiffVolumeComb (cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == 'ML' && cupTestdata.comparativeUnit == 'L') {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == 'ML' && cupTestdata.comparativeUnit == 'KL') {
    adjustmentValue = 10000
  }

  if (cupTestdata.itemUnit == 'L' && cupTestdata.comparativeUnit == 'ML') {
    adjustmentValue = 0.001
  }

  if (cupTestdata.itemUnit == 'L' && cupTestdata.comparativeUnit == 'KL') {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == 'KL' && cupTestdata.comparativeUnit == 'L') {
    adjustmentValue = 0.01
  }

  if (cupTestdata.itemUnit == 'KL' && cupTestdata.comparativeUnit == 'ML') {
    adjustmentValue = 0.00001
  }
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue
}

function adjustItemsizeToComparativeSizeForDiffLengthComb (cupTestdata) {
  let adjustmentValue = Number(0)
  cy.log('itemunit: ' + cupTestdata.itemUnit + ' , comparativeUnit: ' + cupTestdata.comparativeUnit)
  if (cupTestdata.itemUnit == 'MM' && cupTestdata.comparativeUnit == 'CM') {
    adjustmentValue = 10
  }

  if (cupTestdata.itemUnit == 'MM' && cupTestdata.comparativeUnit == 'M') {
    adjustmentValue = 1000
  }

  if (cupTestdata.itemUnit == 'CM' && cupTestdata.comparativeUnit == 'MM') {
    adjustmentValue = 0.1
  }

  if (cupTestdata.itemUnit == 'CM' && cupTestdata.comparativeUnit == 'M') {
    adjustmentValue = 100
  }

  if (cupTestdata.itemUnit == 'M' && cupTestdata.comparativeUnit == 'CM') {
    adjustmentValue = 0.01
  }

  if (cupTestdata.itemUnit == 'M' && cupTestdata.comparativeUnit == 'MM') {
    adjustmentValue = 0.001
  }
  cy.log('adjustmentValue:' + adjustmentValue)

  return adjustmentValue
}

function round (num) {
  const m = Number((Math.abs(num) * 100).toPrecision(15))
  return Math.round(m) / 100 * Math.sign(num)
}

function roundOfDecimaltoTwoDigit (num) {
  return (Math.round(num * 100) / 100).toFixed(2)
}

function verifyCupValues (cupTestdata) {
  let expCupPrice
  expCupPrice = returnCUPprice(cupTestdata)
  cy.log('expectedCUPPrice: ' + expCupPrice)

  // cup price
  expect(Number(cupTestdata.cupPrice)).to.be.equal(expCupPrice)

  // hasCupPrice
  expect(cupTestdata.hasCupPrice).to.be.equal(true)
  // CupMeasure
  const expComparativeSize = cupTestdata.comparativeSize
  const expComparativeUnit = cupTestdata.comparativeUnit
  const expCUPMeasure = expComparativeSize + expComparativeUnit
  cy.log('expCUPMeasure: ' + expCUPMeasure)
  expect(cupTestdata.cupMeasure).to.be.equal(expCUPMeasure)
  // CupString
  let roundOfExpectedCUPprice
  roundOfExpectedCUPprice = roundOfDecimaltoTwoDigit(expCupPrice)
  const expCUPString = '$' + roundOfExpectedCUPprice + ' / ' + expCUPMeasure
  cy.log('expCUPString: ' + expCUPString)
  expect(cupTestdata.cupString).to.be.equal(expCUPString)
}
