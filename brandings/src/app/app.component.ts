import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { AgendaPageComponent } from '../pages/agenda/agenda-page.component';
import { ErrorService } from '../pages/error.service';
import { GlobalStatsPageComponent } from '../pages/global-stats/global-stats-page.component';
import { NodeStatusPageComponent } from '../pages/node-status/node-status-page.component';
import { InvitePageComponent } from '../pages/referrals/invite-page.component';
import { SeePageComponent } from '../pages/see/see-page.component';
import { TodoListOverviewPageComponent } from '../pages/todo-list/todo-list-overview-page.component';
import { TodoListPageComponent } from '../pages/todo-list/todo-list-page.component';
import { WalletPageComponent } from '../pages/wallet/wallet-page.component';
import { RogerthatService } from '../services/rogerthat.service';
import { TodoListService } from '../services/todo-list.service';

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
              private actions$: Actions) {
    translate.setDefaultLang('en');
    platform.ready().then(() => {
      rogerthat.callbacks.ready(() => {
        console.timeEnd('loaded');
        if (rogerthat.system.appId.includes('staging')) {
          statusBar.backgroundColorByHexString('#5f9e62');
        } else {
          statusBar.styleDefault();
        }
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
          { tag: 'agenda', page: AgendaPageComponent },
          { tag: 'node_status', page: NodeStatusPageComponent },
          { tag: 'wallet', page: WalletPageComponent },
        ];
        // the or is for debugging
        const page = pages.find(p => sha256(p.tag) === rogerthat.menuItem.hashedTag || p.tag === rogerthat.menuItem.hashedTag);
        if (page) {
          this.rootPage = page.page;
        } else {
          console.error('Cannot find page for menu item', JSON.stringify(rogerthat.menuItem));
        }
        this.platformReady = true;
        this.cdRef.detectChanges();
      });
    });
    setInterval(() => this.cdRef.detectChanges(), 200);
  }

  ngOnInit() {
    // Useful for debugging
    this.actions$.subscribe(action => {
      // if (true || window.location.host.includes('localhost')) {
      console.log(action);
      // } else {
      //   console.log(JSON.stringify(action));
      // }
    });
  }
}
