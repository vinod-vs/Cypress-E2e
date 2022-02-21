/// <reference types="cypress" />
/* eslint-disable no-unused-expressions */

import addItemsBodyWow from '../../../../fixtures/sideCart/addItemsToTrolley.json'
import addItemsBodyMp from '../../../../fixtures/sideCart/addItemsToTrolley1.json'
import addressSearch from '../../../../fixtures/checkout/addressSearch.json'
import { fulfilmentType } from '../../../../fixtures/checkout/fulfilmentType.js'
import { windowType } from '../../../../fixtures/checkout/fulfilmentWindowType.js'
import searchRequest from '../../../../fixtures/search/productSearch.json'
import creditCardDetails from '../../../../fixtures/payment/creditcard.json'
import digitalPaymentRequest from '../../../../fixtures/payment/digitalPayment.json'
import creditcardSessionHeader from '../../../../fixtures/payment/creditcardSessionHeader.json'
import confirmOrderRequest from '../../../../fixtures/orderConfirmation/confirmOrderParameter.json'
import * as lib from './commonHelpers'
import '../../../login/api/commands/login'
import '../../../search/api/commands/search'
import '../../../checkout/api/commands/navigateToCheckout'
import '../../../checkout/api/commands/redeemRewardsDollars'
import '../../../payment/api/commands/creditcard'
import '../../../payment/api/commands/paypal'
import '../../../sideCart/api/commands/addItemsToTrolley'
import '../../../sideCart/api/commands/clearTrolley'
import '../../../payment/api/commands/digitalPayment'
import '../../../payment/api/commands/zero'
import '../../../payment/api/commands/giftCard'
import '../../../checkout/api/commands/confirmOrder'
import '../../../invoices/api/commands/commands'
import '../../../fulfilment/api/commands/fulfilment'
import '../../../utilities/api/apiUtilities'
import '../../../gifting/api/commands/gifting'
import { paymentType } from './paymentType'

Cypress.Commands.add('searchForProducts', (testData, item) => {
  if (item.searchTerm != null && item.searchTerm != undefined) {
    searchRequest.SearchTerm = item.searchTerm
    cy.log('Searching for item specific search term: ' + searchRequest.SearchTerm)
    cy.productSearch(searchRequest).as('productSearchResults').then((productSearchResponse) => {
      console.log(productSearchResponse)
      expect(productSearchResponse.SearchResultsCount).to.be.greaterThan(0)
    })
  } else {
    searchRequest.SearchTerm = testData.searchTerm
    cy.log('Searching for default search term: ' + searchRequest.SearchTerm)
    cy.productSearch(searchRequest).as('productSearchResults').then((productSearchResponse) => {
      console.log(productSearchResponse)
      expect(productSearchResponse.SearchResultsCount).to.be.greaterThan(0)
    })
  }
})

Cypress.Commands.add('getTestProductFromProductSearchResponse', (testData) => {
  // Add the desired products to cart
  const items = testData.items
  let totalQuantity = new Number(0)
  let totalWowQuantity = new Number(0)
  let totalEdmQuantity = new Number(0)
  let wowTotal = new Number(0)
  let edmTotal = new Number(0)
  items.forEach(item => {
    // Search for the required product
    cy.searchForProducts(testData, item)

    cy.get('@productSearchResults').then((response) => {
      // Add required WOW items to cart
      let x
      if (item.isEDMProduct === 'false') {
        cy.log('Adding a WOW product')
        const minWowOrderThreshold = item.minWowOrderThreshold
        const bufferWowQuantity = item.bufferWowQuantity
        // Get available WOW product only
        const wowProducts = response.Products.filter(searchProduct => !searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable && searchProduct.Products[0].IsPurchasable && searchProduct.Products[0].Price !== null && searchProduct.Products[0].IsInStock === true && searchProduct.Products[0].SupplyLimit >= 50 && !searchProduct.Products[0].IsInTrolley && searchProduct.Products[0].IsForDelivery)
        expect(wowProducts.length).to.be.greaterThan(0)

        // Add available WOW product to cart
        for (x in wowProducts) {
          const product = wowProducts[x].Products[0]
          let wowQuantity = new Number(0)
          let wowStockCode = new Number(0)
          // Determine wow item quantity
          if (item.quantity > 0) {
            wowQuantity = item.quantity
            cy.log('Using wowQuantity from testdata: ' + wowQuantity)
          } else {
            wowQuantity = minWowOrderThreshold / product.Price
            wowQuantity = Math.floor(wowQuantity) + bufferWowQuantity
            cy.log('Using Calculated wowQuantity: ' + wowQuantity)
          }
          if (product.SupplyLimit >= wowQuantity) {
            wowStockCode = product.Stockcode
            cy.log('WOWProduct: ' + wowStockCode + ' , SupplyLimit: ' + product.SupplyLimit + ' , PerItemPrice: ' + product.Price + ' , Quantity: ' + wowQuantity)
            addItemsBodyWow.StockCode = wowStockCode
            addItemsBodyWow.Quantity = wowQuantity
            item.stockCode = wowStockCode
            item.quantity = wowQuantity
            item.pricePerItem = product.Price
            totalWowQuantity = totalWowQuantity + wowQuantity
            totalQuantity = totalQuantity + wowQuantity
            wowTotal = Number.parseFloat(Number(item.quantity) * Number(item.pricePerItem)).toFixed(2)

            cy.log('Adding WOW Item to Cart. Stockcode: ' + wowStockCode + ' , of quantity: ' + wowQuantity)
            cy.addItemsToTrolley(addItemsBodyWow).then((response) => {
              expect(response.TotalTrolleyItemQuantity).to.be.equal(Number(totalQuantity))
              expect(response.Totals.WoolworthsSubTotal).to.be.equal(Number(wowTotal))
            })
            expect(wowStockCode).to.be.greaterThan(0)
            break
          }
        }
      }
      // Add required EDM items to cart
      let y
      if (item.isEDMProduct === 'true') {
        cy.log('Adding a EDM product')
        let mpStockCode = 0
        const mpQuantity = item.quantity
        // Get available EDM product only
        const edmProducts = response.Products.filter(searchProduct => searchProduct.Products[0].IsMarketProduct && searchProduct.Products[0].IsAvailable && searchProduct.Products[0].IsPurchasable && searchProduct.Products[0].Price !== null && searchProduct.Products[0].IsInStock === true && searchProduct.Products[0].SupplyLimit >= 50 && !searchProduct.Products[0].IsInTrolley && searchProduct.Products[0].IsForDelivery)
        expect(edmProducts.length).to.be.greaterThan(0)

        // Add available EDM product to cart
        for (y in edmProducts) {
          const product = edmProducts[y].Products[0]
          mpStockCode = product.Stockcode
          cy.log('MarketProduct: ' + mpStockCode + ' , SupplyLimit: ' + product.SupplyLimit + ' , PerItemPrice: ' + product.Price + ' , Quantity: ' + mpQuantity)
          addItemsBodyMp.StockCode = mpStockCode
          addItemsBodyMp.Quantity = mpQuantity
          item.stockCode = mpStockCode
          item.pricePerItem = product.Price
          item.sellerName = product.AdditionalAttributes['Market.Seller_BusinessName']
          totalEdmQuantity = totalEdmQuantity + mpQuantity
          totalQuantity = totalQuantity + mpQuantity
          edmTotal = Number(Number.parseFloat(Number(item.quantity) * Number(item.pricePerItem)).toFixed(2))

          cy.log('Adding MP Item to Cart. Stockcode: ' + mpStockCode + ' , of quantity: ' + mpQuantity)
          cy.addItemsToTrolley(addItemsBodyMp).then((response) => {
            expect(response.TotalTrolleyItemQuantity).to.be.equal(Number(totalQuantity))
            expect(response.Totals.MarketSubTotal).to.be.equal(Number(edmTotal))
          })
          expect(mpStockCode).to.be.greaterThan(0)
          break
        }
      }
      testData.wowTotal = wowTotal
      testData.edmTotal = edmTotal
      testData.totalQuantity = totalQuantity
      testData.totalWowQuantity = totalWowQuantity
      testData.totalEdmQuantity = totalEdmQuantity
      cy.log('wowTotal: ' + wowTotal + ' , edmTotal: ' + edmTotal + ' , totalQuantity: ' + totalQuantity + ' , totalWowQuantity: ' + totalWowQuantity + ' , totalEdmQuantity: ' + totalEdmQuantity)
    })
  })
})

Cypress.Commands.add('loginAndPlaceRequiredOrderFromTestdata', (shopperDetails, testData) => {
  // Login
  cy.loginViaApiAndHandle2FA(shopperDetails)

  // Set fulfilment using the new /windows endpoint
  cy.setFulfilmentLocationWithWindow(fulfilmentType.DELIVERY, addressSearch, windowType.FLEET_DELIVERY)

  // clear the trolley before placing an order
  cy.clearTrolley().then((response) => {
    expect(response).to.have.property('TrolleyItemCount', 0)
    expect(response).to.have.property('TotalTrolleyItemQuantity', 0)
  })

  // Search for the desired products and add them to cart
  cy.getTestProductFromProductSearchResponse(testData)

  // If gift order, add the gifting message
  if (testData.isAGiftOrder) {
    cy.addGiftingDetails('message', 'sender', 'recipient').as('giftingResponse')
  }

  // Checkout and Pay the order using the right payment method
  cy.payTheOrder(testData).then((response) => {
    confirmOrderRequest.placedOrderId = response.PlacedOrderId
  })

  // Confirm the orders or place the order
  cy.wait(Cypress.config('fiveSecondWait'))
  cy.confirmOrder(confirmOrderRequest).then((response) => {
    expect(response.Order.OrderId).to.eqls(confirmOrderRequest.placedOrderId)
    return response
  })
})

Cypress.Commands.add('payTheOrder', (testData) => {
  cy.log('PaymentType: ' + testData.paymentType)

  switch (testData.paymentType) {
    case paymentType.PAYPAL_ONLY:
      // Checkout
      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        digitalPaymentRequest.payments[0].amount = response.Model.Order.BalanceToPay
      })
      // Pay with paypal
      cy.payWithLinkedPaypalAccount(digitalPaymentRequest).as('paymentResponse')
      break
    case paymentType.PAYPAL_PLUS_REWARDS:
      // Redeem $10 from rewards
      cy.redeemRewardsDollars(10)
      // Checkout
      cy.navigateToCheckout().then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        digitalPaymentRequest.payments[0].amount = response.Model.Order.BalanceToPay
      })
      // Pay with paypal
      cy.payWithLinkedPaypalAccount(digitalPaymentRequest).as('paymentResponse')
      break
    case paymentType.CREDIT_CARD_ONLY:
      cy.payByCreditCard(true)
      break
    case paymentType.CREDIT_CARD_PLUS_REWARDS:
      // TODO
      break
    case paymentType.CREDIT_CARD_PLUS_REWARDS_PLUS_GIFTCARD:
      // Redeem $10 from rewards
      cy.redeemRewardsDollars(10)
      // Checkout
      cy.navigateToCheckout().as('checkoutResponse').then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
      })
      // Get gift card paymentInstrumentId
      cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(10)
      // Pay with paypal and GC of $10
      cy.get('@checkoutResponse').then((checkoutResponse) => {
        cy.get('@giftcardPaymentInstrumentId').then((giftcardPaymentInstrumentId) => {
          // payment[0] is for CC. It's paymentInstrumentId is set by the command payByCreditCard at payments[0] position.
          // payment[1] is for GC
          const payments = [{ amount: checkoutResponse.Model.Order.BalanceToPay - 10, paymentInstrumentId: 0, stepUpToken: 'tokenise-stepup-token' }, { amount: 10, paymentInstrumentId: giftcardPaymentInstrumentId, stepUpToken: 'tokenise-stepup-token' }]
          digitalPaymentRequest.payments = payments
          cy.log('giftcardPaymentInstrumentId: ' + giftcardPaymentInstrumentId)
          cy.log('payments: ' + JSON.stringify(payments))
          cy.log('digitalPaymentRequest: ' + JSON.stringify(digitalPaymentRequest))
          cy.payByCreditCard(false)
        })
      })
      break
    case paymentType.PAYPAL_PLUS_REWARDS_PLUS_GIFTCARD:
      // Redeem $10 from rewards
      cy.redeemRewardsDollars(10)
      // Checkout
      cy.navigateToCheckout().as('checkoutResponse').then((response) => {
        expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
      })
      // Get gift card paymentInstrumentId
      cy.checkAndGetGiftCardPaymentInstrumentWithExpectedBalance(10)
      // Pay with paypal and GC of $10
      cy.get('@checkoutResponse').then((checkoutResponse) => {
        cy.get('@giftcardPaymentInstrumentId').then((giftcardPaymentInstrumentId) => {
          // payment[0] is for PP. It's paymentInstrumentId is set by the command payWithLinkedPaypalAccount at payments[0] position.
          // payment[1] is for GC
          const payments = [{ amount: checkoutResponse.Model.Order.BalanceToPay - 10, paymentInstrumentId: 0, stepUpToken: 'tokenise-stepup-token' }, { amount: 10, paymentInstrumentId: giftcardPaymentInstrumentId, stepUpToken: 'tokenise-stepup-token' }]
          digitalPaymentRequest.payments = payments
          cy.log('giftcardPaymentInstrumentId: ' + giftcardPaymentInstrumentId)
          cy.log('payments: ' + JSON.stringify(payments))
          cy.log('digitalPaymentRequest: ' + JSON.stringify(digitalPaymentRequest))
          cy.payWithLinkedPaypalAccount(digitalPaymentRequest).as('paymentResponse')
        })
      })
      break
      case paymentType.GIFTCARD_ONLY:
        
        // Checkout
        cy.navigateToCheckout().as('checkoutResponse').then((response) => {
          expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
        })
      
        // Pay with Gift Card
        cy.get('@checkoutResponse').then((checkoutResponse) => {

          const totalCartValue = checkoutResponse.Model.Order.BalanceToPay
          cy.log("Total Cart Value is "+totalCartValue)
          // Generate multiple giftcards and get array of gift card paymentInstrumentIds
          cy.generateGiftCards(totalCartValue)

          cy.get('@giftcardPaymentInstrumentIds').then((giftcardPaymentInstrumentIds) => {
            const payments = []
            giftcardPaymentInstrumentIds.forEach(paymentInstrument => {
              payments.push({amount: paymentInstrument.amount, paymentInstrumentId: paymentInstrument.InstrumentId, stepUpToken: 'tokenise-stepup-token'})
            });
    
            digitalPaymentRequest.payments = payments
            cy.log('payments: ' + JSON.stringify(payments))
            cy.log('digitalPaymentRequest: ' + JSON.stringify(digitalPaymentRequest))
            cy.payWithGiftCard(digitalPaymentRequest).as('paymentResponse')
          })
        })
        break
    default: // default is CREDIT_CARD_ONLY
      cy.payByCreditCard(true)
      break
  }

  // Verify the order is placed
  cy.get('@paymentResponse').then((response) => {
    expect(response.TransactionReceipt).to.not.be.null
    expect(response.PlacedOrderId).to.not.be.null
    return response
  })
})

Cypress.Commands.add('getPaymentInstrumentId', (creditcardPaymentResponse) => {
  let paymentInstrumentId = 0
  if (creditcardPaymentResponse.itemId != undefined || creditcardPaymentResponse.itemId != null) {
    paymentInstrumentId = creditcardPaymentResponse.itemId
    cy.log('creditcardPaymentResponse.itemId: ' + creditcardPaymentResponse.itemId)
  } else if (creditcardPaymentResponse.paymentInstrument != undefined || creditcardPaymentResponse.paymentInstrument != null) {
    paymentInstrumentId = creditcardPaymentResponse.paymentInstrument.itemId
    cy.log('creditcardPaymentResponse.paymentInstrument.itemId: ' + creditcardPaymentResponse.paymentInstrument.itemId)
  }
  cy.wrap(paymentInstrumentId).as('paymentInstrumentId')
})

Cypress.Commands.add('payByCreditCard', (checkBalanceToPay) => {
  // Checkout
  if (checkBalanceToPay) {
    cy.navigateToCheckout().then((response) => {
      expect(response.Model.Order.BalanceToPay).to.be.greaterThan(0)
      digitalPaymentRequest.payments[0].amount = response.Model.Order.BalanceToPay
    })
  }

  // Pay with CC
  cy.log('Using default PaymentType: CREDIT_CARD_ONLY')
  cy.navigatingToCreditCardIframe().then((response) => {
    expect(response).to.have.property('Success', true)
    creditcardSessionHeader.creditcardSessionId = response.IframeUrl.toString().split('/')[5]
  })
  cy.getExpectedCCCardDetails()
  cy.get('@creditCardToUse').then((creditCardToUse) => {
    cy.creditcardTokenisation(creditCardToUse, creditcardSessionHeader).then((response) => {
      cy.log('creditcardPaymentResponse: ' + JSON.stringify(response))
      expect(response.status.responseText).to.be.eqls('ACCEPTED')
      cy.getPaymentInstrumentId(response)
    })
  })
  cy.get('@paymentInstrumentId').then((paymentInstrumentId) => {
    digitalPaymentRequest.payments[0].paymentInstrumentId = paymentInstrumentId
  })
  cy.digitalPay(digitalPaymentRequest).as('paymentResponse')
})

Cypress.Commands.add('getExpectedCCCardDetails', () => {
  const card = Cypress.env('card')
  let cardDetails
  cy.log('Using CC: ' + card)

  // Select desired card. Default is amex
  switch (card) {
    case 'visa':
      cardDetails = creditCardDetails.visa
      break
    case 'amex':
      cardDetails = creditCardDetails.amex
      break
    case 'diner':
      cardDetails = creditCardDetails.diner
      break
    case 'mastercard':
      cardDetails = creditCardDetails.mastercard
      break
    default:
      cardDetails = creditCardDetails.amex
      break
  }

  cy.log('CardDetails: ' + JSON.stringify(cardDetails))
  cy.wrap(cardDetails).as('creditCardToUse')
})

Cypress.Commands.add('verifyOrderInvoice', (testData) => {
  cy.invoiceSearch(1).then((response) => {
    const invoices = response.Invoices.filter(inv => inv.InvoiceId === Number(testData.orderId))
    cy.log('Required invoices: ' + JSON.stringify(invoices))
    expect(invoices).to.have.length(1)
    const invoice = invoices[0]
    lib.verifyInvoiceDetails(invoice, testData)
  })
})


Cypress.Commands.add('getEDMProductFromProductSearchResponse', (productSearchResponse, testdata, type) => {
  const response = productSearchResponse
  let y
  let mpStockCode = 0

  for (y in response.Products) {
    if (response.Products[y].Products[0].Price !== null &&
      response.Products[y].Products[0].IsInStock === true &&
      response.Products[y].Products[0].IsMarketProduct === true) {
      mpStockCode = response.Products[y].Products[0].Stockcode
      cy.log('MarketProduct: ' + mpStockCode + ' , SupplyLimit: ' + response.Products[y].Products[0].SupplyLimit + ' , PerItemPrice: ' + response.Products[y].Products[0].Price)
      break
    }
  }

  switch (type) {
    case 'CUP':
    
      let cupPrice = new Number(0)
      let cupMeasure
      let hasCupPrice
      let cupString

      // CUP Details
      cupPrice = response.Products[y].Products[0].CupPrice
      cupMeasure = response.Products[y].Products[0].CupMeasure
      hasCupPrice = response.Products[y].Products[0].HasCupPrice
      cupString = response.Products[y].Products[0].CupString

      testdata.cupPrice = cupPrice
      testdata.cupMeasure = cupMeasure
      testdata.hasCupPrice = hasCupPrice
      testdata.cupString = cupString
      cy.log('product: ' + testdata.searchTerm + ' ,CupPrice: ' + cupPrice + ' , CupMeasure: ' + cupMeasure + ' , HasCupPrice: ' + hasCupPrice + ' ,CupString ' + cupString)
      break;
    case 'TGA':
      let productWarningsAct
      // TGA
      productWarningsAct = response.Products[y].Products[0].AdditionalAttributes.tgawarning
      testdata.productWarningsAct = productWarningsAct  
      cy.log('productWarningsAct: ' + productWarningsAct )
      break;
  }

})