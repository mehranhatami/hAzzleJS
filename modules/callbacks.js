// Prop: jQuery
// Modified to work with hAzzle

hAzzle.Callbacks = function(options) {

     options = typeof options === "string" ?
         (optionsCache[options] || createOptions(options)) :
         hAzzle.shallowCopy({}, options);

     var memory, // Last fire value (for non-forgettable lists)
         fired, // Flag to know if list was already fired
         firing, // Flag to know if list is currently firing
         firingStart, // First callback to fire (used internally by add and fireWith)
         firingLength, // End of the loop when firing
         firingIndex, // Index of currently firing callback (modified by remove if needed)
         list = [], // Actual callback list
         stack = !options.once && [], // Stack of fire calls for repeatable lists

         fire = function(data) {
             memory = options.memory && data;
             fired = true;
             firingIndex = firingStart || 0;
             firingStart = 0;
             firingLength = list.length;
             firing = true;
             for (; list && firingIndex < firingLength; ++firingIndex) {
                 if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                     memory = false;
                     break;
                 }
             }
             firing = false;
             if (list) {
                 if (stack) {
                     if (stack.length) {
                         fire(stack.shift());
                     }
                 } else if (memory) {
                     list = [];
                 } else {
                     Callbacks.disable();
                 }
             }
         },

         Callbacks = {
             add: function() {
                 if (list) {
                     var start = list.length;

                     (function add(args) {
                         hAzzle.each(args, function(arg) {
                             var type = hAzzle.type(arg);
                             if (type === "function") {
                                 if (!options.unique || !Callbacks.has(arg)) {
                                     list.push(arg);
                                 }
                             } else if (arg && arg.length && type !== "string") {
                                 // Inspect recursively
                                 add(arg);
                             }
                         });
                     })(arguments);

                     if (firing) {
                         firingLength = list.length;
                         // With memory, if we're not firing then
                         // we should call right away
                     } else if (memory) {
                         firingStart = start;
                         fire(memory);
                     }
                 }
                 return this;
             },
             remove: function() {
                 if (list) {
                     hAzzle.each(arguments, function(arg) {
                         var index;
                         while ((index = hAzzle.inArray(arg, list, index)) > -1) {
                             list.splice(index, 1);
                             // Handle firing indexes
                             if (firing) {
                                 if (index <= firingLength) {
                                     firingLength--;
                                 }
                                 if (index <= firingIndex) {
                                     firingIndex--;
                                 }
                             }
                         }
                     });
                 }
                 return this;
             },
             has: function(fn) {
                 return fn ? hAzzle.inArray(fn, list) > -1 : !!(list && list.length);
             },
             empty: function() {
                 list = [];
                 firingLength = 0;
                 return this;
             },
             // Have the list do nothing anymore
             disable: function() {
                 list = stack = memory = undefined;
                 return this;
             },
             disabled: function() {
                 return !list;
             },
             // Lock the list in its current state
             lock: function() {
                 stack = undefined;
                 if (!memory) {
                     Callbacks.disable();
                 }
                 return this;
             },
             locked: function() {
                 return !stack;
             },
             // Call all callbacks with the given context and arguments
             fireWith: function(context, args) {
                 if (list && (!fired || stack)) {
                     args = args || [];
                     args = [context, args.slice ? args.slice() : args];
                     if (firing) {
                         stack.push(args);
                     } else {
                         fire(args);
                     }
                 }
                 return this;
             },
             fire: function() {
                 Callbacks.fireWith(this, arguments);
                 return this;
             },
             fired: function() {
                 return !!fired;
             }
         };

     return Callbacks;
 };