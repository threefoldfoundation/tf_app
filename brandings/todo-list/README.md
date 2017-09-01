# Todo list

## Development

Run `node_modules/ionic/bin/ionic serve`

## Production build

Run `npm run build:zip`. A `todo-list.zip` file will be generated in this folder.

## Other tools

- Sort translations: `node tools/sort_i18n.js`


## Testing

To test it, either upload it as a branding on your rogerthat server or add this to index.html above main.js to test it in the browser:

```html
<script>
  if (typeof rogerthat === 'undefined') {
    rogerthat = {
      callbacks: {
        ready: function () {
        }
      },
      user: {
        data: {
          todo_lists: ['list1', 'list2'],
          todo_list1: {
            id: 'list1',
            name: 'ITO todos',
            items: [{
              id: 'item1',
              name: 'Check out the todo list',
              checked: true
            }, {
              id: 'item2',
              name: 'Some other thing',
              checked: false
            }]
          },
          todo_list2: {
            id: 'list2',
            name: 'Second list',
            items: [{
              id: 'item1',
              name: 'This is the second list',
              checked: false
            }, {
              id: 'item2',
              name: 'Second item of the second list',
              checked: false
            }]
          }
        }
      }
    };
  }
</script>
```
