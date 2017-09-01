import { Injectable } from '@angular/core';
import { TodoList } from '../interfaces/todo-list.interfaces';

@Injectable()
export class TodoListService {

  getTodoLists(): TodoList[] {
    let todoLists = [];
    const listIds: string[] = rogerthat.user.data.todo_lists;
    if (listIds && listIds.length) {
      for (const list of listIds) {
        const listKey = 'todo_' + list;
        if (rogerthat.user.data[ listKey ]) {
          todoLists.push(<TodoList>rogerthat.user.data[ listKey ]);
        }
      }
    }
    return todoLists;
  }
}
