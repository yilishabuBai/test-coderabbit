# API Documentation

## Endpoints

The following endpoints are available. Note the base URL is `http://localhost:3000`.

### Get Users
Gets all users from the database

**URL**: `/api/users`

**Method**: GET

**Response**:
```json
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

### Get User by ID

**URL**: `/api/users/:id`

**Method**: GET

|Parameter|Type|Description|
|---|---|---|
|id|integer|The user ID|

**Response**:
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}
```

### Create User

**URL**: `/api/users`

**Method**: POST

**Body**:
```json
{
  "name": "Charlie",
  "email": "charlie@example.com",
  "password":"secret123"
}
```

**Response**:
```json
{
  "id": 3,
  "name": "Charlie"
}
```

## Error Handling

All errors follow this format:

```json
{
  "error": {
    "code": 404,
    "message": "Not Found"
  }
}
```

Error codes:

- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not found
- 500 - Internal Server Error

## Authentication

Authentication is done via JWT tokens. To get a token:

1. POST to `/api/auth/login` with credentials
2. Include the token in the `Authorization` header
3. Tokens expire after 24 hours

For more details see the [CodeRabbit Config Guide](./coderabbit-config.md).

Deployment and extended API reference documentation are coming soon.

## Rate Limiting
The API is rate limited to 100 requests per minute. Exceeding this will result in a 429 response.

### Websocket Support

The API also supports websockets for real-time updates. Connect to `ws://localhost:3000/ws` to receive events.

#### Events:

* `user.created` - When a new user is created
* `user.updated` - When a user is updated
* `user.deleted` - When a user is deleted

---

## Changelog

* v1.0.0 - Initial release
* v1.1.0 - Added websocket support
* v1.2.0 - Added rate limiting
