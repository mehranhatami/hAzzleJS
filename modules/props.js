var
    i,
    propKey = /^key/,
    propMouse = /^(?:mouse|pointer|contextmenu)|click/,

	// Includes all common event props including KeyEvent and MouseEvent specific props

	props = ('altKey attrChange cancelable attrName bubbles cancelable cancelBubble altGraphKey ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
        'srcElement target timeStamp type view which propertyName').split(' ');

hAzzle.extend({

    fixHooks: {},

    propHooks: {

        which: function(evt) {
            var button = evt.button;

            // Add which for key events
            if (evt.which == null && propKey.test(evt.type)) {
                return evt.charCode != null ? evt.charCode : evt.keyCode;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!evt.which && button !== undefined && propMouse.test(evt.type)) {
                return (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
            }

            return evt.which;
        },

        pageX: function(evt) {
            var eventDoc, doc, body;

            // Calculate pageX if missing and clientX available
            if (evt.pageX == null && evt.clientX != null) {
                eventDoc = evt.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                return evt.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
            }

            return evt.pageX;
        },

        pageY: function(evt) {
            var eventDoc, doc, body;

            // Calculate pageY if missing and clientY available
            if (evt.pageY == null && evt.clientY != null) {
                eventDoc = evt.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                return evt.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) -
                    (doc && doc.clientTop || body && body.clientTop || 0);
            }

            return evt.pageY;
        }
    },

    fix: function(evt) {

        if (evt[hAzzle.expando]) {
            return evt;
        }

        // Create a writable copy of the event object and normalize some properties
		
        var originalEvent = evt,
            fixHook = this.fixHooks[evt.type];

        if (fixHook && fixHook.props && fixHook.props.length) {
            hAzzle.each(fixHook.props.splice(0), addEventProps);
        }

        evt = hAzzle.Event(originalEvent);

        if (!evt.target) {
            evt.target = document;
        }

        // Target should not be a text node

        if (evt.target.nodeType === 3) {
            evt.target = evt.target.parentNode;
        }

        return fixHook && fixHook.filter ? fixHook.filter(evt, originalEvent) : evt;
    }

}, hAzzle.event);

/* ============================ UTILITY METHODS =========================== */

function addEventProps(name) {

    Object.defineProperty(hAzzle.Event.prototype, name, {
        enumerable: true,
        configurable: true,

        get: function() {
            var value, hooks;

            if (this.originalEvent) {
                if (hooks = hAzzle.event.propHooks[name]) {
                    value = hooks(this.originalEvent);
                } else {
                    value = this.originalEvent[name];
                }
            }

            return this[name] = value;
        },

        set: function(value) {
            Object.defineProperty(this, name, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        }
    });
}

// Auto-add during pageload / page refresh

for(i in props) {
addEventProps(props[i])
}