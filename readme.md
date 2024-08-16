# @asr/elementary
[![JSR](https://jsr.io/badges/@asr/elementary)](https://jsr.io/@asr/elementary)

Elementary is a lightweight (~600B minified) reactive web components library built around a variant of [The Elm Architecture](https://guide.elm-lang.org/architecture/).

Here's what a counter looks like:
```js
import element from "@asr/elementary"; // or, to load it from a CDN, use https://unyt.land/@asr/elementary?raw

element(
    // name
    "app-counter",
    // template
    // messages are hooked to events using the 'x-on' attribute as 'event1 => messageName1, event2 => messageName2, ...'
    // the dispatched message will be a tuple of [message name, event] where event is the original browser event object
    (_self, count) => `
        <div>
            <button x-on="click => increment">+</button>
            <p>${count}</p>
            <button x-on="click => decrement">-</button>
        </div>
    `,
    // initial state
    () => 0,
    // update
    (_self, state, message) => {
        switch (message[0]) {
            case "increment":
                return state + 1;
            case "decrement":
                return state - 1;
        }
    },
);
```
This will automatically register an `<app-counter>` custom element.

See [the demo](demo/app.js) for more examples.
