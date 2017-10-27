# -*- coding: utf-8 -*-
# Copyright 2017 GIG Technology NV
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @@license_version:1.3@@
from plugins.tff_backend.bizz.crm.api_util import exec_graphql_request
from plugins.tff_backend.bizz.crm.countries import countries


def _get_all_contacts():
    query = """
query GetContacts($amount: Int){
  contacts(first: $amount) {
    edges {
      node {
        uid
        firstname
        lastname
        emails
        telephones
        addresses{
          streetName
          streetNumber
          city
          state
          zipCode
          country     
        }
      }
    }
  }
}
    """
    return exec_graphql_request(query, {'amount': 10000})['items']


def get_contact(contact_id):
    query = """
query GetContact($uid: String){
  contact(uid: $uid) {
    uid
    firstname
    lastname
    emails
    telephones
    addresses{
      streetName
      streetNumber
      city
      state
      zipCode
      country     
    }
  }
}
""" % contact_id
    return exec_graphql_request(query, {'uid': contact_id})


def _search_contact(firstname, lastname, email, phone):
    firstname = firstname.strip()
    lastname = lastname.strip()
    contacts = _get_all_contacts()
    # assumes everyone has a different name
    for contact in contacts:
        if contact['firstname'].strip() == firstname and contact['lastname'] == lastname:
            return contact
        if email in contact['emails'] or phone in contact['telephones']:
            return contact


def _update_contact(contact, email, phone, referral_code, street_number, street_name, city, country, zip_code):
    addresses = contact['addresses']
    must_add_address = True
    for address in addresses:
        if address['streetNumber'] == street_number and address['streetName'] == street_name and \
                address['city'] == city and address['country'] == country and address['zipCode'] == zip_code:
            must_add_address = False

    params = {
        'uid': contact['uid'],
        # 'referralCode': referral_code
    }
    if email not in contact['emails']:
        if contact['emails']:
            params['emails'] = '%s,%s' % (contact['emails'], email)
        else:
            params['emails'] = email
    if phone not in contact['telephones']:
        if contact['telephones']:
            params['telephones'] = '%s,%s' % (contact['telephones'], phone)
        else:
            params['telephones'] = phone
    if must_add_address:
        address = {
            'streetNumber': street_number,
            'streetName': street_name,
            'city': city,
            'zipCode': zip_code
        }
        country = _get_country(country)
        if country:
            address['country'] = country
        addresses.append(address)
        params['addresses'] = addresses
    mutation = """
mutation UpdateContacts($records: [UpdateContactContactArguments]!) {
  updateContacts(records: $records) {
    ok
    ids
  }
}
"""
    return exec_graphql_request(mutation, {'records': [params]})['data']['updateContacts']['ids'][0]


def _create_contact(firstname, lastname, email, phone, referral_code, street_number, street_name, city, country,
                    zip_code):
    params = {
        'firstname': firstname,
        'lastname': lastname,
        'emails': email,
        'telephones': phone,
        'tfApp': True,
        'tfWeb': False,
        # 'referralCode': referral_code,
        'addresses': [{
            'streetNumber': street_number,
            'streetName': street_name,
            'city': city,
            'zipCode': zip_code
        }]
    }

    country = _get_country(country)
    if country:
        params['addresses'][0]['country'] = country
    mutation = """
mutation CreateContacts($records: [CreateContactArguments]!) {
  createContacts(records: $records) {
    ok
    ids
  }
}
"""
    return exec_graphql_request(mutation, {'records': [params]})['data']['createContacts']['ids'][0]


def upsert_contact(firstname, lastname, email, phone, referral_code, street_number, street_name, city, country,
                   zip_code):
    contact = _search_contact(firstname, lastname, email, phone)
    if contact:
        _update_contact(contact, email, phone, referral_code, street_number, street_name, city, country, zip_code)
    else:
        _create_contact(firstname, lastname, email, phone, referral_code, street_number, street_name, city, country,
                        zip_code)


def _get_country(user_input):
    user_input = user_input.lower().title()
    if user_input in countries.itervalues():
        return user_input
    if user_input == 'Belgie' or user_input == 'België':
        return 'Belgium'
