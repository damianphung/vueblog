---
title: Hasura
date: 2020-07-20
description: Getting a backend up really FAST!

---
# Hasura

## Authentication using an external auth provider

![Picture](/uploads/hasura-auth-jwt-overview.png)

First decide on a provider. Both will provide a JSON Web Token (JWT)

* Firebase
* Auth0

Then generate the JWT secret using [jwt-config from hasura](https://hasura.io/jwt-config/)

To add custom claims in the token, configure the login build flow of the auth provider to add in the X-Hasura-* fields in the `https://hasura.io/jwt/claims` namespace of the JWT.

We shall now start the hasura engine with the `HASURA_GRAPHQL_JWT_SECRET` environment variable to the JWT secret we generated.

Let's login to our auth provider (i.e auth0).
Obtain the `id_token` value and put that in the `Authorization` header when making a request to Hasura.

From Hasura.

> The JWT is decoded, the signature is verified, then it is asserted that the requested role of the user (if specified in the request) is in the list of allowed roles. If the desired role is not specified in the request, then the default role is applied. If the authorization passes, then all of the x-hasura-* values in the claim are used for the permissions system.

### Forward to external web service

We have two choices to verify the JWT contents.

* GraphQL remote schema
* Webhooks

With GraphQL remote schema:  
Hasura will forward all Header fields in the request, such as the Authorization Bearer token, to the remote GraphQL server.
We will need to decode the token in this scenario.

With Webhook:  
Hasura will forward the payload as the request body with `POST`.

Either case you shall extract the user id (i.e x-hasura-user-id)

* Use it to verify the user_id with external auth provider
* Use it to do something in the business logic of your application.

## Authentication using webhooks.

![Picture](/uploads/hasura-auth-webhook-overview.png)
Here we will go through Hasura for authentication.

One thing to be aware of is instead of using `HASURA_GRAPHQL_JWT_SECRET` environment variable to verify users signing in with the JWT obtained externally.

We will use `HASURA_GRAPHQL_AUTH_HOOK_MODE` for both sign in and sign up within a GraphQL hasura request.

We simply forward all headers to the external web service performing the authentication.

The web service shall return X-Hasura-* as a response to hasura.
i.e

```json
{
    "X-Hasura-User-Id": "26",
    "X-Hasura-Role": "user",
    "X-Hasura-Is-Owner": "false",
    "Cache-Control": "max-age=600"
}
```
