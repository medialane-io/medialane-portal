# Interface copy

Strings that live in components and helpers rather than in a page.

## `src/lib/collection-copy.ts`

- **label:** Group
- **hint:** One per event, or one for everything.
- **empty:** No groups yet
- **create:** New group
- **label:** Collection
- **hint:** One per project, or one for everything.
- **empty:** No collections yet
- **create:** New collection
- **item:** items

## `src/lib/spend-labels.ts`

- **wallet:deploy:** Recipient wallets
- **paymaster:invoke-build:** Transaction gas
- **paymaster:deploy-build:** Wallet gas
- **metadata:upload-file:** Images stored
- **metadata:upload-json:** Details stored
- **metadata:upload-directory:** Folders stored
- **metadata:signed-url:** Upload links
- **intent:create-tier:** Tickets created
- **intent:create-collection:** Collections created
- **intent:mint:** Issuance prepared
- **rpc:call:** Chain reads
- **price:read:** Price lookups
- **auth:email-send:** Emails sent

## `src/components/footer.tsx`

- **label:** X / Twitter
- **label:** Telegram
- **label:** GitHub
- **label:** DAO
- Protocol infrastructure for licensed intellectual property. Built for integrators and the businesses and AI agents they serve.
- Platform
- Community
- Legal

## `src/components/connect-dialog.tsx`

- **description:** You may have declined it, or your wallet may need extra verification first.
- Connect Wallet
- Choose how you want to connect to Medialane.
- Browser Wallets
- No browser wallets detected. Install Ready or Braavos to continue.

## `src/components/portal/task-dialog.tsx`

- You need more credits for this run
- Nothing was issued and nothing was charged. Top up and start it again.
- Add credits
- Not now
- This one is on us to sort out
- Your run is paused while we clear something on our side. Nothing was issued, and nothing was charged. Try again in a few minutes.
- Close
- Done

## `src/components/portal/issuance-task.tsx`

- Launchpad
- **title:** Proof of ownership
- **title:** Terms that travel
- **title:** Held by the right people
- Cover image
- Click to upload (JPG, PNG, GIF, SVG, WebP · max 10 MB)
- Say what kind of material this is, and link to somewhere it can be read about.
- These travel with the asset and are recorded alongside it as proof of the terms you set.
- Recipients
- One email per line. Everyone receives their own copy.
- **recipient:** recipients
- This run costs
- Working
- Connect your wallet to issue.

## `src/components/portal/tickets-task.tsx`

- Launchpad
- Ticket
- Artwork
- Validity
- Supply
- Empty matches the guest list.
- **ticket:** tickets
- Tickets are tradable assets. These terms travel with them.
- Passing on
- Resale royalty %
- License
- AI and data mining
- Territory
- Guest list
- **guest:** guests
- Group
- Cost
- Working
- Connect your wallet.
- **sm:items-center:** sm:items-start

## `src/components/portal/collection-picker.tsx`

- Try again
- Name
- Short code
- Cancel
- Promise

## `src/components/portal/credits-tab.tsx`

- API Credits
- Every API call is billed per action from this balance, pay-as-you-go. Top up with USDC on Starknet whenever you're running low.
- Balance
- Connect your wallet above to add credits.
- Deposits are launching soon. Check back, or reach out if you need credits in the meantime.
- This balance is shared across every API key on your account, so it stays intact if you revoke or lose a key.
- Payment history

## `src/components/portal/api-keys-tab.tsx`

- **label:** List open orders
- **label:** Get your account profile
- Quickstart
- Replace
- YOUR_API_KEY
- Need more? The full reference is in the
- API docs
- Couldn't load your API keys. Please try again in a moment.
- API Keys
- Use a key to authenticate requests to the Medialane REST API from your app, script, or agent.
- New Key
- A new key's full value is shown once. Copy it before closing the dialog.
- Lost a key? Revoke it below and create a new one.
- Credits stay with your account regardless of which key is used, so your balance stays intact when you revoke one.
- You don't have any API keys yet. Create one to start calling the Medialane API.
- Create your first key
- **default:** secondary
- Create API Key
- Copy your key now. It won't be shown again, so keep it somewhere safe. If you lose it, revoke it and create a new one.
- Done
- Label (optional)
- A name to help you tell keys apart later. You can use up to 5 at once.
- Cancel

## `src/components/portal/buy-credits-dialog.tsx`

- Crediting your account…
- Your transfer is on-chain. This usually only takes a few seconds.
- Add credits
- Pay with
- **default:** outline
- Add API credits to your account.

## `src/components/portal/spend-panel.tsx`

- Your first run will show up here, itemised by what it did.

