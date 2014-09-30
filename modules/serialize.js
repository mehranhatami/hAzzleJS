// serialize.js
var s20 = /%20/g,
    sNormal = /\r?\n/g,
    sRbif = /^(?:submit|button|image|reset|file)$/i,
    sCheckbox = /checkbox/i,
    sIst = /^(?:input|select|textarea|keygen)/i,
    sRadio = /radio/i,
    rbracket = /\[\]$/,
    buildParams = function(prefix, obj, trad, add) {

        var name, i, v;

        if (hAzzle.isArray(obj)) {
            // Serialize array item.
            for (i = 0; obj && i < obj.length; i++) {
                v = obj[i];
                if (trad || rbracket.test(prefix)) {
                    // Treat each array item as a scalar.
                    add(prefix, v);
                } else {
                    buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']',
                        v,
                        trad,
                        add);
                }
            }
        } else if (!trad && obj.toString() === '[object Object]') {
            // Serialize object item.
            for (name in obj) {
                buildParams(prefix + '[' + name + ']', obj[name], trad, add);
            }

        } else {
            // Serialize scalar item.
            add(prefix, obj);
        }
    },

    // normalize newline variants according to spec -> CRLF
    normalize = function(s) {
        return s ? s.replace(sNormal, '\r\n') : '';
    },

    serial = function(el, cb) {
        var n = el.name,
            t = el.tagName.toLowerCase(),
            optCb = function(o) {
                if (o && !o.disabled) {
                    cb(n, normalize(o.attributes.value && o.attributes.value.specified ? o.value : o.text));
                }
            },
            ch, ra, val, i;

        // don't serialize elements that are disabled or without a name
        if (el.disabled || !n) {
            return;
        }
        if (t === 'input') {
            if (!sRbif.test(el.type)) {
                ch = sCheckbox.test(el.type);
                ra = sRadio.test(el.type);
                val = el.value;
                // WebKit gives us "" instead of "on" if a checkbox has no value, so correct it here

                (!(ch || ra) || el.checked) && cb(n, normalize(ch && val === '' ? 'on' : val));
            }
        }
        if (t === 'textarea') {
            cb(n, normalize(el.value));
        }

        if (t === 'select') {
            if (el.type.toLowerCase() === 'select-one') {
                optCb(el.selectedIndex >= 0 ? el.options[el.selectedIndex] : null);
            } else {
                for (i = 0; el.length && i < el.length; i++) {
                    el.options[i].selected && optCb(el.options[i]);
                }
            }

        }
    },
    eachFormElement = function() {
        var cb = this,
            e, i, serializeSubtags = function(e, tags) {
                var i, j, fa;
                for (i = 0; i < tags.length; i++) {
                    fa = e.getElementsByTagName(tags[i]);
                    for (j = 0; j < fa.length; j++) {
                        serial(fa[j], cb);
                    }
                }
            };

        for (i = 0; i < arguments.length; i++) {
            e = arguments[i];
            if (sIst.test(e.tagName)) {
                serial(e, cb);
            }
            serializeSubtags(e, ['input', 'select', 'textarea']);
        }
    },

    // standard query string style serialization
    serializeQueryString = function() {
        return hAzzle.toQueryString(hAzzle.serializeArray.apply(null, arguments));
    },

    // { 'name': 'value', ... } style serialization
    serializeHash = function() {
        var hash = {};
        eachFormElement.apply(function(name, value) {
            if (name in hash) {
                hash[name] && !hAzzle.isArray(hash[name]) && (hash[name] = [hash[name]]);
                hash[name].push(value);
            } else hash[name] = value;
        }, arguments);
        return hash;
    };

hAzzle.extend({
    // [ { name: 'name', value: 'value' }, ... ] style serialization
    serializeArray: function() {
        var arr = [];
        eachFormElement.apply(function(name, value) {
            arr.push({
                name: name,
                value: value
            });
        }, arguments);
        return arr;
    },

    serialize: function() {
        if (arguments.length === 0) {
            return '';
        }

        var opt, fn, args = Array.prototype.slice.call(arguments, 0);

        opt = args.pop();
        opt && opt.nodeType && args.push(opt) && (opt = null);
        opt && (opt = opt.type);

        if (opt == 'map') {
            fn = serializeHash;
        } else if (opt == 'array') {
            fn = hAzzle.serializeArray;
        } else {
            fn = serializeQueryString;
        }

        return fn.apply(null, args);
    },

    // Serialize an array of form elements or a set of
    // key/values into a query string  

    toQueryString: function(options, trad) {
        var prefix, i, traditional = trad || false,
            s = [],
            enc = encodeURIComponent,
            add = function(key, value) {
                // If value is a function, invoke it and return its value
                value = (typeof value === 'function') ? value() : (value == null ? '' : value);
                s[s.length] = enc(key) + '=' + enc(value);
            };

        // If an array was passed in, assume that it is an array of form elements.
        if (hAzzle.isArray(options)) {
            for (i = 0; options && i < options.length; i++) {
                add(options[i].name, options[i].value);
            }
        } else {

            for (prefix in options) {
                if (options.hasOwnProperty(prefix)) {
                    buildParams(prefix, options[prefix], traditional, add);
                }
            }
        }

        // Return the resulting serialization
        return s.join('&').replace(s20, '+');
    }

}, hAzzle);