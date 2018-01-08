# ThreeFold app home screen implementation

## THREEFOLD NEWS

- Show the 3 most recent news items using `rogerthat.news.list`
  - response contains `result` and `cursor`
    - `result` is an array of news items
    - a news item (AppNewsItemTO) contains: `title`, `message`, `image_url`, ...
  - TODO in rogerthat:
    - implementation of rogerthat.news.list
    - new partials should be downloaded completely
- Register to updates using `rogerthat.callbacks.badgeUpdated({type: 'news', number: 3})`.

## BUY TOKENS

- **STEP 1/2 - SUBMIT REFERRAL CODE**
  - Show this tile if `!rogerthat.user.data.has_referrer`.


- **REGISTER STEP 2/2 - GO THROUGH KYC CHECK**
  - Show this tile if `rogerthat.user.data.has_referrer && !rogerthat.user.data.kyc.verified`.
  - You can see the verification status using `rogerthat.user.data.kyc.status`, which is a number:
    - **-10**: DENIED
    - **0**: UNVERIFIED (Not verified, and not applied to be verified yet)
    - **10**: PENDING_SUBMIT (KYC flow has been sent to the user)
    - **20**: SUBMITTED (KYC flow has been submitted by user)
    - **30**: INFO_SET (Admin verified the info sent in by the user, completed any missing data. Info is now ready to be checked to Onfido.)
    - **40**: PENDING_APPROVAL (API call to Onfido done, admin has to mark user as approved/denied now)
    - **50**: VERIFIED (Approved by admin)


- **YOU'RE GOOD TO GO**
  - Show this tile if `rogerthat.user.data.has_referrer && rogerthat.user.data.kyc.verified`.


## CONTACT SUPPORT

- TBD how to determine the offline/online state.

## INBOX

- On press, open the existing inbox using `rogerthat.util.open({action_type: null, action: 'messages'})`.
- Register on badge number changes using `rogerthat.callbacks.badgeUpdated({type: 'messages', number: 3})`

## BECOME A BLOCKCHAIN HOST

- Show this tile if `!rogerthat.user.data.nodes || !rogerthat.user.data.nodes.length`.
  - TODO in TF-backend: save nodes in user_data

## NODE STATUS

- See `rogerthat.user.data.nodes[x].online` to show the node connectivity.
  - TODO in TF-backend: save nodes in user_data
  - `node = {online: true, id: '273'}`
- On press, navigate to the existing "Node Status" mini-app.

## TF AGENDA

- See `rogerthat.service.data.agenda_events`. This is an array containing events.
- An event contains: `title`, `description`, `start_timestamp`, `past`, ...

## REFERRALS

- See `rogerthat.user.data.referrals` (array).
  - TODO in TF-backend: save referrals in user_data

## SPREAD THE WORD

- Navigate to the existing "Invite friends to ThreeFold" mini-app.

## WALLET

- Open the existing wallet functionality using `rogerthat.util.open({action_type: 'cordova', action: 'rogerthat-payment', title: 'Wallet'})`.

## TF DOCS

- Navigate to the existing "TF docs" mini-app.
