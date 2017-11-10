import { ErrorService } from '../pages/error.service';
import { AgendaService } from './agenda.service';
import { GlobalStatsService } from './global-stats.service';
import { I18nService } from './i18n.service';
import { ReferrerService } from './referrer.service';
import { RogerthatService } from './rogerthat.service';
import { SeeService } from './see.service';
import { TodoListService } from './todo-list.service';

export const SERVICES = [ I18nService, RogerthatService, TodoListService, GlobalStatsService, SeeService, ErrorService, ReferrerService,
  AgendaService ];
