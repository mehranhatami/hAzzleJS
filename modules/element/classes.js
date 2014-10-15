// classes.js
hAzzle.define('Classes', function() {

    var _support = hAzzle.require('Support'),
        _util = hAzzle.require('Util'),
        _storage = hAzzle.require('Storage'),
        _strings = hAzzle.require('Strings'),
        _types = hAzzle.require('Types'),
        whitespace = (/\S+/g),
        reSpace = /[\n\t\r]/g,

        addRemove = function(elem, classes, nativeMethodName, fn, done) {

            if (!_types.isEmptyObject(elem)) {

                var length, i,
                    based = false;

                // Support for array (e.g. ['hello', 'world']

                classes = _types.isString(classes) ?
                    classes :
                    _types.isArray(classes) ?
                    classes.join(' ') : '';

                if (nativeMethodName === 'remove' && !classes) {
                    elem.className = '';
                }

                // use native classList property if possible

                if (_support.classList) {

                    // Flag native

                    based = true;

                    fn = function(elem, cls) {
                        return elem.classList[nativeMethodName](cls);
                    };
                }

                classes = (classes || '').match(whitespace) || [];

                // Some browsers (e.g. IE) don't support multiple  arguments

                if (based && _support.multipleArgs) {
                    elem && elem.classList[nativeMethodName].apply(elem.classList, classes);
                } else {

                    length = classes.length;

                    for (i = 0; i < length; i++) {
                        fn(elem, classes[i]);
                    }
                }
                // Callback function (if provided) that will be fired after the
                // className value has been added / removed to / from the element 

                if (_types.isFunction(done)) {
                    done.call(elem, elem);
                }
            }
        },

        hasClass = function(elem, classes) {

            elem = elem.length ? elem : [elem];

            var className = ' ' + classes + ' ',
                els = elem.length ? elem : [elem],
                i = 0,
                cls = _support.classList,
                l = els.length;

            for (; i < l; i++) {
                if (els[i].nodeType === 1) {
                    if (cls) {
                        if (els[i].classList.contains(classes)) {
                            return true;
                        }
                    } else {
                        if ((' ' + els[i].className + ' ').replace(reSpace, ' ').indexOf(className) >= 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        // addClass - can take single elem or array of elements

        addClass = function(elem, classes, /*optional*/ fn) {

            var els = elem.length ? elem : [elem];
            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'add', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(reSpace, ' '),
                        finalValue;

                    if (cur.indexOf(' ' + cls + ' ') < 0) {
                        cur += cls + ' ';
                    }

                    // Only assign if different to avoid unneeded rendering.
                    finalValue = _strings.trim(cur);
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }
                }, fn);
            });
        },

        // removeClass - can take single elem or array of elements

        removeClass = function(elem, classes, /*optional*/ fn) {

            var els = elem.length ? elem : [elem];

            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'remove', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(reSpace, ' '),
                        finalValue;

                    if (cur.indexOf(' ' + cls + ' ') >= 0) {
                        cur = cur.replace(' ' + cls + ' ', ' ');
                    }
                    // Only assign if different to avoid unneeded rendering.
                    finalValue = cls ? _strings.trim(cur) : '';
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
                    }

                }, fn);
            });
        },
        setClass = function(elem, /* classe(s) to be added*/ add, /* classe(s) to be removed*/ remove, fn) {
            addClass(elem, add, fn);
            removeClass(elem, remove, fn);
        },

        // NOTE! Use use non-native classList solution for 'toggleClass'
        // because of bugs in IE and some other browsers ( IE10, iOS, Nokia phones e.g.) 
        // One nasty exaple is the fact that IE10+ doesn't support the toggle boolean flag.

        // Toggles the presence of CSS class `className` on `element`.

        toggleClass = function(elem, value, stateVal) {

            var els = elem.length ? elem : [elem],
                type = typeof value;

            if (typeof stateVal === 'boolean' && type === 'string') {
                return stateVal ? addClass(els, value) : removeClass(els, value);
            }
            var i = 0,
                len = els.length;

            for (; i < len; i++) {

                elem = els[i];

                if (type === 'string') {
                    // Toggle individual class names
                    var className,
                        self = hAzzle(elem),
                        classNames = value.match(whitespace) || [];

                    i = 0;

                    while ((className = classNames[i++])) {
                        // Check each className given, space separated list
                        if (self.hasClass(className)) {
                            self.removeClass(className);
                        } else {
                            self.addClass(className);
                        }
                    }

                    // Toggle whole class name
                } else if (value === undefined || type === 'boolean') {
                    if (elem.className) {
                        // store className if set
                        _storage.privateData.set(elem, '__className__', elem.className);
                    }
                    elem.className = elem.className || value === false ?
                        '' :
                        _storage.privateData.get(this, '__className__') || '';
                }
            }
        };


    this.hasClass = function(classes) {
        return hasClass(this.elements, classes);
    };

    // Add the given CSS class to element

    this.addClass = function(classes, fn) {
        return typeof classes === 'function' ?
            this.each(function(elem, index) {
                hAzzle(elem).addClass(classes.call(elem, index, elem.className));
            }) : addClass(this.elements, classes, fn);
    };
    
    // Replace a given class with another
    
    this.replaceClass = function(firstClass, secondClass) {
        if (this.hasClass(firstClass)) {
            this.removeClass(firstClass).addClass(secondClass);
        } else if (this.hasClass(secondClass)) {
            this.removeClass(secondClass).addClass(firstClass);
        }

        return this;
    };
    // Removes CSS class `className` from `element`.

    this.removeClass = function(classes) {
        removeClass(this.elements, classes);
    };

    this.toggleClass = function(value, stateVal) {
        return toggleClass(this.elements, value, stateVal);

    };

    return {
        addClass: addClass,
        removeClass: removeClass,
        setClass: setClass,
        hasClass: hasClass,
        toggleClass: toggleClass
    };
});