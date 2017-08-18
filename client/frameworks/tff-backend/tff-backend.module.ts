import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MdButtonModule, MdInputModule, MdListModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { MultilingualModule } from '../i18n/multilingual.module';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services/index';
import { TffEffects } from './effects/tff.effect';

const MATERIAL_IMPORTS = [
  MdButtonModule, MdInputModule, MdListModule
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
    TFF_COMPONENTS
  ],
  providers: [
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
