/**
 * DOM 4 shim / pollify for hAzzle
 *
 * This pollify covers:
 *
 * - append
 * - prepend
 * - before
 * - after
 * - replace
 * - remove
 * - matches
 */
 
(function(window) {

    'use strict';

    var property,

        ElementPrototype = (window.Element ||
            window.Node ||
            window.HTMLElement).prototype,

        properties = [
            'append',
            function append() {
                this.appendChild(
                    applyToFragment(arguments)
                );
            },
            'prepend',
            function prepend() {
                if (this.firstChild) {
                    this.insertBefore(
                        applyToFragment(arguments), this.firstChild
                    );
                } else {
                    this.appendChild(
                        applyToFragment(arguments)
                    );
                }
            },
            'before',
            function before() {
                var parentNode = this.parentNode;
                if (parentNode) {
                    parentNode.insertBefore(
                        applyToFragment(arguments), this
                    );
                }
            },
            'after',
            function after() {
                if (this.parentNode) {
                    if (this.nextSibling) {
                        this.parentNode.insertBefore(
                            applyToFragment(arguments), this.nextSibling
                        );
                    } else {
                        this.parentNode.appendChild(
                            applyToFragment(arguments)
                        );
                    }
                }
            },
            'replace',
            function replace() {
                if (this.parentNode) {
                    this.parentNode.replaceChild(
                        applyToFragment(arguments), this
                    );
                }
            },
            'remove',
            function remove() {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                }
            },
            'matches', (
                ElementPrototype.matchesSelector ||
                ElementPrototype.webkitMatchesSelector ||
            //    ElementPrototype.khtmlMatchesSelector ||
                ElementPrototype.mozMatchesSelector ||
                ElementPrototype.msMatchesSelector ||
            //    ElementPrototype.oMatchesSelector ||
                function matches(selector) {
                    var parentNode = this.parentNode;
                    return !!parentNode && -1 < indexOf.call(
                        parentNode.querySelectorAll(selector),
                        this
                    );
                }
            ),
        ],
        slice = properties.slice,
        i = properties.length;

    // Loop through
    for (; i; i -= 2) {

        property = properties[i - 2];

        if (!(property in ElementPrototype)) {
            ElementPrototype[property] = properties[i - 1];
        }
    }

    /* ============================ UTILITY METHODS =========================== */
    
	// Create TextNode if string, else
    // return the node untouched

    function stringNode(node) {
        return typeof node === 'string' ?
            window.document.createTextNode(node) : node;
    }
    
	// Apply the node to the fragment
	
    function applyToFragment(nodes) {

        var fragment = window.document.createDocumentFragment(),
            container = slice.call(nodes),
            i = 0,
            l = nodes.length;

        if (nodes.length === 1) {

            return stringNode(nodes[0]);
        }

        for (; i < l; i++) {

            fragment.appendChild(stringNode(container[i]));
        }

        return fragment;
    }

}(window));