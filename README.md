# Chat App Server

This Node.js server is designed for a real-time chat application using Socket.io and MongoDB. The server includes JWT authentication, user login/register functionality, and manages conversations and messages through MongoDB.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Micu-Alex/chatApp-server-db.git
   cd chatApp-server-db
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

1. Set up your MongoDB database and configure the environment variables (see [Environment Variables](#environment-variables)).

2. Start the server:

   ```bash
   node index.js
   ```

## Folder Structure

- `config/`: JWT authentication token.
- `middleware/`: JWT authentication logic and cores.
- `models/`: Mongoose models for users, conversations, and messages.
- `routes/`: API routes for user authentication and registration.
- `socket/`: Socket.io event handlers.
- `startup/`: Server startup configuration.

## Environment Variables

```
set chatApp_jwtPrivateKey to a secret key
```

## Authentication

JWT (JSON Web Token) authentication is implemented for secure communication. The `auth` middleware checks for a valid token before processing any requests.

## Models

- `User`: Model for user data.
- `Conversation`: Model for conversation data.
- `Message`: Model for message data.

## API Endpoints

- `POST /auth`: User login endpoint.
- `POST /users`: User registration endpoint.

## Socket Events

- Custom events for chat functionality.

## Startup

The `startup` folder contains configuration files for initializing the server.

## License

This project is licensed under the [MIT License](LICENSE).
