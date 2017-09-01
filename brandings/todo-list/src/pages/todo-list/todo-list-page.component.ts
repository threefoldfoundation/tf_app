import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavParams, Platform } from 'ionic-angular';
import { TodoList } from '../../interfaces/todo-list.interfaces';

@Component({
  selector: 'todo-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'todo-list-page.component.html'
})

export class TodoListPageComponent implements OnInit {
  todoList: TodoList;

  constructor(private navParams: NavParams, private platform: Platform) {
  }

  ngOnInit() {
    this.todoList = <TodoList>this.navParams.data;
  }

  close() {
    this.platform.exitApp();
  }
}
