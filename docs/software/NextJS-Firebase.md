---
title: NextJS Web App with antd styling and Server side Firebase authentication
date: 2020-12-18 20:00:00 +0000
description: Next.JS + antd styling + firebase template in Typescript

---


## Setup and configurations
Bootstrap the next app with yarn create next-app
```yarn create next-app```

Run:
- ```yarn add antd less less-vars-to-js babel-plugin-import null-loader next-compose-plugins firebase firebase-admin nookies airtable```
- ```yarn add typescript @types/react @types/node @zeit/next-less -D```

Add to ```styles/antd-custom.less```

```less
// file: styles/antd-custom.less

@import "~antd/dist/antd.less";

@primary-color: #000; // primary color for all components
@link-color: #1890ff; // link color
@success-color: #52c41a; // success state color
@warning-color: #faad14; // warning state color
@error-color: #f5222d; // error state color
@font-size-base: 14px; // major text font size
@heading-color: rgba(0, 0, 0, 0.85); // heading text color
@text-color: rgba(0, 0, 0, 0.65); // major text color
@text-color-secondary: rgba(0, 0, 0, 0.45); // secondary text color
@disabled-color: rgba(0, 0, 0, 0.25); // disable state color
@border-radius-base: 4px; // major border radius
@border-color-base: #d9d9d9; // major border color
@box-shadow-base: 0 2px 8px rgba(0, 0, 0, 0.15);
```

create ```.babelrc``` file

```json
{
  "presets": ["next/babel"],
  "plugins": [
    [
      "import", {
        "libraryName": "antd",
        "style": true
      },
    ]
  ]
}
```


create ```next.config.js``` file
```js
// file: next.config.js

const lessToJS = require('less-vars-to-js') // To read custom values from local less file 
const fs = require('fs')
const path = require('path');

const withLess = require('@zeit/next-less');
const withPlugins = require('next-compose-plugins');

// Where your antd-custom.less file lives
const themeVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, './styles/antd-custom.less'), 'utf8'));

const plugins = [
    withLess({
        lessLoaderOptions: {
            javascriptEnabled: true,
            modifyVars: themeVariables, 
        },
        webpack: (config, { isServer }) => {
            if (isServer) {
                const antStyles = /antd\/.*?\/style.*?/;
                const origExternals = [...config.externals];           
                config.externals = [
                    (context, request, callback) => {
                        if (request.match(antStyles)) return callback();
                        if (typeof origExternals[0] === 'function') {
                            origExternals[0](context, request, callback);
                        } else {
                            callback();
                        }
                    },
                    ...(typeof origExternals[0] === 'function' ? [] : origExternals),
                ];

                config.module.rules.unshift({
                    test: antStyles,
                    use: 'null-loader',
                });
            }
            return config;
        },
    })
];

module.exports = withPlugins(plugins);
```

Modify ```_app.js``` file
```js
// remove import "../styles/globals.css";

import "../styles/antd-custom.less";
```

### Add .env files
```touch .env.local```


## Firebase Authentication
### Client side
Reading the firebase document we initialize our Firebase Client like so:
```ts
// file: firebaseClient.ts

const firebaseConfig = {
  // ...
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
```

Let's create a ```firebaseClient.ts``` file
```ts
// file: firebaseClient.ts

import firebaseClient from "firebase/app";
import "firebase/auth";
const firebaseConfig = {
  // ... get these fields from your firebase project
};

// The !firebaseClient.apps.length is to prevent NextJS from re-initializing our SDK when it hot reloads our app
if (typeof window !== "undefined" && !firebaseClient.apps.length) {
  firebaseClient.initializeApp(firebaseConfig);
  firebaseClient
    .auth()
    .setPersistence(firebaseClient.auth.Auth.Persistence.SESSION);
  (window as any).firebase = firebaseClient;
}

export { firebaseClient };
```

### Logging in.

Here's some code to sign in as a user with firebase. 
```ts
// file: login.tsx

import React, { useState } from 'react';
import Link from 'next/link';
import { firebaseClient } from '../firebaseClient';

export default (_props: any) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  return (
    <div>
      <Link href="/">
        <a>Go back to home page</a>
      </Link>
      <br />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={'Email'}
      />
      <input
        type={'password'}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder={'Password'}
      />
      <button
        onClick={async () => {
          await firebaseClient
            .auth()
            .createUserWithEmailAndPassword(email, pass);
          window.location.href = '/';
        }}
      >
        Create account
      </button>
      <button
        onClick={async () => {
          await firebaseClient.auth().signInWithEmailAndPassword(email, pass);
          window.location.href = '/';
        }}
      >
        Log in
      </button>
    </div>
  );
};
```

That was the client. lets do the server.

### Server side
```ts
// file: firebaseAdmin.ts

import * as firebaseAdmin from "firebase-admin";

const privateKey = process.env["PRIVATE_KEY"];
const clientEmail = process.env["CLIENT_EMAIL"];
const projectId = process.env["PROJECT_ID"];

if (!privateKey || !clientEmail || !projectId) {
  console.log(
    `Set the environtment vars in the .env.local file`
  );
}

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      privateKey: privateKey,
      clientEmail,
      projectId,
    }),
    databaseURL: `https://${projectId}.firebaseio.com`,
  });
}

export { firebaseAdmin };
```


Now we have the Firebase SDK all setup. Let's get to the "hard" part now.
Here's the high level overview:
1. We need to create a React Context that will "listen" to the ```firebase.auth().onIdTokenChanged``` event listener
2. When ```firebase.auth().onIdTokenChanged``` fires, we set the ```token``` cookie containing the user ID.
3. We make this context available throughout our whole application by wrapping the component in the ```_app.tsx```.
4. Create the hook for our context
5. Check the token in ```getServerSideProps``` that NextJS provides (Client side would use a HOC)
6. Access the firebase user object from the client side to display data if it exists

### React Context and Provider
From the react documentation:
> Context provides a way to pass data through the component tree without having to pass props down manually at every level

In other words; global data for a tree of components.

We create an ```AuthContext``` by using ```createContext``` from react.  
With a ```AuthContext``` component, we need to provide a ```AuthContext.Provider``` definition

```ts
<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
```

```{children}``` in this case is the top level NextJS component in ```_app.tsx```.

This is so that every single page we use, will have the AuthContext shared with them.


We need to define ```{{user}}```. This is our "global" data to shared along the component tree.

This is where we can leverage the firebase SDK, or any authentication SDK to define our user.   
Create a listener to ```firebase.auth().onIdTokenChanged``` in our Provider. 
This is fired when the user logs in.

Note:  
```onIdTokenChanged``` is identical to ```onAuthStateChanged``` but it also fires when the user's ID token is refreshed


```ts
// file: auth.tsx

import React, { useState, useEffect, useContext, createContext } from "react";
import nookies from "nookies";
import { firebaseClient } from "./firebaseClient";

const AuthContext = createContext<{ user: firebaseClient.User | null }>({
  user: null,
});

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState<firebaseClient.User | null>(null);
  useEffect(() => {
    return firebaseClient.auth().onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        return;
      }
      setUser(user);
    });
  }, []);


  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

```

### Set the token cookie
Since we want to do firebase authentication on the server-side, we need to set the user token in the cookies.  
We make use of ```nookies``` package to do this.   
All it does is set the Header field ```Set-Cookie``` in the HTTP response.
 
Let's add this to the ```AuthProvider``` we defined above, in code. 

```ts
// file: auth.tsx
// snippet.
  useEffect(() => {
    return firebaseClient.auth().onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(null);
        nookies.destroy(null, "token");
        nookies.set(null, "token", "", {});
        return;
      }
      setUser(user);
      const token = await user.getIdToken();
      nookies.destroy(null, "token");
      nookies.set(null, "token", token, {});
    });
  }, []);
```

### Share user state across whole app
We now need to make our ```AuthProvider``` available across our whole application.

This ones easy.  
We simply need to wrap our top level component with our ```AuthProvider``` to share our user data across the entire component tree.  

In NextJS this is in the ```_app.tsx``` file

```ts
// file: _app.tsx
import type { AppProps } from 'next/app';
import { AuthProvider } from '../auth';
import "../styles/antd-custom.less"; // we'll get to antd styling later

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
export default MyApp;
```

### Create the hook
So we made the context available throughout the whole app. How do we consume this context?.  
Simple. A call to ```React.useContext``` with the ```AuthContext``` we defined earlier.

```ts
export const useAuth = () => {
  return useContext(AuthContext);
};
```

We can then make use of our of ```AuthContext``` throughout our client side code to fetch the user data by creating a hook.  

### Authenticating protected routes.
Since we are doing server-side authentication with firebase. We obviously need a server to do this.  

Without NextJS framework this would be a nodeJS server of some sort. 

With NextJS, we can make use of [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering)

This is perfect for our use-case where we want to authenticate the user *before* accessing our protected route.

```ts
// file: protected.tsx
import React from "react";
import nookies from "nookies";
import { InferGetServerSidePropsType, GetServerSidePropsContext } from "next";

import { firebaseAdmin } from "../firebaseAdmin";
import { firebaseClient } from "../firebaseClient";


export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    // get the context from the server.
    // See if the cookies have the firebase token set
    const cookies = nookies.get(ctx);
    console.log(JSON.stringify(cookies, null, 2));
    const token = await firebaseAdmin.auth().verifyIdToken(cookies.token);
    const { uid, email } = token;

    // the user is authenticated here.

    return {
      props: { message: `token.email - ${email},  token.uid - ${uid}.` },
    };
  } catch (err) {
    // redirect to the login page if an attempt by an unsigned user gets here.
    return {
      redirect: {
        permanent: false,
        destination: "/login",
      },
      props: {} as never,
    };
  }
};

const ProtectedPage = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => (
  <div>
    <p>{props.message!}</p>
    <button
      onClick={async () => {
        await firebaseClient.auth().signOut();
        window.location.href = "/";
      }}
    >
      Sign out
    </button>
  </div>
);

export default ProtectedPage;
```

Side Note:  

For client side authentication, protected routes, we would typically make a call to the ```useAuth()``` hook we created with a "loading" boolean property.

We put up a spinner icon on the page that user is on, while authentication is finished on the client side.  

Something like this:
```ts
// Sample code to authenticate from the client side
export const ProtectRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading || (!isAuthenticated && window.location.pathname !== '/login')){
    return <LoadingScreen />;  // Spinner icon comes here
  }
  return children;
};

// Usage
// ...
// ...
export default ProtectRoute(ProtectedPageClientSide);
// auth.tsx would be using the firebase client SDK to fetch and 'await' for the result of the authentication (remember we use the admin SDK for server side)

```

In our case of server side authentication, there is no need for the spinner icon!.  
We do all the authentication on the server side before even showing the page.  
Combine this with performant fetching and caching, page loads will be fast anyway.

End side note.

### Usage on client side
Earlier we created a hook to access the ```AuthContext``` data.  

Usage is quite simple.

```ts
// file: index.tsx
import { useAuth } from '../auth';
function indexPage() {
  const { user } = useAuth();
  return (
      <div>      
        <p>{`User ID: ${user ? user.uid : 'User is not signed in'}`}</p>
      </div>
  );
}


export default indexPage;
```

## Styling with antd
Most of the components you'd want to use can be found on the [antd components documentation](https://ant.design/components/overview/)

Here's an example of how to style our Home page. You can use the ```Form``` components provided by antd to style your ```login.tsx``` page.

```ts
// file: index.tsx
import { useAuth } from '../auth';
import Link from 'next/link';
import { Layout, Card, Menu } from 'antd';
const { Header, Content, Footer } = Layout;

function indexPage() {
  const { user } = useAuth();
  

  return (
    <Layout style={{minHeight:"100vh"}}>
        <Header style={{ position: 'fixed', zIndex: 1, width: '100%' }}>
          <Menu style={{float: 'right'}} theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
              <Menu.Item key="1"><Link href="/login">Login</Link></Menu.Item>
          </Menu>
        </Header>
        <Content className="site-layout" style={{ padding: '0 50px', marginTop: 64 }}>
            <Card style={{ textAlign: "center" }}>
              <p>{`User ID: ${user ? user.uid : 'no user signed in'}`}</p>
            </Card>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Your footer</Footer>
    </Layout>
  );
}


export default indexPage;
```

![](/uploads/nextantdfirebase.png)



The components are well documented by antd and they provide lots of examples of the components.

