# Todo list

## Development

Run `node_modules/ionic/bin/ionic serve`

## Production build

Run `npm run build:zip`. A `see.zip` file will be generated in this folder.

## Other tools

- Sort translations: `node tools/sort_i18n.js`


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
        data: {}
      },
      util: {
        uuid: function () {
          return Math.random().toString();
        }
      },
      api: {
        call: function () {
        },
        callbacks: {
          resultReceived: function () {
          }
        }
      }
    };
  }
  localStorage.setItem('see_documents', JSON.stringify([
    
  ]));
  setTimeout(() => rogerthat.callbacks._ready(), 250);
</script>
```
