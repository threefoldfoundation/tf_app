export interface Applicant {
  id: string;
  created_at: string;
  href: string;
  title: 'Mr' | 'Mrs' | 'Miss' | 'Ms';
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  gender: 'male' | 'female';
  dob: string;
  telephone: string;
  mobile: string;
  country: string;
  mothers_maiden_name: string;
  previous_last_name: string;
  nationality: string;
  country_of_birth: string;
  addresses: Address[];
  id_numbers: IdNumber[];
}

export interface IdNumber {
  type: 'ssn' | 'social_insurance' | 'tax_id' | 'identity_card' | 'driving_license';
  value: string;
  state_code: string;
}

export interface Address {
  flat_number: string;
  building_number: string;
  building_name: string;
  street: string;
  sub_street: string;
  town: string;
  state: string;
  postcode: string;
  country: string;
  start_date: string;
  end_date: string;
}

export interface Check {
  created_at: string;
  download_uri: string;
  href: string;
  id: string;
  reports: string[];
  result: 'clear' | 'consider' | 'unidentified';
  results_uri: string;
  status: 'complete' | 'in_progress';
  tags: string[];
  type: 'standard' | 'express';
}
