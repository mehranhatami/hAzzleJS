/**
 * Events properties
 *
 * Note! This is NOT extendable through plugins
 *
 */
var keyRegex = /key/i,
    mouseRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i,
    mousewheelRegex = /mouse.*(wheel|scroll)/i,
    textRegex = /^text/i,
    touchRegex = /^touch|^gesture/i,
    pointerRegex = /^pointer/i,
    popstateRegex = /^popstate$/i,
    msgRegex = /^message$/i,

    // a whitelist of properties for different event types
    commonProps = ('altKey attrChange cancelable attrName bubbles cancelable cancelBubble altGraphKey ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
        'srcElement target timeStamp type view which propertyName').split(' '),
    keyProps = ('char charCode key keyCode keyIdentifier keyLocation location clipboardData').split(' '),
    mouseProps = ('button buttons clientX clientY offsetX offsetY pageX pageY ' +
        'screenX screenY toElement dataTransfer fromElement').split(' '),
    mouseWheelProps = mouseProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ deltaY deltaX deltaZ ' +
        'axis').split(' ')),
    touchProps = mouseProps.concat(('touches targetTouches changedTouches scale rotation ').split(' ')),
    pointerProps = touchProps, // Its the same, isn't it!?
    messageProps = ('data origin source lastEventId').split(' '),
    textProps = ('data').split(' '),
    stateProps = ('state').split(' '),

    nativeWheel =
    // IE>=9 supports `wheel` via `addEventListener` but exposes no `onwheel` attribute on DOM elements
    // making feature detection impossible :(
    'onwheel' in document.createElement('div') || document.documentMode > 8 ?
    'wheel' :
    'mousewheel';

// Damn! Mozilla and webKit have special events, let us deal with it ....!

// Firefox

if (hAzzle.isFirefox) {
    mouseProps = mouseProps.concat('mozMovementY mozMovementX'.split(' '));
}

// webKit 
if (hAzzle.isChrome || hAzzle.isOpera) {
    mouseProps = mouseProps.concat(('webkitMovementY webkitMovementX').split(' '));
}

hAzzle.props = {

    hookers: [{ // key events
            reg: keyRegex,
            props: keyProps,
            filter: function(evt, original) {

                // Add which for key events
                if (evt.which === null) {
                    evt.which = original.charCode !== null ? original.charCode : original.keyCode;
                }

                // Add keyCode

                evt.keyCode = original.keyCode || original.which;

                return evt;
            }
        }, { // mouse events
            reg: mouseRegex,
            props: mouseProps,
            filter: mousescroll
        },

        { // Mouse wheel / scroll events
            reg: mousewheelRegex,
            props: mouseWheelProps,
            filter: function mousescroll(evt, original) {

                var evtDoc, doc, body,
                    button = original.button;

                // Calculate pageX/Y if missing and clientX/Y available

                if (evt.pageX === null && original.clientX !== null) {
                    evtDoc = evt.target.ownerDocument || document;
                    doc = evtDoc.documentElement;
                    body = evtDoc.body;
                    docBody = doc || body;
                    evt.pageX = original.clientX + docBody.scrollLeft - docBody.clientLeft || 0;
                    evt.pageY = original.clientY + docBody.scrollTop - docBody.clientTop || 0;
                }


                if (nativeWheel === 'wheel') {
                    evt.deltaMode = original.deltaMode;
                    evt.deltaX = original.deltaX;
                    evt.deltaY = original.deltaY;
                    evt.deltaZ = original.deltaZ;
                } else {
                    evt.type = 'wheel';
                    evt.deltaMode = 0; // deltaMode === 0 => scrolling in pixels (in Chrome default wheelDeltaY is 120)
                    evt.deltaX = -1 * original.wheelDeltaX;
                    evt.deltaY = -1 * original.wheelDeltaY;
                    evt.deltaZ = 0; // not supported
                }

                if (!evt.which && button !== undefined) {

                    evt.which = button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0));
                }


                return evt;
            }
        }, { // TextEvent
            reg: textRegex,
            props: textProps,
            filter: function(evt) {
                return evt;
            }
        }, { // Touch and gesture events
            reg: touchRegex,
            props: touchProps,
            filter: function(evt, original) {

                var touch = original.changedTouches[0];

                evt.pageX = touch.pageX;
                evt.pageY = touch.pageY;
                evt.screenX = touch.screenX;
                evt.screenY = touch.screenY;
                evt.clientX = touch.clientX;
                evt.clientY = touch.clientY;

                return evt;
            }
        }, { // IE11+ pointer events
            reg: pointerRegex,
            props: pointerProps,
            filter: function(evt) {
                return evt;
            }
        }, { // Message events
            reg: msgRegex,
            props: messageProps,
            filter: function(evt) {
                return evt;
            }
        }, { // Popstate events
            reg: popstateRegex,
            props: stateProps,
            filter: function(evt) {
                return evt;
            }
        }
    ],

    fixedEvents: {},

    propFix: function(evt) {
        if (!evt) {

            return;
        }
        if (evt && evt[hAzzle.expando]) {

            return evt;
        }

        var i = 0,
            l = this.hookers.length,
            prop, copy,
            type = evt.type,
            target, originalEvent = evt,
            fixHook = this.fixedEvents[type];

        if (!fixHook) {

            for (; i < l; i++) {
                if (this.hookers[i].reg.test(type)) {
                    this.fixedEvents[type] = this.hookers[i];
                    break;
                }
            }
        }

        copy = this.fixedEvents[type] ? commonProps.concat(this.fixedEvents[type].props) : commonProps;

        evt = new hAzzle.Event(originalEvent);

        target = evt.target;
        i = copy.length;

        while (i--) {

            prop = copy[i];

            evt[prop] = originalEvent[prop];
        }

        if (!target) {

            target = document;
        }

        if (target.nodeType === 3) {
            target = target.parentNode;
        }

        return this.fixedEvents[type] ? this.fixedEvents[type].filter(evt, originalEvent) : evt;
    }
};

/* =========================== INTERNAL ========================== */

// Same for mouse, mouseWheel and mouseScroll

function mousescroll(evt, original) {

    var evtDoc, doc, body,
        button = original.button;

    // Calculate pageX/Y if missing and clientX/Y available

    if (evt.pageX === null && original.clientX !== null) {
        evtDoc = evt.target.ownerDocument || document;
        doc = evtDoc.documentElement;
        body = evtDoc.body;
        docBody = doc || body;
        evt.pageX = original.clientX + docBody.scrollLeft - docBody.clientLeft || 0;
        evt.pageY = original.clientY + docBody.scrollTop - docBody.clientTop || 0;
    }


    if (nativeWheel === 'wheel') {
        event.deltaMode = orgEvent.deltaMode;
        event.deltaX = orgEvent.deltaX;
        event.deltaY = orgEvent.deltaY;
        event.deltaZ = orgEvent.deltaZ;
    } else {
        event.type = 'wheel';
        event.deltaMode = 0; // deltaMode === 0 => scrolling in pixels (in Chrome default wheelDeltaY is 120)
        event.deltaX = -1 * orgEvent.wheelDeltaX;
        event.deltaY = -1 * orgEvent.wheelDeltaY;
        event.deltaZ = 0; // not supported
    }

    if (!evt.which && button !== undefined) {

        evt.which = button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0));
    }

    evt.pos = {
        x: 0,
        y: 0
    };

    evt.rightClick = original.which === 3 || original.button === 2;

    return evt;
}