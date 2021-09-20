export function validateEvents (response, expectedEventName, expectedEventCount) {
  cy.log('Expected Event Name: ' + expectedEventName + ' , expected count: ' + expectedEventCount)
  const events = response.data.filter(event => event.domainEvent === String(expectedEventName))
  cy.log('Expected events: ' + JSON.stringify(events))
  events.forEach(event => {
    // Verify the event contents
    expect(event.domainEvent).to.be.equal(expectedEventName)
    expect(event.payload).to.not.be.null
  })
  // Verify there are only expectedEventCount events
  expect(events).to.have.length(expectedEventCount)
}

export function validateOrderApiAgainstTrader (marketOrderApiData) {
  cy.get('@confirmedTraderOrder').then((traderData) => {
    expect(marketOrderApiData.orderId).to.equal(traderData.Order.OrderId)
    expect(marketOrderApiData.orderReference).to.equal(traderData.Order.OrderReference)
    expect(marketOrderApiData.shippingAmount).to.equal(traderData.Order.MarketShippingFee)
    expect(marketOrderApiData.invoices.reduce(function (accumulator, invoice) {
      return accumulator + invoice.invoiceTotal
    }, 0)).to.equal(traderData.Order.MarketSubtotal)
  })
}
