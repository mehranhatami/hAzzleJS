// style.js
hAzzle.define('Style', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _units = hAzzle.require('Units'),
        _strings = hAzzle.require('Strings'),
        _curcss = hAzzle.require('curCSS'),

        unitlessProps = ('zoom box-flex columns counter-reset volume stress overflow flex-grow ' +
            'column-count flex-shrink flex-height order orphans widows rotate3d flipped ' +
            'transform ms-flex-order transform-origin perspective transform-style ' +
            'ms-flex-negative ms-flex-positive transform-origin perspective ' +
            'perspective-origin backface-visibility scale scale-x scale-y scale-z ' +
            'scale3d reflect-x-y reflect-z reflect-y reflect ' +
            'background-color border-bottom-color border-left-color border-right-color border-top-color ' +
            'color column-rule-color outline-color text-decoration-color text-emphasis-color ' +
            'alpha z-index font-weight opacity red green blue').split(' '),

        sNumbs = /^([+-])=([+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|))(.*)/i,

        prefixElement = document.createElement('div'),

        prefixMatches = {},

        cssProps = {
            'float': 'cssFloat'
        },

        unitless = {},

        cssHooks = {
            get: {},
            set: {}
        },

        prefixCheck = function(prop) {
            // If this property has already been checked, return the cached value
            if (prefixMatches[prop]) {
                return [prefixMatches[prop], true];
            } else {
                var vendors = ['', 'Webkit', 'Moz', 'ms', 'O'];

                for (var i = 0, vendorsLength = vendors.length; i < vendorsLength; i++) {
                    var propertyPrefixed;

                    if (i === 0) {
                        propertyPrefixed = prop;
                    } else {
                        // Capitalize the first letter of the property to conform to JavaScript vendor prefix notation (e.g. webkitFilter).
                        propertyPrefixed = vendors[i] + prop.replace(/^\w/, function(match) {
                            return match.toUpperCase();
                        });
                    }

                    // Check if the browser supports this property as prefixed
                    if (typeof prefixElement.style[propertyPrefixed] === 'string') {
                        // Cache the match
                        prefixMatches[prop] = propertyPrefixed;

                        return [propertyPrefixed, true];
                    }
                }

                // If the browser doesn't support this property in any form, include a false flag so that the caller can decide how to proceed.
                return [prop, false];
            }
        },

        // getCSS

        getCSS = function(elem, name) {

            var val, hooks, computed, style,
                origName = _strings.camelize(name),
                p = prefixCheck(origName);


            // Make sure that we're working with the right name

            name = cssProps[origName] ||
                (p[1] ? cssProps[origName] = p[0] : name);

            style = elem.style;

            // Try prefixed name followed by the unprefixed name
            hooks = cssHooks.get[name] || cssHooks.get[origName];

            // If a hook was provided get the computed value from there
            val = hooks ? hooks(elem, true) : val;

            if (!computed && val === undefined) {
                style = _curcss.getStyles(elem);
                val = hooks ? hooks(elem, true) : style[name];
                computed = true;
            }

            return val;
        },

        // setCSS        

        setCSS = function(elem, name, value) {

            if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) { // Text or Comment

                var ret, style, hook, type, action, origName = _strings.camelize(name);

                name = cssProps[origName] || (cssProps[origName] = prefixCheck(name)[0]);

                style = elem.style;
                if (!style) {
                    return;
                }
                if (value !== undefined) {

                    type = typeof value;

                    hook = cssHooks.set[name];

                    // Convert '+=' or '-=' to relative numbers, and
                    // and convert all unit types to PX (e.g. 10em will become 160px)
                     
                    if (type === 'string' && (ret = sNumbs.exec(value))) {
                        value = _units.units(_curcss.curCSS(elem, name), ret[3], elem, name) + (ret[1] + 1) * ret[2];
                        type = 'number';
                    }

                    // If a number was passed in, add 'px' (except for certain CSS properties)

                    if (type === 'number' && !unitless[name]) {
                        value += ret && ret[3] ? ret[3] : 'px';
                    }

                    // If null and NaN values, remove / don't set current style

                    if (value === null || value === '') {
                        action = 'remove';
                    } else {
                        action = 'set';
                    }

                    // Set values through cssHooks if defined

                    if (hook) {
                        hook(elem, name, value);
                    } else {
                        // CSSStyleDeclaration 
                        style[action + 'Property'](name, '' + value);
                    }

                } else {
                    hook = cssHooks.get[name];

                    if (cssHooks.get[name] && (ret = cssHooks.get[name](elem, false))) {
                        return ret;
                    }

                    return style[name];
                }
            }
        };

    this.css = function(name, value) {

        var node = this.elements;

        // jQuery method

        if (_types.isArray(name)) {

            var map = {},
                i = name.length;

            while (i--) {
                map[name[i]] = getCSS(node[0], name[i], false);
            }

            return map;
        }

        if (value === undefined) {

            if (typeof name === 'string') {
                return node[0] && getCSS(node[0], name);
            }

            // Object

            return this.each(function(elem) {
                _util.each(name, function(value, prop) {
                    setCSS(elem, prop, value);
                });
            });
        }

        // Set style
        return this.each(function(elem) {
            setCSS(elem, name, value);
        });
    };

    // Populate the unitless properties list

    _util.each(unitlessProps, function(prop) {
        unitless[_strings.camelize(prop)] = true;
    });

    return {
        cssHooks: cssHooks,
        cssProps: cssProps,
        unitless: unitless,
        getCSS: getCSS,
        setCSS: setCSS
    };
});