var directions = ["Top", "Right", "Bottom", "Left"],
    reDash = /\-./g,
    docElem = hAzzle.docElem,

    excludedProps = [
        'zoom',
        'box-flex',
        'columns',
        'counter-reset',
        'volume',
        'stress',
        'overflow',
        'flex-grow',
        'column-count',
        'flex-shrink',
        'order',
        'orphans',
        'widows',
        'transform',
        'transform-origin',
        'transform-style',
        'perspective',
        'perspective-origin',
        'backface-visibility'
    ],

    cssHooks = {

        opacity: {
            get: function(elem, computed) {

                if (computed) {

                    var opacity = elem.style.opacity ||
                        curCSS(elem, 'opacity');

                    return (opacity === '') ? 1 : opacity.toFloat();
                }
            },
            set: function(el, value) {

                if (typeof value !== 'number') {

                    value = 1;
                }

                if (value == 1 || value === '') {

                    value = '';

                } else if (value < 0.00001) {

                    value = 0;
                }

                el.style.opacity = value;
            }
        }
    };

// Expand the global hAzzle Object

hAzzle.extend({

    cssProps: {

        'float': 'cssFloat'
    },

    // Properties that shouldn't have units behind 

    unitless: {},

    /**
     * Add cssHooks
     *
     * The name has to be camlized, else we will get
     * conflicts with other parts of the hAzzle Core.
     *
     * @param {String} name
     * @param {Function} Object
     *
     *
     * Example:
     *
     * hAzzle.addCSSHook('test', {
     *
     *	'get': function(){},
     *	'set': function(){}
     *
     *	});
     */

    addCSSHook: function(name, obj) {

        if (typeof name !== 'string' ||
            hAzzle.type(obj) !== 'object') {
            return;
        }

        // Set up the hook
        cssHooks[hAzzle.camelize(name)] = obj;

    },

    cssStyles: {

        get: {},
        set: {}
    }

}, hAzzle);

// Get computed styles

var computeStyle = hAzzle.computeStyle = function(elem) {
        var view = elem.ownerDocument.defaultView;
        return !!document.defaultView.getComputedStyle ? (view.opener ? view.getComputedStyle(elem, null) :
            window.getComputedStyle(elem, null)) : elem.style;
    },

    cssStyles = hAzzle.cssStyles,

    computed = computeStyle(docElem),

    props = hAzzle.makeArray(computed);

hAzzle.each(props, function(propName) {

    var prefix = propName[0] === "-" ?

        propName.substring(1, propName.indexOf("-", 1) - 1) : null,

        unprefixedName = prefix ? propName.substring(prefix.length + 2) : propName,

        stylePropName = propName.replace(reDash, function(str) {

            return str[1].toUpperCase();
        });

    // most of browsers starts vendor specific props in lowercase

    if (!(stylePropName in computed)) {

        stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
    }

    cssStyles.get[unprefixedName] = function(style) {

        return style[stylePropName];
    };

    cssStyles.set[unprefixedName] = function(style, value) {

        value = typeof value === "number" ? value + "px" : value.toString();
        style["cssText" in style ? stylePropName : propName] = value;
    };
});

// Exclude the following css properties from adding px
hAzzle.each(excludedProps, function(propName) {

    var stylePropName = propName.replace(reDash, function(str) {
        return str[1].toUpperCase();
    });

    if (propName === "float") {
        stylePropName = "cssFloat" in computed ? "cssFloat" : "styleFloat";
        // normalize float css property
        cssStyles.get[propName] = function(style) {
            return style[stylePropName];
        };
    }

    cssStyles.set[propName] = function(style, value) {
        style["cssText" in style ? stylePropName : propName] = value.toString();
    };
});

// Normalize property shortcuts
hAzzle.forOwn({
    font: ["fontStyle", "fontSize", "/", "lineHeight", "fontFamily"],
    padding: hAzzle.map(directions, function(dir) {
        return "padding" + dir;
    }),
    margin: hAzzle.map(directions, function(dir) {
        return "margin" + dir;
    }),
    "border-width": directions.map(function(dir) {
        return "border" + dir + "Width";
    }),
    "border-style": directions.map(function(dir) {
        return "border" + dir + "Style";
    })
}, function(key, props) {

    cssStyles.get[key] = function(style) {
        var result = [],
            hasEmptyStyleValue = function(prop, index) {
                result.push(prop === "/" ? prop : style[prop]);

                return !result[index];
            };

        return props.some(hasEmptyStyleValue) ? "" : result.join(" ");
    };
    cssStyles.set[key] = function(style, value) {
        if (value && "cssText" in style) {
            // normalize setting complex property across browsers
            style.cssText += ";" + key + ":" + value;
        } else {
            props.forEach(function(name) {
                return style[name] = typeof value === "number" ? value + "px" : value.toString();
            });
        }
    };
});

/* =========================== INTERNAL ========================== */

// Populate the unitless list

hAzzle.each(excludedProps, function(name) {
    hAzzle.unitless[hAzzle.camelize(name)] = true;
});