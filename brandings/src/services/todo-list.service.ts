import { Injectable } from '@angular/core';
import { TodoList } from '../interfaces/todo-list.interfaces';

@Injectable()
export class TodoListService {

  getTodoLists(): TodoList[] {
    const todoLists = [];
    const listIds: string[] = rogerthat.user.data.todo_lists;
    if (listIds && listIds.length) {
      for (const list of listIds) {
        const listKey = 'todo_' + list;
        if (rogerthat.user.data[ listKey ]) {
          const todoList = <TodoList>rogerthat.user.data[ listKey ];
          todoList.doneCount = todoList.items.filter(item => item.checked).length;
          todoLists.push(todoList);
        }
      }
    }
    return todoLists;
  }
}
