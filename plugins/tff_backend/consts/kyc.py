# coding=utf-8

import pycountry

unsupported_countries = ['CHN', 'KOR', 'PRK', 'SGP', 'USA']
country_choices = sorted(
    filter(lambda c: c['value'] not in unsupported_countries,
           map(lambda country: {'value': country.alpha_3, 'label': country.name}, pycountry.countries)),
    key=lambda c: c['label'])

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
        'message': 'Please enter the state of your home address.',
        'order': 17
    },
    {
        'type': 'address_country',
        'message': 'Please enter the country of your home address.',
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
    }
]

DEFAULT_KYC_STEPS = {'first_name', 'last_name', 'email', 'gender', 'dob', 'address_building_number',
                     'address_street', 'address_town', 'address_country', 'address_postcode'}

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
    u'URY': ['national_identity_card'],
    u'USA': ['national_identity_card_front', 'national_identity_card_back'],
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
