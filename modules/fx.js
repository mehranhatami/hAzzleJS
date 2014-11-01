// fx.js
hAzzle.define('Fx', function() {

    // Basic animation engine for native Javascript 
    // It will be extended in version 1.2

    var _util = hAzzle.require('Util')
    _collection = hAzzle.require('Collection')
    _storage = hAzzle.require('Storage')
    _types = hAzzle.require('Types'),

        queue = function(elem, type, data) {

            if (!elem) {
                return;
            }

            type = (type || "fx") + "queue";

            var q = _storage.private.access(elem, type);

            if (!data) {
                return q || [];
            }

            if (!q || _types.isArray(data)) {
                q = _storage.private.access(elem, type, _collection.makeArray(data));
                
            } else {
                q.push(data);
            }

            return q;
        },

        dequeue = function(elems, type) {
            /* Custom: Embed element iteration. */
            _util.each(elems.nodeType ? [elems] : elems, function(elem) {
                type = type || "fx";

                var queue = queue(elem, type),
                    fn = queue.shift();

                if (fn === "inprogress") {
                    fn = queue.shift();
                }

                if (fn) {
                    if (type === "fx") {
                        queue.unshift("inprogress");
                    }

                    fn.call(elem, function() {
                        dequeue(elem, type);
                    });
                }
            });
        },
        Animate = function(elem, options) {
            var opts = options;

if(elem instanceof hAzzle) { elem = elem.elements[0];}

            elems = elem.nodeType ? elem : [elem];

            function processElement(elem) {

                var element = elems;

                function buildQueue(next) {

                   // Animation triggered from here

/* Start the tick loop. */
                            tick();
                }

                if (options.queue === false) {   
                    buildQueue();
                } else {

                   queue(element, options.queue, function(next) {

                        
                        buildQueue(next);
                    });

                }

                if ((opts.queue === "" || opts.queue === "fx") && queue(element)[0] !== "inprogress") {
                    dequeue(element);
                }
            }
    processElement.call(elems);

        };

    this.animate = function(options) {
        return Animate(this.elements, options)
    }

    return {
        Animate: Animate
        };
});