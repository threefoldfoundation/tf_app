import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { TodoList } from '../../interfaces/todo-list.interfaces';

@Component({
  selector: 'todo-item-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'todo-item-list.component.html',
})

export class TodoItemListComponent implements OnChanges {

  @Input() todoList: TodoList;

  itemsLeft = 0;
  itemLeftMap = {
    '=0': 'items_left.none',
    '=1': 'items_left.singular',
    'other': 'items_left.multiple',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.todoList) {
      const list = <TodoList>changes.todoList.currentValue;
      this.itemsLeft = list.items.length - list.doneCount;
    }
  }
}
