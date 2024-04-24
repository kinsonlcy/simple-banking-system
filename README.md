# simple-banking-system

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

This project is to demonstrate how to use Express with Typescript to implement a simple banking system that allow user to perform the following features:

- Users can create a new bank account with a name and starting balance
- Users can deposit money to their accounts
- Users can withdraw money from their accounts
- Users are not allowed to overdraft their accounts
- Users can transfer money to other accounts in the same banking system
- Users can see their account transaction history

Tools:

- Express for API server
- Prisma for ORM
- Jest for Unit testing

A Postman collection json file is also provided in the root directory for the ease of API testing.

## Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

1. Assuming Node and yarn are correctly installed on your machine.

```bash
node -v
v21.7.3

yarn -v
1.22.22
```

2. Installing dependencies

```bash
yarn
```

3. Put `.env` in the root directory of this project. For development, you can create a symbolic link to `.env.example`:

```bash
ln -s .env.example .env
```

That's all of setup! You're good to go.

## Usage <a name = "usage"></a>

### Development server

To start the development server, invoke

```bash
yarn dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to see the server in action.

The development server will restart automatically to take in recent changes to files in `src` folder, thanks to `nodemon`.

To run migration, invoke

```bash
yarn prisma migrate dev
```

To run test, invoke

```bash
yarn test
```

To build, invoke

```bash
yarn build
```