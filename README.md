# Nest Request Job Cards Server!
## Description

This server is made using [Nest](https://github.com/nestjs/nest) framework with TypeScript language.

## Installation

```bash
$ yarn install
```

## Start database

Rename the `.env.sample` file into `.env` and fill it with your database and AWS S3 bucket credentials.

```bash
$ yarn prisma:apply
```

## Seed database (if necessary)

```bash
$ yarn prisma:seed
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

> Read the `package.json` for more scripts. 

## Stay in touch

- Author - [Ruslan Gonzalez](https://rusgunx.tk)
- Website - [https://rusgunx.tk](https://rusgunx.tk/)
- Twitter - [@ruslangonzalez](https://twitter.com/ruslangonzalez)

