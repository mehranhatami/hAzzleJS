var pKeyfixRegex = /^key/,
    pMousefixRegex = /^(?:mouse|pointer|contextmenu)|click/,

    // Includes all common event props including KeyEvent and MouseEvent specific props
    commonProps =

    ('altKey attrChange cancelable attrName bubbles cancelable cancelBubble '                   + // Common
        'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget '       +
        'button buttons clientX clientY offsetX offsetY pageX pageY altGraphKey '               +
        'screenX screenY toElement dataTransfer fromElement data state ctrlKey currentTarget '  +
        'srcElement target timeStamp type view which propertyName shiftKey'                     +
        'wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ deltaY deltaX deltaZ axis '             + // Mousewheel
        'char charCode key keyCode keyIdentifier keyLocation location clipboardData '           + // Keys
        'touches targetTouches changedTouches scale rotation').split(' ');                        // Touch / Pointer

// The fixHooks API are following the ES5 specs.
// Example, to set a hook for the 'drop' event that copies the dataTransfer 
// property, assign an object to hAzzle.event.fixHooks.drop:
//
// hAzzle.event.fixHooks.drop = {
//    props: [ "dataTransfer" ]
// };
//
// TODO! Fix the code so it supports ES6. Should give better performance

var fixHooks = {

        which: function(evt) {

            var button = evt.button;

            // Add which for key events
            if (evt.which == null && pKeyfixRegex.test(evt.type)) {
                return evt.charCode != null ? evt.charCode : evt.keyCode;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!evt.which && button !== undefined && pMousefixRegex.test(evt.type)) {
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
        },
        relatedTarget: function(evt) {
            return this.relatedTarget = (evt.fromElement === this.target ? evt.toElement : evt.fromElement);
        },
        metaKey: function(evt) {
            return evt.metaKey === undefined ?
                this.originalEvent.ctrlKey : evt.metaKey;
        },
    },

    fix = function(evt) {

        if (evt[hAzzle.expando]) {
            return evt;
        }

        // Create a writable copy of the event object and normalize some properties

        var originalEvent = evt,
            fHook = this.fixHooks[evt.type];

        if (fHook && fHook.props && fHook.props.length) {
            hAzzle.each(fHook.props.splice(0), addEventProps);
        }

        evt = new hAzzle.Event(originalEvent);

        if (!evt.target) {
            evt.target = document;
        }

        // Target should not be a text node

        if (evt.target.nodeType === 3) {
            evt.target = evt.target.parentNode;
        }

        return fHook && fHook.filter ? fHook.filter(evt, originalEvent) : evt;
    }

// Expose

hAzzle.event.fixHooks = fixHooks;
hAzzle.event.fix = fix;

// Firefox eventTypes

if (hAzzle.isFirefox) {
  commonProps.concat('mozMovementY mozMovementX'.split(' '));
}

// WebKit eventTypes
// Support: Chrome / Opera

if (hAzzle.isWebkit) {
    commonProps.concat(('webkitMovementY webkitMovementX').split(' '));
}

// Add new event props

function addEventProps(name) {

    var OdP = Object.defineProperty;

    OdP(hAzzle.Event.prototype, name, {
        enumerable: true,
        configurable: true,

        get: function() {
            var value, hooks;
            if (this.originalEvent) {
                if ((hooks = hAzzle.event.fixHooks[name])) {
                    value = hooks(this.originalEvent);
                } else {
                    value = this.originalEvent[name];
                }
            }
            return this[name] = value;
        },

        set: function(value) {
            OdP(this, name, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: value
            });
        }
    });
};

// Add common props

hAzzle.each(commonProps, function(props) {
    addEventProps(props);
});