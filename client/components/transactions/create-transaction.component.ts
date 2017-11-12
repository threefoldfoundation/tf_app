import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../../../framework/client/rpc/rpc.interfaces';
import { CreateTransactionPayload, TokenTypes } from '../../interfaces/transactions.interfaces';

@Component({
  selector: 'create-transaction',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-transaction.component.html'
})

export class CreateTransactionComponent {
  tokenTypes = Object.keys(TokenTypes).map((t: keyof TokenTypes) => <TokenTypes>TokenTypes[ <any>t ]);
  @Input() createStatus: ApiRequestStatus;
  @Output() onCreateTransaction = new EventEmitter<CreateTransactionPayload>();
  @ViewChild('form') form: NgForm;

  private _transaction: CreateTransactionPayload;

  get transaction() {
    return this._transaction;
  }

  @Input() set transaction(value: CreateTransactionPayload) {
    this._transaction = { ...value };
  }

  submit() {
    if (this.form.form.valid) {
      this.onCreateTransaction.emit(this.transaction);
    }
  }
}
