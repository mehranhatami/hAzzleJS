// has.js
var isBrowser =
    // the most fundamental decision: are we in the browser?
    typeof window !== 'undefined' &&
    typeof location !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.location === location && window.document == document,
    doc = isBrowser && document,
    element = doc && doc.createElement('DiV'),
    hasCache = {};

hAzzle.extend({
    has: function(name) {
        return typeof hasCache[name] === 'function' ? 
                      (hasCache[name] = hasCache[name](window, doc, element)) : 
                      hasCache[name]; // Boolean
    },

    add: function(name, test, now, force) {
        (typeof hasCache[name] == 'undefined' || force) && (hasCache[name] = test);
        return now && has(name);
    },
    clearElement: function(element) {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }
        return element;
    }
 }, hAzzle);