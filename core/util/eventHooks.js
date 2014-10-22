// eventhooks.js
hAzzle.define('eventHooks', function() {

    var _event = hAzzle.require('Events'),

        mouseWheelEvent = /mouse.*(wheel|scroll)/i,
        textEvent = /^text/i,
        touchEvent = /^touch|^gesture/i,
        messageEvent = /^message$/i,
        popstateEvent = /^popstate$/i,

        mouseWheelProps = _event.mouseProps.concat(('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ ' +
            'deltaY deltaX deltaZ').split(' ')),
        textProps = _event.commonProps.concat(('data').split(' ')),
        touchProps = _event.commonProps.concat(('touches changedTouches targetTouches scale rotation').split(' ')),
        messageProps = _event.commonProps.concat(('data origin source').split(' ')),
        stateProps = _event.commonProps.concat(('state').split(' '));

    _event.propHooks = _event.propHooks.concat([

        { // mouse wheel events
            reg: mouseWheelEvent,
            fix: function() {
                return mouseWheelProps;
            }
        }, { // TextEvent
            reg: textEvent,
            fix: function() {
                return textProps;
            }
        }, { // touch and gesture events
            reg: touchEvent,
            fix: function() {
                return touchProps;
            }
        }, { // message events
            reg: messageEvent,
            fix: function() {
                return messageProps;
            }
        }, { // popstate events
            reg: popstateEvent,
            fix: function() {
                return stateProps;
            }
        }
    ]);
    return {};
});