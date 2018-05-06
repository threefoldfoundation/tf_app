import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, NgForm } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, withLatestFrom } from 'rxjs/operators';
import { filterNull } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { Profile } from '../../../../its_you_online_auth/client/interfaces';
import { CreateOrderAction, ResetNodeOrderAction, SearchUsersAction } from '../../actions';
import { ContactInfo, CreateOrderPayload, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces';
import { ITffState } from '../../states';
import { createOrderStatus, getOrder, getUserList } from '../../tff.state';

@Component({
  selector: 'tff-create-order-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-order-page.component.html',
})
export class CreateOrderPageComponent implements OnInit, OnDestroy {
  @ViewChild('userSearchInput') userSearchInput: ElementRef;
  userSearchControl: FormControl;
  maxDate = new Date();
  order: CreateOrderPayload<Date>;
  selectedUser: Profile | null = null;
  selectedDocument: File | null;
  statuses = ORDER_STATUSES;
  NodeOrderStatuses = NodeOrderStatuses;
  userList$: Observable<Profile[]>;
  createStatus$: Observable<ApiRequestStatus>;

  private _inputSubscription: Subscription;
  private _createSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute,
              private router: Router) {
    this.userSearchControl = new FormControl();
    const now = new Date();
    const contactInfo: ContactInfo = { address: '', email: '', name: '', phone: '' };
    this.order = {
      app_user: '',
      billing_info: contactInfo,
      document: '',
      odoo_sale_order_id: 0,
      order_time: now,
      send_time: now,
      shipping_info: contactInfo,
      status: NodeOrderStatuses.SENT,
      sign_time: now,
    };
  }

  ngOnInit() {
    this.store.dispatch(new ResetNodeOrderAction());
    this.userList$ = this.store.select(getUserList).pipe(
      map(result => result.results.filter(p => p.app_email !== null)),
    );
    this.createStatus$ = this.store.select(createOrderStatus);

    this._inputSubscription = this.userSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(input => !!input && typeof input !== 'object'),
    ).subscribe(input => this.store.dispatch(new SearchUsersAction({ query: input })));
    this._createSubscription = this.createStatus$.pipe(
      withLatestFrom(this.store.select(getOrder).pipe(filterNull())),
    ).subscribe(([ status, order ]) => this.router.navigate([ '..', order.id ], { relativeTo: this.route }));
  }

  ngOnDestroy() {
    this._inputSubscription.unsubscribe();
    this._createSubscription.unsubscribe();
  }

  setDocument(input: Event) {
    const files = (<HTMLInputElement>input.target).files;
    this.selectedDocument = files && files.length ? files[ 0 ] : null;
    if (this.selectedDocument) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(this.selectedDocument);
      fileReader.onload = () => {
        if (fileReader.result) {
          this.order.document = fileReader.result;
        }
      };
    }
  }

  submit(form: NgForm) {
    if (!this.selectedUser) {
      this.userSearchControl.setErrors({ 'required': true });
      return;
    }
    if (form.form.valid) {
      this.order.app_user = <string>this.selectedUser.app_email;
      this.store.dispatch(new CreateOrderAction(this.convertOrder(this.order)));
    }
  }

  getUserInfoLine(user: Profile) {
    const name = user.info && user.info.firstname ? `${user.info.firstname} ${user.info.lastname}` : user.username;
    if (user.info && user.info.validatedemailaddresses.length) {
      return `${name} - ${user.info.validatedemailaddresses[ 0 ].emailaddress}`;
    }
    return name;
  }

  setSelectedUser(event: MatAutocompleteSelectedEvent) {
    this.selectedUser = event.option.value;
    this.userSearchInput.nativeElement.value = '';
    this.setContactInfo(this.selectedUser);
  }

  shouldShowSignTime() {
    return [ NodeOrderStatuses.SIGNED, NodeOrderStatuses.PAID, NodeOrderStatuses.SENT, NodeOrderStatuses.ARRIVED ].includes(this.order.status);
  }

  shouldShowSentTime() {
    return [ NodeOrderStatuses.SENT, NodeOrderStatuses.ARRIVED ].includes(this.order.status);
  }

  private convertOrder(order: CreateOrderPayload<Date>): CreateOrderPayload<number> {
    return {
      ...order,
      order_time: Math.round(order.order_time.getTime() / 1000),
      send_time: Math.round(order.send_time.getTime() / 1000),
      sign_time: Math.round(order.sign_time.getTime() / 1000),
    };
  }

  private setContactInfo(user: Profile | null) {
    if (!(user && user.info)) {
      return;
    }
    if (user.info.firstname) {
      this.order.billing_info.name = `${user.info.firstname} ${user.info.lastname}`;
    }
    if (user.info.validatedemailaddresses.length) {
      this.order.billing_info.email = user.info.validatedemailaddresses[ 0 ].emailaddress;
    }
    if (user.info.validatedphonenumbers.length) {
      this.order.billing_info.phone = user.info.validatedphonenumbers[ 0 ].phonenumber;
    }
    if (user.info.addresses.length) {
      const address = user.info.addresses[ 0 ];
      this.order.billing_info.address = `${address.street} ${address.nr}
${address.postalcode} ${address.city}
${address.country}`;
    }
    this.order.shipping_info = { ...this.order.billing_info };
  }
}
