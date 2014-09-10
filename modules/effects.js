// effects.js
hAzzle.each(['Down', 'Up'], function(direction) {
    hAzzle.Core['slide' + direction] = function(speed, easing, callback) {

        var props = {
            height: direction === 'Down' ? 'show' : 'hide',
            marginBottom: direction === 'Down' ? 'show' : 'hide',
            marginTop: direction === 'Down' ? 'show' : 'hide',
            paddingBottom: direction === 'Down' ? 'show' : 'hide',
            paddingTop: direction === 'Down' ? 'show' : 'hide',
        };

        return this.animate(props, speed, easing, callback);
    };
});

hAzzle.each(['fade', 'slide'], function(direction) {
    hAzzle.Core[direction + 'toggle'] = function(speed, easing, callback) {

        if (direction === 'fade') {

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
        var props = {

            display: direction === 'fade' ? 'auto' : 'none'
        };
        return this.animate(props, speed, easing, callback);
    };
});


hAzzle.each(['In', 'Out'], function(direction) {
    hAzzle.Core['fade' + direction] = function(speed, easing, callback) {
        var props = {
            opacity: direction === 'In' ? 'show' : 'hide',
            display: direction === 'In' ? 'auto' : 'none'
        };
        return this.animate(props, speed, easing, callback);
    };
});