# Bridge bot

![./images/discord.png](images/discord.png)
![./images/matrix.png](images/matrix.png)
![./images/revolt.png](images/revolt.png)

A cool bot that allows you to share chats between multiple platforms
made to be as animalistic as possible no discord.js or other bloated libs that hog memory

## Inviting the bot

discord: https://discord.com/oauth2/authorize?client_id=870366487674753054&permissions=536870912&scope=bot%20applications.commands

matrix: @bridger:matrix.org just invite it to your public server may take some time to join join one of the support channels to get it sped up

revolt: https://app.revolt.chat/bot/01FGDVV90D3T64A6MRKMB9V02S

## Using the bot

wait for the bot to register slashcommands in your discord server and then use /setup to set it up

## Feature requests

You can report issues or ask for support in any of these discord

- this also applies if you dont need a discord link and just a matrix with revolt

- [discord](https://discord.gg/mY8zTARu4g)
- [Revolt](https://app.revolt.chat/invite/WsEK5GFG)
- [matrix](https://matrix.to/#/#bridger:matrix.org)

## Selfhosting

node version: ^16
yarn: 1.22+

you need the following variables in your dotenv

```ini
# .env
# postgres database or anything that works with prisma
DATABASE_URL=
DISCORD_TOKEN=
MATRIX_TOKEN=
REVOLT_TOKEN=
# Disable prisma telemetry
CHECKPOINT_DISABLE=1
```

#### install the dependencies

```bash
yarn
```

#### Sync the prisma database

```bash
yarn prisma db push
yarn prisma generate
```

#### start the bot

```bash
yarn start
```

## Plans

My plan is to add multiple platforms and not just matrix

- auto join matrix rooms
- add permission checks for matrix and revolt

## Contributing

Contributions are welcome even if its just to fix a typo ( which there prob are enough knowing my spelling )

## Donating

You can donate to me using the following xmr address
`89prBkdG58KU15jv5LTbP3MgdJ2ikrcyu1vmdTKTGEVdhKRvbxgRN671jfFn3Uivk4Er1JXsc1xFZFbmFCGzVZNLPQeEwZc`

## not faq

- why not use the packages instead of making your own forks of them
  - A they are bloated and i like todo it in a non bloated way with the least possible deps

## LICENSE

> This project is licensed under the [BSD 3-Clause License](./LICENSE)
> Copyright (c) 2021. Tricked.
