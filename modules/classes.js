/**
 * Class manipulation 
 */ 

var wSpace = /\S+/g,
    mArgsL = /(^| )a( |$)/,
    mArgsR = /(^| )b( |$)/,

    // class feature container 
    // Contains various supports and bug related info

    clsF = {};

// Check for classList support. NOTE! IE9 are the only browser
// who don't support classList

hAzzle.assert(function (div) {
    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    clsF['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it
    clsF['api-MultiArgs'] = mArgsL.test(div.className) && mArgsR.test(div.className);
});

hAzzle.extend({

    /**
     * Add class(es) to element
     *
     * @param {String} value
     * @return {hAzzle}
     */

    addClass: function (value) {

        if (value) {

            var classes, cls, i = 0,
                l, type = typeof value;

            if (type === 'function') {
                return this.each(function (el, count) {
                    hAzzle(el).addClass(value.call(el, count, el.className));
                });
            }

            if (type === 'string') {

                // split with regEx are a safer solution

                classes = value.match(wSpace) || [];

                return this.each(function (elem) {

                    if (elem.nodeType === 1) {

                        // Multiple arguments

                        if (clsF['api-MultiArgs']) {

                            elem.classList.add.apply(elem.classList, classes);

                        } else {

                            l = classes.length;

                            for (; i < l; i++) {
                                cls = classes[i];
                                elem.classList.add(cls);
                            }
                        }
                    }
                });
            }
        }
    },

    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function (value) {
        if (value) {
            var classes, cls, i = 0,
                l, type = typeof value;

            if (type === 'function') {
                return this.each(function (el, count) {
                    hAzzle(el).removeClass(value.call(el, count, el.className));
                });
            }

            if (arguments.length === 0 || type === 'string') {

                classes = value.match(wSpace) || [];

                return this.each(function (elem) {

                    if (elem.nodeType === 1 && elem.className) {

                        if (!value) {

                            elem.className = '';
                        }

                        // Check if we are supporting multiple arguments

                        if (clsF['api-MultiArgs']) {

                            elem.classList.remove.apply(elem.classList, classes);

                        } else {

                            l = classes.length;

                            for (; i < l; i++) {
                                cls = classes[i];
                                elem.classList.add(cls);
                            }
                        }
                    }
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

    hasClass: function (value) {

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

    toggleClass: function (value, state) {

        var type = typeof value,
            isBool = typeof state === 'boolean';

        if (typeof value === 'function') {
            return this.each(function (el, count) {
                hAzzle(el).toggleClass(value.call(el, count, el.className, state), state);
            });
        }

        return this.each(function (el) {
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

                } else if (type === 'undefined' || type === 'boolean') { // toggle whole class name
                    if (el.className) {
                        // store className if set
                        hAzzle.data(this, '__cln__', el.className);
                    }

                    el.className = this.className ||
                        value === false ? '' : hAzzle.data(el, '__cln__') || '';
                }
            }
        });
    }

});

// Return true/ false if classList are supported
// This depends of the 'classList shim' are 
// included in the build or not. If not, it
// will only return false on IE9

hAzzle.classList = clsF['api-classList'];