---
title: Bubble + AppGyver
date: 2020-07-16
description:
    Setting up a data model and CRUD backend with Frontend client. All with no code
---

## Bubble 

### Data Model

### Enable API

### Define Endpoints

### Swagger definition

### Testing it out 


## AppGyver

### Creating variables

### Installing component dependencies

### Authentication

#### Enable Authentication
Select third party authentication

AppGyver creates a new page called Login. We could use this page but let's create our own page instead.

#### Configure authentication

Create our data resources:

##### Signup
- Click on ```Data``` tab
- Select ```Add Data Resource``` then ```REST API direct integration resource```
- Fill in ```Resource URL``` to the bubble endpoint for ```signup```
- Select ```CREATE RECORD (POST)```
- Enable the method
- Select ```Config``` tab
- Set ```Response key path``` to ```response```.
This is because the backend returns this json structure, but we only want the contents of ```response```
```json
{
  "status": "success",
  "response": {
    "user_id": "<user_id>",
    "token": "<token>",
    "expires": 86400
  }
}
```
- Select ```Schema``` tab
- Set request schema to ```Custom schema```
- properties of the schema shall be ```email```, ```name```, and ```password```
- Select ```Test``` Tab
- Fill in the values to test in ```Custom Object```
- Run test
- Get a response. Verify the data actually goes to your bubble backend
- Select ```Set Schema from response```


#### Login
Repeat the process for ```login``` resource but properties shall be ```email``` and ```password```

#### User data resource
- Select ```Add Data Resource``` then ```REST API direct integration resource```
- Fill in ```Resource URL``` to the bubble endpoint for ```user```
- Add in ```HTTP Header``` field ```Authorization```. Make sure ```Is static``` and ```Is optional``` is turned off.
- Select ```GET RECORD (GET)```
- In ```Config``` we shall leave response as it is.
- In ```Test``` fill in the Authorization Bearer token and user id 
- Run the test. If it was successful. 
- Select ```Set schema from response```. Are you getting the hang of this now? :)

#### Logout
For Logout all we need is the base URL to the logout bubble endpoint. 
Just like User, we need an authorization token in the HTTP header.



### UI Page creation
xx
#### Sign up
xxx