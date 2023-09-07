# ChatApp-Client

## Requirements
These are the product requirement for the chat application:
## Registration
* Users can register using their email.
* Email activation.
## Authentication
* Guests can join the chat and get “Guest-” prefix to their selected names.
* Registered users can login with email & password.
## Permissions
* Guests can only use the main “real time chat”.
* Registered users can also send/receive personal messages.
## Main Chat Room
* All users can read messages in the main room.
## Message History
* All message history is saved in the DB (Offline users can see chat history when logging in).
* Users can view chat history from before they logged in.
## User Statuses
* Online - all currently connected users.
* Away - switchable by the user.
* Offline - all registered users who are not currently connected.
## Private Messaging
* Users can send a private message to other users.
## User Profile
* Can be private or public.
* Will include (some fields can be optional):
* Photo
* First name
* Last name
* Nickname
* Email
* Date of birth
* Age
* Description
## Chat Export
* A user can download all currently visible messages as a text file.
## Admin Users
* An admin is a registered user with some extra Permissions.
* Admins can mute/unmute other users in the main chat (muted users can still send private messages).
* Admins appear first in the users list in the chat with a * in front of their user name.
* Making a user admin is done manually in the db.
