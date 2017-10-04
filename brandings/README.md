# Threefold brandings

## Development

Run `node_modules/ionic/bin/ionic serve`

## Production build

Run `npm run build:zip`. A `threefold.zip` file will be generated in this folder.

## Other tools

- Sort translations: `npm run sort_translations`


## Testing

To test it, either upload it as a branding on your rogerthat server or add this to index.html above main.js to test it in the browser:

```html
<script>
  if (typeof rogerthat === 'undefined') {
    rogerthat = {
      callbacks: {
        ready: function (callback) {
          this._ready = callback;
        }
      },
      user: {
        language: 'en',
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
  setTimeout(() => rogerthat.callbacks._ready(), 250);
</script>
```


## Deployment on rogerthat

This branding can be used on menu items with the following tags, the appropriate page will be opened when clicking on the menu item.

- todo_list
- global_stats
- iyo_see
- referrals_invite
- set_referrer
