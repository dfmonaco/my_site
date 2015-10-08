---
title: Understanding Node - The Event Loop
layout: post.html
date: 2015-07-28
author: Diego Mónaco
tags: Javascript, NodeJS
draft: false
---

[1]: https://developers.google.com/v8
[2]: http://docs.libuv.org/en/v1.x/design.html#the-i-o-loop
[3]: https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_arg
[4]: https://nodejs.org/api/timers.html#timers_setinterval_callback_delay_arg
[5]: https://nodejs.org/api/timers.html#timers_setimmediate_callback_arg
[6]: https://nodejs.org/api/process.html#process_process_nexttick_callback_arg

Node processes JavaScript instructions using a single thread (using the [V8 JavaScript engine][1]), this means that your Node program will execute only one operation at a time, so in order to achieve concurrency, Node uses a bunch of threads running behind the scenes to manage asynchronous I/O tasks (among other things), these operations generate events that end up executing callback functions into the aforementioned single thread of Javascript.

The event loop is in charge to poll for I/O events and coordinate the execution of all these callbacks, building up and tearing down a single stack on each iteration.

So how these stacks are built?

When a Node process executes the input script some instructions may express interest on future events by registering a function to be called when the associated event occurs, after this first stack finishes running, the event loop will start walking through a series of steps synchronously invoking callbacks based on his [internal algorithm][2], when the last function on the current iteration returns Node starts the cycle again to run the next "tick" of Javascript code, this loop keeps running until there are no more events to handle and therefore no more callbacks to run.

# Callback Types
There are four kind of callbacks that can be registered for future execution:

## I/O callbacks:
All I/O operations are consistently implemented as asynchronous, evented data streams, the event loop will poll the OS on every iteration to check for I/O events ready to be handled and will run the corresponding callbacks if any.

## Timer callbacks:
Callbacks to be executed sometime in the future specified in milliseconds, Node timers are not interrupts, they simply promise to execute as close as possible to the specified time, though never before. You can run a one-time callback after a specific delay or you can schedule a callback to be executed periodically based on a time interval.

[`global.setTimeout`][3]  

[`global.setInterval`][4]

## Immediate callbacks:
Immediate callbacks won't fire until the next event loop iteration and after all I/O processing. Callbacks for immediates are queued in the order in which they were created.

[`global.setImmediate`][5]

## Next Tick callbacks:
Next Tick callbacks are run right after each call from C++ into JavaScript. It means that these callbacks will fire as soon as the current stack runs to completion, __before going back to the event loop__, this ensures that they always run before any further I/O processing.

[`process.nextTick`][6]

_* Names are very misleading here as global.setImmediate is on the next “tick”, and process.nextTick is “immediate”_

# Callback execution order

On each iteration of the event loop callbacks are run in the following order:

<p class="stretch">
  ![event loop](/images/posts/node_event_loop.svg)
</p>


0. __Run initial script__ 

  ->  __Run Next Tick callbacks.__

1. __Run Timer callbacks:__ All active timers scheduled for a time before the loop’s concept of now get their callbacks called.

  ->  __Run Next Tick callbacks.__

2. __Run Pending I/O callbacks:__ If the previous iteration deferred any I/O callback it will be run at this point.

  ->  __Run Next Tick callbacks.__

3. __Run Current I/O callbacks:__ At this point the loop will block for I/O (with a previously calculated timeout), all I/O related handles that were monitoring a given file descriptor for a read or write operation get their callbacks called at this point.

  ->  __Run Next Tick callbacks.__

4. __Run Immediate callbacks:__ The entire callback queue is processed every event loop iteration.

  ->  __Run Next Tick callbacks.__

5. __Go to step 2:__ Start new cycle

Understanding this, we can clearly see that the entire program can be blocked by JavaScript code because while a call stack is being unrolled no other events can be handled, so it's the developer task to ensure that the call stack always executes as fast as possible.

# Code time

```javascript
var fs = require('fs');
var tickNumber = 0;

function newTick() {
  ++tickNumber;
  console.log('');
};

function printExecutionOrder(operation) {
  console.log('Tick: ' + tickNumber + ' | ' + operation);
};

printExecutionOrder('Registering nextTick');
process.nextTick(function() {
  printExecutionOrder('  > Executing nextTick');
  newTick();
});

printExecutionOrder('Registering setTimeout');
setTimeout(function() {
  printExecutionOrder('Executing setTimeout');

  printExecutionOrder('Registering nextTick');
  process.nextTick(function() {
    printExecutionOrder('  > Executing nextTick');
  });
}, 1);

printExecutionOrder('Registering setImmediate');
setImmediate(function() {
  printExecutionOrder('Executing setImmediate');

  printExecutionOrder('Registering nextTick');
  process.nextTick(function() {
    printExecutionOrder('  > Executing nextTick');
  });
  // last function executed by the first tick
  process.nextTick(newTick);
});

printExecutionOrder('Registering setInterval');
setInterval(function() {
  printExecutionOrder('Executing setInterval');

  printExecutionOrder('Registering nextTick');
  process.nextTick(function() {
    printExecutionOrder('  > Executing nextTick');
  });
  // unref the handle so the process terminates
}, 1).unref();


printExecutionOrder('Registering I/O');
fs.stat(__filename, function() {
  printExecutionOrder('Executing I/O');

  printExecutionOrder('Registering nextTick');
  process.nextTick(function() {
    printExecutionOrder('  > Executing nextTick');
  });
});

process.on('exit', function() {
  console.log('etc, etc....');
});
```

Running this script we can see that the execution order for the registered callbacks is exactly what was described before:

```js
$ node event_loop.js
Tick: 0 | Registering nextTick
Tick: 0 | Registering setTimeout
Tick: 0 | Registering setImmediate
Tick: 0 | Registering setInterval
Tick: 0 | Registering I/O
Tick: 0 |   > Executing nextTick

Tick: 1 | Executing setTimeout
Tick: 1 | Registering nextTick
Tick: 1 |   > Executing nextTick
Tick: 1 | Executing setInterval
Tick: 1 | Registering nextTick
Tick: 1 |   > Executing nextTick
Tick: 1 | Executing I/O
Tick: 1 | Registering nextTick
Tick: 1 |   > Executing nextTick
Tick: 1 | Executing setImmediate
Tick: 1 | Registering nextTick
Tick: 1 |   > Executing nextTick

Tick: 2 | Executing setInterval
Tick: 2 | Registering nextTick
Tick: 2 |   > Executing nextTick
etc, etc....
```


