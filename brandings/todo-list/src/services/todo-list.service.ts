import { Injectable } from '@angular/core';
import { TodoList } from '../interfaces/todo-list.interfaces';

@Injectable()
export class TodoListService {

  getTodoLists(): TodoList[] {
    let todoLists = [];
    const listIds: string[] = rogerthat.user.data.todo_lists;
    if (listIds && listIds.length) {
      for (const list of listIds) {
        if (rogerthat.user.data[ list ]) {
          todoLists.push(<TodoList>rogerthat.user.data[ list ]);
        }
      }
    }
    return todoLists;
  }
}
