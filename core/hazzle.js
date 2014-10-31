/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0d Release Candidate
 * Released under the MIT License.
 *
 * Date: 2014-10-31
 */
 
(function() {

    var
    // Quick-lookup for hAzzle(id)

        idOnly = /^#([\w\-]*)$/,

        // Holder for all modules

        modules = {},

        // Keep track of installed modules. Hopefully people won't spoof this... would be daft.

        installed = {},

        version = {
            full: '1.0.0a-rc',
            major: 1,
            minor: 0,
            dot: 0,
            codeName: 'new-age'
        },

        // Throws an error if `condition` is `true`.

        err = function(condition, code, message) {
            if (condition) {
                var e = new Error('[hAzzle-' + code + '] ' + message);
                e.code = code;
                throw e;
            }
        },
        // Returns an instance for `name`

        require = function(name) {
            return modules[name];
        },

        // Defines a module for `name: String`, `fn: Function`,

        define = function(name, fn) {

            // Check arguments
            err(typeof name !== 'string', 1, 'id must be a string "' + name + '"');
            err(modules[name], 2, 'module already included "' + name + '"');
            err(typeof fn !== 'function', 3, 'function body for "' + name + '" must be an function "' + fn + '"');

            // append to module object
            installed[name] = true;

            modules[name] = fn.call(hAzzle.prototype);
        },

        validTypes = function(elem) {
            return elem && (elem.ELEMENT_NODE || elem.DOCUMENT_NODE);
        },

        // Define a local copy of hAzzle
        // NOTE! Everything need to be returned as an array
        // so important to wrap [] around the 'sel' to avoid
        // errors

        hAzzle = function(sel, ctx) {

            // hAzzle(), hAzzle(null), hAzzle(undefined), hAzzle(false)
            if (!sel) {
                return;
            }
            // Allow instantiation without the 'new' keyword
            if (!(this instanceof hAzzle)) {
                return new hAzzle(sel, ctx);
            }

            if (sel instanceof hAzzle) {
                return sel;
            }

            // Include required module

            var m, _util = hAzzle.require('Util'),
               // Document ready
                _ready = hAzzle.require('Ready');

            // If a function is given, call it when the DOM is ready

            if (typeof sel === 'function') {
                if (installed.Ready) {
                    _ready.ready(sel);
                } else {
                    err(true, 6, 'ready.js module not installed');
                }
            }

            if (typeof sel === 'string') {

                // Quick look-up for hAzzle(#id)

                if ((m = idOnly.exec(sel)) && !ctx) {
                    this.elements = [document.getElementById(m[1])];
                }

                if (this.elements === null || this.elements === undefined) {

                    // The 'find' method need to have a boolean value set to 'true', to 
                    // work as expected. Else it will behave like the global .find method

                    this.elements = this.find(sel, ctx, true);
                }
                // hAzzle([dom]) 
            } else if (sel instanceof Array) {
                this.elements = _util.unique(_util.filter(sel, validTypes));
                // hAzzle(dom)
            } else if (this.isNodeList(sel)) {
                this.elements = _util.filter(_util.makeArray(sel), validTypes);
                // hAzzle(dom)
            } else if (sel.nodeType) {
                // If it's a html fragment, create nodes from it
                if (sel.nodeType === 11) {
                    // This children? Are they an array or not?
                    this.elements = sel.children;
                } else {
                    this.elements = [sel];
                }
                // window     
            } else if (sel === window) {
                this.elements = [sel];
            } else {
                this.elements = [];
            }

            // Create a new hAzzle collection from the nodes found
            // NOTE!! If undefined, set length to 0, and
            // elements to an empty array [] to avoid hAzzle
            // throwing errors

            if (this.elements === undefined) {
                this.length = 0;
                this.elements = [];
            } else {
                this.length = this.elements.length;
            }
            return this;
        };

    // Expose

    hAzzle.err = err;
    hAzzle.installed = installed;
    hAzzle.require = require;
    hAzzle.define = define;
    hAzzle.codename = version.codename 
    hAzzle.version = version.full
    hAzzle.major = version.major
    hAzzle.minor = version.minor
    hAzzle.dot = version.dot

    // Hook hAzzle on the window object

    window.hAzzle = hAzzle;

}(window));