public with sharing class searchSAIdLWController {

    @AuraEnabled(Cacheable=false)
    public static Map<String,Contact> searchSouthAfricaIdNumber(Decimal contactSouthAfricaIdNumber,String contactBirthdayDate, String contactGender, String contactCitizen){
        Map<String,Contact> contactInsertLog = new Map<String,Contact>();
        String upsertErrors = '';

        Decimal searchHistory = 1;        
        Contact con = new Contact();
        List<Contact> contacts = new List<Contact>();
        contacts = [SELECT Id,South_Africa_Id_Number__c,Times_Searched__c FROM Contact WHERE South_Africa_Id_Number__c =: contactSouthAfricaIdNumber];
		
        if(contacts.size()>0)
        {
            if(contacts[0].Times_Searched__c != null){
                searchHistory = contacts[0].Times_Searched__c+1;
            }
        }
        
        con.Birthdate = Date.valueOf(contactBirthdayDate);
        con.South_Africa_Id_Number__c = contactSouthAfricaIdNumber;
        //LastName is required for salesforce contacts
        con.LastName = 'CloudSmithsTest'+String.valueOf(System.now());
        con.Gender__c = contactGender;
        con.Citizenship__c = contactCitizen;
        con.Times_Searched__c = searchHistory;
		
        System.debug('contact to Insert : '+con);
        try {
            upsert con South_Africa_Id_Number__c;
        }
        catch (DmlException e) {
            System.debug(e.getMessage());
            upsertErrors = e.getMessage();
        }

        contactInsertLog.put(upsertErrors,con);

        return contactInsertLog;
    }

}