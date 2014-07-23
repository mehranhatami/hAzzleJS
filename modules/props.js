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
    popstateRegex = /^popstate$/i,
    msgRegex = /^message$/i,

    // a whitelist of properties for different event types
    commonProps = ('altKey attrChange cancelable attrName bubbles cancelable ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
        'srcElement target timeStamp type view which propertyName').split(' '),
    keyProps = ('char charCode key keyCode keyIdentifier keyLocation location').split(' '),
    mouseProps = ('button buttons clientX clientY offsetX offsetY pageX pageY ' +
        'screenX screenY toElement dataTransfer fromElement').split(' '),
    mouseWheelProps = mouseProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ deltaY deltaX deltaZ ' +
        'axis').split(' ')),
    touchProps = ('touches targetTouches changedTouches scale rotation').split(' '),
    messageProps = ('data origin source').split(' '),
    textProps = ('data').split(' '),
    stateProps = ('state').split(' ');

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
            filter: function (evt, original) {

                // Add which for key events
                if (evt.which === null) {
                    evt.which = original.charCode !== null ? original.charCode : original.keyCode;
                }

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
            filter: mousescroll
        }, { // TextEvent
            reg: textRegex,
            props: textProps,
            filter: function (evt) {
                return evt;
            }
        }, { // Touch and gesture events
            reg: touchRegex,
            props: touchProps,
            filter: function (evt) {
                return evt;
            }
        }, { // Message events
            reg: msgRegex,
            props: messageProps,
            filter: function (evt) {
                return evt;
            }
        }, { // Popstate events
            reg: popstateRegex,
            props: stateProps,
            filter: function (evt) {
                return evt;
            }
        }
    ],

    fixedEvents: {},

    propFix: function (evt) {

        if (evt[hAzzle.expando]) {

            return evt;
        }

        var i = 0,
            l = this.hookers.length,
            prop, copy,
            type = evt.type,
            target, originalEvent = evt,
            fE = this.fixedEvents,
            fixHook = this.fixedEvents[type];

        if (!fixHook) {

            for (; i < l; i++) {
                if (this.hookers[i].reg.test(type)) {
                    //alert(this.hookers[i].props)
                    this.fixedEvents[type] = this.hookers[i];
                    break;
                }
            }
        }

        copy = this.fixedEvents[type].props ? commonProps.concat(this.fixedEvents[type].props) : commonProps;

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

        return fE.filter ? fE.filter(evt, originalEvent) : evt;
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

        evt.pageX = original.clientX +
            (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
            (doc && doc.clientLeft || body && body.clientLeft || 0);
        evt.pageY = original.clientY +
            (doc && doc.scrollTop || body && body.scrollTop || 0) -
            (doc && doc.clientTop || body && body.clientTop || 0);
    }

    if (!evt.which && button !== undefined) {
        evt.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
    }

    return evt;
}