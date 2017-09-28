# app_backend
Repository for the threefold app backend


## API

The base URL for all API requests is https://tff-backend.appspot.com/api/plugins/tff_backend/v1.0

### Authentication

Set the `Authorization` header with value: `Bearer <jwt>` where `<jwt>` is a JWT for the current user.
The issuer of the JWT should be `itsyouonline`, and the audience should be `tff_backend`.

### Transactions

#### List transactions

GET /users/{username}/transactions

Optional query parameters: `token_type`, `page_size`, `cursor`

#### Grant tokens

POST /users/{username}/transactions

```json
{
	"token_count": 123,
	"memo": "Memo goes here",
	"timestamp": 0,
	"token_type": "iTFT_A"
}
```
