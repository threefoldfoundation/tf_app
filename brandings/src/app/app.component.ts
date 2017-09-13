import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TranslateService } from '@ngx-translate/core';
import { RogerthatService } from '../services/rogerthat.service';
import { TodoListService } from '../services/todo-list.service';
import { TodoListPageComponent } from '../pages/todo-list/todo-list-page.component';
import { ErrorService } from '../pages/error.service';
import { TodoListOverviewPageComponent } from '../pages/todo-list/todo-list-overview-page.component';
import { GlobalStatsPageComponent } from '../pages/global-stats/global-stats-page.component';
import { SeePageComponent } from '../pages/see/see-page.component';
import { InvitePageComponent } from '../pages/referrals/invite-page.component';
import { SetReferrerPageComponent } from '../pages/referrals/set-referrer-page.component';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { IAppState } from './app.state';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app.html',
})
export class AppComponent implements OnInit {
  rootPage: any;
  platformReady = false;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private translate: TranslateService,
              private rogerthatService: RogerthatService,
              private todoListService: TodoListService,
              private cdRef: ChangeDetectorRef,
              private errorService: ErrorService,
              private actions$: Actions,
              private store: Store<IAppState>) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
      rogerthat.callbacks.ready(() => {
        console.timeEnd('loaded');
        statusBar.styleDefault();
        splashScreen.hide();
        this.rogerthatService.initialize();
        if (!rogerthat.menuItem) {
          // old iOS app doesn't support this yet
          this.errorService.showVersionNotSupported(this.translate.instant('not_supported_pls_update'));
          return;
        }
        let todoComp: typeof TodoListOverviewPageComponent | typeof TodoListPageComponent = TodoListOverviewPageComponent;
        const todoLists = this.todoListService.getTodoLists();
        if (todoLists.length === 1) {
          todoComp = TodoListPageComponent;
        }
        const pages = [
          { tag: 'todo_list', page: todoComp },
          { tag: 'global_stats', page: GlobalStatsPageComponent },
          { tag: 'iyo_see', page: SeePageComponent },
          { tag: 'referrals_invite', page: InvitePageComponent },
          { tag: 'set_referrer', page: SetReferrerPageComponent },
        ];
        const page = pages.find(page => sha256(page.tag) === rogerthat.menuItem.hashedTag);
        if (page) {
          this.rootPage = page.page;
        } else {
          console.error('Cannot find page for menu item', rogerthat.menuItem);
        }
        this.platformReady = true;
        this.cdRef.detectChanges();
      });
    });
  }

  ngOnInit() {
    this.actions$.withLatestFrom(this.store).subscribe(([ action, store ]) => {
      // Useful for debugging
      console.log('Dispatching action', action, store);
    });
  }
}