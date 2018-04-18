export interface KYCVerifyResult {
  CountryCode: string;
  Errors: ServiceError[];
  ProductName: string;
  Record: Record;
  TransactionID: string;
  UploadedDt: string;
}

export interface ServiceError {
  Code: string;
  Message: string;
}

export interface Record {
  DatasourceResults: DatasourceResult[];
  Errors: ServiceError[];
  RecordStatus: 'match' | 'nomatch';
  Rule: RecordRule;
  TransactionRecordID: string;
}

export interface DatasourceResult {
  AppendedFields: AppendedField[];
  DatasourceFields: DatasourceField[];
  DatasourceName: string;
  DatasourceStatus: string;
  Errors: ServiceError[];
  FieldGroups: string[];
}

export interface AppendedField {
  Data: string;
  FieldName: string;
}

export interface DatasourceField {
  FieldGroup?: string;
  FieldName: string;
  Status: string;
}

export interface RecordRule {
  Note: string;
  RuleName: string;
}

export interface DataFields {
  Business: Partial<Business>;
  Communication: Partial<Communication>;
  Document: Partial<Document>;
  DriverLicence: Partial<DriverLicence>;
  Location: Partial<Location>;
  NationalIds: Partial<NationalIds>[];
  Passport: Partial<Passport>;
  PersonInfo: Partial<PersonInfo>;
}

export interface Business {
  BusinessName: string;
  BusinessRegistrationNumber: string;
  DayOfIncorporation: number;
  MonthOfIncorporation: number;
  YearOfIncorporation: number;
}

export interface Communication {
  EmailAddress: string;
  MobileNumber: string;
  Telephone: string;
  Telephone2: string;
}

export interface Document {
  DocumentBackImage: string;
  DocumentFrontImage: string;
  DocumentType: DocumentTypes;
  LivePhoto: string;
}

export const enum DocumentTypes {
  DrivingLicence = 'DrivingLicence',
  IdentityCard = 'IdentityCard',
  Passport = 'Passport',
  ResidencePermit = 'ResidencePermit',
}

export interface DriverLicence {
  DayOfExpiry: number;
  MonthOfExpiry: number;
  Number: string;
  State: string;
  YearOfExpiry: number;
}

export interface Location {
  AdditionalFields: { Address1: string };
  BuildingName: string;
  BuildingNumber: string;
  City: string;
  Country: string;
  County: string;
  POBox: string;
  PostalCode: string;
  StateProvinceCode: string;
  StreetName: string;
  StreetType: string;
  Suburb: string;
  UnitNumber: string;
}

export interface NationalIds {
  CityOfIssue: string;
  CountyOfIssue: string;
  DistrictOfIssue: string;
  Number: string;
  ProvinceOfIssue: string;
  Type: NationalIdTypes;
}

export const enum NationalIdTypes {
  NationalID = 'NationalID',
  Health = 'Health',
  SocialService = 'SocialService',
  TaxIDNumber_NationalID = 'TaxIDNumber NationalID',
}

export interface Passport {
  DayOfExpiry: number;
  MonthOfExpiry: number;
  Mrz1: string;
  Mrz1Picture?: string;
  Mrz2: string;
  Mrz2Picture?: string;
  Number: string;
  YearOfExpiry: number;
}

export interface PersonInfo {
  AdditionalFields: { FullName: string };
  DayOfBirth: number;
  FirstGivenName: string;
  FirstSurName: string;
  Gender: 'M' | 'F';
  ISOLatin1Name: string;
  MiddleName: string;
  MinimumAge: number;
  MonthOfBirth: number;
  SecondSurname: string;
  YearOfBirth: number;
}

