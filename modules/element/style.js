// style.js
hAzzle.define('Style', function() {

    var _util = hAzzle.require('Util'),
        _types = hAzzle.require('Types'),
        _strings = hAzzle.require('Strings'),
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

        prefixCache = {},

        cssCamelized = {},

        cssProps = {
            "float": "cssFloat"
        },

        unitless = {},

        cssHooks = {
            get: {},
            set: {}
        },

        prefixCheck = function(prop) {
            if (prefixCache[prop]) {
                return [prefixCache[prop], true];
            }

            return [prop, false];

        },

         autoCamelize = function(prop) {
        return cssCamelized[prop];
       
       },

        getStyles = function(elem) {
            // Support: IE<=11+, Firefox<=30+
            // IE throws on elements created in popups
            // FF meanwhile throws on frame elements through 'defaultView.getComputedStyle'
            if (elem.ownerDocument.defaultView.opener) {
                return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
            }

            return window.getComputedStyle(elem, null);
        };

    function getCSS(elem, name) {
        var val, hooks, computed, style,
            origName = _strings.camelize(name);
        if (elem) {

            style = elem.style;

            // Auto-prefixing

            name = prefixCheck(name)[0];

            // Try prefixed name followed by the unprefixed name
            hooks = cssHooks.get[name] || cssHooks.get[origName];

            // If a hook was provided get the computed value from there
            val = hooks ? hooks(elem, true) : val;

            if (!computed && val === undefined) {
                style = getStyles(elem);
                val = hooks ? hooks(elem, true) : style[name];
                computed = true;
            }

            return val;
        }
    }

    function setCSS(elem, name, value) {
        var ret, style, hook, type;

        if (elem && (elem.nodeType !== 3 || elem.nodeType !== 8)) {

            type = typeof value;

            // Auto-camelizing

            name = autoCamelize(name) || _strings.camelize(name);

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
    }

    this.css = function(name, value) {

        var len = arguments.length,
            node = this.elements;

        // jQuery method

        if (_types.isArray(name)) {

            var map = {},
                i = name.length;

            while (i--) {
                map[name[i]] = getCSS(node[0], name[i], false);
            }

            return map;
        }

        if (len === 1) {

            if (typeof name == 'string') {
                return node[0] && getCSS(node[0], name);
            }

            // Object
            return this.each(function(elem) {
                _util.each(name, function(value, key) {
                    setCSS(elem, key, value);
                });
            });
        }

        // Set style
        return this.each(function(elem) {
            setCSS(elem, name, value);
        });
    };

    var computed = getStyles(document.documentElement),
        reDash = /\-./g,
        props = Array.prototype.slice.call(computed, 0);



    // Iterate through    

    _util.each(props, function(propName) {
        var prefix = propName[0] === '-' ? propName.substr(1, propName.indexOf('-', 1) - 1) : null,
            unprefixedName = prefix ? propName.substr(prefix.length + 2) : propName,
            stylePropName = propName.replace(reDash, function(str) {
                return str[1].toUpperCase();
            });
        // Most of browsers starts vendor specific props in lowercase
        if (!(stylePropName in computed)) {
            stylePropName = stylePropName[0].toLowerCase() + stylePropName.substr(1);
        }

        prefixCache[_strings.camelize(unprefixedName)] = stylePropName;

        cssCamelized[unprefixedName] = stylePropName;
    });

    // Populate the unitless properties list

    _util.each(unitlessProps, function(prop) {
        unitless[_strings.camelize(prop)] = true;
    });

    return {
        unitless: unitless,
        cssProps: cssProps,
        autoCamelize: autoCamelize,
        getCSS: getCSS,
        setCSS: setCSS
    };
});