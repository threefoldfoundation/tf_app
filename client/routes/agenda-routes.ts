import { MetaGuard } from '@ngx-meta/core';
import {
  AgendaEventDetailPageComponent,
  AgendaEventsListPageComponent,
  CreateAgendaEventPageComponent,
  EventParticipantsPageComponent,
} from '../components/agenda';

export const AGENDA_ROUTES = [
  {
    path: 'agenda',
    canActivate: [ MetaGuard ],
    data: {
      icon: 'event',
      id: 'tff_agenda',
      meta: {
        title: 'tff.agenda',
      },
    },
    component: AgendaEventsListPageComponent,
  },
  {
    path: 'agenda/create',
    canActivate: [ MetaGuard ],
    data: { meta: { title: 'tff.create_event' } },
    component: CreateAgendaEventPageComponent,
  },
  {
    path: 'agenda/:eventId',
    canActivate: [ MetaGuard ],
    canActivateChild: [ MetaGuard ],
    data: {
      sidebarItems: [
        { label: 'tff.details', 'icon': 'edit ', route: 'details' },
        { label: 'tff.participants', 'icon': 'group', route: 'participants' },
      ],
      meta: { title: 'tff.agenda' },
    },
    children: [
      { path: '', redirectTo: 'details', pathMatch: 'full' },
      {
        path: 'details',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.event_details' } },
        component: AgendaEventDetailPageComponent,
      },
      {
        path: 'participants',
        canActivate: [ MetaGuard ],
        data: { meta: { title: 'tff.participants' } },
        component: EventParticipantsPageComponent,
      } ],
  },
];
