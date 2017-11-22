import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { NavController, Platform } from 'ionic-angular';
import { TodoList } from '../../interfaces/todo-list.interfaces';
import { TodoListService } from '../../services/todo-list.service';
import { TodoListPageComponent } from './todo-list-page.component';

@Component({
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'todo-list-overview-page.component.html',
})
export class TodoListOverviewPageComponent implements OnInit {
  todoLists: TodoList[] = [];

  constructor(private todoListService: TodoListService,
              private platform: Platform,
              private nav: NavController) {
  }

  ngOnInit() {
    this.todoLists = this.todoListService.getTodoLists();
  }

  close() {
    this.platform.exitApp();
  }

  showDetails(todoList: TodoList) {
    this.nav.push(TodoListPageComponent, { todoList });
  }
}
