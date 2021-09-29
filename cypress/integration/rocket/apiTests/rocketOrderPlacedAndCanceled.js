/// <reference types="cypress" />

import rocketOrderInfo from '../../../fixtures/rocketOrder/rocketOrderInfo.json'
import rocketCancelOrderInfo from '../../../fixtures/rocketOrder/rocketCancelOrderInfo.json'
import TestFilter from '../../../support/TestFilter'
import '../../../support/rocket/api/commands/createAndCancelOrder'
import '../../../support/utilities/ui/utility'
const faker = require('faker/locale/en_AU')
const dateNow = new Date()
const moment = require('moment')

TestFilter(['B2C-API'], () => {
  describe('Rocket orderID is created,saved and published successfully', () => {
    before(() => {
      cy.clearCookies({ domain: null })
      cy.clearLocalStorage({ domain: null })
      cy.getDOB('personal').then((value) => {
        rocketOrderInfo.dateOfBirth = value
      })
    })
    let orderId
    let cancelCreatedOn
    let cancelLastUpdatedOn
    const orderDeliveryDate = new Date(dateNow.setDate(dateNow.getDate() + 1))
    const orderCancelDate = new Date(dateNow.setDate(dateNow.getDate() + 2))
    const orderDeliveryEndDate = new Date(orderDeliveryDate.setDate(orderDeliveryDate.getDate() + 3))
    const orderDeliveryAmendDate = moment(orderDeliveryDate).format('dddd, Do MMMM')
    const deliveryDate = orderDeliveryDate.toISOString().substring(0, orderDeliveryDate.toISOString().indexOf('T'))
    rocketOrderInfo.createdDate = dateNow.toISOString()
    rocketOrderInfo.originalOrderCreatedDate = dateNow.toISOString()
    rocketOrderInfo.deliveryDate = deliveryDate
    const OrderRefRandom = faker.datatype.uuid()
    const orderRef = OrderRefRandom.split('-').pop()
    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const email = firstName + '.' + lastName + '@testwoolies.com'
    rocketOrderInfo.orderRef = orderRef
    rocketOrderInfo.shopper.firstName = firstName
    rocketOrderInfo.shopper.lastName = lastName
    rocketOrderInfo.shopper.email = email
    rocketOrderInfo.shopper.homePhone = faker.phone.phoneNumber('04########')
    rocketOrderInfo.shopper.mobilePhone = faker.phone.phoneNumber('04########')
    rocketOrderInfo.deliveryWindow.startTime = orderDeliveryDate.toISOString()
    rocketOrderInfo.deliveryWindow.endTime = orderDeliveryEndDate.toISOString()
    rocketOrderInfo.orderReference = OrderRefRandom
    rocketOrderInfo.amendmentCutOffDay = orderDeliveryAmendDate
    rocketCancelOrderInfo.cancelledDateTime = orderCancelDate
    rocketCancelOrderInfo.orderReference = OrderRefRandom
    rocketCancelOrderInfo.deliveryDate = orderDeliveryDate

    it('Should create the OrderID successfully', () => {
      cy.createRocketOrderViaApi(rocketOrderInfo).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('orderStatus', 'Placed')
        expect(response.body).to.have.property('orderSource', 'UBR')
        expect(response.body).to.have.property('orderReference', OrderRefRandom)
        expect(response.body.orderId).to.be.above(0)
        orderId = response.body.orderId
      }).then(() => {
        // Should create the same OrderID number for same reference number and order source
        cy.createRocketOrderViaApi(rocketOrderInfo).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('orderId', orderId)
        })
      }).then(() => {
        // Should cancel the created order successfully
        rocketCancelOrderInfo.orderId = orderId
        cy.cancelRocketOrderViaApi(rocketCancelOrderInfo, orderId).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('orderId', orderId)
          expect(response.body).to.have.property('orderStatus', 'Cancelled')
          expect(response.body).to.have.property('orderReference', OrderRefRandom)
          cancelCreatedOn = response.body.createdOn
          cancelLastUpdatedOn = response.body.lastUpdatedOn
        })
      }).then(() => {
        // Should not change the created and updated cancellation time for same order
        rocketCancelOrderInfo.orderId = orderId
        cy.cancelRocketOrderViaApi(rocketCancelOrderInfo, orderId).then((response) => {
          expect(response.status).to.eq(200)
          expect(response.body).to.have.property('orderId', orderId)
          expect(response.body).to.have.property('orderStatus', 'Cancelled')
          expect(response.body).to.have.property('orderReference', OrderRefRandom)
          expect(response.body).to.have.property('createdOn', cancelCreatedOn)
          expect(response.body).to.have.property('lastUpdatedOn', cancelLastUpdatedOn)
        })
      })
    })

    it('Should fail for order not placed', () => {
      rocketOrderInfo.status = 'dispatched'
      cy.createRocketOrderViaApi(rocketOrderInfo).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body.errors[0]).to.have.property('errorType', 'OrderStatusNotPlaced')
      })
    })

    it('Should fail cancellation for incorrect orderID ', () => {
      rocketCancelOrderInfo.orderId = 123
      cy.cancelRocketOrderViaApi(rocketCancelOrderInfo, 123).then((response) => {
        expect(response.status).to.eq(404)
        expect(response.body.errors[0]).to.have.property('errorType', 'OrderNotFound')
      })
    })
  })
})
