import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { CreateTransactionPayload, TokenTypes } from '../../interfaces';

@Component({
  selector: 'tff-create-transaction',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-transaction.component.html',
})

export class CreateTransactionComponent {
  tokenTypes = [ TokenTypes.A, TokenTypes.B, TokenTypes.C, TokenTypes.D, TokenTypes.I ];
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
