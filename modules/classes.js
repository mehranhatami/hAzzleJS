// Classes
;
(function ($) {

    // Check if we can support classList

    var csp =  !!document.createElement('p').classList,

        indexOf = Array.prototype.indexOf,

        sMa,
        whitespace = /\S+/g,
        _class = /[\t\r\n\f]/g,
        isFunction = $.isFunction;

    // Check if classList support multiple arguments

    if (csp) {

        (function () {

            var div = document.createElement('div');
            div.classList.add('a', 'b');
            sMa = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
        }());
    }

    $.extend($.fn, {

        /**
         * Add class(es) to element collection
         *
         * @param {String} value
         */

        addClass: function (value) {

            if (isFunction(value)) {
                return this.each(function (index) {
                    $(this).addClass(value.call(this, index, this.className));
                });
            }

            var cls,
                cur,
                j,
                finalValue,
                classes = (value || "").match(whitespace) || [];

       // I think this could give memory leak, so we need to find a solution here.
            return this.each(function (_, elem) {

                // classList

                if ($.nodeType(1, elem)) {

                    if (!csp && !sMa) {

                        elem.classList.add.apply(elem.classList, classes);

                    } else {

                        if (!csp) {

                            cur = $.nodeType(1, elem) && (elem.className ? (" " + elem.className + " ").replace(_class, " ") : " ");
                        }

                        j = 0;
                        while ((cls = classes[j++])) {

                            if (csp) {
                                elem.classList.add(cls);
                            } else {
                                if (cur.indexOf(" " + cls + " ") < 0) {
                                    cur += cls + " ";
                                }
                            }
                        }
                        if (!csp) {
                            finalValue = cur.trim(cur);

                            if (elem.className !== finalValue) {
                                elem.className = finalValue;
                            }
                        }
                    }
                    return;
                }
            });
        },

        /**
         * Remove class(es) from element
         *
         * @param {String} value
         */

        removeClass: function (value) {

            var classes, cur, cls, j, finalValue;

            if (isFunction(value)) {
                return this.each(function (j) {
                    $(this).removeClass(value.call(this, j, this.className));
                });
            }

            classes = (value || "").match(whitespace) || [];

            return this.each(function (_, elem) {

                if (!value) {

                    return elem.className = "";
                }

                // ClassList

                if (csp && $.nodeType(1, elem) && elem.className) {
                  
				    if (!value) {
                        elem.className = '';
                    }
					
                    if (sMa) {
						
                        elem.classList.remove.apply(elem.classList, classes);
						
                    } else {
						
                        j = 0;
                        while ((cls = classes[j++])) {
                            elem.classList.remove(cls);
                        }
                    }

                    return $.each(classes, function (_, classes) {
                        elem.classList.remove(classes);
                    });
                }

                // Old way of doing things

                cur = $.nodeType(1, elem) && (elem.className ? (" " + elem.className + " ").replace(_class, " ") : "");

                if (cur) {
                    j = 0;
                    while ((cls = classes[j++])) {
                        // Remove *all* instances
                        while (cur.indexOf(" " + cls + " ") >= 0) {
                            cur = cur.replace(" " + cls + " ", " ");
                        }
                    }

                    // Only assign if different to avoid unneeded rendering.

                    finalValue = value ? $.trim(cur) : "";
                    if (elem.className !== finalValue) {
                        elem.className = finalValue;
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
                l = this.length;

            while (i < l) {

                if (!csp) {

                    if ($.nodeType(1, this[i])) {

                        if (this[i].classList.contains(value)) {

                            return true;
                        }
                    }

                } else { // The old way

                    var className = " " + value + " ";
                    if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(_class, " ").indexOf(className) >= 0) {
                        return true;
                    }
                }
                i++;
            }
            return false;
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
         * Add class(es) to element, and remove after 'duration' milliseconds
         * @param {String} clas
         * @param {Number} duration
         */

        tempClass: function (clas, duration) {
            return this.each(function (_, elem) {
                $(elem).addClass(clas);
                setTimeout((function () {
                    $(elem).removeClass(clas);
                }), duration || /* default 100ms */ 100);
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