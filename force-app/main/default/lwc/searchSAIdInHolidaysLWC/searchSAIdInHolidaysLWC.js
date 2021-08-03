import { LightningElement,api,track,wire} from 'lwc';
import searchSouthAfricaIdNumber from '@salesforce/apex/searchSAIdLWController.searchSouthAfricaIdNumber';

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
        this.hideContactFromDatabase = true;
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
                var contactWasInserted = true;
                if (contactWasInserted) {                    
                    //this.fireSuccessToast();
                } else {
                    console.log('First name was NOT updated');
                }
            })
            .catch(error => {
                console.log('error: ', error);
            });
    

    }
}