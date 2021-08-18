export function verifyEventDetails (response, expectedEventIndex, expectedEventName, expectedTotalEventsLength, testData, shopperId) {
  // Verify the event contents
  expect(response.data[expectedEventIndex].orderId).to.equal(Number(testData.orderId))
  expect(response.data[expectedEventIndex].orderReference).to.be.equal(testData.orderReference)
  expect(response.data[expectedEventIndex].shopperId).to.be.equal(Number(shopperId))
  expect(response.data[expectedEventIndex].domainEvent).to.be.equal(expectedEventName)
  expect(response.data[expectedEventIndex].payload).to.not.be.null
  // Verify there are only expectedTotalEventsLength events
  expect(response.data).to.have.length(expectedTotalEventsLength)
}

export function verifyCommonOrderDetails (response, testData, shopperId) {
  // Order details
  expect(response.orderId).to.equal(Number(testData.orderId))
  expect(response.orderReference).to.be.equal(testData.orderReference)
  expect(response.shopperId).to.be.equal(Number(shopperId))
  expect(response.orderStatus).to.be.equal('Placed')
  expect(response.thirdPartyOrderId).to.not.be.null
  expect(response.thirdPartyName).to.be.equal('Marketplacer')
  expect(response.createdTimeStampUtc).to.not.be.null
  expect(response.shippingPdfLink).to.not.be.null
  expect(response.shippingAmount).to.not.be.null
  expect(response.invoices.length).to.be.equal(1)
}
