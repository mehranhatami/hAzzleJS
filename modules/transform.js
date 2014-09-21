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

                get: function(element) {
                    var _private = getCached(element);

                    if (_private === undefined ||
                        _private.transformCache[name] === undefined) {
                        return tScale.test(name) ? 1 : 0;
                    } else {
                        return _private.transformCache[name].replace(/[()]/g, '');
                    }
                },

                set: function(element, propertyValue) {

                    var invalid = false,
                        _private = getCached(element),
                        shortName = name.substr(0, name.length - 1);

                    if (shortName === 'translate') {
                        invalid = !tUnits.test(propertyValue);
                    } else if (shortName === 'scale' || shortName === 'scal') {
                        if (hAzzle.isAndroid && _private.transformCache[name] === undefined && propertyValue < 1) {
                            propertyValue = 1;
                        }

                        invalid = !tDigit.test(propertyValue);
                    } else if (shortName === 'skew') {
                        invalid = !tDeg.test(propertyValue);
                    } else if (shortName === 'rotate') {
                        invalid = !tDeg.test(propertyValue);
                    }

                    if (!invalid) {
                        _private.transformCache[name] = '(' + propertyValue + ')';
                    }

                    return _private.transformCache[name];
                }
            };
        })();
    }

    function getCached(elem) {
        return hAzzle.private(elem, 'CSS');
    }

    function flushTransformCache(element) {
        var transformString = '',
            name,
            transformValue;

        if ((hAzzle.ie || (hAzzle.isAndroid && !hAzzle.isChrome)) && getCached(element).isSVG) {

            function getTransformFloat(transformProperty) {
                return parseFloat(getFXCss(element, transformProperty));
            }

            var SVGTransforms = {
                translate: [getTransformFloat('translateX'), getTransformFloat('translateY')],
                skewX: [getTransformFloat('skewX')],
                skewY: [getTransformFloat('skewY')],

                scale: getTransformFloat('scale') !== 1 ? [getTransformFloat('scale'), getTransformFloat('scale')] : [getTransformFloat('scaleX'), getTransformFloat('scaleY')],

                rotate: [getTransformFloat('rotateZ'), 0, 0]
            };

            for (name in getCached(element).transformCache) {

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

            var  perspective;

            for (name in getCached(element).transformCache) {
                transformValue = getCached(element).transformCache[name];

                if (name === 'transformPerspective') {
                    perspective = transformValue;
                    return true;
                }

                // IE9 only supports one rotation type, rotateZ, which it refers to as 'rotate'.

                if (hAzzle.ie === 9 && name === 'rotateZ') {
                    name = 'rotate';
                }

                transformString += name + transformValue + ' ';
            }

            if (perspective) {
                transformString = 'perspective' + perspective + ' ' + transformString;
            }
        }
        setFXCss(element, 'transform', transformString);
    }
}