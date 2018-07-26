import { ErrorService } from '../pages/error.service';
import { AgendaService } from './agenda.service';
import { DocumentsService } from './documents.service';
import { ExchangesService } from './exchanges.service';
import { GlobalStatsService } from './global-stats.service';
import { I18nService } from './i18n.service';
import { NodeService } from './node.service';
import { RogerthatService } from './rogerthat.service';
import { TodoListService } from './todo-list.service';

export const SERVICES = [ I18nService, RogerthatService, TodoListService, GlobalStatsService, DocumentsService, ErrorService, AgendaService,
  NodeService, ExchangesService ];
