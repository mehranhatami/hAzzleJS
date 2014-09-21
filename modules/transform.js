// transform.js
var specialTransform = ('translateX translateY scale scaleX scaleY skewX skewY rotateZ').split(' '),
    transforms3D = ('transformPerspective translateZ scaleZ rotateX rotateY').split(' '),
    tTranslate = /^translate/i,
    tScale = /^scale/i,
    tRotate = /^rotate/i,
    tUnits = /(%|px|em|rem|vw|vh|\d)$/i,
    tDigit = /(\d)$/i,
    tDeg = /(deg|\d)$/i;

// 3D transform not supported in IE 9

if (hAzzle.ie !== 9) {
    specialTransform = specialTransform.concat(transforms3D);
}

// Extend 'templates' object 

hAzzle.extend({
    'backgroundPosition': ['X Y', '0% 0%'],
    'transformOrigin': ['X Y Z', '50% 50% 0px'],
    'perspectiveOrigin': ['X Y', '50% 50%']

}, templates);

// Check if we are supporting CSS Transform

if (hAzzle.cssSupport.transform) {

    var i = 0,
        len = specialTransform.length;

    for (; i < len; i++) {

        (function() {

            var name = specialTransform[i];

            // Extend FX animation hooks

            cssCore.FX.cssHooks[name] = {

                name: 'transform',

                get: function(elem) {
                    var _private = getCached(elem);

                    if (_private === undefined ||
                        _private.transformCache[name] === undefined) {
                        return tScale.test(name) ? 1 : 0;
                    } else {
                        return _private.transformCache[name].replace(/[()]/g, '');
                    }
                },

                set: function(elem, value) {

                    var invalid = false,
                        _private = getCached(elem),
                        shortName = name.substr(0, name.length - 1);

                    if (shortName === 'translate') {
                        invalid = !tUnits.test(value);
                    } else if (shortName === 'scale' || shortName === 'scal') {
                        if (hAzzle.isAndroid &&
                            _private.transformCache[name] === undefined && value < 1) {
                            value = 1;
                        }

                        invalid = !tDigit.test(value);
                    } else if (shortName === 'skew') {
                        invalid = !tDeg.test(value);
                    } else if (shortName === 'rotate') {
                        invalid = !tDeg.test(value);
                    }

                    if (!invalid) {
                        _private.transformCache[name] = '(' + value + ')';
                    }

                    return _private.transformCache[name];
                }
            };
        })();
    }

    function getCached(elem) {
        return hAzzle.private(elem, 'CSS');
    }

    function flushTransformCache(elem) {
        var transformString = '',
            name, value;

        if ((hAzzle.ie || (hAzzle.isAndroid && !hAzzle.isChrome)) && getCached(elem).isSVG) {

            function getTransformFloat(transformProperty) {
                return parseFloat(getFXCss(elem, transformProperty));
            }

            var SVGTransforms = {
                translate: [getTransformFloat('translateX'), getTransformFloat('translateY')],
                skewX: [getTransformFloat('skewX')],
                skewY: [getTransformFloat('skewY')],

                scale: getTransformFloat('scale') !== 1 ? [getTransformFloat('scale'), getTransformFloat('scale')] : [getTransformFloat('scaleX'), getTransformFloat('scaleY')],

                rotate: [getTransformFloat('rotateZ'), 0, 0]
            };

            for (name in getCached(elem).transformCache) {

                if (tTranslate.test(name)) {
                    name = 'translate';
                } else if (tScale.test(name)) {
                    name = 'scale';
                } else if (tRotate.test(name)) {
                    name = 'rotate';
                }

                if (SVGTransforms[name]) {
                    transformString += name + '(' + SVGTransforms[name].join(' ') + ')' + ' ';
                    delete SVGTransforms[name];
                }
            }

        } else {

            var perspective;

            for (name in getCached(elem).transformCache) {
                value = getCached(elem).transformCache[name];

                if (name === 'transformPerspective') {
                    perspective = value;
                    return true;
                }

                // IE9 only supports one rotation type, rotateZ, which it refers to as 'rotate'.

                if (hAzzle.ie === 9 && name === 'rotateZ') {
                    name = 'rotate';
                }

                transformString += name + value + ' ';
            }

            if (perspective) {
                transformString = 'perspective' + perspective + ' ' + transformString;
            }
        }
        setFXCss(elem, 'transform', transformString);
    }
}