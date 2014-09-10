// promises.js
hAzzle.Promises = function(func) {

    var OrderedLists = [
            // action, add listener, listener list, final state
            ['resolve', 'done', hAzzle.Signals('once memory'), 'resolved'],
            ['reject', 'fail', hAzzle.Signals('once memory'), 'rejected'],
            ['notify', 'progress', hAzzle.Signals('memory')]
        ],
        state = 'pending',

        // A+ specs as far as we can follow them

        promise = {

            state: function() {
                return state;
            },
            always: function() {
                promised.done(arguments).fail(arguments);
                return this;
            },
            then: function(fnDone, fnFail) {
                return hAzzle.Promises(function(newDefer) {
                    promised
                        .done(stdCallback(newDefer, fnDone))
                        .fail(stdCallback(newDefer, fnFail));
                }).promise();
            },
            catch: function(fnFail) {
                return promise.then(null, fnFail);
            },
            pipe: function( /* fnDone, fnFail, fnProgress */ ) {
                var fns = arguments;
                return hAzzle.Promises(function(newDefer) {
                    hAzzle.each(OrderedLists, function(tuple, i) {
                        var fn = hAzzle.isFunction(fns[i]) && fns[i];
                        // promised[ done | fail | progress ] for forwarding actions to newDefer
                        promised[tuple[1]](function() {
                            var returned = fn && fn.apply(this, arguments);
                            if (!stdAttach(
                                returned,
                                newDefer.resolve,
                                newDefer.reject,
                                newDefer.notify
                            )) {
                                newDefer[tuple[0] + 'With'](
                                    this === promise ? newDefer.promise() : this,
                                    fn ? [returned] : arguments
                                );
                            }
                        });
                    });
                    fns = null;
                }).promise();
            },

            // If obj is provided, the promise aspect is added to the object
            promise: function(obj) {
                return obj != null ? hAzzle.shallowCopy(obj, promise) : promise;
            }
        },
        promised = {};

    // Add list-specific methods

    hAzzle.each(OrderedLists, function(tuple, i) {
        var list = tuple[2],
            stateString = tuple[3];

        // promise[ done | fail | progress ] = list.add
        promise[tuple[1]] = list.add;

        // Handle state
        if (stateString) {
            list.add(function() {
                // state = [ resolved | rejected ]
                state = stateString;

                // [ reject_list | resolve_list ].disable; progress_list.lock
            }, OrderedLists[i ^ 1][2].disable, OrderedLists[2][2].lock);
        }

        // promised[ resolve | reject | notify ]
        promised[tuple[0]] = function() {
            promised[tuple[0] + 'With'](this === promised ? promise : this, arguments);
            return this;
        };
        promised[tuple[0] + 'With'] = list.fireWith;
    });

    // Make the promised a promise
    promise.promise(promised);

    // Call given func if any
    if (func) {
        func.call(promised, promised);
    }

    // All done!
    return promised;
};

// Promises helper
hAzzle.when = function(subordinate /* , ..., subordinateN */ ) {
    var i = 0,
        resolveValues = slice.call(arguments),
        length = resolveValues.length,

        // the count of uncompleted subordinates
        remaining = length !== 1 ||
        (subordinate && hAzzle.isFunction(subordinate.promise)) ? length : 0,

        // the master Promises.
        // If resolveValues consist of only a single Promises, just use that.
        promised = remaining === 1 ? subordinate : hAzzle.Promises(),

        // Update function for both resolve and progress values
        updateFunc = function(i, contexts, values) {
            return function(value) {
                contexts[i] = this;
                values[i] = arguments.length > 1 ? slice.call(arguments) : value;
                if (values === progressValues) {
                    promised.notifyWith(contexts, values);
                } else if (!(--remaining)) {
                    promised.resolveWith(contexts, values);
                }
            };
        },

        progressValues, progressContexts, resolveContexts;

    // Add listeners to Promises subordinates; treat others as resolved
    if (length > 1) {
        progressValues = new Array(length);
        progressContexts = new Array(length);
        resolveContexts = new Array(length);
        for (; i < length; i++) {
            if (!stdAttach(
                resolveValues[i],
                updateFunc(i, resolveContexts, resolveValues),
                promised.reject,
                updateFunc(i, progressContexts, progressValues)
            )) {
                --remaining;
            }
        }
    }

    // If we're not waiting on anything, resolve the master
    if (!remaining) {
        promised.resolveWith(resolveContexts, resolveValues);
    }

    return promised.promise();
};

// Standard Attach

function stdAttach(object, fnDone, fnFail, fnProgress) {
    return object &&
        (
            hAzzle.isFunction(object.promise) ?
            object.promise()
            .done(fnDone)
            .fail(fnFail)
            .progress(fnProgress) :
            hAzzle.isFunction(object.then) && object.then(fnDone, fnFail)
        );
}

// Standard callback

function stdCallback(defer, callback) {
    return typeof callback === 'function' && function(value) {
        setTimeout(function() {
            var returned;
            try {
                returned = callback(value);
            } catch (e) {
                return defer.reject(e);
            }
            if (!stdAttach(
                returned,
                defer.resolve,
                defer.reject,
                defer.notify
            )) {
                defer.resolve(returned);
            }
        });
    };
}