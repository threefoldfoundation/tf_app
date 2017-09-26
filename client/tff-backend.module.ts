import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MdButtonModule,
  MdChipsModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdSelectModule,
  MdSlideToggleModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';
import { IAppState } from '../../framework/client/ngrx/state/app.state';
import { AddRoutesAction } from '../../framework/client/sidebar/index';
import { TffEffects } from './effects/tff.effect';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services/index';
import { TffRoutes } from './tff.routes';
import './operators';

const MATERIAL_IMPORTS = [
  MdButtonModule, MdInputModule, MdListModule, MdIconModule, MdSelectModule, MdChipsModule, MdSlideToggleModule, MdProgressSpinnerModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MultilingualModule,
    RouterModule.forChild(TffRoutes),
    EffectsModule.run(TffEffects),
    MATERIAL_IMPORTS,
    FlexLayoutModule
  ],
  declarations: [
    TFF_COMPONENTS,
    TimestampPipe,
  ],
  providers: [
    DatePipe,
    CurrencyPipe,
    TFF_PROVIDERS,
  ],
  exports: [
    TFF_COMPONENTS,
  ],
})
export class TffBackendModule {
  constructor(@Optional() @SkipSelf() parentModule: TffBackendModule, private store: Store<IAppState>) {
    if (parentModule) {
      throw new Error('TffBackendModule already loaded; Import in root module only.');
    }
    this.store.dispatch(new AddRoutesAction(TffRoutes));
  }
}
