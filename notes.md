## Scaling
A fundamental part of Node's design is to create or fork processes when parallelizingexecution or scaling a system—as opposed to creating a thread pool, for instance.
onmulticore machines, forked processes will be distributed (by the OS) to differentcores. Spreading node processes across cores (even other machines) and managingIPC is (one) way to scale a Node application in a stable, understandable, andpredictable way.
pass a network server an object to a child. Thistechnique allows multiple processes, including the parent, to share the responsibilityfor servicing connection requests, spreading load across cores.
two separate processes are balancing theserver load. It should be clear that this technique, when combined with the simpleinter-process messaging protocol discussed previously, demonstrates how RyanDahl's creation succeeds in providingan easy way to build scalable network programs.

## REPL
Because the REPL is a native object, programs can also use instances as a context inwhich to run JavaScript interactively

## Errors
First and foremost, as you saw earlier in the chapter, Node applications rely on big processes with a lot of shared state.
If an error occurs in a particular callback of a particular HTTP request, for example, the whole process is compromised:
This behavior changes if you add an uncaughtException handler. The process doesn’t exit, and you are in charge of things afterward:
Throughout Node, many of the native modules such as http and net emit error events. If these events go unhandled, an uncaught exception is thrown.
Aside from the uncaughtException and error events, most of the asynchronous Node APIs take a callback where the first parameter sent is an error object or null
•  The first argument returned to a callback function is any error message,preferably in the form of an error object. If no error is to be reported, this slotshould contain avalue.•  When passing a callback to a function it should be assigned the last slot of thefunction signature. APIs should be consistently designed this way.
•  Any number of arguments may exist between the error and the callback slots.
Node provides more advanced tools for error handling. In particular, Node'sdomainsystem helps with a problem that evented systems have: how can a stacktrace be generated if the full route of a call has been obliterated as it jumped fromcallback to callback?The goal ofdomainis simple: fence and label an execution context such that allevents that occur within it are identified as such, allowing more informative stacktraces. By creating several different domains for each significant segment of yourprogram, a chain of errors can be properly understood.

## Globals
In the browser, window is the global object. Anything that you define in window becomes available to all parts of your code. For example, setTimeout is in reality window.
setTimeout, and document is window.document.
Node has two similar objects that provide a cleaner separation:
- global: Just like window, any property attached to global becomes a variable you can access anywhere.
- process: Everything that pertains to the global context of execution is in the process
object. In the browser, there’s only one window, and in Node, there’s only one process at any given time.
Some functions and utilities available in the browser are not part of the language specification but rather are useful things that browsers added on top, which today are generally considered to be JavaScript. These are often exposed as globals.

## Modules
Instead of defining a number of globals (or evaluating a lot of code that you might not use), Node decided to introduce a simple yet extremely powerful module system, the roots of which are three globals: require, module, and exports.
For a module to expose an API that’s expressed as the return value of a require call, two globals, module and exports ,come into play.
By default, each module exports an empty object {}. If you want to add properties to it, you can simply reference exports
exports happens to be a reference to module.exports, which is an object by default. If setting individual keys in this object is not enough, you can also override module.exports completely.
Node introduced the concept of thepackage,following the CommonJSspecification. A package is a collection of program files bundled with a manifestfile describing the collection. Dependencies, authorship, purpose, structure, andother important meta-data are exposed in a standard way. This encourages theconstruction of large systems from many small, interdependent systems.

## Events
The DOM APIs in the browser that deal with events are mainly addEventListener, removeEventListener, and dispatchEvent.
In Node, you also listen to and emit events everywhere. Node therefore exposes the Event Emitter API that defines on, emit, and removeListener methods. It’s exposed as process.EventEmitter
Events are central to Node’s non-blocking design. Since Node usually doesn’t “respond right away” with data (because that would imply blocking the thread while waiting on a resource), it usually emits events with data instead.
EventEmitter often appears asynchronous because it is regularly used to signal the completion of asynchronous operations, but the EventEmitter API is entirely synchronous. The emit function may be called asynchronously, but note that all the listener functions will be executed synchronously, in the order they were added, before any execution can continue in statements following the call to emit.
## Buffers
Another deficiency in the language that Node makes up for, besides modules, is handling of binary data.
Buffer is a global object that represents a fixed memory allocation (that is, the number of bytes that are put aside for a buffer have to be known in advance), which behaves like an array of octets, effectively letting you represent binary data in JavaScript.
A part of its functionality is the capability to convert data between encodings.

