import { PaginatedResult } from './shared.interfaces';

export enum TransactionSyncedStatus {
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

export enum TokenTypes {
  A = 'TFT_A',
  B = 'TFT_B',
  C = 'TFT_C',
  D = 'TFT_D',
  I = 'iTFT_A',
}

export interface CreateTransactionPayload {
  username: string;
  token_type: TokenTypes;
  token_count: number;
  memo: string | null;
  date_signed?: number;
}

export interface WalletBalance {
  available: number;
  total: number;
  description: string;
  token: TokenTypes;
  precision: number;
}
