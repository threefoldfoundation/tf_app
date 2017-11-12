import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { Store, StoreModule } from '@ngrx/store';
import { MultilingualModule } from '../../framework/client/i18n/multilingual.module';
import { SetThemeAction } from '../../framework/client/identity/actions';
import { AuthenticationService } from '../../framework/client/identity/services';
import { IAppState } from '../../framework/client/ngrx';
import { AddRoutesAction } from '../../framework/client/sidebar/index';
import { AddToolbarItemAction } from '../../framework/client/toolbar/actions';
import { ToolbarItemTypes } from '../../framework/client/toolbar/interfaces';
import { TffEffects } from './effects';
import './operators';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { tffReducer } from './reducers';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services';
import { TffRoutes } from './tff.routes';

const MATERIAL_IMPORTS = [
  MatButtonModule, MatInputModule, MatListModule, MatIconModule, MatSelectModule, MatChipsModule, MatSlideToggleModule,
  MatProgressSpinnerModule, MatCardModule,
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
    FlexLayoutModule,
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
        const newTheme = this.authService.getLocalTheme() ? null : { cssClass: 'dark-theme', dark: true };
        this.store.dispatch(new SetThemeAction(newTheme));
      },
    };
    this.store.dispatch(new AddToolbarItemAction(themeItem));
  }
}
