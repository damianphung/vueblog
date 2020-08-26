---
title: window.addEventListener and window.postMessage
date: 2020-08-26 06:00:00 +0000
description: window.addEventListener and window.postMessage

---

## window.addEventListener and window.postMessage

[From mozilla](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage):
> The window.postMessage() method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it. 

[Combine this with addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Front-end browser client
We create a listener for the message we expect and handle it.
```javascript

const allowed_origin = "https://mybackendserver.com"

function handleMessage({origin, data}){
	if ( origin === allowed_origin) {
		if(data) {
			console.log("Got some data -> ", data);
		}
	}
}

window.addEventListener('message', handleMessage, true)
```

Back-end server
```javascript
// Pretend it's an express server or something
app.get("/", function(request, response, next) {
	const destination = "https://mywebsite.com"
	const data = {
		"hello" : "world"
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
