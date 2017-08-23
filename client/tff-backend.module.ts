import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdButtonModule, MdIconModule, MdInputModule, MdListModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services/index';
import { TffEffects } from './effects/tff.effect';
import { TimestampPipe } from "./pipes/timestamp.pipe";
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';

const MATERIAL_IMPORTS = [
  MdButtonModule, MdInputModule, MdListModule, MdIconModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MultilingualModule,
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
  constructor(@Optional() @SkipSelf() parentModule: TffBackendModule) {
    if (parentModule) {
      throw new Error('TffBackendModule already loaded; Import in root module only.');
    }
  }
}
