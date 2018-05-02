# coding=utf-8

unsupported_countries = ['CHN', 'KOR', 'PRK', 'SGP']
# import pycountry
# country_choices = sorted(
#     filter(lambda c: c['value'] not in unsupported_countries,
#            map(lambda country: {'value': country.alpha_3, 'label': country.name}, pycountry.countries)),
#     key=lambda c: c['label'])

country_choices = [{'label': u'Afghanistan', 'value': u'AFG'},
                   {'label': u'Albania', 'value': u'ALB'},
                   {'label': u'Algeria', 'value': u'DZA'},
                   {'label': u'American Samoa', 'value': u'ASM'},
                   {'label': u'Andorra', 'value': u'AND'},
                   {'label': u'Angola', 'value': u'AGO'},
                   {'label': u'Anguilla', 'value': u'AIA'},
                   {'label': u'Antarctica', 'value': u'ATA'},
                   {'label': u'Antigua and Barbuda', 'value': u'ATG'},
                   {'label': u'Argentina', 'value': u'ARG'},
                   {'label': u'Armenia', 'value': u'ARM'},
                   {'label': u'Aruba', 'value': u'ABW'},
                   {'label': u'Australia', 'value': u'AUS'},
                   {'label': u'Austria', 'value': u'AUT'},
                   {'label': u'Azerbaijan', 'value': u'AZE'},
                   {'label': u'Bahamas', 'value': u'BHS'},
                   {'label': u'Bahrain', 'value': u'BHR'},
                   {'label': u'Bangladesh', 'value': u'BGD'},
                   {'label': u'Barbados', 'value': u'BRB'},
                   {'label': u'Belarus', 'value': u'BLR'},
                   {'label': u'Belgium', 'value': u'BEL'},
                   {'label': u'Belize', 'value': u'BLZ'},
                   {'label': u'Benin', 'value': u'BEN'},
                   {'label': u'Bermuda', 'value': u'BMU'},
                   {'label': u'Bhutan', 'value': u'BTN'},
                   {'label': u'Bolivia, Plurinational State of', 'value': u'BOL'},
                   {'label': u'Bonaire, Sint Eustatius and Saba', 'value': u'BES'},
                   {'label': u'Bosnia and Herzegovina', 'value': u'BIH'},
                   {'label': u'Botswana', 'value': u'BWA'},
                   {'label': u'Bouvet Island', 'value': u'BVT'},
                   {'label': u'Brazil', 'value': u'BRA'},
                   {'label': u'British Indian Ocean Territory', 'value': u'IOT'},
                   {'label': u'Brunei Darussalam', 'value': u'BRN'},
                   {'label': u'Bulgaria', 'value': u'BGR'},
                   {'label': u'Burkina Faso', 'value': u'BFA'},
                   {'label': u'Burundi', 'value': u'BDI'},
                   {'label': u'Cabo Verde', 'value': u'CPV'},
                   {'label': u'Cambodia', 'value': u'KHM'},
                   {'label': u'Cameroon', 'value': u'CMR'},
                   {'label': u'Canada', 'value': u'CAN'},
                   {'label': u'Cayman Islands', 'value': u'CYM'},
                   {'label': u'Central African Republic', 'value': u'CAF'},
                   {'label': u'Chad', 'value': u'TCD'},
                   {'label': u'Chile', 'value': u'CHL'},
                   {'label': u'Christmas Island', 'value': u'CXR'},
                   {'label': u'Cocos (Keeling) Islands', 'value': u'CCK'},
                   {'label': u'Colombia', 'value': u'COL'},
                   {'label': u'Comoros', 'value': u'COM'},
                   {'label': u'Congo', 'value': u'COG'},
                   {'label': u'Congo, The Democratic Republic of the', 'value': u'COD'},
                   {'label': u'Cook Islands', 'value': u'COK'},
                   {'label': u'Costa Rica', 'value': u'CRI'},
                   {'label': u'Croatia', 'value': u'HRV'},
                   {'label': u'Cuba', 'value': u'CUB'},
                   {'label': u'Cura\xe7ao', 'value': u'CUW'},
                   {'label': u'Cyprus', 'value': u'CYP'},
                   {'label': u'Czechia', 'value': u'CZE'},
                   {'label': u"C\xf4te d'Ivoire", 'value': u'CIV'},
                   {'label': u'Denmark', 'value': u'DNK'},
                   {'label': u'Djibouti', 'value': u'DJI'},
                   {'label': u'Dominica', 'value': u'DMA'},
                   {'label': u'Dominican Republic', 'value': u'DOM'},
                   {'label': u'Ecuador', 'value': u'ECU'},
                   {'label': u'Egypt', 'value': u'EGY'},
                   {'label': u'El Salvador', 'value': u'SLV'},
                   {'label': u'Equatorial Guinea', 'value': u'GNQ'},
                   {'label': u'Eritrea', 'value': u'ERI'},
                   {'label': u'Estonia', 'value': u'EST'},
                   {'label': u'Ethiopia', 'value': u'ETH'},
                   {'label': u'Falkland Islands (Malvinas)', 'value': u'FLK'},
                   {'label': u'Faroe Islands', 'value': u'FRO'},
                   {'label': u'Fiji', 'value': u'FJI'},
                   {'label': u'Finland', 'value': u'FIN'},
                   {'label': u'France', 'value': u'FRA'},
                   {'label': u'French Guiana', 'value': u'GUF'},
                   {'label': u'French Polynesia', 'value': u'PYF'},
                   {'label': u'French Southern Territories', 'value': u'ATF'},
                   {'label': u'Gabon', 'value': u'GAB'},
                   {'label': u'Gambia', 'value': u'GMB'},
                   {'label': u'Georgia', 'value': u'GEO'},
                   {'label': u'Germany', 'value': u'DEU'},
                   {'label': u'Ghana', 'value': u'GHA'},
                   {'label': u'Gibraltar', 'value': u'GIB'},
                   {'label': u'Greece', 'value': u'GRC'},
                   {'label': u'Greenland', 'value': u'GRL'},
                   {'label': u'Grenada', 'value': u'GRD'},
                   {'label': u'Guadeloupe', 'value': u'GLP'},
                   {'label': u'Guam', 'value': u'GUM'},
                   {'label': u'Guatemala', 'value': u'GTM'},
                   {'label': u'Guernsey', 'value': u'GGY'},
                   {'label': u'Guinea', 'value': u'GIN'},
                   {'label': u'Guinea-Bissau', 'value': u'GNB'},
                   {'label': u'Guyana', 'value': u'GUY'},
                   {'label': u'Haiti', 'value': u'HTI'},
                   {'label': u'Heard Island and McDonald Islands', 'value': u'HMD'},
                   {'label': u'Holy See (Vatican City State)', 'value': u'VAT'},
                   {'label': u'Honduras', 'value': u'HND'},
                   {'label': u'Hong Kong', 'value': u'HKG'},
                   {'label': u'Hungary', 'value': u'HUN'},
                   {'label': u'Iceland', 'value': u'ISL'},
                   {'label': u'India', 'value': u'IND'},
                   {'label': u'Indonesia', 'value': u'IDN'},
                   {'label': u'Iran, Islamic Republic of', 'value': u'IRN'},
                   {'label': u'Iraq', 'value': u'IRQ'},
                   {'label': u'Ireland', 'value': u'IRL'},
                   {'label': u'Isle of Man', 'value': u'IMN'},
                   {'label': u'Israel', 'value': u'ISR'},
                   {'label': u'Italy', 'value': u'ITA'},
                   {'label': u'Jamaica', 'value': u'JAM'},
                   {'label': u'Japan', 'value': u'JPN'},
                   {'label': u'Jersey', 'value': u'JEY'},
                   {'label': u'Jordan', 'value': u'JOR'},
                   {'label': u'Kazakhstan', 'value': u'KAZ'},
                   {'label': u'Kenya', 'value': u'KEN'},
                   {'label': u'Kiribati', 'value': u'KIR'},
                   {'label': u'Kuwait', 'value': u'KWT'},
                   {'label': u'Kyrgyzstan', 'value': u'KGZ'},
                   {'label': u"Lao People's Democratic Republic", 'value': u'LAO'},
                   {'label': u'Latvia', 'value': u'LVA'},
                   {'label': u'Lebanon', 'value': u'LBN'},
                   {'label': u'Lesotho', 'value': u'LSO'},
                   {'label': u'Liberia', 'value': u'LBR'},
                   {'label': u'Libya', 'value': u'LBY'},
                   {'label': u'Liechtenstein', 'value': u'LIE'},
                   {'label': u'Lithuania', 'value': u'LTU'},
                   {'label': u'Luxembourg', 'value': u'LUX'},
                   {'label': u'Macao', 'value': u'MAC'},
                   {'label': u'Macedonia, Republic of', 'value': u'MKD'},
                   {'label': u'Madagascar', 'value': u'MDG'},
                   {'label': u'Malawi', 'value': u'MWI'},
                   {'label': u'Malaysia', 'value': u'MYS'},
                   {'label': u'Maldives', 'value': u'MDV'},
                   {'label': u'Mali', 'value': u'MLI'},
                   {'label': u'Malta', 'value': u'MLT'},
                   {'label': u'Marshall Islands', 'value': u'MHL'},
                   {'label': u'Martinique', 'value': u'MTQ'},
                   {'label': u'Mauritania', 'value': u'MRT'},
                   {'label': u'Mauritius', 'value': u'MUS'},
                   {'label': u'Mayotte', 'value': u'MYT'},
                   {'label': u'Mexico', 'value': u'MEX'},
                   {'label': u'Micronesia, Federated States of', 'value': u'FSM'},
                   {'label': u'Moldova, Republic of', 'value': u'MDA'},
                   {'label': u'Monaco', 'value': u'MCO'},
                   {'label': u'Mongolia', 'value': u'MNG'},
                   {'label': u'Montenegro', 'value': u'MNE'},
                   {'label': u'Montserrat', 'value': u'MSR'},
                   {'label': u'Morocco', 'value': u'MAR'},
                   {'label': u'Mozambique', 'value': u'MOZ'},
                   {'label': u'Myanmar', 'value': u'MMR'},
                   {'label': u'Namibia', 'value': u'NAM'},
                   {'label': u'Nauru', 'value': u'NRU'},
                   {'label': u'Nepal', 'value': u'NPL'},
                   {'label': u'Netherlands', 'value': u'NLD'},
                   {'label': u'New Caledonia', 'value': u'NCL'},
                   {'label': u'New Zealand', 'value': u'NZL'},
                   {'label': u'Nicaragua', 'value': u'NIC'},
                   {'label': u'Niger', 'value': u'NER'},
                   {'label': u'Nigeria', 'value': u'NGA'},
                   {'label': u'Niue', 'value': u'NIU'},
                   {'label': u'Norfolk Island', 'value': u'NFK'},
                   {'label': u'Northern Mariana Islands', 'value': u'MNP'},
                   {'label': u'Norway', 'value': u'NOR'},
                   {'label': u'Oman', 'value': u'OMN'},
                   {'label': u'Pakistan', 'value': u'PAK'},
                   {'label': u'Palau', 'value': u'PLW'},
                   {'label': u'Palestine, State of', 'value': u'PSE'},
                   {'label': u'Panama', 'value': u'PAN'},
                   {'label': u'Papua New Guinea', 'value': u'PNG'},
                   {'label': u'Paraguay', 'value': u'PRY'},
                   {'label': u'Peru', 'value': u'PER'},
                   {'label': u'Philippines', 'value': u'PHL'},
                   {'label': u'Pitcairn', 'value': u'PCN'},
                   {'label': u'Poland', 'value': u'POL'},
                   {'label': u'Portugal', 'value': u'PRT'},
                   {'label': u'Puerto Rico', 'value': u'PRI'},
                   {'label': u'Qatar', 'value': u'QAT'},
                   {'label': u'Romania', 'value': u'ROU'},
                   {'label': u'Russian Federation', 'value': u'RUS'},
                   {'label': u'Rwanda', 'value': u'RWA'},
                   {'label': u'R\xe9union', 'value': u'REU'},
                   {'label': u'Saint Barth\xe9lemy', 'value': u'BLM'},
                   {'label': u'Saint Helena, Ascension and Tristan da Cunha', 'value': u'SHN'},
                   {'label': u'Saint Kitts and Nevis', 'value': u'KNA'},
                   {'label': u'Saint Lucia', 'value': u'LCA'},
                   {'label': u'Saint Martin (French part)', 'value': u'MAF'},
                   {'label': u'Saint Pierre and Miquelon', 'value': u'SPM'},
                   {'label': u'Saint Vincent and the Grenadines', 'value': u'VCT'},
                   {'label': u'Samoa', 'value': u'WSM'},
                   {'label': u'San Marino', 'value': u'SMR'},
                   {'label': u'Sao Tome and Principe', 'value': u'STP'},
                   {'label': u'Saudi Arabia', 'value': u'SAU'},
                   {'label': u'Senegal', 'value': u'SEN'},
                   {'label': u'Serbia', 'value': u'SRB'},
                   {'label': u'Seychelles', 'value': u'SYC'},
                   {'label': u'Sierra Leone', 'value': u'SLE'},
                   {'label': u'Sint Maarten (Dutch part)', 'value': u'SXM'},
                   {'label': u'Slovakia', 'value': u'SVK'},
                   {'label': u'Slovenia', 'value': u'SVN'},
                   {'label': u'Solomon Islands', 'value': u'SLB'},
                   {'label': u'Somalia', 'value': u'SOM'},
                   {'label': u'South Africa', 'value': u'ZAF'},
                   {'label': u'South Georgia and the South Sandwich Islands', 'value': u'SGS'},
                   {'label': u'South Sudan', 'value': u'SSD'},
                   {'label': u'Spain', 'value': u'ESP'},
                   {'label': u'Sri Lanka', 'value': u'LKA'},
                   {'label': u'Sudan', 'value': u'SDN'},
                   {'label': u'Suriname', 'value': u'SUR'},
                   {'label': u'Svalbard and Jan Mayen', 'value': u'SJM'},
                   {'label': u'Swaziland', 'value': u'SWZ'},
                   {'label': u'Sweden', 'value': u'SWE'},
                   {'label': u'Switzerland', 'value': u'CHE'},
                   {'label': u'Syrian Arab Republic', 'value': u'SYR'},
                   {'label': u'Taiwan, Province of China', 'value': u'TWN'},
                   {'label': u'Tajikistan', 'value': u'TJK'},
                   {'label': u'Tanzania, United Republic of', 'value': u'TZA'},
                   {'label': u'Thailand', 'value': u'THA'},
                   {'label': u'Timor-Leste', 'value': u'TLS'},
                   {'label': u'Togo', 'value': u'TGO'},
                   {'label': u'Tokelau', 'value': u'TKL'},
                   {'label': u'Tonga', 'value': u'TON'},
                   {'label': u'Trinidad and Tobago', 'value': u'TTO'},
                   {'label': u'Tunisia', 'value': u'TUN'},
                   {'label': u'Turkey', 'value': u'TUR'},
                   {'label': u'Turkmenistan', 'value': u'TKM'},
                   {'label': u'Turks and Caicos Islands', 'value': u'TCA'},
                   {'label': u'Tuvalu', 'value': u'TUV'},
                   {'label': u'Uganda', 'value': u'UGA'},
                   {'label': u'Ukraine', 'value': u'UKR'},
                   {'label': u'United Arab Emirates', 'value': u'ARE'},
                   {'label': u'United Kingdom', 'value': u'GBR'},
                   {'label': u'United States', 'value': u'USA'},
                   {'label': u'United States Minor Outlying Islands', 'value': u'UMI'},
                   {'label': u'Uruguay', 'value': u'URY'},
                   {'label': u'Uzbekistan', 'value': u'UZB'},
                   {'label': u'Vanuatu', 'value': u'VUT'},
                   {'label': u'Venezuela, Bolivarian Republic of', 'value': u'VEN'},
                   {'label': u'Viet Nam', 'value': u'VNM'},
                   {'label': u'Virgin Islands, British', 'value': u'VGB'},
                   {'label': u'Virgin Islands, U.S.', 'value': u'VIR'},
                   {'label': u'Wallis and Futuna', 'value': u'WLF'},
                   {'label': u'Western Sahara', 'value': u'ESH'},
                   {'label': u'Yemen', 'value': u'YEM'},
                   {'label': u'Zambia', 'value': u'ZMB'},
                   {'label': u'Zimbabwe', 'value': u'ZWE'},
                   {'label': u'\xc5land Islands', 'value': u'ALA'}]

state_choices = [{'label': u'Armed Forces America', 'value': u'AA'},
                 {'label': u'Armed Forces', 'value': u'AE'},
                 {'label': u'Armed Forces Pacific', 'value': u'AP'},
                 {'label': u'Alaska', 'value': u'AK'},
                 {'label': u'Alabama', 'value': u'AL'},
                 {'label': u'Arkansas', 'value': u'AR'},
                 {'label': u'Arizona', 'value': u'AZ'},
                 {'label': u'California', 'value': u'CA'},
                 {'label': u'Colorado', 'value': u'CO'},
                 {'label': u'Connecticut', 'value': u'CT'},
                 {'label': u'Washington DC (District of Columbia)', 'value': u'DC'},
                 {'label': u'Delaware', 'value': u'DE'},
                 {'label': u'Florida', 'value': u'FL'},
                 {'label': u'Georgia', 'value': u'GA'},
                 {'label': u'Guam', 'value': u'GU'},
                 {'label': u'Hawaii', 'value': u'HI'},
                 {'label': u'Iowa', 'value': u'IA'},
                 {'label': u'Idaho', 'value': u'ID'},
                 {'label': u'Illinois', 'value': u'IL'},
                 {'label': u'Indiana', 'value': u'IN'},
                 {'label': u'Kansas', 'value': u'KS'},
                 {'label': u'Kentucky', 'value': u'KY'},
                 {'label': u'Louisiana', 'value': u'LA'},
                 {'label': u'Massachusetts', 'value': u'MA'},
                 {'label': u'Maryland', 'value': u'MD'},
                 {'label': u'Maine', 'value': u'ME'},
                 {'label': u'Michigan', 'value': u'MI'},
                 {'label': u'Minnesota', 'value': u'MN'},
                 {'label': u'Missouri', 'value': u'MO'},
                 {'label': u'Mississippi', 'value': u'MS'},
                 {'label': u'Montana', 'value': u'MT'},
                 {'label': u'North Carolina', 'value': u'NC'},
                 {'label': u'North Dakota', 'value': u'ND'},
                 {'label': u'Nebraska', 'value': u'NE'},
                 {'label': u'New Hampshire', 'value': u'NH'},
                 {'label': u'New Jersey', 'value': u'NJ'},
                 {'label': u'New Mexico', 'value': u'NM'},
                 {'label': u'Nevada', 'value': u'NV'},
                 {'label': u'New York', 'value': u'NY'},
                 {'label': u'Ohio', 'value': u'OH'},
                 {'label': u'Oklahoma', 'value': u'OK'},
                 {'label': u'Oregon', 'value': u'OR'},
                 {'label': u'Pennsylvania', 'value': u'PA'},
                 {'label': u'Puerto Rico', 'value': u'PR'},
                 {'label': u'Rhode Island', 'value': u'RI'},
                 {'label': u'South Carolina', 'value': u'SC'},
                 {'label': u'South Dakota', 'value': u'SD'},
                 {'label': u'Tennessee', 'value': u'TN'},
                 {'label': u'Texas', 'value': u'TX'},
                 {'label': u'Utah', 'value': u'UT'},
                 {'label': u'Virginia', 'value': u'VA'},
                 {'label': u'Virgin Islands', 'value': u'VI'},
                 {'label': u'Vermont', 'value': u'VT'},
                 {'label': u'Washington', 'value': u'WA'},
                 {'label': u'Wisconsin', 'value': u'WI'},
                 {'label': u'West Virginia', 'value': u'WV'},
                 {'label': u'Wyoming', 'value': u'WY'}]

kyc_steps = [
    {
        'type': 'first_name',
        'message': 'Please enter your first name.',
        'order': 0
    },
    {
        'type': 'last_name',
        'message': 'Please enter your surname.',
        'order': 1
    },
    {
        'type': 'middle_name',
        'message': 'Please enter your middle name.',
        'order': 2
    },
    {
        'type': 'dob',
        'message': 'Please select your birth date.',
        'widget': 'SelectDateWidget',
        'order': 5
    },
    {
        'type': 'gender',
        'message': 'Please select your gender.',
        'widget': 'SelectSingleWidget',
        'choices': [{'value': 'male', 'label': 'Male'}, {'value': 'female', 'label': 'Female'}],
        'order': 6
    },
    {
        'type': 'telephone',
        'message': 'Please enter your phone number.',
        'keyboard_type': 'PHONE',
        'order': 7
    },
    {
        'type': 'mobile',
        'message': 'Please enter mobile phone number.',
        'keyboard_type': 'PHONE',
        'order': 8
    },
    {
        'type': 'email',
        'message': 'Please enter your email address.',
        'keyboard_type': 'EMAIL',
        'order': 9
    },
    {
        'type': 'address_street',
        'message': 'Please enter the street name of your home address.',
        'max_chars': 32,
        'order': 10
    },
    {
        'type': 'address_building_number',
        'message': 'Please enter the building number of your home address.',
        'order': 11
    },
    {
        'type': 'address_building_name',
        'message': 'Please enter the name of the building of your home address.',
        'order': 12
    },
    {
        'type': 'address_flat_number',
        'message': 'Please enter the flat/unit/apartment number of your home address.',
        'order': 13
    },
    {
        'type': 'address_sub_street',
        'message': 'Please enter the suburb / subdivision / municipality of your home address.',
        'order': 14
    },
    {
        'type': 'address_postcode',
        'message': 'Please enter the postal code of your home address.',
        'order': 15
    },
    {
        'type': 'address_town',
        'message': 'Please enter the city of your home address.',
        'order': 16
    },
    {
        'type': 'address_state',
        'message': 'Please select the state of your home address.',
        'widget': 'SelectSingleWidget',
        'choices': state_choices,
        'order': 17
    },
    {
        'type': 'address_country',
        'message': 'Please select the country of your home address.',
        'widget': 'SelectSingleWidget',
        'choices': country_choices,
        'order': 19
    },
    {
        'type': 'national_identity_card_front',
        'message': 'Please take a picture of the front of your national identity card.',
        'widget': 'PhotoUploadWidget',
        'order': 20
    },
    {
        'type': 'national_identity_card_back',
        'message': 'Please take a picture of the back of your national identity card.',
        'widget': 'PhotoUploadWidget',
        'order': 21
    },
    {
        'type': 'national_identity_card',
        'message': 'Please take a picture of your national identity card.',
        'widget': 'PhotoUploadWidget',
        'order': 22
    },
    {
        'type': 'passport',
        'message': 'Please take a picture of your passport.',
        'widget': 'PhotoUploadWidget',
        'order': 23
    },
    {
        'type': 'utility_bill',
        'message': 'Please upload a picture of a utility bill that is not older than three months and has your name and address on it for our Proof of Address.',
        'widget': 'PhotoUploadWidget',
        'order': 24
    }
]

DEFAULT_KYC_STEPS = {'first_name', 'last_name', 'email', 'gender', 'dob', 'address_building_number',
                     'address_street', 'address_town', 'address_postcode', 'passport', 'utility_bill'}

"""
From https://info.onfido.com/supported-documents
const array = [];
$('tr').each((i, element)=>{
	const tds = $(element).find('td');
	if(tds.length){
        const country = tds[0].textContent;
        const docType = tds[1].textContent;
        array.push({country, docType});
    }
});

countries = []  # result from above
unknown =  []   
doc_type_mapping = {}
for thing in countries:
    if thing['country'] in mapping:
        country_code = mapping[thing['country']]
        doc_type_mapping[country_code] = thing['docType']
    else:
        unknown.append(thing)

if unknown:
    raise Exception('please add these to the doc_type_mapping manually %s' % unknown)

def convert(doc_type_str):
    if 'National Identity card*' in doc_type_str:
        return ['national_identity_card_front', 'national_identity_card_back']
    elif 'National Identity card' in doc_type_str:
        return ['national_identity_card']
    elif 'Passport' in doc_type_str:
        return ['passport']
    else:
        raise Exception(doc_type_str)


REQUIRED_DOCUMENT_TYPES = {k: convert(v) for k, v in doc_type_mapping.iteritems()}

"""
REQUIRED_DOCUMENT_TYPES = {
    u'ABW': ['passport'],
    u'AFG': ['passport'],
    u'AGO': ['passport'],
    u'AIA': ['passport'],
    u'ALA': ['passport'],
    u'ALB': ['national_identity_card_front', 'national_identity_card_back'],
    u'AND': ['passport'],
    u'ARE': ['national_identity_card_front', 'national_identity_card_back'],
    u'ARG': ['national_identity_card'],
    u'ARM': ['passport'],
    u'ASM': ['passport'],
    u'ATG': ['passport'],
    u'AUS': ['passport'],
    u'AUT': ['national_identity_card_front', 'national_identity_card_back'],
    u'AZE': ['national_identity_card_front', 'national_identity_card_back'],
    u'BDI': ['passport'],
    u'BEL': ['national_identity_card_front', 'national_identity_card_back'],
    u'BEN': ['passport'],
    u'BFA': ['passport'],
    u'BGD': ['national_identity_card_front', 'national_identity_card_back'],
    u'BGR': ['national_identity_card_front', 'national_identity_card_back'],
    u'BHR': ['passport'],
    u'BHS': ['passport'],
    u'BIH': ['national_identity_card_front', 'national_identity_card_back'],
    u'BLM': ['passport'],
    u'BLR': ['passport'],
    u'BLZ': ['passport'],
    u'BMU': ['passport'],
    u'BOL': ['passport'],
    u'BRA': ['national_identity_card'],
    u'BRB': ['passport'],
    u'BRN': ['passport'],
    u'BTN': ['passport'],
    u'BWA': ['passport'],
    u'CAF': ['passport'],
    u'CAN': ['national_identity_card_front', 'national_identity_card_back'],
    u'CCK': ['passport'],
    u'CHE': ['national_identity_card_front', 'national_identity_card_back'],
    u'CHL': ['national_identity_card'],
    u'CHN': ['passport'],
    u'CIV': ['passport'],
    u'CMR': ['passport'],
    u'COD': ['passport'],
    u'COG': ['passport'],
    u'COK': ['passport'],
    u'COL': ['national_identity_card_front', 'national_identity_card_back'],
    u'COM': ['passport'],
    u'CPV': ['passport'],
    u'CRI': ['national_identity_card_front', 'national_identity_card_back'],
    u'CUB': ['passport'],
    u'CXR': ['passport'],
    u'CYM': ['passport'],
    u'CYP': ['national_identity_card_front', 'national_identity_card_back'],
    u'CZE': ['national_identity_card_front', 'national_identity_card_back'],
    u'DEU': ['national_identity_card_front', 'national_identity_card_back'],
    u'DJI': ['passport'],
    u'DMA': ['passport'],
    u'DNK': ['national_identity_card_front', 'national_identity_card_back'],
    u'DOM': ['national_identity_card_front', 'national_identity_card_back'],
    u'DZA': ['national_identity_card_front', 'national_identity_card_back'],
    u'ECU': ['national_identity_card_front', 'national_identity_card_back'],
    u'EGY': ['passport'],
    u'ERI': ['passport'],
    u'ESH': ['passport'],
    u'ESP': ['national_identity_card_front', 'national_identity_card_back'],
    u'EST': ['national_identity_card_front', 'national_identity_card_back'],
    u'ETH': ['passport'],
    u'FIN': ['national_identity_card_front', 'national_identity_card_back'],
    u'FJI': ['passport'],
    u'FLK': ['passport'],
    u'FRA': ['national_identity_card'],
    u'FRO': ['passport'],
    u'FSM': ['passport'],
    u'GAB': ['passport'],
    u'GBR': ['passport'],
    u'GEO': ['national_identity_card_front', 'national_identity_card_back'],
    u'GHA': ['passport'],
    u'GIB': ['national_identity_card_front', 'national_identity_card_back'],
    u'GIN': ['passport'],
    u'GLP': ['passport'],
    u'GMB': ['passport'],
    u'GNB': ['passport'],
    u'GNQ': ['passport'],
    u'GRC': ['national_identity_card_front', 'national_identity_card_back'],
    u'GRD': ['passport'],
    u'GRL': ['passport'],
    u'GTM': ['national_identity_card_front', 'national_identity_card_back'],
    u'GUF': ['passport'],
    u'GUM': ['passport'],
    u'GUY': ['passport'],
    u'HKG': ['national_identity_card_front', 'national_identity_card_back'],
    u'HND': ['passport'],
    u'HRV': ['national_identity_card_front', 'national_identity_card_back'],
    u'HTI': ['passport'],
    u'HUN': ['national_identity_card_front', 'national_identity_card_back'],
    u'IDN': ['national_identity_card_front', 'national_identity_card_back'],
    u'IND': ['national_identity_card'],
    u'IOT': ['passport'],
    u'IRL': ['national_identity_card_front', 'national_identity_card_back'],
    u'IRN': ['passport'],
    u'IRQ': ['passport'],
    u'ISL': ['passport'],
    u'ISR': ['passport'],
    u'ITA': ['national_identity_card_front', 'national_identity_card_back'],
    u'JAM': ['passport'],
    u'JOR': ['national_identity_card_front', 'national_identity_card_back'],
    u'JPN': ['passport'],
    u'KAZ': ['passport'],
    u'KEN': ['national_identity_card_front', 'national_identity_card_back'],
    u'KGZ': ['passport'],
    u'KHM': ['passport'],
    u'KIR': ['passport'],
    u'KNA': ['passport'],
    u'KOR': ['passport'],
    u'KWT': ['passport'],
    u'LBN': ['passport'],
    u'LBR': ['passport'],
    u'LBY': ['passport'],
    u'LCA': ['passport'],
    u'LIE': ['national_identity_card_front', 'national_identity_card_back'],
    u'LKA': ['passport'],
    u'LSO': ['passport'],
    u'LTU': ['national_identity_card_front', 'national_identity_card_back'],
    u'LUX': ['national_identity_card_front', 'national_identity_card_back'],
    u'LVA': ['national_identity_card_front', 'national_identity_card_back'],
    u'MAC': ['passport'],
    u'MAR': ['national_identity_card_front', 'national_identity_card_back'],
    u'MCO': ['national_identity_card_front', 'national_identity_card_back'],
    u'MDA': ['national_identity_card_front', 'national_identity_card_back'],
    u'MDG': ['passport'],
    u'MDV': ['passport'],
    u'MEX': ['passport'],
    u'MHL': ['passport'],
    u'MKD': ['national_identity_card_front', 'national_identity_card_back'],
    u'MLI': ['passport'],
    u'MLT': ['national_identity_card_front', 'national_identity_card_back'],
    u'MMR': ['passport'],
    u'MNE': ['national_identity_card_front', 'national_identity_card_back'],
    u'MNG': ['passport'],
    u'MNP': ['passport'],
    u'MOZ': ['passport'],
    u'MRT': ['passport'],
    u'MTQ': ['passport'],
    u'MUS': ['passport'],
    u'MWI': ['passport'],
    u'MYS': ['national_identity_card'],
    u'MYT': ['passport'],
    u'NAM': ['passport'],
    u'NCL': ['passport'],
    u'NER': ['passport'],
    u'NFK': ['passport'],
    u'NGA': ['national_identity_card_front', 'national_identity_card_back'],
    u'NIC': ['passport'],
    u'NIU': ['passport'],
    u'NLD': ['national_identity_card_front', 'national_identity_card_back'],
    u'NOR': ['national_identity_card_front', 'national_identity_card_back'],
    u'NPL': ['passport'],
    u'NRU': ['passport'],
    u'NZL': ['passport'],
    u'OMN': ['passport'],
    u'PAK': ['national_identity_card_front', 'national_identity_card_back'],
    u'PAN': ['passport'],
    u'PCN': ['passport'],
    u'PER': ['national_identity_card'],
    u'PHL': ['national_identity_card_front', 'national_identity_card_back'],
    u'PLW': ['passport'],
    u'PNG': ['passport'],
    u'POL': ['national_identity_card_front', 'national_identity_card_back'],
    u'PRI': ['national_identity_card'],
    u'PRK': ['passport'],
    u'PRT': ['national_identity_card_front', 'national_identity_card_back'],
    u'PRY': ['national_identity_card_front', 'national_identity_card_back'],
    u'PSE': ['passport'],
    u'PYF': ['passport'],
    u'QAT': ['national_identity_card'],
    u'REU': ['passport'],
    u'ROU': ['national_identity_card_front', 'national_identity_card_back'],
    u'RUS': ['passport'],
    u'RWA': ['passport'],
    u'SAU': ['passport'],
    u'SDN': ['passport'],
    u'SEN': ['passport'],
    u'SGP': ['national_identity_card'],
    u'SHN': ['passport'],
    u'SLB': ['passport'],
    u'SLE': ['passport'],
    u'SLV': ['passport'],
    u'SMR': ['passport'],
    u'SOM': ['passport'],
    u'SPM': ['passport'],
    u'SRB': ['national_identity_card_front', 'national_identity_card_back'],
    u'SSD': ['passport'],
    u'STP': ['passport'],
    u'SVK': ['national_identity_card_front', 'national_identity_card_back'],
    u'SVN': ['national_identity_card_front', 'national_identity_card_back'],
    u'SWE': ['national_identity_card_front', 'national_identity_card_back'],
    u'SWZ': ['passport'],
    u'SYC': ['passport'],
    u'SYR': ['passport'],
    u'TCA': ['passport'],
    u'TCD': ['passport'],
    u'TGO': ['passport'],
    u'THA': ['national_identity_card'],
    u'TJK': ['passport'],
    u'TKM': ['passport'],
    u'TLS': ['passport'],
    u'TON': ['passport'],
    u'TTO': ['national_identity_card_front', 'national_identity_card_back'],
    u'TUN': ['passport'],
    u'TUR': ['national_identity_card_front', 'national_identity_card_back'],
    u'TWN': ['passport'],
    u'TZA': ['passport'],
    u'UGA': ['passport'],
    u'UKR': ['national_identity_card_front', 'national_identity_card_back'],
    u'UMI': ['national_identity_card_front', 'national_identity_card_back'],
    u'URY': ['national_identity_card'],
    u'USA': ['address_state', 'national_identity_card_front', 'national_identity_card_back'],
    u'UZB': ['passport'],
    u'VAT': ['passport'],
    u'VCT': ['passport'],
    u'VEN': ['passport'],
    u'VGB': ['passport'],
    u'VIR': ['passport'],
    u'VNM': ['national_identity_card'],
    u'VUT': ['passport'],
    u'WSM': ['passport'],
    u'YEM': ['passport'],
    u'ZAF': ['national_identity_card'],
    u'ZMB': ['passport'],
    u'ZWE': ['passport']
}
