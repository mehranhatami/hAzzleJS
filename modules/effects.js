// effects.js
hAzzle.each(['Down', 'Up'], function(direction) {
    hAzzle.Core['slide' + direction] = function(speed, easing, callback) {
        return this.animate({
            height: direction === 'Down' ? 'show' : 'hide',
            marginBottom: direction === 'Down' ? 'show' : 'hide',
            marginTop: direction === 'Down' ? 'show' : 'hide',
            paddingBottom: direction === 'Down' ? 'show' : 'hide',
            paddingTop: direction === 'Down' ? 'show' : 'hide',
        }, speed, easing, callback);
    };
});

hAzzle.each(['fade', 'slide'], function(direction) {
    hAzzle.Core[direction + 'Toggle'] = function(speed, easing, callback) {

        if (direction === 'slide') {

            props = {
                height: "toggle",
                marginBottom: "toggle",
                marginTop: "toggle",
                paddingBottom: "toggle",
                paddingTop: "toggle",
            };

        } else {

            props = {
                opacity: 'toggle'
            };
        }

        return this.animate(props, speed, easing, callback);
    };
});

hAzzle.each(['In', 'Out'], function(direction) {
    hAzzle.Core['fade' + direction] = function(speed, easing, callback) {
        return this.animate({
            opacity: direction === 'In' ? 'show' : 'hide',
        }, speed, easing, callback);
    };
});