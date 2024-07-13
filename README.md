# Authentication and Access Control Project

## Project Description

This project implements an authentication and access control system using Node.js, Express, Prisma ORM, and JWT for token-based authentication. Additionally, it has a mechanism to protect against excessive login attempts.

To make requests, execute the `index.py` file with the command `python index.py`.
Or use an API Client like Postman or Insomnia.

## Key Features

- **User Authentication**: Allows users to log in using email and password.
- **Protection Against Brute Force**: Limits the number of login attempts and temporarily blocks the account after multiple failed attempts.
- **JWT Token Generation**: Generates a JWT token for authenticated users, which can be used to access protected routes.
- **Activity Logging**: Records invalid access attempts.

## Technologies Used

- Node.js
- Express
- Prisma ORM
- JWT (JSON Web Tokens)
- Bcrypt
- TypeScript
- dotenv

## Directory Structure

```
/project-root
|-- .env
|-- index.py
|-- series.ts
|-- user.ts
|-- package.json
|-- README.md
```

## Configuration and Execution

### Prerequisites

- Installed Node.js
- Installed NPM or Yarn
- PostgreSQL, MySQL, or another database compatible with Prisma

### Installation

1. Clone the repository:

```bash
git clone https://github.com/xmurilo/Series_API.git
```

2. Navigate to the project directory:

```bash
cd Series_API
```

3. Install the dependencies:

```bash
npm install
```

4. Configure the `.env` file with the necessary environment variables:

```bash
DATABASE_URL="url_of_your_database"
JWT_KEY="key_of_your_jwt_token"
```

5. Run Prisma migrations to set up the database:

```bash
npx prisma migrate dev --name init
```

### Execution

To start the development server, run:

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

## Endpoints

### Authentication

#### POST `/`

Authenticates the user.

- **Request Body:**

  ```json
  {
    "email": "user@example.com",
    "password": "Password123#"
  }
  ```

- **Responses:**
  - **200 OK**
  ```json
  {
    "id": "userId",
    "name": "User Name",
    "email": "user@example.com",
    "token": "jwt_token"
  }
  ```
  - **400 Bad Request**
  ```json
  {
    "error": "Incorrect login or password"
  }
  ```
  - **403 Forbidden**
  ```json
  {
    "error": "Account blocked. Please try again later."
  }
  ```

## Security

This project utilizes several security measures to protect user data:

- **Password Hashing**: Passwords are securely stored in the database using bcrypt.
- **Protection Against Brute Force**: Limits the number of login attempts and temporarily blocks the account after multiple failed attempts.
- **JWT**: Uses JWT tokens for user authentication and authorization.

## Contribution

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request
