// Fixes Chrome bug / issue
if (hAzzle.isChrome) {
    hAzzle.cssHooks.textDecoration = {
        name: 'textDecoration',
        set: function(elem, value) {
            return value;
        },
        get: function(elem, computed) {
            if (computed) {

                //Chrome 31-36 return text-decoration-line and text-decoration-color
                //which are not expected yet.
                //see https://code.google.com/p/chromium/issues/detail?id=342126
                var ret = curCSS(elem, 'text-decoration');
                //We cannot assume the first word as 'text-decoration-style'
                if (/\b(inherit|(?:und|ov)erline|blink|line\-through|none)\b/.test(ret)) {
                    return RegExp.$1;
                }
            }
        }
    }
}

if (!cssCore.has['api-pixelPosition']) {
    hAzzle.each(['top', 'left', 'bottom', 'right'], function(prop) {
        hAzzle.cssHooks[prop] = {
            name: prop,
            get: function(elem, computed) {
                if (computed) {
                    var isAutoPosition,
                        elStyles = getStyles(elem),
                        position = curCSS(elem, 'position', null, elStyles);
                    computed = curCSS(elem, prop, null, elStyles);
                    isAutoPosition = computed === 'auto';
                    if (isAutoPosition && position === 'relative') {
                        return '0px';
                    }
                    // if curCSS returns percentage or auto, fallback to offset

                    if (isAutoPosition && position !== 'static' || cssCore.RegEx.sNumb.test(computed)) {
                        // Since we can't handle right and bottom with offset, let's work around it
                        var elemPosition = hAzzle(elem).position();
                        if (prop === 'bottom') {
                            return elemPosition.top + parseFloat(elStyles.height) + 'px';
                        } else if (prop === 'right') {
                            return elemPosition.left + parseFloat(elStyles.width) + 'px';
                        }
                        return elemPosition[prop] + 'px';
                    }
                    return computed;
                }
            }
        };
    });
}