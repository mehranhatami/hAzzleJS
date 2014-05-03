// Classes
;
(function ($) {

    // Check if we can support classList

    var csp = !!document.createElement('p').classList,

        // ONLY!! for browsers who don't support classlist

        indexOf = Array.prototype.indexOf,

        sMa, // Multiple argumens
        whitespace = /\S+/g,
        isFunction = $.isFunction;

    // Check for support for multiple arguments for classList (IE doesn't have it )

    csp && function () {
        var div = document.createElement('div');
        div.classList.add('a', 'b');
        sMa = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
    }();

    $.extend($.fn, {

        /**
         * Add class(es) to element collection
         *
         * @param {String} value
         */


        addClass: function (value) {

            return isFunction(value) ? this.each(function (e) {
                $(this).addClass(value.call(this, index, this.className));
            }) : this.each(function (_, element) {
                if ($.nodeType(1, element)) {
                    if (csp && sMa) {
                        value.replace(whitespace, function (name) {
                            element.classList.add(name);
                        });
                    } else {
                        var classes = ' ' + element.className + ' ',
                            name;
                        value = value.trim().split(/\s+/);
                        while (name = value.shift()) {
                            if ($.inArray(classes, ' ' + name + ' ') === -1) {
                                classes += name + ' ';
                            }
                        }
                        element.className = classes.trim();
                    }
                    return element;
                }
            });
        },

        /**
         * Remove class(es) from element
         *
         * @param {String} value
         */

        removeClass: function (value) {

            var cls;

            return isFunction(value) ?
                this.each(function (j) {
                    $(this).removeClass(value.call(this, j, this.className));
                }) : this.each(function (_, element) {

                    if (!value) {
                        return element.className = "";
                    }

                    if (value === '*') {
                        element.className = '';
                    } else {
                        if ($.isRegExp(value)) {
                            value = [value];
                        } else if (csp && $.inArray(value, '*') === -1) {
                            if (sMa) {
                                value.replace(whitespace, function (name) {
                                    element.classList.remove(name);
                                });
                            } else {
                                var i = 0;
                                while ((cls = value[i++])) {
                                    element.classList.remove(cls);
                                }
                            }
                            return;
                        } else {
                            value = value.trim().split(/\s+/);
                        }

                        var classes = ' ' + element.className + ' ',
                            name;
                        while (name = value.shift()) {
                            if (name.indexOf && name.indexOf('*') !== -1) {
                                name = new RegExp('\\s*\\b' + name.replace('*', '\\S*') + '\\b\\s*', 'g');
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
                l = this.length;
            for (; i < l;) {
                return csp ?
                    this[i].classList.contains($.trim(value)) : this[i].nodeType === 1 && (" " + this[i].className + " ").replace(/[\t\r\n\f]/g, " ").indexOf($.trim(value)) >= 0;
            }
        },


        /**
         * Replace a class in a element collection
         *
         * @param {String} clA
         * @param {String} clB
         */

        replaceClass: function (clA, clB) {
            var current, found, i;
            return this.each(function () {
                current = this.className.split(' '),
                found = false;

                for (i = current.length; i--;) {
                    if (current[i] == clA) {
                        found = true;
                        current[i] = clB;
                    }
                }
                if (!found) {
                    return $(this).addClass(clB, this);
                }
                this.className = current.join(' ');
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

            if (typeof state === "boolean" && type === "string") {
                return state ? this.addClass(value) : this.removeClass(value);
            }

            if (isFunction(value)) {
                return this.each(function (i) {
                    $(this).toggleClass(value.call(this, i, this.className, state), state);
                });
            }

            var classNames = value.match(whitespace) || [],
                cls,
                i = 0,
                self;

            return this.each(function (_, elem) {

                if (type === "string") {

                    // ClassList

                    self = $(elem);

                    while ((cls = classNames[i++])) {

                        if (csp) {

                            if (typeof state === "boolean") {

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
                } else if (type === typeof undefined || type === "boolean") {
                    if (this.className) {
                        // store className if set
                        $.data(this, "__className__", this.className);
                    }

                    this.className = this.className || value === false ? "" : $.data(this, "__className__") || "";
                }
            });
        }
    });

})(hAzzle);