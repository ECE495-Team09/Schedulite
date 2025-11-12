Team 09:
    Aryan Kunwar Banerjee
    Luca Ricci
    Jacob Jackson

Alright for the prototype, first set up the .env file, and install the
requirements using node. To start the backend, just enter these commands from
the Schedulite directory.
    cd backend
    node src/server.js

I have implemented a POST, GET, and DELETE route.

Yall only need to use the POST route, it adds an event to the database, and
ALSO returns the event json in the response. So you can basically make an html
form which on SEND uses the POST route to upload the event and uses the response
for the availability dashboard on the next page.