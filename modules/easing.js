
// Default easing value

hAzzle.defaultEasing = 'swing';

var easings = hAzzle.easing = {};

hAzzle.each(['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'], function(name, i) {
    easings[name] = function(p) {
        return Math.pow(p, i + 2);
    };
});

hAzzle.extend({
    sine: function(p) {
        return 1 - Math.cos(p * Math.PI / 2);
    },
    circ: function(p) {
        return 1 - Math.sqrt(1 - p * p);
    },
    elastic: function(p) {
        return p === 0 || p === 1 ? p :
            -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
    },
    back: function(p) {
        return p * p * (3 * p - 2);
    },
    bounce: function(p) {
        var pow2,
            bounce = 4;

        while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) {}
        return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
    }
}, easings);

hAzzle.each(easings, function(easeIn, name) {
    hAzzle.easing['easeIn' + name] = easeIn;
    hAzzle.easing['easeOut' + name] = function(p) {
        return 1 - easeIn(1 - p);
    };
    hAzzle.easing['easeInOut' + name] = function(p) {
        return p < 0.5 ?
            easeIn(p * 2) / 2 :
            1 - easeIn(p * -2 + 2) / 2;
    };
});

// Bonus 'spring' easing, which is a less exaggerated version of easeInOutElastic.
hAzzle.easing.spring = function(p) {
    return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
};

// A few more

hAzzle.easing.easeFrom = function(p) {
    return Math.pow(p, 4);
};

hAzzle.easing.easeTo = function(p) {
    return Math.pow(p, 0.25);
};

hAzzle.easing.elastic = function(p) {
    return -1 * Math.pow(4, -8 * p) * Math.sin((p * 6 - 1) * (2 * Math.PI) / 2) + 1;
};
hAzzle.easing.swingFrom = function(p) {
    var s = 1.70158;
    return p * p * ((s + 1) * p - s);
};

hAzzle.easing.swingTo = function(p) {
    var s = 1.70158;
    return (p -= 1) * p * ((s + 1) * p + s) + 1;
};

hAzzle.easing.linear = function( p ) {
		return p;
	};
hAzzle.easing.swing = function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	};