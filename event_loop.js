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
