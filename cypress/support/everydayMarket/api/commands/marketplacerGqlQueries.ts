export const getInvoiceDetailsQuery = `query ($id: ID!)
{
  node(id: $id)
  { __typename ... on Invoice
    { id legacyId order
      {
        id
        createdAt
        aggregateInvoiceStatus
        aggregateInvoiceStatusFinal
        externalIds
        {
          key
          value
        }
      }
      externalIds
      {
        key
        value
      }
      amendments
      {
        id
        taxCents
        lineItems
        {
          id
          quantity
          status
          amountCents
          custom
          quantity
          status
          totalCents
        }
        remittanceCents
        totalCents
        taxCents
        invoice{
          commissionAmountCents
          refundRequests{
            cashAmountCents
            refundAmountCents
            recoveredAmountCents
            totalCents
            cashAmountCents
            refundAmountCents
            giftCardAmountCents
          }
        }
      }
      status
      refundRequests
      {
        cashAmountCents
        invoice
        {
          id
        }
        refundAmountCents
        returnedConsignments
        {
          filename
        }
      }
      seller
      {
        id
        businessName
        businessNumber
        
      }
      order{
        metadata{
          key
          value
        },
        messageToSeller
      }
      shipments
      {
        id
        carrier
        trackingLink
        trackingNumber
      }
      shippingDescription
      shippingFromLocationMessage
      lineItems
      {
        id
        status
        statusFull
      }
    }
  }
}`
