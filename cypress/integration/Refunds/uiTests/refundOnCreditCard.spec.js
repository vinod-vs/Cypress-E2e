import TestFilter from '../../../support/TestFilter.js'
import '../../../support/login/ui/commands/login.js'
import '../../../support/sideCart/ui/commands/clearTrolley.js'
import '../../../support/fulfilment/ui/commands/deliveryDateAndWindow.js'
import '../../../support/search/ui/commands/searchAndAddProduct.js'
import "../../../support/siteManagement/ui/commands/login.ts";
import "../../../support/siteManagement/ui/commands/orderManagement.ts";
import "../../../support/siteManagement/ui/commands/homepage";
import { onSearchResultsPage } from '../../../support/search/ui/pageObjects/SearchResultsPage.js'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon.ts'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector.ts'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector.ts'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage.ts'
import { onHaveYouForgottenPage } from '../../../support/hyf/ui/pageObjects/HaveYouForgottenPage.ts'
import { onCheckoutPage } from '../../../support/checkout/ui/pageObjects/CheckoutPage.ts'
import { onOrderConfirmationPage } from '../../../support/orderConfirmation/ui/pageObjects/OrderConfirmationPage.ts'
import { onOrderManagement } from '../../../support/siteManagement/ui/pageObjects/OrderManagement.ts'
import { HomepageTopMenu } from "../../../support/siteManagement/ui/commands/HomepageTopMenu";
import { OrderManagementMenu } from "../../../support/siteManagement/ui/commands/OrderManagementMenu";
import shoppers from '../../../fixtures/login/b2cShoppers.json'
import refundsTestData from '../../../fixtures/refunds/refundsTestData.json'
import smLogins from "../../../fixtures/siteManagement/loginDetails.json";


TestFilter(['B2C', 'UI', 'Refunds', 'OPS', 'P3'], () => {
  describe('[UI] Place an order, then refund the order', () => {
    let orderId="", firstStockCode="", refundTotal="", goodwillTotal="", refundId="";
    let refundTime, refundTotalFloat, goodwillTotalFloat;
    const { JSDOM } = require('jsdom')
    before(() => {
          cy.clearCookies({ domain: null })
          cy.clearLocalStorage({ domain: null })
    })
    it('Place an order', () => {
      cy.loginViaUi(shoppers[4])
      onSideCartPage.cleanupTrolley()
      onFMSRibbon.getFMSRibbonAddressLink().click({waitForAnimations: false})
      onFMSAddressSelector.selectDeliveyAddress(refundsTestData.refundsOnCC.deliveryAddress)
      onFMSWindowSelector.selectAvailableDayAfterTomorrow()
      onFMSWindowSelector.selectLastTimeslot();
      onFMSWindowSelector.getContinueShoppingButton().click()
      onSearchResultsPage.addRandomProductsFromEachDepartmentToCartUntilReachSpendThreshold(refundsTestData.refundsOnCC.orderMinAmount)
      onSideCartPage.getViewCartButton().click()
      onSideCartPage.gotoCheckout()
      
      onHaveYouForgottenPage.continueToCheckout()
      
      onCheckoutPage.onCheckoutFulfilmentSelectionPanel.getSummarisedFulfilmentAddressElement().then(address => {
        cy.wrap(address.text()).as('expectedAddress')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentDay().then(fulfilmentDay => {
        cy.wrap(fulfilmentDay).as('expectedFulfilmentDay')
      })

      onCheckoutPage.onCheckoutFulfilmentWindowPanel.getSummarisedFulfilmentTime().then(fulfilmentTime => {
        cy.wrap(fulfilmentTime).as('expectedFulfilmentTime')
      })

      onCheckoutPage.onCheckoutPaymentPanel.getPaymentTotalAmountElement().then(totalAmount => {
        cy.wrap(totalAmount.text()).as('expectedTotalAmount')
      })

      onCheckoutPage.onCheckoutPaymentPanel.payWithExistingCreditCard('0001', '4050')

      // Verify order confirmation page
      onOrderConfirmationPage.getOrderConfirmationHeader().should('be.visible').and('have.text', 'Order received')
      cy.url().should('include', '/confirmation')

      cy.get('@expectedAddress').then(expectedAddress => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedAddress)
      })

      cy.get('@expectedFulfilmentDay').then(expectedFulfilmentDay => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentDay)
      })
      
      cy.get('@expectedFulfilmentTime').then(expectedFulfilmentTime => {
        onOrderConfirmationPage.getConfirmationFulfilmentDetailsContentElement().should('contain.text', expectedFulfilmentTime)
      })

      cy.get('@expectedTotalAmount').then(expectedTotalAmount => {
        onOrderConfirmationPage.getOrderPaymentSummaryTotalAmountElement().should('contain.text', expectedTotalAmount)
      })

      onOrderConfirmationPage.getOrderNumberElement().then(function($orderidElement) {
        orderId = $orderidElement.text()
        orderId = orderId.trim()
        cy.wait(20000) //waiting for some time for the order to come in SM
      })
    })
    //get first stock code in the order from SM and wrap it as 'firstStockCode' for later use
    it('get stock code from the order in SM', () => {
      cy.siteManagementLoginViaUi(smLogins.email, smLogins.password);
      cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT);
      cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH);
      cy.searchOrder(orderId)
      onOrderManagement.getFirstStockCodeInOrder()
      cy.get('@firstStockCode').then(firstStockCodeVal => {
        firstStockCode = firstStockCodeVal.trim()       
      })
    })
    it.skip('dispatch full order from ECF', () => {
      //added wait to manually dispatch the order in ECF till ECF APIs are developed and automated
      cy.wait(60000)
    })
    //create refund, get refund and goodwill amounts and wrap them as 'refundTotal' and 'goodwillTotal' for later use
    it.skip('create a refund with good will for one stock code', () => {
      refundTime=new Date()
      cy.siteManagementLoginViaUi(smLogins.email, smLogins.password);
      cy.selectTopMenu(HomepageTopMenu.ORDER_MANAGEMENT);
      cy.selectOrderManagementSubMenu(OrderManagementMenu.CUSTOMER_SEARCH);
      cy.searchOrder(orderId)
      onOrderManagement.generateRefundInSiteManagement(firstStockCode, 'Damaged Item', 'test comment', '1', '1')
      onOrderManagement.getRefundIdTitleHearder().invoke('text').then(($refundIdHeader) => {
        refundId = $refundIdHeader.substring($refundIdHeader.indexOf(":")+1, $refundIdHeader.length).trim()
      })
      cy.get('@refundTotalCapture').then(refundTotalVal => {
        refundTotal = refundTotalVal
        //verify refund created on credit card
        refundTotalFloat = parseFloat(refundTotal).toFixed(2)
        cy.contains('td', 'CreditCard').its('length').should('eq',1)
        cy.contains('td', 'CreditCard').prev().should('contain', refundId)
        cy.contains('td', 'CreditCard').next().next().next().should('contain', refundTotalFloat.toString())
        cy.contains('td', 'CreditCard').next().next().next().next().invoke('text').then((processText)=> {
          expect(processText).to.be.oneOf(["Processed","Pending"])
        })
        cy.contains('td', 'CreditCard').next().next().next().next().next().next().next().should('contain', 'Payment')
        cy.contains('td', 'CreditCard').next().next().next().next().next().next().next().next().should('contain', 'False')
        cy.contains('td', 'CreditCard').next().next().next().next().next().next().next().next().next().should('contain', 'CreditCard')
      })
      
      //verify goodwill created as store credit
      cy.get('@goodwillTotalCapture').then(goodwillTotalVal => {
        goodwillTotal = goodwillTotalVal
        goodwillTotalFloat = parseFloat(goodwillTotal).toFixed(2)
        cy.contains('td', 'StoreCredit').its('length').should('eq',1)
        cy.contains('td', 'StoreCredit').prev().should('contain', refundId)
        cy.contains('td', 'StoreCredit').next().next().next().should('contain', goodwillTotalFloat.toString())
        cy.contains('td', 'StoreCredit').next().next().next().next().should('contain', 'Processed')
        cy.contains('td', 'StoreCredit').next().next().next().next().next().next().next().should('contain', 'Goodwill')
        cy.contains('td', 'StoreCredit').next().next().next().next().next().next().next().next().should('contain', 'True')
        cy.contains('td', 'StoreCredit').next().next().next().next().next().next().next().next().next().should('contain', 'StoreCredit')
      })
    })
    //verify refund emial
    it.skip('verify refund email' ,() => {
      cy.wait(45000) ,{receivedAfter: refundTime}
      cy.mailosaurGetMessage(Cypress.env('mailosaur_serverId'), {sentTo: 'uat_cypresstest@82f8rhkb.mailosaur.net'},{receivedAfter: refundTime},{subject: 'Woolworths Online Notification'}).then(email => {
        expect(email.subject).to.equal('Woolworths Online Notification')
        expect(email.from[0].email).to.equal('shoponline@woolworths.com.au')
        const dom = new JSDOM(email.html.body);
        const el = dom.window.document.querySelector('table.table tbody');
        const emailText = el.textContent;
        // const emailText = 'Hi UAT, Please see below for refund details regarding order number 140149201.  Your credit/debit card used for payment will be refunded with the amount of $22.60. You\’ll receive your refund in the next 3-5 days, depending on your financial institution\’s processing times.   A store credit of $22.60 has been added to your account. Please enter the coupon code SCXDn-Tg-izG at checkout to redeem the next time you shop with Woolworths Online and Everyday Market from Woolworths. Minimum spend of $50 applies. Coupon valid until 6 Apr 2024.Coupon Code:Expiry Date:Amount: SCXDn-Tg-izG 6 Apr 2024$22.60We look forward to seeing you online again soon,Your Woolworths Online TeamLet Olive, your Woolworths Digital Team Member, know how she can help.This email was sent by Woolworths Group Limited, ABN 88 000 014 675,1 Woolworths Way, Bella Vista, NSW 2153.Make sure you addnoreply@onlineemails.woolworths.com.au to your address book and safe list. You have received this email as this is a service announcement and not apromotional email. Emails to this address will not be responded to. If youneed any further information feel free to call us on 1800 000 610.If you have an enquiry about why you received this email, please see our fullTerms and Conditions.Need help? Check out ourhandy FAQ\'sor Chat live with us oncontact us page.';
        expect(emailText).to.include('Please see below for refund details regarding order number '+ orderId)
        expect(emailText).to.include("Your credit/debit card used for payment will be refunded with the amount of $"+refundTotalFloat.toString()+". You\’ll receive your refund in the next 3-5 days, depending on your financial institution\’s processing times.")
        expect(emailText).to.include('A store credit of $'+goodwillTotalFloat.toString()+' has been added to your account.')
        const regEx = new RegExp('[A-Za-z0-9]{5}\-[A-Za-z0-9]{2}\-[A-Za-z0-9]{3}')
        const storeCreditCoupon = regEx.exec(emailText)
        console.log("storecredit: " + storeCreditCoupon[0])
        expect(emailText).to.include('Please enter the coupon code '+storeCreditCoupon[0]+' at checkout to redeem the next time you shop with Woolworths Online and Everyday Market from Woolworths. Minimum spend of $50 applies.')
        const emailTextWithTable = emailText.substring(emailText.indexOf('Coupon Code:'), emailText.indexOf('We look forward to seeing you online again soon'))
        expect(emailTextWithTable).to.include('Coupon Code:')
        expect(emailTextWithTable).to.include('Expiry Date:')
        expect(emailTextWithTable).to.include('Amount:')
        expect(emailTextWithTable).to.include(storeCreditCoupon[0])
        cy.addYearsToCurrentDate('2').then((scExpiryDate) => {
          expect(emailText).to.include('Minimum spend of $50 applies. Coupon valid until '+scExpiryDate+'.')
          expect(emailTextWithTable).to.include(scExpiryDate)
        })
        expect(emailText).to.include('Olive, your Woolworths Digital Team Member, know how she can help.')
      })
    })
  })
})


