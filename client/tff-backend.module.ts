import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MdButtonModule,
  MdCardModule,
  MdChipsModule,
  MdExpansionModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdProgressSpinnerModule,
  MdSelectModule,
  MdSlideToggleModule
} from '@angular/material';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';
import { SetThemeAction } from '../../framework/client/identity/actions/index';
import { AuthenticationService } from '../../framework/client/identity/services/index';
import { IAppState } from '../../framework/client/ngrx/state/app.state';
import { AddRoutesAction } from '../../framework/client/sidebar/index';
import { AddToolbarItemAction } from '../../framework/client/toolbar/actions/index';
import { ToolbarItemTypes } from '../../framework/client/toolbar/interfaces/index';
import { TffEffects } from './effects/tff.effect';
import './operators';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { tffReducer } from './reducers/tff.reducer';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services/index';
import { TffRoutes } from './tff.routes';

const MATERIAL_IMPORTS = [
  MdButtonModule, MdInputModule, MdListModule, MdIconModule, MdSelectModule, MdChipsModule, MdSlideToggleModule, MdProgressSpinnerModule,
  MdCardModule, MdExpansionModule
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
    StoreModule.forFeature('tff', tffReducer),
    EffectsModule.forFeature([ TffEffects ]),
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
  constructor(@Optional() @SkipSelf() parentModule: TffBackendModule,
              private store: Store<IAppState>,
              private authService: AuthenticationService) {
    if (parentModule) {
      throw new Error('TffBackendModule already loaded; Import in root module only.');
    }
    this.store.dispatch(new AddRoutesAction(TffRoutes));
    const themeItem = {
      id: 'change_theme',
      type: ToolbarItemTypes.ICON,
      icon: 'format_color_fill',
      persistent: true,
      onclick: () => {
        let newTheme = this.authService.getLocalTheme() ? null : { cssClass: 'dark-theme', dark: true };
        this.store.dispatch(new SetThemeAction(newTheme));
      },
    };
    this.store.dispatch(new AddToolbarItemAction(themeItem));
  }
}
