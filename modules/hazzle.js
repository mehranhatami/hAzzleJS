/*!
 * hAzzle.js
 * Copyright (c) 2014 Kenny Flashlight
 * Version: 1.0.0a-alpha
 * Released under the MIT License.
 *
 * Date: 2014-10-14
 */
(function() {

    var
    // Quick-lookup for hAzzle(id)

        idOnly = /^#([\w\-]*)$/,

        // Minimalist module system

        modules = {},

        // Keep track of installed modules. Hopefully people won't spoof this... would be daft.

        installed = {},

        version = {
            full: '1.0.0a-alpha',
            major: 1,
            minor: 0,
            dot: 0,
            codeName: 'new-era'
        },

        // Throws an error if `condition` is `true`.

        err = function(condition, code, message) {
            if (condition) {
                var e = new Error('[hAzzle-' + code + '] ' + message);
                e.code = code;
                throw e;
            }
        },

        // Returns an instance for `id`

        require = function(id) {
            return modules[id];
        },

        // Defines a module for `id: String`, `fn: Function`,

        define = function(id, fn) {

            // Check arguments
            err(typeof id !== 'string', 1, 'id must be a string "' + id + '"');
            err(modules[id], 2, 'id already defined "' + id + '"');
            err(typeof fn !== 'function', 3, 'function body for "' + id + '" must be an function "' + fn + '"');

            // append to module object
            installed[id] = true;

            modules[id] = fn.call(hAzzle.prototype);
        },

        validTypes = function(elem) {
            return elem && (elem.nodeType === 1 || elem.nodeType === 9);
        },

        // Define a local copy of hAzzle
        // NOTE! Everything need to be returned as an array
        // so important to wrap [] around the 'sel' to avoid
        // errors

        hAzzle = function(sel, ctx) {

            if (!sel) {
                return;
            }

            if (!(this instanceof hAzzle)) {
                return new hAzzle(sel, ctx);
            }

            if (sel instanceof hAzzle) {
                return sel;
            }

            // Include required module

            var m, _util = hAzzle.require('Util'),
                _ready = hAzzle.require('Ready');

            if (typeof sel === 'function') {
                _ready.ready(sel);
            }

            if (typeof sel === 'string') {

                // Quick look-up for hAzzle(#id)

                if ((m = idOnly.exec(sel)) && !ctx) {
                    this.elements = [document.getElementById(m[1])];
                }

                if (this.elements === null || this.elements === undefined) {
                    this.elements = this.jiesa(sel, ctx);
                }
                // array   
            } else if (sel instanceof Array) {
                this.elements = _util.unique(_util.filter(sel, validTypes));
                // nodeList
            } else if (_util.isNodeList(sel)) {
                this.elements = _util.filter(_util.makeArray(sel), validTypes);
                // nodeType
            } else if (sel.nodeType) {
                // document fragment
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

            // If undefined, set length to 0, and
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

    // Define constructor
    hAzzle.prototype = {
        constructor: hAzzle
    };

    // Expose to the global scope

    hAzzle.version = version.full;
    hAzzle.err = err;
    hAzzle.installed = installed;
    hAzzle.require = require;
    hAzzle.define = define;

    // Hook hAzzle on the window object

    window.hAzzle = hAzzle;

}(window));