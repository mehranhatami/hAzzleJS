hAzzle.define('Style', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
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

        pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source,
        rrelNum = new RegExp('^([+-])=(' + pnum + ')', 'i'),

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

                    /* Check if the browser supports this property as prefixed. */
                    if (typeof prefixElement.style[propertyPrefixed] === 'string') {
                        /* Cache the match. */
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
                origName = _strings.camelize(name);

            if (elem) {

                style = elem.style;

                name = prefixCheck(name)[0];

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
            }
        },

        // setCSS        

        setCSS = function(elem, name, value) {

            var ret, style, hook, type;

            if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) {

                type = typeof value;

                name = _strings.camelize(name);

                // Auto-prefixing

                name = prefixCheck(name)[0];

                style = elem.style;

                if (value !== undefined) {

                    hook = cssHooks.set[name];

                    // Convert '+=' or '-=' to relative numbers
                    if (type === 'string' && (ret = rrelNum.exec(value))) {
                        value = (ret[1] + 1) * ret[2] + parseFloat(getCSS(elem, name));
                        type = 'number';
                    }

                    // If a number was passed in, add 'px' (except for certain CSS properties)
                    if (type === 'number' && !unitless[name]) {
                        value += 'px';
                    }

                    if (hook) {
                        hook(elem, name, value);
                    } else {
                        elem.style[name] = value;
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

            if (typeof name == 'string') {
                return node[0] && getCSS(node[0], name);
            }

            // Object

            return this.each(function(elem) {
                var val;
                for (val in name) {
                    setCSS(elem, value, name[value]);
                }
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
        cssProps: cssProps,
        unitless: unitless,
        getCSS: getCSS,
        setCSS: setCSS
    };
});