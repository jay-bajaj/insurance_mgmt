Roles: Admin, Agent, Users

Users can register using their email. Authentication based on OTP.
The admin can add a new policy, and users can request existing policies for subscriptions by requesting them from agents. Agents can assign those policies to the Users.

First run the schema.sql file in the database:
  

Then to add policies, companies, people and agents into the database uncomment the lines at the bottom of app.js file 
and run node app.js

Then again comment those lines
again run node app.js
