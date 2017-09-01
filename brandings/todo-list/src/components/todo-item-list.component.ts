import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { TodoListItem } from '../interfaces/todo-list.interfaces';

@Component({
  selector: 'todo-item-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'todo-item-list.component.html',
})

export class TodoItemListComponent implements OnChanges {

  @Input() items: TodoListItem[];

  itemsLeft: number = 0;
  itemLeftMap = {
    '=0': 'items_left.none',
    '=1': 'items_left.singular',
    'other': 'items_left.multiple'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      this.itemsLeft = (<TodoListItem[]>changes.items.currentValue).filter(item => !item.checked).length;
    }
  }
}
