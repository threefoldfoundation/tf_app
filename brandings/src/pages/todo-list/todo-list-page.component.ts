import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams, Platform } from 'ionic-angular';
import { TodoList } from '../../interfaces/todo-list.interfaces';
import { TodoListService } from '../../services/todo-list.service';

@Component({
  selector: 'todo-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'todo-list-page.component.html'
})

export class TodoListPageComponent implements OnInit {
  todoList: TodoList;
  isRoot = false;

  constructor(private navParams: NavParams, private platform: Platform, private todoListService: TodoListService) {
  }

  ngOnInit() {
    this.todoList = <TodoList>this.navParams.data.todoList;
    if (!this.todoList) {
      this.todoList = this.todoListService.getTodoLists()[ 0 ];
      this.isRoot = true;
    }
  }

  close() {
    this.platform.exitApp();
  }
}
