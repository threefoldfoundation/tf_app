import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import {
  AgendaPageComponent,
  GlobalStatsPageComponent,
  InvitePageComponent,
  NodeStatusPageComponent,
  SeePageComponent,
  TodoListOverviewPageComponent,
  TodoListPageComponent,
  ExchangesPageComponent,
} from '../pages';
import { ErrorService } from '../pages/error.service';
import { RogerthatService } from '../services/rogerthat.service';
import { TodoListService } from '../services/todo-list.service';

interface RootPage {
  page: any;
  params: any;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'app.html',
})
export class AppComponent implements OnInit {
  root: RootPage;
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
        }
        if (rogerthat.system.os === 'android') {
          statusBar.styleBlackTranslucent();
        } else {
          statusBar.styleDefault();
        }
        splashScreen.hide();
        this.rogerthatService.initialize();
        this.rogerthatService.getContext().subscribe(context => {
          const root = this.getRootPage(context);
          if (root) {
            this.root = root;
          }
          this.platformReady = true;
          this.cdRef.detectChanges();
        });
      });
    });
  }

  ngOnInit() {
    // Useful for debugging
    // this.actions$.subscribe(action => console.log(action));
    this.actions$.subscribe(action => console.log(JSON.stringify(action)));
  }

  private getRootPage(context: any): RootPage | null {
    if (!rogerthat.menuItem) {
      // old iOS app doesn't support this yet
      this.errorService.showVersionNotSupported(this.translate.instant('not_supported_pls_update'));
      return null;
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
      { tag: 'exchanges', page: ExchangesPageComponent},
    ];
    // the or is for debugging
    const page = pages.find(p => sha256(p.tag) === rogerthat.menuItem.hashedTag || p.tag === rogerthat.menuItem.hashedTag);
    if (page) {
      return { page: page.page, params: null };
    } else {
      console.error('Cannot find page for menu item', JSON.stringify(rogerthat.menuItem));
    }
    return null;
  }
}
