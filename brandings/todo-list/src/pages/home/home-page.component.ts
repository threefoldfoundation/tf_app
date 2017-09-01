import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { TodoList } from '../../interfaces/todo-list.interfaces';
import { TodoListService } from '../../services/todo-list.service';
import { Platform } from 'ionic-angular';
import { TodoListPageComponent } from '../todo-list/todo-list-page.component';

@Component({
  selector: 'home-page',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'home-page.component.html',
})
export class HomePageComponent implements OnInit {
  tabComponent = TodoListPageComponent;
  todoLists: TodoList[] = [];

  constructor(private todoListService: TodoListService,
              private platform: Platform) {
  }

  ngOnInit() {
    this.todoLists = this.todoListService.getTodoLists();
  }

  close() {
    this.platform.exitApp();
  }
}
