// classes.js
var wSpace = /\S+/g,
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it
    MultiArgs = hAzzle.features['api-MultiArgs'];

hAzzle.extend({

    /**
     * Add class(es) to each of the set of matched elements.
     *
     * @param {String} value
     * @return {hAzzle}
     */

    addClass: function(value) {
        var self = this;
        return hAzzle.setter(this, function(elem, value) {
            if (typeof value === 'function') {
                return self.each(function(el, count) {
                    hAzzle.addClass(el, value.call(el, count, el.className));
                });
            }
            return hAzzle.addClass(elem, value);
        }, value, arguments.length > 1);
    },

    /**
     * Remove a single class, multiple classes, or all classes from each element
     * in the set of matched elements.
     *
     * @param {String} value
     * @return {hAzzle}
     */

    removeClass: function(value) {
        var self = this;
        return hAzzle.setter(this, function(elem, value) {
            if (typeof value === 'function') {
                return self.each(function(el, count) {
                    hAzzle.removeClass(el, value.call(el, count, el.className));
                });
            }
            return hAzzle.removeClass(elem, value);
        }, value, arguments.length > 1);
    },

    /**
     * Determine whether any of the matched elements are assigned the given class.
     *
     * @param {String} value
     * @return {Boolean}
     */

    hasClass: function(selector) {

        var self = this,
            i = self.length;

        // Has to have this check here, else it will throw an error

        if (self[0]) {

            while (i--) {

                if (typeof this[i].className === 'object' &&
                    this[i].classList && this[i].classList.contains(selector)) {
                    return true;
                }

                if (self[i].nodeType === 1) {
                    if (self[i].classList.contains(selector)) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    /**
     * Toggle class(es) on element
     * optionally a `bool` may be given
     * to indicate that the class should
     * be added when truthy.
     *
     * @param {String} value
     * @param {Boolean} state
     * @return {Boolean}
     */

    toggleClass: function(value, state) {

        var type = typeof value,
            isBool = typeof state === 'boolean';

        if (hAzzle.type(value) === 'function') {
            return this.each(function(el, count) {
                hAzzle(el).toggleClass(value.call(el, count, el.className, state), state);
            });
        }

        return this.each(function(el) {
            if (el.nodeType === 1) {
                if (type === 'string') {
                    // Toggle individual class names
                    var className,
                        i = 0,
                        classNames = value.match(wSpace) || [];

                    // Check each className given, space separated list
                    while ((className = classNames[i++])) {
                        if (isBool) {
                            // IE10+ doesn't support the toggle boolean flag.
                            if (state) {
                                el.classList.add(className);
                            } else {
                                el.classList.remove(className);
                            }
                        } else {
                            el.classList.toggle(className);
                        }
                    }

                } else if (value === undefined || type === 'boolean') { // toggle whole class name
                    if (el.className) {
                        // store className if set
                        hAzzle.data(this, '__cln__', el.className);
                    }

                    el.className = this.className ||
                        value === false ? '' : hAzzle.data(el, '__cln__') || '';
                }
            }
        });
    },

    /**
     * Classes - handle all classes at once
     *
     * @param {String} classes
     * @return {hAzzle}
     *
     * Examples:
     *
     * hAzzle(...).classes(); // => gets all the classes for the first element in the collection
     *
     * hAzzle(...).classes('+someclass'); // => adds a class to all elements in the collection
     *
     * hAzzle(...).classes('-someclass'); // => removes a class from all elements in the collection
     *
     * hAzzle(...).classes('~someclass'); // => toggles a class for all elements in the collection
     *
     * hAzzle(...).classes('+state-open +state-active ~visible -list-item +list-item-active');
     *
     */

    classes: function(classes) {

        var elem = this,
            actionPrefix, className;

        // Get all the classes of the first element in the jQuery collection

        if (arguments.length === 0) {

            return elem[0].className;
        }

        // Ensure classes is a string

        if (typeof classes === 'string') {

            return this.each(classes.split(/\s+/), function(elem) {

                if (elem.length === 0) {

                    return;
                }

                actionPrefix = elem.charAt(0);
                className = elem.slice(1);

                switch (actionPrefix) {
                    case '+':
                        elem.addClass(className);
                        break;
                    case '-':
                        elem.removeClass(className);
                        break;
                    case '~':
                        elem.toggleClass(className);
                        break;
                    default:
                        throw new Error('Could not apply class change ["' + elem + '"]');
                }
            });
        }

        return this;
    },

    /** 
     * Remove classes that have given prefix
     *
     * @param {String} prefix
     * @return {hAzzle}
     *
     * Example:
     *
     * hAzzle( ELEM ).addClass( "js hAzzleCore hAzzleClasses html" );
     * hAzzle( ELEM ).removeClassPrefix('hAzzle');
     *
     * The resulting classes are "js html"
     *
     */

    removeClassPrefix: function(prefix) {
        return this.each(function(elem) {
            var classes = hAzzle.map(elem.className.split(' '), function(itm) {
                return hAzzle.indexOf(itm, prefix) === 0 ? '' : itm;
            });
            elem.className = classes.join(' ');
        });
    }
});

hAzzle.extend({

    addClass: function(elem, value) {

        if (value) {

            var classes = (value || '').match(wSpace) || [],
                cls, i = 0,
                l;

            if (typeof elem.className === 'object' && elem.classList) {
                elem.classList.add.apply(elem.classList, classes);
            }

            if (typeof value === 'string') {

                if (elem.nodeType === 1) {

                    // Multiple arguments

                    if (MultiArgs) {

                        elem = elem.classList;
                        elem.add.apply(elem, classes);

                    } else {

                        l = classes.length;

                        for (i = 0; i < l; i++) {
                            cls = classes[i];
                            elem.classList.add(cls);
                        }
                    }
                }
            }
        }
    },

    removeClass: function(elem, value) {

        if (value) {

            var classes = value.match(wSpace) || [],
                cls, i = 0,
                l;

            if (typeof elem.className === 'object' && elem.classList) {
                elem.classList.remove.apply(elem.classList, classes);
            }

            if (typeof value === 'string' ||
                arguments.length === 0) {

                if (elem.nodeType === 1 && elem.className) {

                    if (!value) {

                        elem.className = '';
                    }

                    // Check if we are supporting multiple arguments

                    if (MultiArgs) {

                        elem.classList.remove.apply(elem.classList, classes);

                    } else {

                        l = classes.length;

                        for (; i < l; i++) {
                            cls = classes[i];
                            elem.classList.add(cls);
                        }
                    }
                }
            }
        } else {

            elem.className = '';
        }
    }

}, hAzzle);