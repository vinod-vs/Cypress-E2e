class PayPalPage {
    getPayPalSelectionStatusLocatorString() {
        return '.paypal-list-item > .digitalPayListItem.digitalPayListItem--selectable.digitalPayListItem--selected'
    }

    getPayPalSelectionLocatorString() {
        return '.paypal-list-item > .digitalPayListItem.digitalPayListItem--selectable'
    }

    getPayPalSelectedLocatorString() {
        return '.paypal-list-item > .digitalPayListItem.digitalPayListItem--selectable.digitalPayListItem--selected'
    }    
}

export default PayPalPage
