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
    easings['easeIn' + name] = easeIn;
    easings['easeOut' + name] = function(p) {
        return 1 - easeIn(1 - p);
    };
    easings['easeInOut' + name] = function(p) {
        return p < 0.5 ?
            easeIn(p * 2) / 2 :
            1 - easeIn(p * -2 + 2) / 2;
    };
});

// Bonus 'spring' easing, which is a less exaggerated version of easeInOutElastic.
easings.spring = function(p) {
    return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
};

// And a few more

hAzzle.extend({
    easeFrom: function(p) {
        return Math.pow(p, 4);
    },

    easeTo: function(p) {
        return Math.pow(p, 0.25);
    },

    elastic: function(p) {
        return -1 * Math.pow(4, -8 * p) * Math.sin((p * 6 - 1) * (2 * Math.PI) / 2) + 1;
    },
    swingFrom: function(p) {
        var s = 1.70158;
        return p * p * ((s + 1) * p - s);
    },

    swingTo: function(p) {
        var s = 1.70158;
        return (p -= 1) * p * ((s + 1) * p + s) + 1;
    },

    linear: function(p) {
        return p;
    },
    swing: function(p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
    },

    easeOut: function(p) {
        return Math.sin(p * Math.PI / 2);
    },

    easeOutStrong: function(p) {
        return (p == 1) ? 1 : 1 - Math.pow(2, -10 * p);
    },

    easeIn: function(p) {
        return p * p;
    },

    easeInStrong: function(p) {
        return (p == 0) ? 0 : Math.pow(2, 10 * (p - 1));
    },

    wobble: function(p) {
        return (-Math.cos(p * Math.PI * (9 * p)) / 2) + 0.5;
    },

    sinusoidal: function(p) {
        return (-Math.cos(p * Math.PI) / 2) + 0.5;
    },

    flicker: function(p) {
        var p = p + (Math.random() - 0.5) / 5;
        return easings.sinusoidal(p < 0 ? 0 : p > 1 ? 1 : p);
    },
    mirror: function(p) {
        if (p < 0.5)
            return easings.sinusoidal(p * 2);
        else
            return easings.sinusoidal(1 - (p - 0.5) * 2);
    },

    bounceIn: function(p) {
        return 1 - easings.bounceOut(1 - p);
    },
    bounceOut: function(p) {
        if (p < 1 / 2.75) {
            return (7.5625 * p * p);
        } else if (p < 2 / 2.75) {
            return (7.5625 * (p -= 1.5 / 2.75) * p + 0.75);
        } else if (p < 2.5 / 2.75) {
            return (7.5625 * (p -= 2.25 / 2.75) * p + 0.9375);
        } else {
            return (7.5625 * (p -= 2.625 / 2.75) * p + 0.984375);
        }
    },
    bounceInOut: function(p) {
        if (p < 0.5) return easings.bounceIn(p * 2) * .5;
        return easings.bounceOut(p * 2 - 1) * 0.5 + 0.5;
    },

    sineInOut: function(p) {
        return -0.5 * (Math.cos(Math.PI * p) - 1)
    },

    sineOut: function(p) {
        return Math.sin(p * Math.PI / 2);
    },
    sineIn: function(p) {
        return 1 - Math.cos(p * Math.PI / 2);
    }
}, easings);