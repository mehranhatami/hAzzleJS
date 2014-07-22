/**
 * Events properties
 *
 * Note! This is extendable through plugins
 *
 */

var keyRegex = /key/i,
    mouseRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i,
    textRegex = /^text/i,
    touchRegex = /^touch|^gesture/i,
    popstateRegex = /^popstate$/i,
    msgRegex = /^message$/i,

    // a whitelist of properties for different event types
    commonProps = ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget ' +
        'detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey ' +
        'srcElement target timeStamp type view which propertyName').split(' '),
    keyProps = 'char charCode key keyCode'.split(' '),
    mouseProps = 'button buttons clientX clientY offsetX offsetY pageX pageY ' +
    'screenX screenY toElement'.split(' '),
    touchProps = 'touches targetTouches changedTouches scale rotation'.split(' '),
    messageProps = 'data origin source'.split(' '),
    textProps = 'data',
    stateProps = 'state';

hAzzle.props = {

    typeFixers: [{ // key events
        reg: keyRegex,
        props: keyProps,
        filter: function (event, original) {

            // Add which for key events
            if (event.which === null) {
                event.which = original.charCode !== null ? original.charCode : original.keyCode;
            }

            return event;
        }
    }, { // mouse events
        reg: mouseRegex,
        props: mouseProps,
        filter: function (event, original) {

            var eventDoc, doc, body,
                button = original.button;

            // Calculate pageX/Y if missing and clientX/Y available
            if (event.pageX === null && original.clientX !== null) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = original.clientY +
                    (doc && doc.scrollTop || body && body.scrollTop || 0) -
                    (doc && doc.clientTop || body && body.clientTop || 0);
            }

            if (!event.which && button !== undefined) {
                event.which = (button & 1 ? 1 : (button & 2 ? 3 : (button & 4 ? 2 : 0)));
            }

            return event;
        }
    }, { // TextEvent
        reg: textRegex,
        props: textProps,
        filter: function (event) { return event; }
    }, { // touch and gesture events
        reg: touchRegex,
        props: touchProps,
        filter: function (event) { return event; }
    }, { // message events
        reg: msgRegex,
        props: messageProps,
        filter: function (event) { return event; }
    }, { // popstate events
        reg: popstateRegex,
        props: stateProps,
        filter: function (event) { return event; }
    }],

    fixHooks: {},

    propFix: function (event) {
		
        if (event[hAzzle.expando]) {
            return event;
        }

        var i = 0, l = this.typeFixers.length, prop, copy,
            type = event.type,
            originalEvent = event,
            fixHook = this.fixHooks[type];

        if (!fixHook) {
            
            for (; i < l; i++) {
                if (this.typeFixers[i].reg.test(type)) { 
                    this.fixHooks[type] = this.typeFixers[i];
                    break;
                }
            }
        }

        copy = this.fixHooks.props ? commonProps.concat(fixHook.props) : commonProps;

        event = new hAzzle.Event(originalEvent);

        i = copy.length;

        while (i--) {
			
            prop = copy[i];
			
            event[prop] = originalEvent[prop];
        }

       if (!event.target) {
            
			event.target = document;
        }

        if (event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }

        return this.fixHooks.filter ? this.fixHooks.filter(event, originalEvent) : event;
    }
};