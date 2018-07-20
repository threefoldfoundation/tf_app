import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { filterNull } from '../../../../framework/client/ngrx';
import { ApiRequestStatus } from '../../../../framework/client/rpc';
import { CreateOrderAction, ResetNodeOrderAction } from '../../actions';
import { ContactInfo, CreateOrderPayload, NodeOrderStatuses, ORDER_STATUSES } from '../../interfaces';
import { ITffState } from '../../states';
import { createOrderStatus, getOrder } from '../../tff.state';

@Component({
  selector: 'tff-create-order-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'create-order-page.component.html',
})
export class CreateOrderPageComponent implements OnInit, OnDestroy {
  maxDate = new Date();
  order: CreateOrderPayload<Date>;
  selectedDocument: File | null;
  statuses = ORDER_STATUSES;
  createStatus$: Observable<ApiRequestStatus>;

  private _createSubscription: Subscription;

  constructor(private store: Store<ITffState>,
              private route: ActivatedRoute,
              private router: Router) {
    const now = new Date();
    const contactInfo: ContactInfo = { address: '', email: '', name: '', phone: '' };
    this.order = {
      username: '',
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
    this.createStatus$ = this.store.select(createOrderStatus);
    this._createSubscription = this.createStatus$.pipe(
      withLatestFrom(this.store.select(getOrder).pipe(filterNull())),
    ).subscribe(([ status, order ]) => this.router.navigate([ '..', order.id ], { relativeTo: this.route }));
  }

  ngOnDestroy() {
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
    if (form.form.valid) {
      this.store.dispatch(new CreateOrderAction(this.convertOrder(this.order)));
    }
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
}
