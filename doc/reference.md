# Schedulite Reference Document

## System Structure

### Repository Structure

Schedulite/  
├── backend/                   \# Node.js/Express API  
│   ├── src/  
│   │   ├── server.tsx         \# Entry point  
│   │   ├── models/            \# Database schemas  
│   │   │   └── eventSchema.tsx  
│   │   └── routes/            \# API routes  
│   │       └── eventRoutes.tsx  
│   ├── package.json           \# Dependencies  
│   └── .env                   \# Configuration (not in git)  
│  
├── wed-frontend/              \# Client app  
│   ├── html/  
│   │   ├── main.html          \# Event creation form  
│   │   └── dashboard.html     \# Availability view  
│   └── css/  
├── ios-frontend/              \# iOS mobile app  
├── android-frontend/          \# Android mobile app  
├── doc/  
│   └── dev\_process.md         \# Development guidelines  
│  
└── readme.txt                 \# Setup instructions

## Key APIs / Interfaces

| File Name | Route Purpose |
| :---- | :---- |
| auth.js | Allows a logged in user to get an OAuth2.0 token through Google APIs. |
| createEvent.js | Creates an event in a specific group. |
| createGroup.js | Creates a group with the current user as the owner of the group, and assigns random GroupID and join code. |
| debugPush.js | A debug endpoint to send a push notification to an authenticated user. Only used for testing and debugging. |
| getEvents.js | Fetches all events from groups the current user is found within on our database. |
| getGroups.js | Fetches all groups current user is found within on our database. |
| getSingleGroup.js | Fetches all group information for a specific group ID for the purposes of displaying it on the group homepage. |
| groupMembers.js | Fetches all group members for a specific group ID. |
| joinGroups.js | Allows current user to join a group with the inputted join code. |
| manageEvents.js | Allows users to edit and remove events. |
| rsvp.js | Either creates a new RSVP for current user for a specific event, or updates the current one. |
| users.js | Allows users to edit their avatar, view their current information, and delete their profile. |

## Configuration

### Backend env config variables:

| Environment Variable Name | Variable Purpose |
| :---- | :---- |
| MONGO\_URI  | The link to the database |
| PORT | The server port |
| CORS\_ORIGINS | The backend base url |
| GOOGLE\_CLIENT\_ID | Google API key |
| JWT\_SECRET | Our Schedulite auth token |

### Frontend env config variables

#### Mobile:

| Environment Variable Name | Variable Purpose |
| :---- | :---- |
| EXPO\_PUBLIC\_API\_URL | Base url to interact with backend APIs |
| EXPO\_PUBLIC\_GOOGLE\_WEB\_CLIENT\_ID | Google OAuth web client ID (same as GOOGLE\_CLIENT\_ID in backend) |

#### Web:

| Environment Variable Name | Variable Purpose |
| :---- | :---- |
| VITE\_API\_URL | A base url to interact with backend APIs |
| VITE\_GOOGLE\_CLIENT\_ID | Google OAuth web client ID (same as GOOGLE\_CLIENT\_ID in backend) |

## DB Schemas

### User Schema:

| Field Name | Type | Required |
| :---- | :---- | :---- |
| googleId | String | True |
| name | String | False |
| email | String | True |
| photoUrl | String | False |

### Group Schema:

| Field Name | Type | Required |
| :---- | :---- | :---- |
| name | String | True |
| joinCode | String | True |
| ownerId | mongoose.Schema.Types.ObjectId | True |
| members | \[memberSchema\] | False |

### Member Schema:

| Field Name | Type | Required |
| :---- | :---- | :---- |
| userId | mongoose.Schema.Types.ObjectId | True |
| role | String | True |

### Event Schema:

| Field Name | Type | Required |
| :---- | :---- | :---- |
| groupId | mongoose.Schema.Types.ObjectId | True |
| createdBy | mongoose.Schema.Types.ObjectId | True |
| title | String | True |
| startAt | Date | True |
| location | String | False |
| description | String | False |
| status | String | False |
| rsvps | \[rsvpSchema\] | False |

### RSVP Schema:

| Field Name | Type | Required |
| :---- | :---- | :---- |
| userId | mongoose.Schema.Types.ObjectId | True |
| status | String | True |
| note | String | False |
| updatedAt | Date | False |
| lastNotified | Date | False |

