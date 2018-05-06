import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatDatepickerInputEvent } from '@angular/material';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { CreateInvestmentAgreementAction, GetGlobalStatsAction, GetGlobalStatsListAction, SearchUsersAction } from '../../actions';
import { CreateInvestmentAgreementPayload, InvestmentAgreementsStatuses } from '../../interfaces';
import { ITffState } from '../../states';
import { createInvestmentAgreementStatus, getGlobalStats, getGlobalStatsList, getUserList } from '../../tff.state';

@Component({
  selector: 'tff-create-investment-agreement-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-investment-agreement-page.component.html',
})
export class CreateInvestmentAgreementPageComponent implements OnInit, OnDestroy {
  @ViewChild('form') form: NgForm;
  @ViewChild('userSearchInput') userSearchInput: ElementRef;
  userSearchControl: FormControl;
  currencies$: Observable<string[]>;
  statuses = [ { value: InvestmentAgreementsStatuses.SIGNED, label: 'tff.signed' },
    { value: InvestmentAgreementsStatuses.PAID, label: 'tff.paid' } ];
  tokenTypes$: Observable<string[ ]>;
  agreement: CreateInvestmentAgreementPayload = {
    amount: 0,
    app_user: '',
    currency: 'USD',
    document: '',
    token: 'iTFT',
    status: InvestmentAgreementsStatuses.PAID,
    sign_time: Math.round(new Date().getTime() / 1000),
    paid_time: null,
  };
  createStatus$: Observable<ApiRequestStatus>;
  userList$: Observable<Profile[]>;
  selectedUser: Profile | null = null;
  selectedDocument: File | null;
  maxDate = new Date();

  private _inputSubscription: Subscription;
  private _createSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private router: Router) {
    this.userSearchControl = new FormControl();
  }

  ngOnInit() {
    this.store.dispatch(new GetGlobalStatsListAction());
    this.createStatus$ = this.store.select(createInvestmentAgreementStatus);
    this.userList$ = this.store.select(getUserList).pipe(
      map(result => result.results.filter(p => p.app_email !== null)),
    );
    this.tokenTypes$ = this.store.select(getGlobalStatsList).pipe(map(stats => stats.map(s => s.id)));
    this.currencies$ = this.store.select(getGlobalStats).pipe(
      map(stats => [ 'USD', ... (stats ? stats.currencies.map(c => c.currency) : []) ]),
    );
    this.getCurrencies();
    this._inputSubscription = this.userSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(input => !!input && typeof input !== 'object'),
    ).subscribe(input => this.store.dispatch(new SearchUsersAction({ query: input })));
    this._createSubscription = this.createStatus$.pipe(filter(s => s.success))
      .subscribe(() => this.router.navigate([ 'investment-agreements' ]));
  }

  ngOnDestroy() {
    this._inputSubscription.unsubscribe();
    this._createSubscription.unsubscribe();
  }

  getUserInfoLine(user: Profile) {
    const name = user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
    if (user.info && user.info.validatedemailaddresses.length) {
      return `${name} - ${user.info.validatedemailaddresses[ 0 ].emailaddress}`;
    }
    return name;
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

  setSelectedUser(event: MatAutocompleteSelectedEvent) {
    this.selectedUser = event.option.value;
    this.userSearchInput.nativeElement.value = '';
  }

  submit() {
    if (this.form.form.valid && this.selectedUser) {
      const agreement = {
        ...this.agreement,
        app_user: <string>this.selectedUser.app_email,
        paid_time: this.agreement.status === InvestmentAgreementsStatuses.PAID ? this.agreement.paid_time : null,
      };
      this.store.dispatch(new CreateInvestmentAgreementAction(agreement));
    }
  }

}
