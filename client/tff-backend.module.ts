import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatButtonModule, MatCardModule, MatChipsModule, MatDatepickerModule, MatIconModule, MatInputModule, MatListModule,
  MatNativeDateModule, MatProgressSpinnerModule, MatSelectModule, MatSlideToggleModule, MatTabsModule, MatToolbarModule,
} from '@angular/material';
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
import { MarkdownPipe } from './pipes/markdown.pipe';
import { TimestampPipe } from './pipes/timestamp.pipe';
import { tffReducer } from './reducers';
import { TFF_COMPONENTS, TFF_PROVIDERS } from './services';
import { TffRoutes } from './tff.routes';

const MATERIAL_IMPORTS = [
  MatButtonModule, MatInputModule, MatListModule, MatIconModule, MatSelectModule, MatChipsModule, MatSlideToggleModule,
  MatProgressSpinnerModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatTabsModule, MatIconModule, MatToolbarModule,
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
    MarkdownPipe,
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
