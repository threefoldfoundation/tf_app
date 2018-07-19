import { ChangeDetectionStrategy, Component, ElementRef, forwardRef, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { Actions, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { GetTffProfileAction, GetTffProfileCompleteAction, SearchUsersAction, TffActions, TffActionTypes } from '../../actions';
import { TffProfile } from '../../interfaces';
import { ITffState } from '../../states';
import { getUserList } from '../../tff.state';

@Component({
  selector: 'tff-user-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'user-field.component.html',
  providers: [ {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UserFieldComponent),
    multi: true,
  } ],
})
export class UserFieldComponent implements OnInit, ControlValueAccessor {
  userList$: Observable<TffProfile[]>;
  userSearchControl: FormControl;
  onTouched: () => void;
  onChange: (_: any) => void;
  @ViewChild('userSearchInput') userSearchInput: ElementRef;

  private _inputSubscription: Subscription;
  private _actionSubscription: Subscription = Subscription.EMPTY;
  private _selectedUser: TffProfile | null = null;

  get selectedUser() {
    return this._selectedUser;
  }

  set selectedUser(value: TffProfile | null) {
    if (value !== this._selectedUser) {
      this._selectedUser = value;
      this.onChange(value ? value.username : null);
    }
  }

  constructor(private store: Store<ITffState>,
              private actions$: Actions<TffActions>) {
    this.userSearchControl = new FormControl();
  }

  ngOnInit() {
    this.userList$ = this.store.pipe(select(getUserList), map(result => result.results.filter(p => p.app_user !== null)));
    this._inputSubscription = this.userSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(input => !!input && typeof input !== 'object'),
    ).subscribe(input => this.store.dispatch(new SearchUsersAction({ query: input })));
  }

  getUserInfoLine(user: TffProfile) {
    return `${user.info.name} - ${user.info.email}`;
  }

  setSelectedUser(event: MatAutocompleteSelectedEvent) {
    this.selectedUser = event.option.value;
    this.userSearchInput.nativeElement.value = '';
  }

  writeValue(value: TffProfile | string | null): void {
    if (typeof value === 'string') {
      this.store.dispatch(new GetTffProfileAction(value));
      this._actionSubscription.unsubscribe();
      this._actionSubscription = this.actions$.pipe(ofType<GetTffProfileCompleteAction>(TffActionTypes.GET_TFF_PROFILE_COMPLETE))
        .subscribe(action => {
          this.selectedUser = action.payload;
        });
    } else {
      this.selectedUser = value;
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
