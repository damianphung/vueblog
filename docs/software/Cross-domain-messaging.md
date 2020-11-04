---
title: Javascript - Dealing with messaging across domains
date: 2020-08-26 06:00:00 +0000
description: Sending data between two windows using window.addEventListener and window.postMessage

---

## Context
So I had a situation where I had perform user login using Facebook Sign-in, and get some custom data after signing in.

The frontend was a react site with a simple login button to sign in with Facebook.

The button would open up a pop-up window and send a request to a web server, running nodeJS with the passport auth module.

Once authenticated the web server would send a JSON message back to the frontend.
I would use the contents of this JSON to render some component on the page.

Anyways thats the short story. Basically login, then render some special component if successful. 

[From mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage):
> The window.postMessage() method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it. 

[Combine this with addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Front-end browser client
We create a listener for the message we expect and handle it.
```javascript
function buttonClick(event)
{
    event.stopPropagation();
    event.preventDefault();

    var childwin = window.open('https://mywebsite.com/login/facebook', "popup", 'height=600px, width=600px');
}
    
const allowed_origin = "https://mybackendserver.com"

function handleMessage({origin, data}){
  if ( origin === allowed_origin) {
    if(data) {
        console.log("Got some data -> ", data);
        // Change some state here
      }
    }
  }

window.addEventListener('message', handleMessage, true);

return (
    <Button
      onMouseDown={event => event.stopPropagation()}
      onClick={event => buttonClick(event)}
    >
      Click me
    </Button>
)
```

Back-end server
```javascript
// Pretend it's an express server or something
  app.get("/login/facebook", function(request, response, next) {
    const destination = "https://mywebsite.com"
    const data = {
      "loggedIn" : true
    };

    response.send(`
<script>
  if (window.opener) {
    window.opener.postMessage(${JSON.stringify(data)}, destination);
    window.opener.focus();
    window.close();
  } 
</script>`);
});
```
