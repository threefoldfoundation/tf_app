import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { CreateInvestmentAgreementAction, GetGlobalStatsAction, GetGlobalStatsListAction } from '../../actions';
import { CreateInvestmentAgreementPayload, InvestmentAgreementsStatuses } from '../../interfaces';
import { ITffState } from '../../states';
import { createInvestmentAgreementStatus, getGlobalStats, getGlobalStatsList } from '../../tff.state';

@Component({
  selector: 'tff-create-investment-agreement-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-investment-agreement-page.component.html',
})
export class CreateInvestmentAgreementPageComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: NgForm;
  currencies$: Observable<string[]>;
  statuses = [ { value: InvestmentAgreementsStatuses.SIGNED, label: 'tff.signed' },
    { value: InvestmentAgreementsStatuses.PAID, label: 'tff.paid' } ];
  tokenTypes$: Observable<string[ ]>;
  agreement: CreateInvestmentAgreementPayload = {
    amount: 0,
    username: '',
    currency: 'USD',
    document: '',
    token: 'iTFT',
    status: InvestmentAgreementsStatuses.PAID,
    sign_time: Math.round(new Date().getTime() / 1000),
    paid_time: null,
  };
  createStatus$: Observable<ApiRequestStatus>;
  selectedDocument: File | null;
  maxDate = new Date();

  private _createSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private router: Router) {
  }

  ngOnInit() {
    this.store.dispatch(new GetGlobalStatsListAction());
    this.createStatus$ = this.store.select(createInvestmentAgreementStatus);
    this.tokenTypes$ = this.store.select(getGlobalStatsList).pipe(map(stats => stats.map(s => s.id)));
    this.currencies$ = this.store.select(getGlobalStats).pipe(
      map(stats => [ 'USD', ... (stats ? stats.currencies.map(c => c.currency) : []) ]),
    );
    this.getCurrencies();
    this._createSubscription = this.createStatus$.pipe(filter(s => s.success))
      .subscribe(() => this.router.navigate([ 'investment-agreements' ]));
  }

  ngOnDestroy() {
    this._createSubscription.unsubscribe();
  }

  isPaid() {
    return [ InvestmentAgreementsStatuses.PAID ].includes(this.agreement.status);
  }

  onDateChange(property: 'sign_time' | 'paid_time', event: MatDatepickerInputEvent<Date>) {
    if (event.value) {
      this.agreement[ property ] = Math.round(event.value.getTime() / 1000);
    }
  }

  getDate(timestamp: number | null) {
    return timestamp && new Date(timestamp * 1000);
  }

  setDocument(input: Event) {
    const files = (<HTMLInputElement>input.target).files;
    this.selectedDocument = files && files.length ? files[ 0 ] : null;
    if (this.selectedDocument) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(this.selectedDocument);
      fileReader.onload = () => {
        if (fileReader.result) {
          this.agreement.document = fileReader.result;
        }
      };
    }
  }

  getCurrencies() {
    this.store.dispatch(new GetGlobalStatsAction(this.agreement.token));
  }


  submit() {
    if (this.form.form.valid) {
      const agreement = {
        ...this.agreement,
        paid_time: this.agreement.status === InvestmentAgreementsStatuses.PAID ? this.agreement.paid_time : null,
      };
      this.store.dispatch(new CreateInvestmentAgreementAction(agreement));
    }
  }

}
