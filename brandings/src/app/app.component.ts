import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Actions } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { PaymentQRCodeType, PayWidgetData } from '../manual_typings/rogerthat';
import {
  AgendaPageComponent,
  GlobalStatsPageComponent,
  InvitePageComponent,
  NodeStatusPageComponent,
  SeePageComponent,
  TodoListOverviewPageComponent,
  TodoListPageComponent,
} from '../pages';
import { ErrorService } from '../pages/error.service';
import { PayWidgetPageComponent, WalletPageComponent } from '../pages/wallet';
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
        this.rogerthatService.getContext().subscribe(context => {
          this.rootPage = this.getRootPage(context);
          this.platformReady = true;
          this.cdRef.detectChanges();
        });
      });
    });
    setInterval(() => this.cdRef.detectChanges(), 200);
  }

  ngOnInit() {
    // Useful for debugging
    // this.actions$.subscribe(action => console.log(action));
    this.actions$.subscribe(action => console.log(JSON.stringify(action)));
  }

  private getRootPage(context: any): any {
    const initialPage = this.processContext(context);
    if (initialPage) {
      return initialPage;
    }
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
      return page.page;
    } else {
      console.error('Cannot find page for menu item', JSON.stringify(rogerthat.menuItem));
    }
  }

  private processContext(data: any): [ any, any ] | null {
    if (data.context && data.context.t) {
      switch (data.context.t) {
        case PaymentQRCodeType.TRANSACTION:
          // Currently not supported, just show the wallet instead
          return [ WalletPageComponent, null ];
        case PaymentQRCodeType.PAY:
          const payContext: PayWidgetData = data.context;
          return [ PayWidgetPageComponent, { payContext } ];
        default:
          if (data.context.result_type === 'plugin') {
            const msg = this.translate.instant('not_supported_ensure_latest_version', { appName: rogerthat.system.appName });
            const content = {
              success: false,
              code: 'not_supported',
              message: msg,
            };
            rogerthat.app.exitWithResult(JSON.stringify(content));
          } else {
            const msg = this.translate.instant('qr_code_not_supported_ensure_latest_version', { appName: rogerthat.system.appName });
            this.errorService.showVersionNotSupported(msg);
          }
      }
    }
    return null;
  }
}
