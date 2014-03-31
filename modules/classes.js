// **************************************************************
// CLASS MANIPULATION
//
// Supported:
//
// - addClass
// - removeClass  
// - replaceClass
// - hasClass
// - matchClass (Retrive all classes that belong to one element)
// - tempClass (Add and remove class after 'duration' milliseconds)
// - allClass  (Retrive all classes that belong to one element)
// - strClass  (Return all classes as a string)
// - toggleClass
//
// **************************************************************
var classList = hAzzle.support.classList,

    expr = {
        specialSplit: /\s*,\s*|\s+/
    };

hAzzle.extend({


    /**
     * Internal remove class function. Uses Classlist for better performance if supported by browser
     *
     * @param {string} class
     * @param {string} el
     */

    removeClass: function (classes, el) {
        if (classList) {
            hAzzle.each(classes.split(expr['specialSplit']), function (classes) {
                el.classList.remove(classes);
            })
        } else {

            var current = el.className.split(expr['specialSplit']);
            var newClasses = [];
            for (var i = 0, len = current.length; i < len; i++) {
                if (current[i] !== className) newClasses.push(current[i]);
            }
            el.className = newClasses.join(' ');
        }

    },

    /**
     * Internal addClass function. Uses Classlist for better performance if supported by browser
     *
     * @param {string} class
     * @param {string} el
     */

    addClass: function (classes, el) {
        if (!classes) return;
        classList ? hAzzle.each(classes.split(expr['specialSplit']), function (cls) {
            el.classList.add(trim(cls));
        }) :
            hAzzle.hasClass(className, el) || (el.className += (el.className ? " " : "") + className);
    },

    hasClass: function (className, el) {
        if (!className) return;
        return support.classList ? el.classList.contains(className) : RegExp("(^|\\s)" + " " + className + " " + "(\\s|$)").test(el.className);
    },

    toggleClass: function (className, el) {
        if (!className) return;
        if (classList) el.classList.toggle(className);
        else {

            var classes = el.className.split(' '),
                existingIndex = -1;
            for (var i = classes.length; i--;) {
                if (classes[i] === className)
                    existingIndex = i;
            }

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');


        }
    }

});


hAzzle.fn.extend({
    /**
	 * Add classes to element collection
	 * Multiple classnames can be with spaces or comma or both
	 *
	 * Example:
	 *
	 *		    addClass("I like to develop javascript")
	 *			addClass("I, like, to, develop, javascript")
	 *		    addClass("I like, to develop, javascript")
	 *
	 *	will all set the same class names.
	 *
	 * @param {String} classes
	 */

    addClass: function (className) {
        if (!className) return;
        return this.each(function (index, elem) {
            hAzzle.addClass(hAzzle.trim(className), elem);
        });
    },

    /**
     * Remove classes from element collection
     *
     * @param {String} className
     */

    removeClass: function (className) {
        if (!className) return;
        return this.each(function (index, elem) {
            hAzzle.removeClass(hAzzle.trim(className), elem);
        });
    },

    /**
     * Checks if an element has the given class
     *
     * @param {String} className
     * @return {Boolean}
     */

    hasClass: function (className) {
        if (!className) return;
        return this.each(function (index, elem) {
            hAzzle.hasClass(hAzzle.trim(className), elem);
        });
    },

    /**
     * Replace a class in a element collection
     *
     * @param {String} className
     */
	 
    replaceClass: function () {},

    /**
     * Check if an class has a class matching 'pattern'
     * @param {String} pattern
     * @return {String}
     */

    matchClass: function (Pattern) {

        return this.each(function (index, elem) {
            for (var el = elem.className.replace(/^\s+|\s+$/g, "").split(" "), clas, i = 0, n = el.length; i < n; i++)
                if (clas = el[i], -1 !== hAzzle.indexOf(clas, pattern)) return clas;
            return "";
        });
    },

    /**
     * Add class 'clas' to 'element', and remove after 'duration' milliseconds
     * @param {String} clas
     * @param {Number} duration
     */

    tempClass: function (clas, duration) {
        return this.each(function (index, elem) {
            hAzzle.addClass(hAzzle.trim(clas), elem);
            setTimeout((function () {
                hAzzle.removeClass(clas, el);
            }), duration);
        });
    },

    /**
     * Retrive all classes that belong to one element
     */

    allClass: function () {
        if (classList) {
            return this[0].classList;
        }
        throw "Syntax error, missing classList support in your browser";
    },

    /**
     * Returning the list of classes as a string
     */

    strClass: function () {
        if (classList) {
            return el.classList.toString();
        }
        throw "Syntax error, missing classList support in your browser";
    },

    /**
     * Checks if an element has the given class
     *
     * @param {String} className
     * @return {Boolean}
     */
    toggleClass: function (className, state) {

        return this.each(function (index, elem) {

            if (hAzzle.isBoolean(state) && hAzzle.isString(type)) {
                return state ? hAzzle.addClass(className, elem) : hAzzle.removeClass(className, elem);
            }
            hAzzle.toggleClass(className, elem);

        });


    }

});