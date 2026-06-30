# Notification System Design
# Stage 1
## Overview
Notification System used for sending a message to a user related to the services they are being provided from the platform.

## API Endpoints
Here are the endpoints which i think should be needed to create an full fleg notification system :
1) Get all notification
Endpoint : GET/notifications - returns all the notifications to the authorized user
headers : application/json
repsonse on success :
```json
{
  "success": true,
  "count": 2,
  "notifications": [
    {
      "id": "N001",
      "title": "New Message",
      "message": "You have received a new message.",
      "type": "message",
      "isRead": false,
      "createdAt": "2026-06-30T10:30:00Z"
    },
    {
      "id": "N002",
      "title": "Profile Updated",
      "message": "Your profile was updated successfully.",
      "type": "system",
      "isRead": true,
      "createdAt": "2026-06-29T09:00:00Z"
    }
  ]
}
```

2) Get Notification by ID
Endpoint : GET/notifications/:id - returns a particular notification based on id
response on success :
```json
{
  "success": true,
  "notification": {
    "id": "N001",
    "title": "New Message",
    "message": "You have received a new message.",
    "type": "message",
    "isRead": false,
    "createdAt": "2026-06-30T10:30:00Z"
  }
}
```
3) Create notification
Endpoint : POST/notification - creates an notification
Content-Type: application/json
request body : 

```json
{
  "userId": "U001",
  "title": "Order Confirmed",
  "message": "Your order #1023 has been confirmed.",
  "type": "order"
}
```

response on sucess :

```json
{
  "success": true,
  "message": "Notification created successfully.",
  "notificationId": "N003"
}
```

4) mark notification as read 
Endpoint : PATCH/notification/:id
repsonse on success :
```json
{
  "success": true,
  "message": "Notification marked as read."
}
```

5) mark all notifications as read
Endpoint : PATCH/notification
response on success :
```json
{

  "success": true,
  "message": "All Notification marked as read."
}

```

6) delete notifications
Endpoint : DELETE/notfication/:id
responce on success:
```json
{
  "success": true,
  "message": "Notification deleted successfully."
}
```

7) Get Unread Notification Count
Endpoint : GET/notification/count
repsonse on success :

```json
{
  "success": true,
  "count": 5
}
```


## Request Format


```http
Content-Type: application/json
Accept: application/json
```

### Example Request

```json
{
  "title": "Interview Scheduled",
  "message": "Your interview is scheduled for tomorrow.",
  "type": "system"
}
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Operation failed."
}
```

## Error Responses

 200 - Request completed successfully 
 201 - Resource created successfully 
 204 - Resource deleted successfully 
 400 - Invalid request 
 404 - Notification not found 
  500 - Internal server error 

## Notification Schema

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "message | order | promotion | reminder | system",
  "isRead": false,
  "createdAt": "ISO-8601 Timestamp"
}
```
## Real-time Notifications

- event occurs -> notifcation sent(created) -> users get notification -> mark as read -> delete notifcations

## Assumptions
- Users are considered pre-authorized; authentication APIs are outside the scope of this design.
- All requests and responses use JSON.
- Notification IDs are unique.
- Timestamps follow ISO-8601 format.
- Notifications are persisted in a database.
- WebSocket connections are established after the user accesses the application.
- API versioning follows `/api/v1`.


# Stage 2
## Database Choice
I propose using **MongoDB** as the primary database and **Redis** as the caching layer.
MongoDB is well suited for a notification system because:

- It stores data in flexible JSON-like documents (BSON).
- Notification data has a simple structure and may evolve over time.
- It provides high write throughput, which is important since notifications are generated frequently.
- It supports horizontal scaling through sharding.
- It offers efficient indexing for fast retrieval of user-specific notifications.


## Notifications Collection

```json
{
  "_id": "ObjectId",
  "userId": "U001",
  "title": "Interview Scheduled",
  "message": "Your interview is scheduled for tomorrow.",
  "type": "system",
  "isRead": false,
  "createdAt": "2026-06-30T10:30:00Z",
  "updatedAt": "2026-06-30T10:30:00Z"
}
```

# MongoDB Queries

## Create Notification

```javascript
db.notifications.insertOne({
    userId: "U001",
    title: "Order Confirmed",
    message: "Your order has been confirmed.",
    type: "order",
    isRead: false,
    createdAt: new Date(),
    updatedAt: new Date()
})
```

## Get All Notifications

```javascript
db.notifications.find({
    userId: "U001"
}).sort({
    createdAt: -1
})
```


## Get Notification by ID

```javascript
db.notifications.findOne({
    _id: ObjectId("notificationId")
})
```


## Mark Notification as Read

```javascript
db.notifications.updateOne(
{
    _id: ObjectId("notificationId")
},
{
    $set: {
        isRead: true,
        updatedAt: new Date()
    }
})
```
## Mark All Notifications as Read

```javascript
db.notifications.updateMany(
{
    userId: "U001",
    isRead: false
},
{
    $set: {
        isRead: true,
        updatedAt: new Date()
    }
})

```


## Delete Notification

```javascript
db.notifications.deleteOne({
    _id: ObjectId("notificationId")
})
```

## Count Unread Notifications

```javascript
db.notifications.countDocuments({
    userId: "U001",
    isRead: false
})
```

# Challenges with Increasing Data Volume

As the number of users and notifications grows, several challenges may arise:

- Large notification collections
- Slower query execution
- Increased database load
- Higher storage requirements
- Increased response times

# Solutions

### 1. Indexing

Create indexes on:

- userId
- isRead
- createdAt

to speed up searches.

### 2. Redis Caching

Store unread counts and recent notifications in Redis to reduce database queries.

### 3. Pagination

Retrieve notifications in pages instead of loading all records.
