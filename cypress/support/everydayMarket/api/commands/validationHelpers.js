export function validateEvents (response, expectedEventIndex, expectedEventName) {
  // Verify the event contents
  expect(response.data[expectedEventIndex].domainEvent).to.be.equal(expectedEventName)
  expect(response.data[expectedEventIndex].payload).to.not.be.null
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
