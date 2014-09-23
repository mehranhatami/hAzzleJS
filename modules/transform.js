// transform.js
var specialTransform = ['translateX', 'translateY', 'scale', 'scaleX', 'scaleY', 'skewX', 'skewY', 'rotateZ'],
    transforms3D = ['transformPerspective', 'translateZ', 'scaleZ', 'rotateX', 'rotateY'],
    // Note! 3D transform not working either in older Android versions, but we are not supporting
    // this versions anyways
    transformProps = (hAzzle.ie !== 9) ? specialTransform.concat(transforms3D) : specialTransform,
    tTranslate = /^translate/i,
    tScale = /^scale/i,
    tRotate = /^rotate/i,
    tWrap = /[()]/g,
    tUnits = /(%|px|em|rem|vw|vh|\d)$/i,
    tDigit = /(\d)$/i,
    tDeg = /(deg|\d)$/i,

    getTransform = function(elem) {
        if (getCached(elem) === undefined ||
            getCached(elem).transformCache[name] === undefined) {
            return tScale.test(name) ? 1 : 0;
        } else {
            return getCached(elem).transformCache[name].replace(tWrap, '');
        }
    },
    setTransform = function(elem, value) {

        var invalid = false,
            shortName = name.slice(0, name.length - 1);
        if (shortName === 'translate') {
            invalid = !tUnits.test(value);
        } else if (shortName === 'scale' || shortName === 'scal') {
            if (hAzzle.isAndroid && getCached(elem).transformCache[name] === undefined && value < 1) {
                value = 1;
            }
            invalid = !tDigit.test(value);
        } else if (shortName === 'skew') {
            invalid = !tDeg.test(value);
        } else if (shortName === 'rotate') {
            invalid = !tDeg.test(value);
        }

        if (!invalid) {
            getCached(elem).transformCache[name] = '(' + value + ')';
        }

        return getCached(elem).transformCache[name];
    };

// Add some templates

templates.backgroundPosition = ['X Y', '0% 0%'];
templates.transformOrigin = ['X Y Z', '50% 50% 0px'];
templates.perspectiveOrigin = ['X Y', '50% 50%'];

// Only continue if the browser support CSS 3D transform...

if (hAzzle.cssSupport.transform) {

    var i = 0,
        name, len = transformProps.length;

    for (; i < len; i++) {

        name = transformProps[i];

        // Extend FX animation hooks

        cssCore.FX.cssHooks[name] = {
            name: 'transform',
            get: getTransform,
            set: setTransform
        };
    }
}

function getCached(elem) {
    return hAzzle.private(elem, 'CSS');
}

function animateTransform(elem) {
    var transformString = '',
        perspective,
        name, transformValue;

    if ((hAzzle.ie || (hAzzle.isAndroid && !hAzzle.isChrome)) && getCached(elem).isSVG) {

        var translateX = getFXCss(elem, 'translateX'),
            translateY = getFXCss(elem, 'translateY'),
            skewX = getFXCss(elem, 'skewX'),
            skewY = getFXCss(elem, 'skewY'),
            scale = getFXCss(elem, 'scale'),
            scaleX = getFXCss(elem, 'scaleX'),
            scaleY = getFXCss(elem, 'scaleY'),
            rotateZ = getFXCss(elem, 'rotateZ'),

            SVGTransforms = {
                translate: [toFloat(translateX), toFloat(translateY)],
                skewX: [toFloat(skewX)],
                skewY: [toFloat(skewY)],
                scale: scale !== 1 ? [scale, scale] : [scaleX, scaleY],
                rotate: [rotateZ, 0, 0]
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

        // Avoid stressing storage.js for each iteration

        var gCElem = getCached(elem);

        for (name in gCElem.transformCache) {

            transformValue = gCElem.transformCache[name];

            if (name === 'transformPerspective') {
                perspective = transformValue;
                return true;
            }

            // IE9 only supports rotateZ, which it refers to as 'rotate'.

            if (hAzzle.ie === 9 && name === 'rotateZ') {
                name = 'rotate';
            }

            transformString += name + transformValue + ' ';
        }

        if (perspective) {
            transformString = 'perspective' + perspective + ' ' + transformString;
        }
    }
    setFXCss(elem, 'transform', transformString);
}