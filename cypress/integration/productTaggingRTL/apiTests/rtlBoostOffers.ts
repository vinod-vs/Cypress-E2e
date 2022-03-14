/// <reference types="cypress" />

import rtlUser from "../../../fixtures/productTaggingRTL/rtlUser.json";
import rtlPatchData from "../../../fixtures/productTaggingRTL/rtlPatchData.json";
import rtlGetOffersData from "../../../fixtures/productTaggingRTL/rtlGetOffersData.json";
import rtlAddToCartData from "../../../fixtures/productTaggingRTL/rtlAddToCartData.json";
import TestFilter from "../../../support/TestFilter";
import "../../../support/productTaggingRTL/api/commands/productTaggingRTL";
import "../../../support/login/api/commands/login";
import "../../../support/logout/api/commands/logout";
import "../../../support/sideCart/api/commands/clearTrolley";
import "../../../support/utilities/ui/utility";
import { Console } from "console";

TestFilter(["B2C", "API", "P0", "RTL"], () => {
  describe("[API] Verify the Product Tagging Service after boost and unboost RTL offers", () => {
    before(() => {
      cy.clearCookies({ domain: null });
      cy.clearLocalStorage({ domain: null });
    });
    
    let sku = rtlGetOffersData.stockcodes[0]
    const stockCode = sku.toString()
    it(`Should login as Rewards User and boost the offer after adding to Cart`, () => {
      cy.loginViaApi(rtlUser).then((response: any) => {
        
        expect(response).to.have.property('LoginResult', 'Success')

        cy.productSearchByStockCode(rtlGetOffersData).then((response : any) => {
          
          expect(response.body.SearchCount.ProductCount).to.eql(1)
        });

        
        // To get the offer ID for RTL offer on the product
        cy.getRtlOffers(rtlGetOffersData).then((response : any) => {
          
          const offerID = response.tags[0].metadata.OfferId;
          
          //Verify if the list of stockcodes include the required stockcode
          expect(response.tags[0].metadata.Stockcodes).to.include(stockCode);

          rtlAddToCartData.stockcode = stockCode;
          rtlAddToCartData.searchTerm = stockCode;
          rtlAddToCartData.offerId = offerID;

          cy.addToCart(rtlAddToCartData).then((response : any) => {

            expect(response.AvailableItems[0]).to.have.property('Stockcode', sku)
            
          });
        });

        //Verify if offer is boosted after the product is added to Cart
        cy.getRtlOffers(rtlGetOffersData).then((response : any) => {
          const hashCrn = response.tags[0].metadata.HashCrn;
          const offerType = response.tags[0].metadata.OfferType;
          const titleText = response.tags[0].metadata.TitleText;
          const status = response.tags[0].metadata.Status;

          expect(titleText).to.eql("Collect 100 points");
          expect(offerType).to.eql("TIGER");
          expect(status).to.eql("Activated");
          expect(hashCrn).to.eql(rtlGetOffersData.hashCrn);

          rtlPatchData.hashCrn = hashCrn;
          rtlPatchData.offerId = response.tags[0].metadata.OfferId;

          //Send PATCH to de-activate the offer
          cy.patchRtlUnboost(rtlPatchData).then((response : any) => {
            expect(response.body).to.eql(true);
          });
        });

        //Clear the trolley
        cy.clearTrolley().then((response: any) => {
          expect(response).to.have.property("TrolleyItemCount", 0);
          expect(response).to.have.property("TotalTrolleyItemQuantity", 0);
        });

        //Verify if the offer status is changed to NotActivated after Patch API, once user logs out offer will change back to 'Boosted' state
        cy.getRtlOffers(rtlGetOffersData).then((response : any) => {
          expect(response.tags[0].metadata.Status).to.eql("NotActivated");
          
        });
      });

      //product Tagging service gets offer activation information from CSL after logging out, So when user logs in again, offer will remain boosted
      cy.logOutViaApi()
    });
  });
});
