// Classes
var whitespaceRegex = /\S+/g,
    mal = /(^| )a( |$)/,
    mar = /(^| )b( |$)/,

// class feature container 
// Contains various supports and bug related info

   clsF = {}; // class features

// Check for classList support. NOTE! IE9 are the only browser
// who don't support classList

hAzzle.assert(function (div) {
    div.classList.add('a', 'b');
    // Detect if the browser supports classList
    clsF['api-classList'] = !!document.documentElement.classList;
    // Detect if the classList API supports multiple arguments
    clsF['api-MultiArgs'] = mal.test(div.className) && mar.test(div.className);
});

hAzzle.extend({

    /**
     * Add class(es) to element collection
     *
     * @param {String} value
     * @return {hAzzle}
     */

    addClass: function (value) {

        var classes, cls, i = 0, l;

        if (typeof value === 'function') {
            return this.each(function (el, count) {
                hAzzle(el).addClass(value.call(el, count, el.className));
            });
        }

        if (typeof value === 'string') {

            classes = (value || '').match(whitespaceRegex) || [];

            return this.each(function (elem) {

                if (elem.nodeType === 1) {

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
    },


    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function (value) {

        var classes, cls, i = 0, l;

        if (typeof value === 'function') {
            return this.each(function (el, count) {
                hAzzle(el).removeClass(value.call(el, count, el.className));
            });
        }

        if (arguments.length === 0 || typeof value === 'string') {

            classes = (value || '').match(whitespaceRegex) || [];

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
    },

    /**
     * Checks if an element has the given class
     *
     * @param {String} selector(s)
     * @return {Boolean} true if the element contains all classes
     */

    hasClass: function (value) {
        var i = 0, self = this, l = self.length;
        for (; i < l; i++) {
            if (self[i].nodeType === 1) {
                if (self[i].classList.contains(value)) {
                    return true;
                }
            }
        }

        return false;
    },


    /**
     * Replace each class name in the set of matched elements
     *
     * @param {String} oC
     * @param {String} nC
     * @param {Boolean} anc
     * @return {hAzzle}
     */

    replaceClass: function (oC, nC, anC) {
        var el;
        return this.each(function () {
            el = hAzzle(this);
            if (el.hasClass(oC) || anC === true) {
                el.removeClass(oC);
                el.addClass(nC);
            }
        });
    },

    /**
     * Toggle class(es) on element
     *
     * @param {String} value
     * @param {Boolean} state
     * @return {Boolean}
     */

    toggleClass: function (value, stateVal) {

        var type = typeof value,
            isBool = typeof stateVal === 'boolean';

        if (typeof value === 'function') {
            return this.each(function (el, count) {
                hAzzle(el).toggleClass(value.call(el, count, el.className, stateVal), stateVal);
            });
        }

        return this.each(function (el) {
            if (el.nodeType === 1) {
                if (type === 'string') {
                    // Toggle individual class names
                    var className,
                        i = 0,
                        classNames = value.match(whitespaceRegex) || [];

                    // Check each className given, space separated list
                    while ((className = classNames[i++])) {
                        if (isBool) {
                            // IE10+ doesn't support the toggle boolean flag.
                            if (stateVal) {
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