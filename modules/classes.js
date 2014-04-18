;
(function ($) {


// Check if we can support classList
var csp = !! document.createElement('p').classList,
    whitespace = (/\S+/g),
    rclass = /[\t\r\n\f]/g;

  $.extend($.fn, {

    /**
     * Add class(es) to element collection
     *
     * @param {String} value
     */

    addClass: function (value) {
        if (hAzzle.isFunction(value)) {
            return this.each(function (j) {
                hAzzle(this).addClass(value.call(this, j, this.className));
            });
        }

        var cur,
            j,
            clazz,
            finalValue,
            classes = (value || "").match(whitespace) || [];

        return this.each(function (_, elem) {

            // classList

            if (csp && hAzzle.nodeType(1, elem)) {
                return hAzzle.each(classes, function (_, cls) {
                    return elem.classList.add(cls);
                });
            }

            // The old way

            cur = hAzzle.nodeType(1, elem) && (elem.className ?

                (" " + elem.className + " ").replace(rclass, " ") : " ");

            if (cur) {
                j = 0;
                while ((clazz = classes[j++])) {
                    if (cur.indexOf(" " + clazz + " ") < 0) {
                        cur += clazz + " ";
                    }
                }

                // only assign if different to avoid unneeded rendering.
                finalValue = hAzzle.trim(cur);
                if (elem.className !== finalValue) {
                    elem.className = finalValue;
                }
            }
        });
    },

    /**
     * Remove class(es) from element
     *
     * @param {String} value
     */

    removeClass: function (value) {

        var classes, cur, clazz, j, finalValue;

        if (hAzzle.isFunction(value)) {
            return this.each(function (j) {
                hAzzle(this).removeClass(value.call(this, j, this.className));
            });
        }

        classes = (value || "").match(whitespace) || [];

        return this.each(function (_, elem) {

            if (!value) {

                return elem.className = "";
            }

            // ClassList

            if (csp && hAzzle.nodeType(1, elem)) {
                return hAzzle.each(classes, function (_, classes) {
                    elem.classList.remove(classes);
                });
            }

            // Old way of doing things

            cur = hAzzle.nodeType(1, elem) && (elem.className ?
                (" " + elem.className + " ").replace(rclass, " ") :
                ""
            );

            if (cur) {
                j = 0;
                while ((clazz = classes[j++])) {
                    // Remove *all* instances
                    while (cur.indexOf(" " + clazz + " ") >= 0) {
                        cur = cur.replace(" " + clazz + " ", " ");
                    }
                }

                // Only assign if different to avoid unneeded rendering.

                finalValue = value ? hAzzle.trim(cur) : "";
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

    hasClass: function (selector) {

        for (var className = " " + selector + " ", i = 0, d = this.length; i < d; i++) {

            // Use classList if browser supports it

            if (csp && hAzzle.nodeType(1, this[i])) return this[i].classList.contains(selector);

            // Fallback to the "old way" if classList not supported

            if (hAzzle.nodeType(1, this[i]) && 0 <= (" " + this[i].className + " ").replace(rclass, " ").indexOf(className)) return true;

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
        var current, found;
        return this.each(function () {
            current = this.className.split(' '),
            found = false;

            for (var i = current.length; i--;) {
                if (current[i] == clA) {
                    found = true;
                    current[i] = clB;
                }
            }
            if (!found) {
                return hAzzle(this).addClass(clB, this);
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
            hAzzle(elem).addClass(clas);
            setTimeout((function () {
                hAzzle(elem).removeClass(clas);
            }), duration || /* default 100ms */ 100);
        });
    },

    /**
     * Retrive all classes that belong to one element
     */

    allClass: function () {
        if (csp) return this[0].classList;
        else return this;
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

        if (hAzzle.isFunction(value)) {
            return this.each(function (i) {
                hAzzle(this).toggleClass(value.call(this, i, this.className, state), state);
            });
        }

        return this.each(function (_, elem) {

            // ClassList
            if (csp) {

               return this.classList.toggle(value);
            }
            // The "old way"	

            if (typeof value === "string") {
                // toggle individual class names
                var className,
                    i = 0,
                    self = hAzzle(this),
                    classNames = value.match(whitespace) || [];

                while ((className = classNames[i++])) {
                    // check each className given, space separated list
                    if (self.hasClass(className)) {
                        self.removeClass(className);
                    } else {
                        self.addClass(className);
                    }
                }

                // Toggle whole class name
            } else if (type === typeof undefined || type === "boolean") {
                if (this.className) {
                    // store className if set
                    hAzzle.data(this, "__className__", this.className);
                }

                this.className = this.className || value === false ? "" : hAzzle.data(this, "__className__") || "";
            }
        });
    }
});

})(hAzzle);