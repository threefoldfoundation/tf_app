import { CommonModule, DatePipe } from '@angular/common';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MdButtonModule, MdIconModule, MdInputModule, MdListModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services/index';
import { TffEffects } from './effects/tff.effect';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';
import { TffRoutes } from './tff.routes';
import { IAppState } from '../../framework/client/ngrx/state/app.state';
import { AddRoutesAction } from '../../framework/client/sidebar/index';

const MATERIAL_IMPORTS = [
  MdButtonModule, MdInputModule, MdListModule, MdIconModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule,
    MultilingualModule,
    RouterModule.forChild(TffRoutes),
    EffectsModule.run(TffEffects),
    MATERIAL_IMPORTS
  ],
  declarations: [
    TFF_COMPONENTS,
    TimestampPipe
  ],
  providers: [
    DatePipe,
    TFF_PROVIDERS
  ],
  exports: [
    TFF_COMPONENTS
  ]
})
export class TffBackendModule {
  constructor(@Optional() @SkipSelf() parentModule: TffBackendModule, private store: Store<IAppState>) {
    if (parentModule) {
      throw new Error('TffBackendModule already loaded; Import in root module only.');
    }
    this.store.dispatch(new AddRoutesAction(TffRoutes));
  }
}
