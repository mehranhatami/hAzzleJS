// dimensions.js
hAzzle.define('Dimensions', function() {

    var _style = hAzzle.require('Style'),
        _types = hAzzle.require('Types'),
        _curcss = hAzzle.require('curCSS'),
        cssShow = {
            visibility: 'hidden',
            display: 'block'
        },
        sizeParams = {
            'Width': ['Left', 'Right'],
            'Height': ['Top', 'Bottom']

        },
        swap = function(elem, fn) {
            var obj = {},
                name, val;

            if (elem.offsetWidth) {
                val = fn();
            } else {
                for (name in cssShow) {
                    obj[name] = elem.style[name];
                    elem.style[name] = cssShow[name];
                }

                val = fn();
                for (name in obj) {
                    elem.style[name] = obj[name];
                }
            }

            return val;
        },

        getSize = function(elem, type, extra) {

            var val = elem['offset' + type];
            type = sizeParams[type];


            if (extra === 'outer') {
                return val;
            }

            // inner = outer - border
            val -= parseFloat(_curcss.curCSS(elem, 'border' + type[0] + 'Width')) +
                parseFloat(_curcss.curCSS(elem, 'border' + type[1] + 'Width'));

            if (extra === 'inner') {
                return val;
            }
            // normal = inner - padding
            val -= parseFloat(_curcss.curCSS(elem, 'padding' + type[0])) +
                parseFloat(_curcss.curCSS(elem, 'padding' + type[1]));

            return val + 'px';
        },

        innerOuter = function(elem, method, value, extra) {

            var docElem;

            if (elem) {

                if (_types.isWindow(elem)) {
                    return elem.document.documentElement.client[method];
                }

                if (elem.nodeType === 9) {
                    docElem = elem.documentElement;
                    return Math.max(docElem.scroll[method], docElem.client[method]);
                }

                return swap(elem, function() {
                    return getSize(elem, method, value, extra);
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

    this.height = function(val) {
        if (val) {
            _style.setCSS(this.elements[0], 'height', val);
        }
        return _curcss.curCSS(this.elements[0], 'width', /*force*/ true);
    };
    this.width = function(val) {
        if (val) {
            _style.setCSS(this.elements[0], 'width', val);
        }
        return _curcss.curCSS(this.elements[0], 'width', /*force*/ true);
    };

    this.innerHeight = function() {
        return innerOuter(this.elements[0], 'Height', 'inner');
    };
    this.innerWidth = function() {
        return innerOuter(this.elements[0], 'Width', 'inner');
    };
    this.outerHeight = function(margin) {
        return innerOuter(this.elements[0], 'Height', 'outer', margin ? 'margin' : 'border');
    };
    this.outerWidth = function(margin) {
        return innerOuter(this.elements[0], 'Width', 'outer', margin ? 'margin' : 'border');
    };

    return {
        getWindow: getWindow,
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
    };
});