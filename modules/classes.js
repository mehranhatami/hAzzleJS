/**
 * Class manipulation
 */
var wSpace = /\S+/g,
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it
    MultiArgs = hAzzle.MultiArgs;

hAzzle.extend({

    /**
     * Add class(es) to element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    addClass: function(value) {

        if (value) {

            var classes, cls, i = 0,
                type = typeof value,
                l = this.length,
                elem, multi;

            if (type === 'string') {

                classes = (value || '').match(wSpace) || [];

                while (l--) {

                    elem = this[l];

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

            if (type === 'function') {
                return this.each(function(el, count) {
                    hAzzle(el).addClass(value.call(el, count, el.className));
                });
            }

        }
    },

    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function(value) {
        if (value) {
            var classes, cls, i = 0,
                l = this.length,
                elem, type = typeof value;

            if (type === 'string' || arguments.length === 0) {

                classes = value.match(wSpace) || [];

                while (l--) {

                    elem = this[l];

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
            }
            if (type === 'function') {
                return this.each(function(el, count) {
                    hAzzle(el).removeClass(value.call(el, count, el.className));
                });
            }
        }
    },

    /**
     * Check if the given element contains class name(s)
     *
     * @param {String} value
     * @return {Boolean}
     */

    hasClass: function(value) {

        var self = this,
            i = self.length;

        // Has to have this check here, else it will throw an error

        if (self[0]) {

            while (i--) {

                if (self[i].nodeType === 1) {
                    if (self[i].classList.contains(value)) {
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

        if (typeof value === 'function') {
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
                return itm.indexOf(prefix) === 0 ? '' : itm;
            });
            elem.className = classes.join(' ');
        });
    }
});