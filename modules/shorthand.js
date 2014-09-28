// aliases.js
hAzzle.extend({

    /**
     * Bind a DOM event
     *
     * @param {String|Object} types
     * @param {String} selector
     * @param {String|Function} data
     * @param {Function|Undefined} fn
     * @param {Boolean} one
     * @return {hAzzle}
     */

    on: function(types, selector, data, fn, /*INTERNAL*/ one) {

        var origFn, type;

        if (typeof types === 'object') {

            if (typeof selector !== 'string') {

                data = data || selector;
                selector = undefined;
            }

            for (type in types) {

                this.on(type, selector, data, types[type], one);
            }
            return this;
        }

        if (data == null && fn == null) {

            fn = selector;
            data = selector = undefined;

        } else if (fn == null) {

            if (typeof selector === 'string') {

                fn = data;
                data = undefined;

            } else {

                fn = data;
                data = selector;
                selector = undefined;
            }
        }

        if (fn === false) {

            fn = returnFalse;

        } else if (!fn) {

            return this;
        }

        // One

        if (one === 1) {

            origFn = fn;

			fn = function( event ) {
				hAzzle().off( event );
				return origFn.apply( this, arguments );
			};

            fn.guid = origFn.guid || (origFn.guid = hAzzle.getID(true, 'hEvt_'));
        }

        return this.each(function() {
            hAzzle.event.add(this, types, fn, data, selector);
        });
    },

    /**
     * Bind a DOM event but fire once before being removed
     *
     * @param {String|undefined} events
     * @param {String|undefined} selector
     * @param {String|undefined} data
     * @param {Function|undefined} fn
     * @return {hAzzle}
     */

    one: function(types, selector, data, fn) {
        return this.on(types, selector, data, fn, 1);
    },

    /**
     * Unbind an event from the element
     *
     * @param {String} types
     * @param {String} selector
     * @param {Function} fn
     * @return {hAzzle}
     */

    off: function(types, selector, fn) {
        var handleObj, type;
        if (types && types.preventDefault && types.handleObj) {
            handleObj = types.handleObj;
            hAzzle(types.delegateTarget).off(
                handleObj.namespace ?
                handleObj.origType + '.' + handleObj.namespace :
                handleObj.origType,
                handleObj.selector,
                handleObj.handler
            );
            return this;
        }
        if (typeof types === 'object') {
            // ( types-object [, selector] )
            for (type in types) {
                this.off(type, selector, types[type]);
            }
            return this;
        }
        if (selector === false || 
		    typeof selector === 'function') {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = returnFalse;
        }
        return this.each(function() {
            hAzzle.event.remove(this, types, fn, selector);
        });
    },

    /**
     * Triggers an event of specific type with optional extra arguments
     *
     * @param {String} type
     * @param {String} data
     * @return {hAzzle}
     */

    trigger: function(type, data) {
        return this.each(function() {
            hAzzle.event.trigger(type, data, this);
        });
    },
    triggerHandler: function(type, data) {
        if (this[0]) {
            return hAzzle.event.trigger(type, data, this[0], true);
        }
    },

    hover: function(fnOver, fnOut) {
        return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
    },
    bind: function(types, data, fn) {
        return this.on(types, null, data, fn);
    },
    unbind: function(types, fn) {
        return this.off(types, null, fn);
    }
});

/* ============================ INTERNAL =========================== */

hAzzle.each(('blur focus focusin focusout load resize scroll unload click dblclick ' +
        'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave ' +
        'change select submit keydown keypress keyup error contextmenu').split(' '),
    function(name) {
        hAzzle.Core[name] = function(data, fn) {
            return arguments.length > 0 ?
                this.on(name, null, data, fn) :
                this.trigger(name);
        };
    });