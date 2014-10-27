// dimensions.js
hAzzle.define('Dimensions', function() {

    var win = window,
        doc = window.document,
        docElem = doc.documentElement,
        _types = hAzzle.require('Types'),
        _style = hAzzle.require('Style'),
        _matchMedia = win.matchMedia || win.msMatchMedia,
        mq = _matchMedia ? function(q) {
            return !!_matchMedia.call(win, q).matches;
        } : function() {
            return false;
        },

        viewportW = function() {
            var a = docElem.clientWidth,
                b = win.innerWidth;
            return a < b ? b : a;
        },
        viewportH = function() {
            var a = docElem.clientHeight,
                b = win.innerHeight;
            return a < b ? b : a;
        },

        // Include the modules    
        _style = hAzzle.require('Style'),
        _types = hAzzle.require('Types'),
        _curcss = hAzzle.require('curCSS'),

        sizeParams = {
            'Width': ['Left', 'Right'],
            'Height': ['Top', 'Bottom']

        },
        getSize = function(elem, type, extra) {

            var val = elem['offset' + type];
            type = sizeParams[type];


            if (extra === 'outer') {
                return val;
            }

            // inner = outer - border
            val -= parseFloat(_curcss.css(elem, 'border' + type[0] + 'Width')) +
                parseFloat(_curcss.css(elem, 'border' + type[1] + 'Width'));

            if (extra === 'inner') {
                return val;
            }
            // normal = inner - padding
            val -= parseFloat(_curcss.css(elem, 'padding' + type[0])) +
                parseFloat(_curcss.css(elem, 'padding' + type[1]));

            return val + 'px';
        },

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
                    return getSize(elem, method, value);
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
        },
        // Test if a media query is active   
        mediaQuery = function() {
            if (!mq) {
                hAzzle.err(true, 15, 'matchMedia are not supported by this browser!');
                return false;
            }
            return true;
        },

        matchMedia = _matchMedia ? function() {
            // matchMedia must be binded to window
            return _matchMedia.apply(win, arguments);
        } : function() {
            return {};
        },
        // Test if any part of an element (or the first element in a matched set) is in the 
        // current viewport
        viewport = function() {
            return {
                'width': viewportW(),
                'height': viewportH()
            };
        },
        calibrate = function(coords, cushion) {
            var opt = {};
            cushion = +cushion || 0;
            opt.width = (opt.right = coords.right + cushion) - (opt.left = coords.left - cushion);
            opt.height = (opt.bottom = coords.bottom + cushion) - (opt.top = coords.top - cushion);
            return opt;
        },

        // Get an a object containing the properties top, bottom, left, right, width, and height 
        // with respect to the top-left corner of the current viewport, and with an 
        // optional cushion amount

        rectangle = function(elem, cushion) {
            if (elem) {

                if (elem instanceof hAzzle) {
                    elem = elem.elements[0];
                } else {

                    elem = elem.nodeType ? elem : elem[0];
                }
                if (!elem || elem.nodeType !== 1) {
                    return false;
                }
                return calibrate(elem.getBoundingClientRect(), cushion);
            }
        },

        // Get the aspect ratio of the viewport or of an object with width/height properties

        aspect = function(opt) {
            opt = !null ? viewport() : opt.nodeType === 1 ? rectangle(opt) : opt;
            var h = opt.height,
                w = opt.width;
            h = _types.isFunction(h) ? h.call(opt) : h;
            w = _types.isFunction(w) ? w.call(opt) : w;
            return w / h;
        },
        // Test if an element is in the same x-axis section as the viewport.
        inX = function(elem, cushion) {
            var r = rectangle(elem, cushion);
            return !!r && r.right >= 0 && r.left <= viewportW();
        },
        // Test if an element is in the same y-axis section as the viewport.    

        inY = function(elem, cushion) {
            var r = rectangle(elem, cushion);
            return !!r && r.bottom >= 0 && r.top <= viewportH();
        },
        // Test if an element is in the viewport.
        inViewport = function(elem, cushion) {
            var r = rectangle(elem, cushion);
            return !!r && r.bottom >= 0 && r.right >= 0 && r.top <= viewportH() && r.left <= viewportW();
        },
        // Get the vertical scroll position in pixels
        scrollY = function() {
            return win.pageYOffset || docElem.scrollTop;
        },
        // Get the horizontal scroll position in pixels
        scrollX = function() {
            return win.pageXOffset || docElem.scrollLeft;
        };
    this.scrollLeft = function(val) {
        return scrollLeft(this.elements[0], val);
    };
    this.scrollTop = function(val) {
        return scrollTop(this.elements[0], val);
    };

    this.height = function(value) {
        var elem = this.elements[0],
            doc;

        if (_types.isWindow(elem)) {
            return elem.document.documentElement["clientHeight"];
        }

        if (elem.nodeType === 9) {
            doc = elem.documentElement;

            return Math.max(
                elem.body["scrollHeight"], doc["scrollHeight"],
                elem.body["offsetHeight"], doc["offsetHeight"],
                doc["clientHeight"]
            );
        }

        return value === undefined ?
            _curcss.css(this.elements[0], 'width', /*force*/ true) :

            _style.setCSS(this.elements[0], 'height', val);

    };
    this.width = function(val) {
        if (val) {
            _style.setCSS(this.elements[0], 'width', val);
        }
        return _curcss.css(this.elements[0], 'width', /*force*/ true);
    };

    this.innerHeight = function() {
        return innerOuter(this.elements[0], 'Height', 'inner');
    };
    this.innerWidth = function() {
        return innerOuter(this.elements[0], 'Width', 'inner');
    };
    this.outerHeight = function() {
        return innerOuter(this.elements[0], 'Height', 'outer');
    };
    this.outerWidth = function() {
        return innerOuter(this.elements[0], 'Width', 'outer');
    };

    return {
        getWindow: getWindow,
        scrollLeft: scrollLeft,
        scrollTop: scrollTop,
        matchMedia: matchMedia,
        mediaQuery: mediaQuery,
        aspect: aspect,
        inViewport: inViewport,
        scrollY: scrollY,
        scrollX: scrollX,
        inX: inX,
        inY: inY,
        rectangle: rectangle,
        viewportW: viewportW,
        viewportH: viewportH

    };
});