# Bridge bot

A cool bot that allows you to share chats between multiple platforms
made to be as animalistic as possible no discord.js or other bloated libs that hog memory

## Inviting the bot

discord: https://discord.com/oauth2/authorize?client_id=870366487674753054&permissions=536870912&scope=bot%20applications.commands

matrix: @bridger:matrix.org just invite it to your public server may take some time to join

## Feature requests

you can request features in the [discord](https://discord.gg/mY8zTARu4g) or make a issue

## Selfhosting

you need the following variables in your dotenv

```ini
# .env
# postgres database or anything that works with prisma
DATABASE_URL=
DISCORD_TOKEN=
MATRIX_TOKEN=
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

## Contributing

Contributions are welcome even if its just to fix a typo ( which there prob are enough knowing my spelling )

## Donating

You can donate to me using the following xmr address
`89prBkdG58KU15jv5LTbP3MgdJ2ikrcyu1vmdTKTGEVdhKRvbxgRN671jfFn3Uivk4Er1JXsc1xFZFbmFCGzVZNLPQeEwZc`

## LICENSE

> This project is licensed under the [BSD 3-Clause License](./LICENSE)
> Copyright (c) 2021. Tricked.
