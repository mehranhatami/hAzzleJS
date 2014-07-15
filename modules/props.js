var win = this,
    doc = win.document,
    docElem = hAzzle.docElem,
    mouseEvent = /^click|mouse(?!(.*wheel|scroll))|menu|pointer|contextmenu|drag|drop/i,
    keyEvent = /^key/,
    textEvent = /^text/i,
    mouseWheelEvent = /mouse.*(wheel|scroll)/i,
    touchEvent = /^touch|^gesture/i,
    messageEvent = /^message$/i,
    popstateEvent = /^popstate$/i,
    overOut = /over|out/,
    // Common properties for all event types

    commonProps = ('altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail ' +
        'eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget ' +
        'shiftKey srcElement target timeStamp type view which propertyName').split(' ');

// Return all common properties
hAzzle.event.typeFixers = [{
        // key events
        reg: keyEvent,
        fix: function (event, original) {

            original.keyCode = event.keyCode || event.which;

            return commonProps.concat('char charCode key keyCode keyIdentifier keyLocation location'.split(' '));
        },
    },

    {
        reg: mouseEvent,
        fix: function (event, original, type) {

            original.rightClick = event.which === 3 || event.button === 2;
            original.pos = {
                x: 0,
                y: 0
            };

            if (event.pageX || event.pageY) {
                original.clientX = event.pageX;
                original.clientY = event.pageY;
            } else if (event.clientX || event.clientY) {
                original.clientX = event.clientX + doc.body.scrollLeft + docElem.scrollLeft;
                original.clientY = event.clientY + doc.body.scrollTop + docElem.scrollTop;
            }
            if (overOut.test(type)) {
                original.relatedTarget = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
            }

            return commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '));
        },
    }, {
        reg: textEvent,
        fix: function () {

            return commonProps.concat('data');
        },
    }, {
        reg: mouseWheelEvent,
        fix: function () {

            return commonProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
                'axis button buttons clientX clientY dataTransfer ' +
                'fromElement offsetX offsetY pageX pageY screenX screenY toElement').split(' '));
        },
    }, {
        reg: touchEvent,
        fix: function () {

            return commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '));
        },
    }, {
        reg: messageEvent,
        fix: function () {

            return commonProps.concat('data origin source'.split(' '));
        },
    }, {
        reg: popstateEvent,
        fix: function () {

            return commonProps.concat('state');
        }
    }, { // everything else
        reg: /.*/,
        fix: function () {
            return commonProps;
        }
    }
];