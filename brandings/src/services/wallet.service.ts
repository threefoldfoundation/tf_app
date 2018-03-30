import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { configuration } from '../configuration';
import { CreateSignatureData, CreateTransactionResult, ParsedTransaction, TfChainBlock, Transaction } from '../interfaces/wallet';
import { CryptoTransaction } from '../manual_typings/rogerthat';
import { getTransactionAmount } from '../util/wallet';

@Injectable()
export class WalletService {

  constructor(private http: HttpClient) {
  }

  getLatestBlock() {
    return this.http.get<TfChainBlock>(`${configuration.wallet_url}/latest`);
  }

  getTransactions(address: string): Observable<ParsedTransaction[]> {
    const params = new HttpParams({ fromObject: { address } });
    return this.http.get<Transaction[]>(`${configuration.wallet_url}/transactions`, { params }).pipe(
      map(results => results.map(transaction => this._convertTransaction(transaction, address))),
    );
  }

  createSignatureData(data: CreateSignatureData) {
    return this.http.post<CryptoTransaction>(`${configuration.wallet_url}/create_signature_data`, data);
  }

  createTransaction(data: CryptoTransaction) {
    return this.http.post<CreateTransactionResult>(`${configuration.wallet_url}/transactions`, data);
  }

  private _convertTransaction(transaction: Transaction, address: string): ParsedTransaction {
    const amount = getTransactionAmount(address, transaction.inputs, transaction.outputs);
    return {
      id: transaction.id,
      inputs: transaction.inputs,
      outputs: transaction.outputs,
      height: transaction.height,
      timestamp: new Date(transaction.timestamp * 1000),
      receiving: amount > 0,
      otherOutputs: transaction.outputs.filter(output => output.unlockhash !== address),
      amount,
      minerfee: transaction.minerfees.reduce((total: number, minerfee: string) => total + parseInt(minerfee), 0),
    };
  }
}
