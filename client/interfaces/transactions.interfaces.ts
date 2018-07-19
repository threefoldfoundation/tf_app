import { PaginatedResult } from './shared.interfaces';

export const enum TransactionSyncedStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

/**
 * PendingTransaction on server
 */
export interface Transaction {
  id: string;
  timestamp: number;
  unlock_timestamps: number[];
  unlock_amounts: number[];
  token: string;
  token_type: string;
  amount: number;
  precision?: number;
  memo: string;
  app_users: string[];
  from_user: string;
  to_user: string;
  synced: boolean;
  synced_status: TransactionSyncedStatus;
}

export interface TransactionList extends PaginatedResult<Transaction> {
}

export const enum TokenTypes {
  A = 'TFT_A',
  B = 'TFT_B',
  C = 'TFT_C',
  D = 'TFT_D',
  I = 'iTFT_A',
}

export interface WalletBalance {
  available: number;
  total: number;
  description: string;
  token: TokenTypes;
  precision: number;
}
