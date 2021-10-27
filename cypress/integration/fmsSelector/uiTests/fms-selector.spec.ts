/// <reference types="Cypress" />
/// <reference types="cypress-iframe" />

import '../../../support/login/ui/commands/login'
import b2cShoppers from '../../../fixtures/login/b2cShoppers.json'
import { onFMSAddressSelector } from '../../../support/fulfilment/ui/pageObjects/FMSAddressSelector'
import { onFMSRibbon } from '../../../support/fulfilment/ui/pageObjects/FMSRibbon'
import { onFMSWindowSelector } from '../../../support/fulfilment/ui/pageObjects/FMSWindowSelector'
import { onSideCartPage } from '../../../support/sideCart/ui/pageObjects/SideCartPage'
import { onCheckoutFulfilmentPanel } from '../../../support/checkout/ui/pageObjects/CheckoutFulfilmentPanel'
import { onCheckoutReviewItemsPanel } from 'cypress/support/checkout/ui/pageObjects/CheckoutReviewItemsPanel'
import { onCheckoutTimePanel } from 'cypress/support/checkout/ui/pageObjects/CheckoutTimePanel'

describe('B2C checkout', () => {
  it('FMS selector sanity test', () => {
    cy.visit('shop/securelogin')
    cy.url().should('include', '/securelogin')

    cy.loginViaUi(b2cShoppers[3])

    //onFMSRibbon.getFMSRibbonAddressLink().click();

    // //workflow 1
    // onFMSAddressSelector.getDeliveryTab().click();
    // onFMSAddressSelector.getAddNewDeliveryAddressButton().click();
    // onFMSAddressSelector.searchForNewAddress("407-419 Elizabeth Street, SURRY HILLS  NSW");
    // onFMSAddressSelector.getSaveAndContinueButton().click();

    //workflow 2
    // onFMSAddressSelector.getDeliveryTab().click();
    // onFMSAddressSelector.selectSavedAddressByKeyword('PENDLE HILL');
    // onFMSAddressSelector.getSaveAndContinueButton().click();

    // //workflow 3
    // onFMSAddressSelector.getPickupTab().click();
    // onFMSAddressSelector.searchForStoreBySuburbName("cherrybrook");
    // onFMSAddressSelector.getSaveAndContinueButton().click();

    // //workflow 4
    // onFMSAddressSelector.getPickupTab().click();
    // onFMSAddressSelector.searchForStoreByPostcode(2154);
    // onFMSAddressSelector.getSaveAndContinueButton().click();

    //workflow 5
    // onFMSRibbon.getFMSRibbonWindowLink().click();
    // onFMSWindowSelector.selectNextAvailableDay();
    // onFMSWindowSelector.selectDayByKeyword("Mon")
    // onFMSWindowSelector.selectLastTimeslot();
    // onFMSWindowSelector.selectTimeSlotByTime('6:00 pm', '11:00 pm')
    // onFMSWindowSelector.getContinueShoppingButton().click()

    // site cart
    onSideCartPage.getViewCartButton().click()
    // onSideCartPage.checkIfSidecartIsEmpty()
    // const nameList = ['Blackmores Total Calcium Magnesium', 'Colgate Plax Alcohol Free Mouthwash Peppermint']
    // onSideCartPage.removeAllItems()
    // onSideCartPage.removeItemByName('Don Ham Leg Honey Roasted Shaved 250g');
    // onSideCartPage.modifyItemQuantity('Wolf Blass Cabernet Sauvignon 750ml', 2)
    onSideCartPage.getCheckoutButton().click();

    cy.wait(5000);

    // //checkout step 1
    // onCheckoutFulfilmentPanel.getChangeFulfilmentButton().click();
    // onCheckoutFulfilmentPanel.selectSavedAddressByKeyword('DOUBLE BAY');
    // onCheckoutFulfilmentPanel.getSaveDetailsButton().click();

    onCheckoutTimePanel.getChangeTimeButton().click();
    //onCheckoutTimePanel.selectDayByKeyword('Monday');
    //onCheckoutTimePanel.selectDayHavingFleetWindow(0);
    onCheckoutTimePanel.selectFirstAvailableFleetTimeWindow();

    // onCheckoutReviewItemsPanel.setGroceriesPackageOption("Reusable bags")
    // onCheckoutReviewItemsPanel.modifyItemQuantityByName("Hass Avocado Each", 5);
    // onCheckoutReviewItemsPanel.modifyItemQuantityByName("Pepsi Max Cans 10x375ml", 3);
    //onCheckoutReviewItemsPanel.removeItemByName("Fresh Broccoli Each");
    // onCheckoutReviewItemsPanel.changeSubstitutionsByProductName("Hass Avocado Each", false);
    // onCheckoutReviewItemsPanel.changeSubstitutionsByProductName("Bushells Turkish Coffee 250g", true);
    // onCheckoutReviewItemsPanel.addOrEditPersonalShopperNoteToProduct("Hass Avocado Each", "Green and fresh please check");
    // onCheckoutReviewItemsPanel.getSaveDetailsButton().click();
  })
})
