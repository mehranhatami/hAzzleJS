// curcss.js
hAzzle.define('curCSS', function() {

    var _detection = hAzzle.require('Detection'),
        _storage = hAzzle.require('Storage'),

        sLnline = /^(b|big|i|small|tt|abbr|acronym|cite|code|dfn|em|kbd|strong|samp|var|a|bdo|br|img|map|object|q|script|span|sub|sup|button|input|label|select|textarea)$/i,
       sListitem = /^(li)$/i,
       sTablerow = /^(tr)$/i,
            
        computedStyle = !!document.defaultView.getComputedStyle,

        computedValues = _detection.isWebkit ? function(elem) {
            var s;
            if (elem.nodeType === 1) {
                var dv = elem.ownerDocument.defaultView;
                s = dv.getComputedStyle(elem, null);
                if (!s && elem.style) {
                    elem.style.display = '';
                    s = dv.getComputedStyle(elem, null);
                }
            }
            return s || {};
        } :

        function(elem) {
            var view = false;
            if (elem && elem !== window) {

                if (elem.ownerDocument !== undefined) {
                    view = elem.ownerDocument.defaultView;
                }
                // Support: IE<=11+, Firefox<=30+
                // IE throws on elements created in popups
                // FF meanwhile throws on frame elements through 'defaultView.getComputedStyle'
                return view && computedStyle ?
                    (view.opener ? view.getComputedStyle(elem, null) :
                        window.getComputedStyle(elem, null)) : elem.style;
            }
            return null;
        },
        computedCSS = function(elem) {
            if (elem) {
                if (_storage.privateData.get(elem, 'computed') === undefined) {
                    _storage.privateData.access(elem, 'computed', {
                        computedStyle: null,
                    });
                }
                return _storage.privateData.get(elem, 'computed');
            }
        },
        getStyles = function(elem) {
            var computed;
            if (computedCSS(elem).computedStyle === null) {
                console.log('caching');
                computed = computedCSS(elem).computedStyle = computedValues(elem);
            } else {
                console.log('cached');
                computed = computedCSS(elem).computedStyle;
            }

            return computed;
        },

        curHeight = function(elem, toggleDisplay) {
            var contentBoxHeight = elem.offsetHeight -
                (parseFloat(curCSS(elem, 'borderTopWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderBottomWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingTop')) || 0) -
                (parseFloat(curCSS(elem, 'paddingBottom')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxHeight;
        },
        curWidth = function(elem, toggleDisplay) {
            var contentBoxWidth = elem.offsetWidth -
                (parseFloat(curCSS(elem, 'borderLeftWidth')) || 0) -
                (parseFloat(curCSS(elem, 'borderRightWidth')) || 0) -
                (parseFloat(curCSS(elem, 'paddingLeft')) || 0) -
                (parseFloat(curCSS(elem, 'paddingRight')) || 0);

            revertDisplay(elem, toggleDisplay);

            return contentBoxWidth;
        },

        revertDisplay = function(elem, toggleDisplay) {
            if (toggleDisplay) {
                elem.style.display = 'none';
            }
        },
            
            getDisplayType = function(elem) {
        var tagName = elem.tagName.toLowerCase();
        if (sLnline.test(tagName)) {
            return 'inline';
        }
        if (sListitem.test(tagName)) {
            return 'list-item';
        }
        if (sTablerow.test(tagName)) {
            return 'table-row';
        }
        return 'block';
    },

        // Prop to jQuery for the name!

        curCSS = function(elem, prop, force) {

        if(typeof elem === 'object' && elem instanceof hAzzle) {
               elem = elem.elements[0];
         }

            var computedValue = 0,
                toggleDisplay = false;

            if ((prop === 'height' || prop === 'width') && curCSS(elem, 'display') === 0) {
                toggleDisplay = true;
                elem.style.display = hAzzle.getDisplayType(elem);
            }

            if (!force) {

                if (prop === 'height' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curHeight(elem, toggleDisplay);
                } else if (prop === 'width' &&
                    curCSS(elem, 'boxSizing').toString().toLowerCase() !== 'border-box') {
                    return curWidth(elem, toggleDisplay);
                }
            }

            var computedStyle = getStyles(elem);

            if ((_detection.ie ||
                    _detection.isFirefox) && prop === 'borderColor') {
                prop = 'borderTopColor';
            }

            // Support: IE9
            // getPropertyValue is only needed for .css('filter')

            if (_detection === 9 && prop === 'filter') {
                computedValue = computedStyle.getPropertyValue(prop);
            } else {
                computedValue = computedStyle[prop];
            }

            if (computedValue === '' || computedValue === null) {
                computedValue = elem.style[prop];
            }

            if (computedValue === 'auto' && (prop === 'top' || prop === 'right' || prop === 'bottom' || prop === 'left')) {

                var position = curCSS(elem, 'position');

                if (position === 'fixed' || (position === 'absolute' && (prop === 'left' || prop === 'top'))) {
                    computedValue = hAzzle(elem).position()[prop] + 'px';
                }
            }
            return computedValue;
        };

    return {
      computedCSS: computedCSS,
      getStyles: getStyles,
      curCSS: curCSS,
      getDisplayType:getDisplayType
    };
});