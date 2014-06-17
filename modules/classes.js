// Classes

var csp = hAzzle.features.classList,
    sMa = hAzzle.features.sMa, // Multiple arguments
    classCache = {},

    isFunction = hAzzle.isFunction,
    isString = hAzzle.isString,

    indexOf = Array.prototype.indexOf,
    rclass = /[\t\r\n\f]/g,
    whitespaceRegex = /\S+/g;

hAzzle.extend({

    /**
     * Add class(es) to element collection
     *
     * @param {String} value
     * @return {hAzzle}
     */

    addClass: function (value) {

        var finalValue, classes;
        if (isFunction(value)) {
            return this.each(function (i) {
                hAzzle(this).addClass(value.call(this, i, this.className));
            });
        }

        if (value && isString(value)) {

            classes = (value || '').match(whitespaceRegex) || [];

            this.each(function (elem) {

                if (elem.nodeType === 1) {
                    var c, cl;

                    if (csp) {

                        if (sMa) {
                            elem.classList.add.apply(elem.classList, classes);
                        } else {

                            for (c = 0, cl = classes.length; c < cl; c++) {
                                elem.classList.add(classes[c]);
                            }
                            elem.className = hAzzle.trim(elem.className); // added to pass unit tests
                        }

                    } else {
                        if (!elem.className) {
                            elem.className = value;
                        } else {
                            var className = " " + elem.className + " ",
                                setClass = elem.className;

                            for (c = 0, cl = classes.length; c < cl; c++) {
                                if (className.indexOf(" " + classes[c] + " ") < 0) {
                                    setClass += " " + classes[c];
                                }
                            }

                            // only assign if different to avoid unneeded rendering.
                            finalValue = hAzzle.trim(className);
                            if (elem.className !== finalValue) {
                                elem.className = finalValue;
                            }
                        }
                    }
                }
            });
        }

        return this;
    },


    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function (value) {

        var cls,
            element,
            classes = (value || '').match(whitespaceRegex) || [];

        // Function

        return isFunction(value) ?
            this.each(function (j) {
                hAzzle(this).removeClass(value.call(this, j, this.className));
            }) : this.each(function () {
                element = this;
                if (element.nodeType === 1 && element.className) {

                    if (!value) {
                        element.className = '';
                        return;
                    }

                    if (value === '*') {
                        element.className = '';
                    } else {
                        if (hAzzle.isRegExp(value)) {
                            value = [value];
                        } else if (csp && hAzzle.inArray(value, '*') === -1) {
                            if (sMa) {
                                element.classList.remove.apply(element.classList, classes);
                            } else {
                                var i = 0;
                                while ((cls = classes[i++])) {
                                    element.classList.remove(cls);
                                }
                            }
                            return;
                        } else {
                            value = value.trim().split(/\s+/);

                            var name;

                            classes = ' ' + element.className + ' ';

                            while ((name = value.shift())) {

                                if (name.indexOf('*') !== -1) {

                                    name = name in classCache ?
                                        classCache[name] :
                                        (classCache[name] = new RegExp('\\s*\\b' + name.replace('*', '\\S*') + '\\b\\s*', 'g'));
                                }
                                if (name instanceof RegExp) {
                                    classes = classes.replace(name, ' ');
                                } else {
                                    while (classes.indexOf(' ' + name + ' ') !== -1) {
                                        classes = classes.replace(' ' + name + ' ', ' ');
                                    }
                                }
                            }
                            element.className = classes.trim();
                        }
                        return element;
                    }
                }
            });
    },

    /**
     * Checks if an element has the given class

     *
     * @param {String} selector(s)
     * @return {Boolean} true if the element contains all classes
     */

    hasClass: function (value) {

        var i = 0,
            className = ' ' + value + ' ',
            self = this,
            l = self.length;
        for (; i < l; i++) {
            if (csp) {
                if (self[i].nodeType === 1) {
                    if (self[i].classList.contains(value)) {
                        return true;
                    }
                }
            } else {
                if (self[i].nodeType === 1 && (' ' + self[i].className + ' ').replace(rclass, ' ').indexOf(className) >= 0) {
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

        toggleClass: function (value, state) {

        var type = typeof value;

        if (typeof state === 'boolean' && type === 'string') {
            return state ? this.addClass(value) : this.removeClass(value);
        }

        if (hAzzle.isFunction(value)) {
            return this.each(function (i) {
                hAzzle(this).toggleClass(value.call(this, i, this.className, state), state);
            });
        }

        var classNames = value.match(whitespaceRegex) || [],
            cls,
            i = 0,
            self;

        return this.each(function (elem) {

            if (type === 'string') {

                // ClassList

                self = hAzzle(elem);

                while ((cls = classNames[i++])) {

                    if (csp) {

                        if (typeof state === 'boolean') {

                            // IE10+ doesn't support the toggle boolean flag.

                            if (state) {

                                return elem.classList.add(cls);

                            } else {

                                return elem.classList.remove(cls);
                            }
                        }

                        return elem.classList.toggle(cls);
                    }

                    // check each className given, space separated list

                    if (self.hasClass(cls)) {

                        self.removeClass(cls);

                    } else {

                        self.addClass(cls);
                    }
                }

                // Toggle whole class name
            } else if (value === undefined || type === "boolean") {
                if (this.className) {
                    // store className if set
                    hAzzle.data(this, '__className__', this.className);
                }

                this.className = this.className || value === false ? '' : hAzzle.data(this, '__className__') || '';
            }
        });
    }

});