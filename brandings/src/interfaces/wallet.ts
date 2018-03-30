import { SupportedAlgorithms } from '../manual_typings/rogerthat';

export enum TransactionStatus {
  UNCONFIRMED = 'unconfirmed',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export interface Transaction {
  id: string;
  status: TransactionStatus;
  timestamp: number;
  inputs: TransactionOutput[];
  outputs: TransactionOutput[];
  minerfees: string[];
}

export interface TransactionInput {
  parent_id: string;
  timelock: number;
}

export interface TransactionOutput {
  unlockhash: string;
  value: string;
}

export interface TransactionList {
  results: Transaction[];
}

export interface CreateSignatureData {
  amount: number;
  precision: number;
  from_address: string;
  to_address: string;
}

export interface GetAddressPayload {
  algorithm: SupportedAlgorithms;
  keyName: string;
  index: number;
  message: string;
}

// Only used by UI
export interface ParsedTransaction {
  id: string;
  status: TransactionStatus;
  timestamp: Date;
  inputs: TransactionOutput[];
  outputs: TransactionOutput[];
  /**
   * Outputs that do not contain the current users' address
   */
  otherOutputs: TransactionOutput[];
  amount: number;
  minerfee: number;
  receiving: boolean;
}

export interface CreateTransactionResult {
  transactionid: string;
}

export const ADDRESS_LENGTH = 78;
export const COIN_TO_HASTINGS_PRECISION = 9;
export const COIN_TO_HASTINGS = Math.pow(10, COIN_TO_HASTINGS_PRECISION);
export const CURRENCY_TFT = 'TFT';
export const KEY_NAME = 'threefold';
export const PROVIDER_ID = 'threefold';
export const RIVINE_ALGORITHM = 'ed25519';
