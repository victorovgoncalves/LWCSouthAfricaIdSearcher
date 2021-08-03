import { LightningElement,api,track,wire} from 'lwc';
import searchSouthAfricaIdNumber from '@salesforce/apex/searchSAIdLWController.searchSouthAfricaIdNumber';
import getRecordHolidaysByCallout from '@salesforce/apex/searchSAIdLWController.getRecordHolidaysByCallout';
import insertHolidayRecords from '@salesforce/apex/searchSAIdLWController.insertHolidayRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SearchSAIdInHolidaysLWC extends LightningElement {
    inputSouthAfricaIdNumber = '';
    inputBirthdate = '';
    inputGender = '';
    inputCitizenship = '';

    outputSouthAfricaIdNumber = '';
    outputBirthdate = new Date();
    outputGender = '';
    outputCitizenship = '';
    outputTimesSearched = '';

    hideSearchButton = true;
    showContactFromDatabase = false;
    
    changedSouthAfricaIdNumber(event){
        this.showContactFromDatabase = false;
        this.inputSouthAfricaIdNumber = event.target.value;
        var newvalue = this.inputSouthAfricaIdNumber;
        let inputfield = this.template.querySelector(".inputSAField");
        var errorMessage = '';
        var birthDayString = '';
        var today = new Date();
        console.log('SAId newvalue: '+newvalue);
        console.log('today year: '+today.getFullYear());
        console.log('inputfields: '+inputfield.value);

        if((2000+parseInt(newvalue.substr(0,2)))>parseInt(today.getFullYear().toString()))
        {            
            birthDayString = '19'+newvalue.substr(0,2)+'-'+newvalue.substr(2,2)+'-'+newvalue.substr(4,2);
        }
        else
        {
            birthDayString = '20'+newvalue.substr(0,2)+'-'+newvalue.substr(2,2)+'-'+newvalue.substr(4,2);
        }

        console.log('birthDayString : '+birthDayString);

        //var birthdayDate = new Date(Date.parse(birthDayString));
        /*console.log('parseInt(birthDayString.substr(0,4)): '+parseInt(birthDayString.substr(0,4)));
        console.log('parseInt(birthDayString.substr(5,2)): '+parseInt(birthDayString.substr(5,2)));
        console.log('parseInt(birthDayString.substr(8,2)): '+parseInt(birthDayString.substr(8,2)));*/
        //var birthdayDate = new Date(parseInt(birthDayString.substr(0,4)),parseInt(birthDayString.substr(5,2))-1,parseInt(birthDayString.substr(8,2)));
        var birthdayDate = new Date(birthDayString);
        console.log('birthdayDate '+birthdayDate);

        var genderCode = newvalue.substr(6,4);
        var citizenCode = newvalue.substr(10,1);
        //var checkSumCode = newvalue.substr(12,1);

        if(newvalue.toString().length != 13)
        {
            console.log('newvalue.toString().length : '+newvalue.toString().length);
            errorMessage = 'Enter a 13 digit number';
            inputfield.setCustomValidity(errorMessage);
            this.hideSearchButton = true;
        }
        else if(birthdayDate.toString() == 'Invalid Date')
        {            
            errorMessage = 'Invalid South Africa Id number';
            inputfield.setCustomValidity(errorMessage);
            this.hideSearchButton = true;
        }
        else if(citizenCode != '0' && citizenCode != '1')
        {            
            errorMessage = 'Invalid South Africa Id number';
            inputfield.setCustomValidity(errorMessage);
            this.hideSearchButton = true;
        }
        else
        {
            errorMessage = "";
            inputfield.setCustomValidity(errorMessage);            
            this.hideSearchButton = false;
            this.inputBirthdate = birthDayString;
            
            if(parseInt(genderCode)<=4999)
            {
                this.inputGender = 'Female';                
            }
            else
            {
                this.inputGender = 'Male';                
            }            
            if(parseInt(citizenCode)==0)
            {
                this.inputCitizenship = 'SA citizen';                
            }
            else
            {
                this.inputCitizenship = 'Permanent resident';                
            }

        }

    }
    searchId(event)
    {
        this.showContactFromDatabase = false;
        console.log('inputSouthAfricaIdNumber : '+this.inputSouthAfricaIdNumber);
        console.log('inputBirthdate : '+this.inputBirthdate);
        console.log('inputGender : '+this.inputGender);
        console.log('inputCitizenship : '+this.inputCitizenship);
        
        //@wire(searchSouthAfricaIdNumber, {contactSouthAfricaIdNumber: inputSouthAfricaIdNumber, contactBirthdayDate: inputBirthdate, contactGender: inputGender,contactCitizen: inputCitizenship});
        /*contactDMLMap({error,data}){
            if (data) {
                console.log('data of contactDMLMap: '+data);
            } else if (error) {
                console.log('error of contactDMLMap: '+error);
        }
    }*/
    
        searchSouthAfricaIdNumber({contactSouthAfricaIdNumber: this.inputSouthAfricaIdNumber, contactBirthdayDate: this.inputBirthdate, contactGender: this.inputGender,contactCitizen: this.inputCitizenship})
            .then(result => {
                console.log('retorno do apex:'+JSON.stringify(result));
                console.log('key[0]:'+Object.keys(result)[0]);
                
                
                var contactWasUpserted = true;
                if(Object.keys(result)[0] != '')
                {
                    contactWasUpserted = false;
                }

                if (contactWasUpserted) {         
                    console.log('contact upserted');
                    console.log('values[0]:'+Object.values(result)[0]);
                    var upsertedContactRecord = Object.values(result)[0];
                
                    this.outputSouthAfricaIdNumber = Object.values(result)[0].South_Africa_Id_Number__c;
                    this.outputBirthdate = Object.values(result)[0].Birthdate;
                    this.outputCitizenship = Object.values(result)[0].Citizenship__c;
                    this.outputTimesSearched = Object.values(result)[0].Times_Searched__c;
                    
                    getRecordHolidaysByCallout({contactRecord: Object.values(result)[0]})
                    .then(result => {

                        var returnedCalloutMap = result;
                        console.log('retorno do apex callout method: '+JSON.stringify(returnedCalloutMap));                      

                        if(Object.keys(returnedCalloutMap)[0] != 'We cannot find any holidays on your birthday, based on your South Africa Id number')
                        {
                            var holidaysOnBithdayJson = Object.values(returnedCalloutMap)[0];                    
                            var holidaysOnBithdayObj = JSON.parse(holidaysOnBithdayJson);
                            var holidaysOnBithdaySize = holidaysOnBithdayObj.response.holidays.length;
                            var holidaysResume = '';
                            var holidays = '';
                            var i = 0;
                            console.log('holidaysOnBithdaySize:'+holidaysOnBithdaySize);
                            console.log('holidaysOnBithdayJson:'+holidaysOnBithdayJson);
                            for(i=0; i<holidaysOnBithdaySize ; i++)
                            {                        
                                if(holidaysOnBithdayObj.response.holidays[i].date.iso == this.inputBirthdate.replace(/ /g, '-'))
                                {                            
                                    holidaysResume = holidaysResume+holidaysOnBithdayObj.response.holidays[i].description;
                                    if(holidays != '')
                                    {
                                        holidays = holidays + ',';
                                    }
                                    holidays = holidays + '{"Name":"'+holidaysOnBithdayObj.response.holidays[i].name+'",';
                                    holidays = holidays + '"Description__c":"'+holidaysOnBithdayObj.response.holidays[i].description+'",';
                                    holidays = holidays + '"Date__c":"'+holidaysOnBithdayObj.response.holidays[i].date.iso+'",';
                                    holidays = holidays + '"Type__c":"'+holidaysOnBithdayObj.response.holidays[i].type+'"}';
                                }
                            }

                            console.log('holidays to Apex: '+holidays);

                            if(holidays != '')
                            {                                
                                insertHolidayRecords({holidayList: holidays,contactRecord: upsertedContactRecord})
                                .then(result => {
                                    console.log('result of inserted holiday Records'+result);
                                })
                                .catch(error => {
                                    this.dispatchEvent(
                                        new ShowToastEvent({
                                            title: 'Error',
                                            type: 'error',
                                            message: error.toString(),                           
                                        }),
                                    );                
                                });
                            }

                            console.log('holidays:'+holidays);

                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: Object.keys(returnedCalloutMap)[0],
                                    variant: 'success',
                                    message: holidaysResume,             
                                }),
                            );
                        }
                        else{
                            this.dispatchEvent(
                                new ShowToastEvent({
                                    title: 'Sorry',
                                    type: 'error',
                                    message: Object.keys(returnedCalloutMap)[0],                           
                                }),
                            );
                        }
                        this.showContactFromDatabase = true;
                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error',
                                type: 'error',
                                message: error,                           
                            }),
                        );            
                    });

                    
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            type: 'error',
                            message: Object.keys(result)[0],                           
                        }),
                    );
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        type: 'error',
                        message: error,                           
                    }),
                );                
            });
    

    }
}