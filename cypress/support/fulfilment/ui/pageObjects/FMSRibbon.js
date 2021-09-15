
export class FMSRibbon
{
    getHeaderFulfilmentSection()
    {
        return cy.get('.header-fulfilment__section');
    }

    getHeaderFulfilmentSectionArrow()
    {
        return cy.get('.header-fulfilment__section-arrow');
    }
    
    getFMSRibbonAddressLink()
    {
        return this.getHeaderFulfilmentSection().find('a').eq(0);
    }

    getFMSRibbonWindowLink()
    {
        return this.getHeaderFulfilmentSection().find('a').eq(1);
    }

    getFMSRibbonChangeAddressButton()
    {
        return this.getHeaderFulfilmentSectionArrow().find('span').eq(0);
    }

    getFMSRibbonChangeWindowButton()
    {
        return this.getHeaderFulfilmentSectionArrow().find('span').eq(1);     
    }
}

export const onFMSRibbon = new FMSRibbon();