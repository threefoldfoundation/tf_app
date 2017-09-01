export interface TodoListItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface TodoList {
  id: string;
  name: string;
  items: TodoListItem[];
}
