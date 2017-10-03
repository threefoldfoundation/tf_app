## ThreeFold app IYO-based registration procedure

1/ App opens https://tff-backend.appspot.com?source=app in Safari. This page shows a LOGIN an REGISTER button.

2/ User presses REGISTER and is redirected to https://itsyou.online/register?client_id=threefold&endpoint=%2Fv1%2Foauth%2Fauthorize&redirect_uri=oauth-em-be-threefold-token%3A%2F%2Fx-callback-url&register=1&response_type=code&scope=XXX&state=YYY

Query params:
- **client_id**: threefold
- **endpoint**: /v1/oauth/authorize
- **redirect_uri**: oauth-em-be-threefold-token://x-callback-url
- **register**: 1
- **response_type**: code
- **scope**: user:name, user:see, user:keystore, user:validated:email, user:validated:phone, user:address
- **state**: a guid

3/ User needs to fill in first name, last name, country, phone number, email, password, password confirmation.

4/ User receives SMS and EMAIL and validates them.

5/ User needs to authorize permissions to ThreeFold to use username, full name, email address, phone number, address, keystore and see documents.

6/ User is redirected to the URL **oauth-em-be-threefold-token://x-callback-url** which is registered by TF app. The TF app is opened by the OS. The code and state are sent to the backend for validation. Once this is completed, the registration is finished.
