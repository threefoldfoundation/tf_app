# Todo list

## Development

Run `node_modules/ionic/bin/ionic serve`

## Production build

Run `npm run build:zip`. A `global-stats.zip` file will be generated in this folder.

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
  localStorage.setItem('global_stats', JSON.stringify([
    {
      "id": "TFF",
      "market_cap": 5000000,
      "name": "Threefold token",
      "token_count": 123456,
      "unlocked_count": 10000,
      "value": 5
    },
    {
      "id": "TFFC",
      "market_cap": 50500,
      "name": "Threefold token contributor",
      "token_count": 9001,
      "unlocked_count": 5000,
      "value": 10
    }
  ]));
  setTimeout(() => rogerthat.callbacks._ready(), 250);
</script>
```
