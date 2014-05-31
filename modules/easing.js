// hAzzle Easing library

hAzzle.easing = {

    elastic: function (p) {
        return p === 0 || p === 1 ? p :
            -Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
    },

    sine: function (p) {
        return 1 - Math.cos(p * Math.PI / 2);
    },
    circ: function (p) {
        return 1 - Math.sqrt(1 - p * p);
    },

    back: function (p) {
        return p * p * (3 * p - 2);
    },

    spring: function (p) {
        return 1 - (Math.cos(p * 4.5 * Math.PI) * Math.exp(-p * 6));
    },

    easeOut: function (t) {
        return Math.sin(t * Math.PI / 2);
    },

    easeOutStrong: function (t) {
        return (t === 1) ? 1 : 1 - Math.pow(2, -10 * t);
    },

    easeIn: function (t) {
        return t * t;
    },

    easeInStrong: function (t) {
        return (t === 0) ? 0 : Math.pow(2, 10 * (t - 1));
    },

    easeOutBounce: function (p) {
        if ((p) < (1 / 2.75)) {
            return (7.5625 * p * p);
        } else if (p < (2 / 2.75)) {
            return (7.5625 * (p -= (1.5 / 2.75)) * p + .75);
        } else if (p < (2.5 / 2.75)) {
            return (7.5625 * (p -= (2.25 / 2.75)) * p + .9375);
        } else {
            return (7.5625 * (p -= (2.625 / 2.75)) * p + .984375);
        }
    },

    easeInBack: function (p) {
        var s = 1.70158;
        return (p) * p * ((s + 1) * p - s);
    },

    easeOutBack: function (p) {
        var s = 1.70158;
        return (p = p - 1) * p * ((s + 1) * p + s) + 1;
    },

    bounce: function (t) {
        if (t < (1 / 2.75)) {
            return 7.5625 * t * t;
        }
        if (t < (2 / 2.75)) {
            return 7.5625 * (t -= (1.5 / 2.75)) * t + 0.75;
        }
        if (t < (2.5 / 2.75)) {
            return 7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375;
        }
        return 7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375;
    },

    bouncePast: function (p) {
        if (p < (1 / 2.75)) {
            return (7.5625 * p * p);
        } else if (p < (2 / 2.75)) {
            return 2 - (7.5625 * (p -= (1.5 / 2.75)) * p + .75);
        } else if (p < (2.5 / 2.75)) {
            return 2 - (7.5625 * (p -= (2.25 / 2.75)) * p + .9375);
        } else {
            return 2 - (7.5625 * (p -= (2.625 / 2.75)) * p + .984375);
        }
    },

    linear: function (p) {
        return p;
    },
    swing: function (p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
    },

    swingTo: function (p) {
        var s = 1.70158;
        return (p -= 1) * p * ((s + 1) * p + s) + 1;
    },

    swingFrom: function (p) {
        var s = 1.70158;
        return p * p * ((s + 1) * p - s);
    },

    wobble: function (p) {
        return (-Math.cos(p * Math.PI * (9 * p)) / 2) + 0.5;
    },

    sinusoidal: function (p) {
        return (-Math.cos(p * Math.PI) / 2) + 0.5;
    },

    flicker: function (p) {
        p = p + (Math.random() - 0.5) / 5;
        return hAzzle.easing.sinusoidal(p < 0 ? 0 : p > 1 ? 1 : p);
    },

    mirror: function (p) {
        if (p < 0.5)
            return hAzzle.easing.sinusoidal(p * 2);
        else
            return hAzzle.easing.sinusoidal(1 - (p - 0.5) * 2);
    }
};