// classes.js
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.include([
    'has',
    'util',
    'storage',
    'strings',
    'types'
], function(_has, _util, _storage, _strings, _types) {

    var _reSpace = /[\n\t\r]/g,
        _whitespace = /\s+/,
        a1 = [''],

        str2array = function(classes) {
            if (typeof classes === 'string') {
                if (classes && !_whitespace.test(classes)) {
                    a1[0] = classes;
                    return a1;
                }

                var arr = classes.split(_whitespace);

                if (arr.length && !arr[0]) {
                    arr.shift();
                }
                if (arr.length && !arr[arr.length - 1]) {
                    arr.pop();
                }
                return arr;
            }
            // Assumed to be an array
            if (!classes) {
                return [];
            }
            return classes;
        },
        getElem = function(elem) {

            if (_util.instanceOf(elem, hAzzle)) {
                return elem.elements[0];
            }
            return elem;
        },
        addRemove = function(elem, classes, nativeMethodName, fn, done) {

            if (!_types.isEmptyObject(elem)) {

                // Array support (e.g. ['hello', 'world']  

                classes = str2array(classes);

                var length, i, based = false;

                if (nativeMethodName === 'remove' && !classes) {

                    elem.className = '';
                }
                // use native classList property if possible

                if (!_has.has('classlist')) {

                    // Flag native

                    based = true;

                    fn = function(elem, cls) {
                        return elem.classList[nativeMethodName](cls);
                    };
                }

                // Some browsers (e.g. IE) don't support multiple  arguments

                if (based && _has.has('multiArgs')) {
                    elem && elem.classList[nativeMethodName].apply(elem.classList, classes);
                } else {

                    length = classes.length;

                    for (i = 0; i < length; i++) {
                        fn(elem, classes[i]);
                    }
                }
                // Callback function (if provided) that will be fired after the
                // className value has been added / removed to / from the element 

                if (_types.isType('Function')(done)) {
                    done.call(elem, elem);
                }
            }
        },

        // Check if the first element in the collection has classes

        hasClass = function(elem, classes) {

            elem = getElem(elem);
            elem = elem.length ? elem : [elem];

            var className = ' ' + classes + ' ',
                els = elem.length ? elem : [elem],
                i = 0,
                cls = _has.has('classlist'),
                l = els.length;

            for (; i < l; i++) {
                if (els[i].nodeType === 1) {
                    if (cls) {
                        if (els[i].classList.contains(classes)) {
                            return true;
                        }
                    } else {
                        if ((' ' + els[i].className + ' ').replace(_reSpace, ' ').indexOf(className) >= 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },

        // Add classes to element collection

        addClass = function(elem, classes, /*optional*/ fn) {

            elem = getElem(elem);

            var els = elem.length ? elem : [elem];
            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'add', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(_reSpace, ' '),
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
            return elem;
        },

        // Remove classes from element collection

        removeClass = function(elem, classes, /*optional*/ fn) {

            elem = getElem(elem);

            var els = elem.length ? elem : [elem];

            _util.each(els, function(elem) {
                return addRemove(elem, classes, 'remove', function(elem, cls) {

                    var cur = (' ' + elem.className + ' ').replace(_reSpace, ' '),
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

        toggleClass = function(elem, value, condition) {

            elem = getElem(elem);

            var els = elem.length ? elem : [elem],
                type = typeof value;

            if (typeof condition === 'boolean' && type === 'string') {
                return condition ? addClass(els, value) : removeClass(els, value);
            }

            var i = 0,
                len = els.length;

            for (; i < len; i++) {

                elem = els[i];

                if (type === 'string') {
                    // Toggle individual class names
                    var className,
                        self = hAzzle(elem),
                        classNames = str2array(value);
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
                        _storage.private.set(elem, '__className__', elem.className);
                    }
                    elem.className = elem.className || value === false ?
                        '' :
                        _storage.private.get(this, '__className__') || '';
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
            return this.removeClass(firstClass).addClass(secondClass);
        } else if (this.hasClass(secondClass)) {
            return this.removeClass(secondClass).addClass(firstClass);
        }
    };

    // Removes CSS class `className` from `element`.

    this.removeClass = function(classes) {
        return removeClass(this.elements, classes);
    };

    this.toggleClass = function(value, condition) {
        toggleClass(this.elements, value, condition);
        return this;
    };

    return {
        addClass: addClass,
        removeClass: removeClass,
        setClass: setClass,
        hasClass: hasClass,
        toggleClass: toggleClass
    };
});
