hAzzle.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "),
	function( name ) {

	// Handle event binding
	hAzzle.Core[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

hAzzle.extend({

    on: function (types, selector, data, fn, /*INTERNAL*/ one) {

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

        // Has to be boolean values, else
        // everything break. So keep '==' and not '==='

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

            fn = once(fn);

            // Use same guid so caller can remove using origFn
            fn.guid = origFn.guid || (origFn.guid = hAzzle.eventCore.setID());
        }

        return this.each(function () {
            hAzzle.event.add(this, types, fn, data, selector);
        });
    },
    one: function (types, selector, data, fn) {
        return this.on(types, selector, data, fn, 1);
    },
    off: function (types, selector, fn) {
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
        if (selector === false || typeof selector === 'function') {
            // ( types [, fn] )
            fn = selector;
            selector = undefined;
        }
        if (fn === false) {
            fn = returnFalse;
        }
        return this.each(function () {
            hAzzle.event.remove(this, types, fn, selector);
        });
    },

    trigger: function (type, data) {
        return this.each(function () {
            hAzzle.event.trigger(type, data, this);
        });
    },
    triggerHandler: function (type, data) {
        var elem = this[0];
        if (elem) {
            return hAzzle.event.trigger(type, data, elem, true);
        }
    },

	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}

});

/* ============================ UTILITY METHODS =========================== */

function returnFalse() {
    return false;
}

function once(fn) {

    return function (evt) {
        // wrap the handler in a handler that does a remove as well
        hAzzle().off(evt);
        return fn.apply(this, arguments);
    };
}
