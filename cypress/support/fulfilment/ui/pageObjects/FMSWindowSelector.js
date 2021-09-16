
export class FMSWindowSelector
{
    getDayDropdown()
    { 
        return cy.get('[class="day-dropdown ng-untouched ng-pristine ng-valid"]');
    }

    getContinueShoppingButton()
    {
        return cy.get('button[class="shopper-action m mobile-full-width"]');
    }

    getMorningTimeSlotList()
    {
        return cy.get('div[class="time-slots ng-star-inserted"] > wow-time-slots-column-side-cart').eq(0).get('.time-slot-list > section > div');
    }

    getAfternoonTimeSlotList()
    {
        return cy.get('div[class="time-slots ng-star-inserted"] > wow-time-slots-column-side-cart').eq(1).get('.time-slot-list > section > div');
    }

    getEveningTimeSlotList()
    {
        return cy.get('div[class="time-slots ng-star-inserted"] > wow-time-slots-column-side-cart').eq(2).get('.time-slot-list > section > div');
    }

    getAllTimeSlotList()
    {
        return cy.get('.time-slot-list > section > div');
    }


    selectSameDay()
    {
        this.selectDayByKeyword('Today');
    }

    selectNextDay()
    {
        this.selectDayByKeyword('Tomorrow');
    }

    selectLatestAvailableDay()
    {
        this.selectDayByKeyword();
    }

    selectDayByKeyword(dayKeyword = "undefined")
    {
        cy.get('[class="day-dropdown ng-untouched ng-pristine ng-valid"] > option').each((dayOption, index) => {

            if(index == 0 || dayOption.text().includes('Closed'))
            {
                return true;
            }

            if(!dayOption.text().includes('Closed') && (dayKeyword == "undefined" || dayOption.text().includes(dayKeyword)))
            {
                this.getDayDropdown().select(dayOption.text());
                return false;
            }
            else
            {
                throw new Error("Test failed. Unable to find given day: " + dayKeyword);
            }
        })
    }

    selectTimeSlotByStartTimeEndTime(startTime, endTime = 'undefined')
    {
        this.selectTimeSlotStartFromIndex(0, startTime, endTime);
    }

    selectFirstTimeslot()
    {
        this.getAllTimeSlotList().first().find('input').check({force: true});
    }

    selectLastTimeslot()
    {
        this.getAllTimeSlotList().last().find('input').check({force: true});
    }

    selectTimeSlotStartFromIndex(index, startTime, endTime = 'undefined')
    {
        let found = false;

        this.getAllTimeSlotList().its('length').then(len => {

            if(index >= len)
            {
                throw new Error("Test failed. Unable to find given time slot: " + startTime + " to " + endTime);
            }

            this.getAllTimeSlotList().eq(index).find('.time-slot-text').invoke('text').then(windowTimeText => {

                let startTimeOnLabel = windowTimeText.substring(0, windowTimeText.indexOf('to')).trim();
                let endTimeOnLabel = windowTimeText.substring(windowTimeText.indexOf('to') + 2).trim();
    
                if(startTimeOnLabel.toLowerCase() == startTime.toLowerCase() && (endTime == 'undefined' || endTimeOnLabel.toLowerCase() == endTime.toLowerCase()))
                {
                    this.getAllTimeSlotList().eq(index).find('input').check({force: true});
                    found = true;
                    return false;
                }
            })
            .then(()=>{

                if(!found)
                {
                    this.selectTimeSlotStartFromIndex(++index, startTime, endTime);
                }
            })
        })
    }
}

export const onFMSWindowSelector = new FMSWindowSelector();