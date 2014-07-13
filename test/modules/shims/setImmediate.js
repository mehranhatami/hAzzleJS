(function (global, undefined) {
  'use strict';

  if (global.setImmediate) {
    return;
  }

  var nextHandle = 1, // Spec says greater than zero
    tasksByHandle = {},
    currentlyRunningATask = false,
    doc = global.document,
    setImmediate;

  function addFromSetImmediateArguments(args) {
    tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
    return nextHandle++;
  }

  // This function accepts the same arguments as setImmediate, but
  // returns a function that requires no arguments.
  function partiallyApplied(handler) {
    var args = [].slice.call(arguments, 1);
    return function () {
      if (typeof handler === 'function') {
        handler.apply(undefined, args);
      } else {
        (new global.Function('' + handler))();
      }
    };
  }

  function runIfPresent(handle) {
    // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
    // So if we're currently running a task, we'll need to delay this invocation.
    if (currentlyRunningATask) {
      // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
      // "too much recursion" error.
      setTimeout(partiallyApplied(runIfPresent, handle), 0);
    } else {
      var task = tasksByHandle[handle];
      if (task) {
        currentlyRunningATask = true;
        try {
          task();
        } finally {
          clearImmediate(handle);
          currentlyRunningATask = false;
        }
      }
    }
  }

  function clearImmediate(handle) {
    delete tasksByHandle[handle];
  }

  function installNextTickImplementation() {
    setImmediate = function () {
      var handle = addFromSetImmediateArguments(arguments);
      process.nextTick(partiallyApplied(runIfPresent, handle));
      return handle;
    };
  }

  function canUsePostMessage() {
    // The test against `importScripts` prevents this implementation from being installed inside a web worker,
    // where `global.postMessage` means something completely different and can't be used for this purpose.
    if (global.postMessage && !global.importScripts) {

      var postMessageIsAsynchronous = true,
          oldOnMessage = global.onmessage;

      global.onmessage = function () {
        postMessageIsAsynchronous = false;
      };
      global.postMessage('', '*');
      global.onmessage = oldOnMessage;
      return postMessageIsAsynchronous;
    }
  }

  function installPostMessageImplementation() {
    // Installs an event handler on `global` for the `message` event: see
    // * https://developer.mozilla.org/en/DOM/window.postMessage
    // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

    var messagePrefix = 'setImmediate$' + Math.random() + '$',
        onGlobalMessage = function (evt) {
      if (evt.source === global &&
        typeof evt.data === 'string' &&
        evt.data.indexOf(messagePrefix) === 0) {
        runIfPresent(+evt.data.slice(messagePrefix.length));
      }
    };

    if (global.addEventListener) {
      global.addEventListener('message', onGlobalMessage, false);
    } else {
      global.attachEvent('onmessage', onGlobalMessage);
    }

    setImmediate = function () {
      var handle = addFromSetImmediateArguments(arguments);
      global.postMessage(messagePrefix + handle, '*');
      return handle;
    };
  }

  function installMessageChannelImplementation() {
    var channel = new MessageChannel(),
	    handle;
    channel.port1.onmessage = function (evt) {
       handle = evt.data;
      runIfPresent(handle);
    };

    setImmediate = function () {
      var handle = addFromSetImmediateArguments(arguments);
      channel.port2.postMessage(handle);
      return handle;
    };
  }

  function installReadyStateChangeImplementation() {
    var html = doc.documentElement;
    setImmediate = function () {
      var handle = addFromSetImmediateArguments(arguments),
      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
      script = doc.createElement('script');
      script.onreadystatechange = function () {
        runIfPresent(handle);
        script.onreadystatechange = null;
        html.removeChild(script);
        script = null;
      };
      html.appendChild(script);
      return handle;
    };
  }

  function installSetTimeoutImplementation() {
    setImmediate = function () {
      var handle = addFromSetImmediateArguments(arguments);
      setTimeout(partiallyApplied(runIfPresent, handle), 0);
      return handle;
    };
  }

  // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
  var OgPO = Object.getPrototypeOf,
     attachTo = OgPO && OgPO(global);
  attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

  // Don't get fooled by e.g. browserify environments.
  if (canUsePostMessage()) {
    // For non-IE10 modern browsers
    installPostMessageImplementation();

  } else if (global.MessageChannel) {
    // For web workers, where supported
    installMessageChannelImplementation();
  } 

  attachTo.setImmediate = setImmediate;
  attachTo.clearImmediate = clearImmediate;
}(this));
