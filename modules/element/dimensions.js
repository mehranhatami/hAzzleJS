// dimensions.js
hAzzle.define('Dimensions', function() {

    var _style = hAzzle.require('Style'),
        _types = hAzzle.require('Types'),

        innerOuter = function(elem, method, value) {

            var docElem;
            if (elem) {

                if (_types.isWindow(elem)) {
                    return elem.document.documentElement.client[method];
                }

                if (elem.nodeType === 9) {
                    docElem = elem.documentElement;
                    return Math.max(docElem.scroll[method], docElem.client[method]);
                }

                return _style.swap(elem, function() {
                    return _style.getSize(elem, method, value);
                });
            }
        },

        scrollLeftTop = function(elem, fn) {
            var win = getWindow(elem);
            return fn(elem, win);
        },

        getWindow = function(elem) {
            return _types.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
        },
        // scrollLeft
        scrollLeft = function(elem, val) {
            return scrollLeftTop(elem, function(elem, win) {
                if (val === undefined) {
                    return win ? win.pageXOffset : elem.scrollLeft;
                }
                return win ? win.scrollTo(val) : elem.scrollLeft = val;
            });
        },
        // scrollTop
        scrollTop = function(elem, val) {
            return scrollLeftTop(elem, function(elem, win) {
                if (val === undefined) {
                    return win ? win.pageYOffset : elem.scrollTop;
                }
                return win ? win.scrollTo(val) : elem.scrollTop = val;
            });
        };

    this.scrollLeft = function(val) {
        return scrollLeft(this.elements[0], val);
    };
    this.scrollTop = function(val) {
        return scrollTop(this.elements[0], val);
    };

    this.innerHeight = function() {
        return innerOuter(this.elements[0], 'Height', 'outer');
    };
    this.innerWidth = function() {
        return innerOuter(this.elements[0], 'Width', 'outer');
    };
    this.outerHeight = function() {
        return innerOuter(this.elements[0], 'Height', 'inner');
    };
    this.outerWidth = function() {
        return innerOuter(this.elements[0], 'Width', 'inner');
    };

    return {
        getWindow: getWindow,
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
    };
});