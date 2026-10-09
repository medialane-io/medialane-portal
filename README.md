# Medialane Portal

**Protect, license and monetize IP onchain, at the scale of an organization.**

[portal.medialane.io](https://portal.medialane.io) is where organizations, developers and AI agents work with Medialane. It brings the same rails that power [medialane.io](https://medialane.io) to whole catalogs, communities and applications.

---

## For organizations

- **Data Tokenization:** register an entire archive or catalog in one run, with authorship, date, license terms and AI policy recorded for every item.
- **Certificate Emission:** issue non-transferable certificates to a list of recipients. Anyone without a wallet gets one.
- **IP Ticketing:** issue tickets with their own supply and validity window, and send them to a guest list.
- **Launchpad services:** limited editions, drops, clubs and sponsorships for your community.

Every asset records its authorship and date permanently, and carries its license and AI policy (Allowed, Training Only or Not Allowed) wherever it goes.

## For developers

Sign in with your email and a passkey, create your API key, and build on the same open API and [`@medialane/sdk`](https://github.com/medialane-io/medialane-sdk) that the Medialane apps use. Every feature in our apps is available to your app too.

## For AI agents

Agents are first-class users. An agent with a Starknet keypair can sign in, get access and call the API on its own, with no person in the loop.

---

## Learn more

- [docs.medialane.io/dev](https://docs.medialane.io/dev): developer reference
- [docs.medialane.io/learn](https://docs.medialane.io/learn): programmable IP, licensing and the launchpad
- [medialane.io](https://medialane.io): the Medialane app

---

## Development

```bash
bun install
cp .env.example .env.local
bun dev
```

Before opening a pull request, run `bun run typecheck`, `bun run lint` and `bun test`.

---

## License

[MIT](LICENSE)
