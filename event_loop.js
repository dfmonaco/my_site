var fs = require('fs');
var tickNumber = 0;

function newTick() {
  ++tickNumber;
  console.log('----------------------');
};

function printExecutionOrder(callback) {
  console.log('Tick: ' + tickNumber + ' | ' + callback);
};

printExecutionOrder('regular call 1 (script)');

setTimeout(function() {
  printExecutionOrder('setTimeout-1 (script)');

  process.nextTick(function() {
    printExecutionOrder('  > nextTick-1');
  });
  process.nextTick(function() {
    printExecutionOrder('  > nextTick-2');
  });
}, 1);

process.nextTick(function() {
  printExecutionOrder('nextTick-1   (script)');
});

setImmediate(function() {
  printExecutionOrder('setImmediate 1 script');
  // last function executed by the first tick
  process.nextTick(newTick);
});

printExecutionOrder('regular call 2 script');

setInterval(function() {
  printExecutionOrder('setInterval  1 script');
}, 1).unref();

process.nextTick(function() {
  printExecutionOrder('nextTick-2   (script)');
});

fs.stat(__filename, function() {
  printExecutionOrder('I/O          1 script');
});

printExecutionOrder('regular call 3 script');

process.on('exit', function() {
  console.log('etc, etc....');
});

// After the scripts finishes execution starts the first event loop cycle
newTick();
