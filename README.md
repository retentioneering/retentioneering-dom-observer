# Retentioneering DOM Observer

The package contains tools for parsing DOM data, observing DOM and tracking changes.

**Dependency free!**

TypeScript supports embedding.

## Installation
```
npm install --save @retentioneering/retentioneering-dom-observer
# or
yarn add @retentioneering/retentioneering-dom-observer
```

## Usage

### Parse DOM

The object that is passed to the ```parseDOM``` function is both a description of the parsing output structure and a description of the DOM structure.

HTML sample:
```html
<div>
  <h1 class="title">Happy family</h1>
  <div class="brothers">
    <div class="person">
      <div class="firstname">Ivan</div>
      <div class="lastname">Karamazov</div>
    </div>
    <div class="person">
      <div class="firstname">Aleksej</div>
      <div class="lastname">Karamazov</div>
    </div>
    <div class="person">
      <div class="firstname">Mitiya</div>
      <div class="lastname">Karamazov</div>
    </div>
  </div>
</div>
```

Parse it:
```javascript
import { parseDOM } from "@retentioneering/retentioneering-dom-observer"

const parsed = parseDOM({
  type: "object",
  keys: [
    {
      key: "family",
      value: {
          type: "string",
          selector: ".title",
      },
    },
    {
      key: "brothers",
      value: {
        type: "array",
        selector: ".person",
        items: {
          type: "object",
          keys: [
            {
              key: "firstname",
              value: {
                type: "string",
                selector: ".firstname",
              },
            },
            {
              key: "lastname",
              value: {
                type: "string",
                selector: ".lastname",
              },
            },
          ],
        },
      },
    },
  ],
})
```

Output:
```json
{
  "family": "Happy family",
  "brothers": [
    {
      "firstname": "Ivan",
      "lastname": "Karamazov",
    },
    {
      "firstname": "Aleksej",
      "lastname": "Karamazov",
    },
    {
      "firstname": "Mitiya",
      "lastname": "Karamazov",
    },
  ],
}
```

The parseDom function also has a second argument that defines the root node of the parsing:
```javascript
const output = parseDOM(config, document.querySelector("#my-root-element"))
```
```javascript
const output = parseDOM(config, "#my-root-element")
```

## Observe DOM

To observe the DOM use the DomObserver class. 

This class is a wrapper over MutationObservers, allowing you to observe changes even of those nodes that are not already in the DOM. Observation will automatically start as soon as the target node appends in the DOM.

Also, all necessary observers will be created (and destroyed) automatically. All you need to do is identify the target node and subscribe to its changes.

```html
<div>
  <div id="parent"></div>
</div>
```

```javascript
import { DomObserver, FOUND_EVENT_NAME, MUTATED_EVENT_NAME } from "@retentioneering/retentioneering-dom-observer"

// defines changes to the target node to be observed (optional)
// https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit
const observerConfig = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: false,
  characterDataOldValue: false,
  attributeOldValue: false,
}

const domObserver = new DomObserver()

const targetDescriptor = {
  name: "my-target-element",
  selector: ".child",
  observerConfig,
}

domObserver.subscribe((e) => {
  if (e.type === FOUND_EVENT_NAME) {
    console.log("my target node was found in the DOM!")
  }
  if (e.type === MUTATED_EVENT_NAME) {
    console.log("my target element mutated!")
    const mutationRecords = e.mutations
  }
}, targetDescriptor)

domObserver.observe(targetDescriptor)
domObserver.start() // run!

const parent = document.getElementById("parent")

const child = document.createElement("div")
child.setAttribute("class", "child")
parent.appendChild(child) // console: "my target node was found in the DOM!"

const nested = document.createElement("div")
child.appendChild(nested) // console: "my target element mutated!"
```

*Important!* Found event will be emitted in both cases:

1. Target node was append to the DOM after the start of observation
2. The observer first discovered the target node that was added before the start of the observation

In order not to miss the FoundEvent, always subscribe before you start ovserving.



In order to subscribe to change any target nodes do not pass the second argument to the subscribe function:
```javascript
domObserver.subscribe((e) => {
  if (e.type === FOUND_EVENT_NAME) {
    console.log("some target node has found!")
  }
  if (e.type === MUTATED_EVENT_NAME) {
    console.log("some target node has changed!")
  }
  console.log(`the target node is called: ${e.descriptor.name}`)
})
```

Unsubscribe:
```javascript
// callback will be called only once
const unsubscribe = domObserver.subscribe((e) => {
  console.log("Enough! Unsubscribe:")
  unsubscribe()
})
```

Stop observation:
```javascript
const descriptor = () => {
  name: "my-target-element",
  selector: ".child",
}

domObserver.subscribe((e) => {
  console.log("Enough! Stop observation:")
  domObserver.stopObservation()
}, descriptor)
domObserver.observe(descriptor)


```

Stop all observers:
```javascript
domObserver.stop()
```

## DomCollector: Observe & parse

DomCollector allows to observe the target nodes and parse the DOM when the target nodes have mutated.

```html
<div class="mortal-kombat">
  <div class="player">
    Smoke
  </div>
</div>
```

```javascript
import { createDomCollector } from "@retentioneering/retentioneering-dom-observer"


const observerConfig = {
  attributes: false,
  childList: true,
  subtree: true,
  characterData: true,
  characterDataOldValue: false,
  attributeOldValue: false,
}

const parseConfig = {
  type: "object",
  keys: [
      {
          key: "name",
          value: {
              type: "string",
              selector: ".mortal-kombat .player",
          },
      },
  ]
}

const target = {
    name: "Mortal Kombat",
    targetSelector: ".mortal-kombat",
    parseRootEl: ".mortal-kombat",
    observeConfig: observerConfig,
    parseConfig,
}

createDomCollector({
  targets: [target],
  onCollect: ({ name, parsedContent: player }) => {
    if (name === "Mortal Kombat") {
      console.log(player.name)
    }
  }
})

// console: "Smoke"

const player = document.querySelector(".player")
setTimeout(() => {
    player.innerHTML = "Scorpion" // console: "Scorpion"
    setTimeout(() => {
        player.innerHTML = "Sub-Zero" // console: "Sub-Zero"
    }, 100)
}, 100)
```

# Synchronous DOM changes

```.subscribe(cb)``` callback (inside which DOM parsing starts) is called after MutationObserver has reacted to DOM changes.

This happens asynchronously. At the same time, ```parseDOM``` parses the DOM "as it is". This means that with a synchronous change in the DOM, intermediate states will not be parsed.

This is normal, because DOM parsing is focused on intercepting what the user sees on the screen, but such intermediate states the user will not see.


# Prevent unnecessary states collection 

To prevent unnecessary states collection , you can pass guardSelector to the collector:

```javascript
createDomCollector({
  targets: [{
    name: "Something",
    targetSelector: ".target",
    guardSelector: ".content",
    parseRootEl: document.body,
    observeConfig: observerConfig,
    parseConfig,
  }],
  onCollect,
})
```

In this case, ```onCollect``` will be called only when ```.content``` element is detected in the DOM.


-----------------------
By Alexey Avramenko and Retentioneering Team 

Copyright (C) 2020 Maxim Godzi, Anatoly Zaytsev, Retentioneering Team

This Source Code Form is subject to the terms of the Retentioneering Software Non-Exclusive, Non-Commercial Use License (License)

By using, sharing or editing this code you agree with the License terms and conditions. 
You can obtain License text at https://github.com/retentioneering/retentioneering-dom-observer/blob/master/LICENSE.md 



