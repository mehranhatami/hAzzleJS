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
 * - customEvent
 */
 
(function(window) {

    'use strict';

    var _Aproto = Array.prototype,
        _slice = _Aproto.slice,
        _indexOf = _Aproto.indexOf,

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
                var parentElement = this.parentElement;
                if (parentElement) {
                    parentElement.insertBefore(
                        applyToFragment(arguments), this
                    );
                }
            },
            'after',
            function after() {
                if (this.parentElement) {
                    if (this.nextSibling) {
                        this.parentElement.insertBefore(
                            applyToFragment(arguments), this.nextSibling
                        );
                    } else {
                        this.parentElement.appendChild(
                            applyToFragment(arguments)
                        );
                    }
                }
            },
            'replace',
            function replace() {
                if (this.parentElement) {
                    this.parentElement.replaceChild(
                        applyToFragment(arguments), this
                    );
                }
            },
            'remove',
            function remove() {
                if (this.parentElement) {
                    this.parentElement.removeChild(this);
                }
            },
            'matches', (
                ElementPrototype.matchesSelector ||
                ElementPrototype.webkitMatchesSelector ||
                ElementPrototype.mozMatchesSelector ||
                ElementPrototype.msMatchesSelector ||
                function matches(selector) {
                    var parentElement = this.parentElement;
                    return !!parentElement && -1 < _indexOf.call(
                        parentElement.querySelectorAll(selector),
                        this
                    );
                }
            )
        ],
        // slice = properties.slice,
        i = properties.length;

    // Loop through
    for (; i; i -= 2) {
        if (!ElementPrototype[properties[i - 2]]) {
            ElementPrototype[properties[i - 2]] = properties[i - 1];
        }
    }

    // Create TextNode if string, else
    // return the node untouched

    function stringNode(node) {
        return typeof node === 'string' ?
            window.document.createTextNode(node) : node;
    }

    // Apply the node to the fragment

    function applyToFragment(nodes) {

        var fragment = window.document.createDocumentFragment(),
            container = _slice.call(nodes, 0),
            i = 0,
            l = nodes.length;

        if (nodes.length === 1) {
            return stringNode(nodes[0]);
        }

        for (; i < l; i++) {

            try {
                fragment.appendChild(stringNode(container[i]));
            } catch (e) {}
        }

        return fragment;
    }
    
    // CUSTOM EVENT
    // -------------
    
    try { // Native, working customEvent()
        new window.CustomEvent('?');
    } catch (e) { 
        window.CustomEvent = function(
            eventName,
            defaultInitDict
        ) {
            function CustomEvent(type, eventInitDict) {

                var event = document.createEvent(eventName);

                if (typeof type !== 'string') {
                    throw new Error('An event name must be provided');
                }

                if (eventName === 'Event') {
                    event.initCustomEvent = initCustomEvent;
                }
                if (eventInitDict == null) {
                    eventInitDict = defaultInitDict;
                }
                event.initCustomEvent(
                    type,
                    eventInitDict.bubbles,
                    eventInitDict.cancelable,
                    eventInitDict.detail
                );
                return event;
            }

            // Attached at runtime
            function initCustomEvent(
                type, bubbles, cancelable, detail
            ) {
                this.initEvent(type, bubbles, cancelable);
                this.detail = detail;
            }

            return CustomEvent;
        }(

            // In IE9 and IE10 CustomEvent() are not usable as a constructor, so let us fix that
            // https://developer.mozilla.org/en/docs/Web/API/CustomEvent

            window.CustomEvent ?
            // Use the CustomEvent interface in such case
            'CustomEvent' : 'Event',
            // Otherwise the common compatible one
            {
                bubbles: false,
                cancelable: false,
                detail: null
            }
        );
    }
}(window));