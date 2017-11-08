# coding=utf-8
from babel import Locale

country_choices = map(lambda (country_code, country_name): {'value': country_code, 'label': country_name},
                      Locale('en', 'GB').territories.iteritems())

kyc_steps = [
    {
        'type': 'PersonInfo',
        'sub_type': 'FirstGivenName',
        'message': 'Please enter your first name',
        'order': 0
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'FirstSurName',
        'message': 'Please enter your surname',
        'order': 1
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'MiddleName',
        'message': 'Please enter your middle name',
        'order': 2
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'ISOLatin1Name',
        'message': 'Please enter your full name',
        'order': 3
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'FullName',
        'message': 'Please enter your full name',
        'order': 4
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'DayOfBirth',
        'message': 'Please select your birth date',
        'widget': 'SelectDateWidget',
        'order': 5
    },
    {
        'type': 'PersonInfo',
        'sub_type': 'Gender',
        'message': 'Please enter your gender',
        'widget': 'SelectSingleWidget',
        'choices': [{'value': 'M', 'label': 'Male'}, {'value': 'F', 'label': 'Female'}],
        'order': 6
    },
    {
        'type': 'Communication',
        'sub_type': 'Telephone',
        'message': 'Please enter your phone number',
        'keyboard_type': 'PHONE',
        'order': 7
    },
    {
        'type': 'Communication',
        'sub_type': 'MobileNumber',
        'message': 'Please enter mobile phone number',
        'keyboard_type': 'PHONE',
        'order': 8
    },
    {
        'type': 'Communication',
        'sub_type': 'EmailAddress',
        'message': 'Please enter your email address',
        'keyboard_type': 'EMAIL',
        'order': 9
    },
    {
        'type': 'Location',
        'sub_type': 'StreetName',
        'message': 'Please enter the street name of your home address',
        'order': 10
    },
    {
        'type': 'Location',
        'sub_type': 'BuildingNumber',
        'message': 'Please enter the building number of your home address',
        'order': 11
    },
    {
        'type': 'Location',
        'sub_type': 'BuildingName',
        'message': 'Please enter the name of the building of your home address',
        'order': 12
    },
    {
        'type': 'Location',
        'sub_type': 'UnitNumber',
        'message': 'Please enter the flat/unit/apartment number of your home address',
        'order': 13
    },
    {
        'type': 'Location',
        'sub_type': 'StreetType',
        'message': 'Please enter the street type of your home address (Typically St, Rd, etc.)',
        'order': 14
    },
    {
        'type': 'Location',
        'sub_type': 'Suburb',
        'message': 'Please enter the suburb / subdivision / municipality of your home address',
        'order': 15
    },
    {
        'type': 'Location',
        'sub_type': 'POBox',
        'message': 'Please enter your Post Office Box number',
        'order': 16
    },
    {
        'type': 'Location',
        'sub_type': 'PostalCode',
        'message': 'Please enter the postal code of your home address.',
        'order': 17
    },
    {
        'type': 'Location',
        'sub_type': 'City',
        'message': 'Please enter the city of your home address',
        'order': 18
    },
    {
        'type': 'Location',
        'sub_type': 'Country',
        'message': 'Please enter the country of your home address.',
        'widget': 'SelectSingleWidget',
        'choices': country_choices,
        'order': 19
    },
    {
        'type': 'DriverLicense',
        'sub_type': 'Number',
        'message': 'Please enter your Driver\'s License Number',
        'order': 20
    },
    {
        'type': 'DriverLicense',
        'sub_type': 'State',
        'message': 'Please enter the state of issue for your Driver\'s License',
        'order': 21
    },
    {
        'type': 'DriverLicense',
        'sub_type': 'DayOfExpiry',
        'message': 'Please select the expiry date of your Driver\'s License',
        'widget': 'SelectDateWidget',
        'order': 22
    },
    {
        'type': 'NationalIds',
        'sub_type': 'Number',
        'message': 'Please enter your national id number',
        'order': 23
    },
    {
        'type': 'NationalIds',
        'sub_type': 'DistrictOfIssue',
        'message': 'Please enter the district that issued your national ID',
        'order': 24
    },
    {
        'type': 'NationalIds',
        'sub_type': 'CityOfIssue',
        'message': 'Please enter the city that issued your national ID',
        'order': 25
    },
    {
        'type': 'NationalIds',
        'sub_type': 'ProvinceOfIssue',
        'message': 'Please enter the province that issued your national ID',
        'order': 26
    },
    {
        'type': 'NationalIds',
        'sub_type': 'CountyOfIssue',
        'message': 'Please enter the county that issued your national ID',
        'order': 27
    },
    {
        'type': 'Passport',
        'sub_type': 'Mrz1',
        'message': 'Please take a picture of the front of your passport',
        'widget': 'PhotoUploadWidget',
        'order': 28
    },
    {
        'type': 'Passport',
        'sub_type': 'Mrz2',
        'message': 'Please take a picture of the back of your passport',
        'widget': 'PhotoUploadWidget',
        'order': 29
    },
    {
        'type': 'Passport',
        'sub_type': 'DayOfExpiry',
        'message': 'Please select the date of expiry of your passport',
        'widget': 'SelectDateWidget',
        'order': 30
    }
]
