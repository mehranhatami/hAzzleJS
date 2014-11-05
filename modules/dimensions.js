// dimensions.js
hAzzle.define('Dimensions', function() {

    var win = window,
        doc = window.document,
        docElem = doc.documentElement,

        // Include the modules    

        _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _style = hAzzle.require('Style'),
        _core = hAzzle.require('Core'),
        _curcss = hAzzle.require('curCSS'),

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
            h = _types.isType('Function')(h) ? h.call(opt) : h;
            w = _types.isType('Function')(w) ? w.call(opt) : w;
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
        },
        setOffset = function(elem, opts, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
                position = _curcss(elem, 'position'),
                curElem = hAzzle(elem),
                props = {};

            // Set position first, in-case top/left are set even on static elem
            if (position === 'static') {
                elem.style.position = 'relative';
            }

            curOffset = curElem.offset();
            curCSSTop = _curcss(elem, 'top');
            curCSSLeft = _curcss(elem, 'left');
            calculatePosition = (position === 'absolute' || position === 'fixed') &&
                (curCSSTop + curCSSLeft).indexOf('auto') > -1;

            // Need to be able to calculate position if either
            // top or left is auto and position is either absolute or fixed
            if (calculatePosition) {
                curPosition = curElem.position();
                curTop = curPosition.top;
                curLeft = curPosition.left;

            } else {
                curTop = parseFloat(curCSSTop) || 0;
                curLeft = parseFloat(curCSSLeft) || 0;
            }

            if (_types.isType('function')(opts)) {
                opts = opts.call(elem, i, curOffset);
            }

            if (opts.top != null) {
                props.top = (opts.top - curOffset.top) + curTop;
            }
            if (opts.left != null) {
                props.left = (opts.left - curOffset.left) + curLeft;
            }

            if ('using' in opts) {
                opts.using.call(elem, props);

            } else {
                curElem.css(props);
            }
        };

    this.scrollLeft = function(val) {
        return scrollLeft(this.elements[0], val);
    };
    this.scrollTop = function(val) {
        return scrollTop(this.elements[0], val);
    };

    this.offset = function(opts) {
        if (arguments.length) {
            return opts === undefined ?
                this.elements :
                this.each(function(elem, i) {
                    setOffset(elem, opts, i);
                });
        }
        var docElem, elem = this.elements[0],
            doc = elem && elem.ownerDocument;

        if (!doc) {
            return;
        }

        docElem = doc.documentElement;

        // Make sure it's not a disconnected DOM node
        if (!_core.contains(docElem, elem)) {
            return {
                top: 0,
                left: 0
            };
        }
        // All major browsers supported by hAzzle supports getBoundingClientRect, so no
        // need for a workaround

        var bcr = elem.getBoundingClientRect(),
            isFixed = (_curcss(elem, 'position') === 'fixed'),
            win = _types.isWindow(doc) ? doc : doc.nodeType === 9 && doc.defaultView;
        return {
            top: bcr.top + elem.parentNode.scrollTop + ((isFixed) ? 0 : win.pageYOffset) - docElem.clientTop,
            left: bcr.left + elem.parentNode.scrollLeft + ((isFixed) ? 0 : win.pageXOffset) - docElem.clientLeft
        };
    };

    this.position = function(relative) {

        var offset = this.offset(),
            elem = this.elements[0],
            scroll = {
                top: 0,
                left: 0
            },
            position = {
                top: 0,
                left: 0
            };

        if (!this.elements[0]) {
            return;
        }

        elem = elem.parentNode;

        if (!_util.nodeName(elem, 'html')) {
            scroll.top += elem.scrollLeft;
            scroll.left += elem.scrollTop;
        }
        position = {
            top: offset.top - scroll.top,
            left: offset.left - scroll.left
        };

        if (relative && (relative = hAzzle(relative))) {
            var relativePosition = relative.getPosition();
            return {
                top: position.top - relativePosition.top - parseInt(_curcss(relative, 'borderLeftWidth')) || 0,
                left: position.left - relativePosition.left - parseInt(_curcss(relative, 'borderTopWidth')) || 0
            };
        }
        return position;
    };

    this.offsetParent = function() {
        return this.map(function() {
            var offsetParent = this.offsetParent || docElem;

            while (offsetParent && (!_util.nodeName(offsetParent, 'html') &&
                    _curcss(offsetParent, 'position') === 'static')) {
                offsetParent = offsetParent.offsetParent;
            }

            return offsetParent || docElem;
        });
    };

    // 'this' height and width

    _util.each({
        height: 'Height',
        width: 'Width'
    }, function(val, prop) {
        // Height / Width
        this[prop] = function(value) {
            var elem = this.elements[0],
                doc;

            if (_types.isWindow(elem)) {
                return elem.document.documentElement['client' + val];
            }

            if (elem.nodeType === 9) {
                doc = elem.documentElement;

                return Math.max(
                    elem.body['scroll' + val], doc['scroll' + val],
                    elem.body['offset' + val], doc['offset' + val],
                    doc['client' + val]
                );
            }
            return value === undefined ?
                _curcss.css(this.elements[0], 'width', /*force*/ true) :
                _style.setCSS(this.elements[0], 'height', val);
        };
        // innerHeight / innerWidth
        this['inner' + val] = function() {
                return this.elements[0]['client' + val];
            };
            // outerHeight / outerWidth
        this['outer' + val] = function(margin) {
            var elem = this.elements[0];
            return margin ? (elem['offset' + val] +
                (parseInt(_curcss.css(elem, prop === 'height' ? 'marginTop' : 'marginLeft'), 10) || 0) +
                (parseInt(_curcss.css(elem, prop === 'height' ? 'marginBottom' : 'marginRight'), 10) || 0)) : elem['offset' + val];

        };
    }.bind(this));

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