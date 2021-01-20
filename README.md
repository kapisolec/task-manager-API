# Task Manager API 
Basic API for task manager using mongoDB and email sending 

To run it, you need to locally add environment variables for:
`port`, `mongoDB connection url`, `email send grid API key`, `jwt secret password for token auth`


at `./config/env.dev` 
To run it just type `npm run dev`

API is deployed at https://kmaj-task-manager.herokuapp.com/.

Endpoints:

| Endpoint | Request | Variables to provide | URL| Return value|
|--|--|--|--|--|
|Create user| POST | name(str), email(str), password(str) | `url`/users | User object|
|User login | POST | email(str), password(str) | `url`/users/login | User object|
|Logout from cur. session| POST | | `url`/users/logout |  |
|Logout from all sessions| POST | | `url`/users/logoutAll | |
|Create task| POST | description(str), completed(boolean)| `url`/users | Task object |
|Upload avatar| POST | avatar(form-data) | `url`/users/me/avatar | String |
|Get user avatar | GET | `id` | `url`/users/`:id`/avatar | binary/image |
| Read tasks| GET | sortBy=completed_`asc/desc` | `url`/task?sortBy=completed_`asc/desc` | Task object |
| Read user profile| GET |  | `url`/users/me | User object |
| Update user | PATCH | password, email | `url`/users/me | User Object |
| Update task | PATCH | `id` | `url`/task/`:id` | Task Object|
|Delete image|DEL| | `url`/users/me/avatar |String|
|Delete user | DEL | |`url`/users/me| |
|Delete task | DEL | `id` | `url`/task/`:id` |  

