// manipulation.js
var hAzzle = window.hAzzle || (window.hAzzle = {});

hAzzle.include([
    'util',
    'support',
    'core',
    'events',
    'types',
    'text'
], function(_util, _support, _core, _events, _types, _text) {

    var _scriptStyle = /<(?:script|style|link)/i,
        _tagName = /<([\w:]+)/,
        _htmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        _rcheckableType = (/^(?:checkbox|radio)$/i),
        _whitespace = /^\s*<([^\s>]+)/,
        _scriptTag = /\s*<script +src=['"]([^'"]+)['"]>/,
        table = ['<table>', '</table>', 1],
        td = ['<table><tbody><tr>', '</tr></tbody></table>', 3],
        option = ['<select>', '</select>', 1],
        noscope = ['_', '', 0, 1],

        tagMap = {
            tr: ['<table><tbody>', '</tbody></table>', 2],
            col: ['<table><colgroup>', '</colgroup></table>', 2],
            fieldset: ['<form>', '</form>', 1],
            legend: ['<form><fieldset>', '</fieldset></form>', 2],
            th: td,
            td: td,
            style: table,
            table: table,
            thead: table,
            tbody: table,
            tfoot: table,
            colgroup: table,
            caption: table,
            option: option,
            optgroup: option,
            script: noscope,
            link: noscope,
            param: noscope,
            base: noscope
        };

    var imcHTML = (function() {

            if (typeof document.implementation.createHTMLDocument === 'function') {
                return true;
            }
            return false;
        })(),

        createHTML = function(html, context) {
            return hAzzle(create(html, context));
        },

        fixInput = function(src, dest) {
            var nodeName = dest.nodeName.toLowerCase();

            // Fails to persist the checked state of a cloned checkbox or radio button.
            if (nodeName === 'input' && _rcheckableType.test(src.type)) {
                dest.checked = src.checked;

                // Fails to return the selected option to the default selected state when cloning options
            } else if (nodeName === 'input' || nodeName === 'textarea') {
                dest.defaultValue = src.defaultValue;
            }
        },

        // Returns a duplicate of `element`
        // - deep (Boolean): Whether to clone events as well.
        // - evtName: event type to be cloned (e.g. 'click', 'mouseenter')
        cloneElem = function(elem, deep, evtName) {

            if (elem === null || elem === undefined) {
                return elem;
            }
            // Wrap it out if it's a instanceof hAzzle

            elem = getElem(elem);

            var source = elem.nodeType && elem.cloneNode(true),
                destElements,
                srcElements,
                i, l;
            if (source) {
                // Fix IE cloning issues
                if (!_support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) &&
                    !_core.isXML(elem)) {

                    destElements = grab(source);
                    srcElements = grab(elem);

                    for (i = 0, l = srcElements.length; i < l; i++) {
                        fixInput(srcElements[i], destElements[i]);
                    }
                }

                // Clone events if the Events.js module are installed

                if (hAzzle.installed.Events && deep && (source.nodeType === 1 || source.nodeType === 9)) {
                    // Copy the events from the original to the clone
                    destElements = grab(source);
                    srcElements = grab(elem);
                    for (i = 0; i < srcElements.length; i++) {
                        _events.clone(destElements[i], srcElements[i], evtName);
                    }
                }
                return source;
            }
        },

        createScriptFromHtml = function(html, context) {
            var scriptEl = context.createElement('script'),
                matches = html.match(_scriptTag);
            scriptEl.src = matches[1];
            return scriptEl;
        },

        deepEach = function(array, fn, context) {
            if (array) {
                var index = array.length;
                while (index--) {
                    if (_types.isNode(array[index])) {
                        deepEach(array[index].children, fn, context);

                        fn.call(context || array[index], array[index], index, array);
                    }
                }
            }
            return array;
        },

        create = function(node, context) {
            if (node) {
                // Mitigate XSS vulnerability

                var defaultContext = imcHTML ?
                    document.implementation.createHTMLDocument() :
                    document,
                    ctx = context || defaultContext,
                    fragment = ctx.createDocumentFragment();

                if (typeof node === 'string' && node !== '') {

                    /* Check for 'script tags' (e.g <script type="text/javascript" src="doml4.js"></script>, and
                       create it if match 
                     */
                    if (_scriptTag.test(node)) {
                        return [createScriptFromHtml(node, context)];
                    }

                    // Deserialize a standard representation

                    var i, tag = node.match(_whitespace),
                        sandbox = fragment.appendChild(ctx.createElement('div')),
                        els = [],
                        map = tag ? tagMap[tag[1].toLowerCase()] : null,
                        dep = map ? map[2] + 1 : 1,
                        noScoop = map && map[3];

                    if (map) {
                        sandbox.innerHTML = (map[0] + node + map[1]);
                    } else {
                        sandbox.innerHTML = node;
                    }

                    while (dep--) {
                        sandbox = sandbox.firstChild;
                    }

                    // for IE NoScope, we may insert cruft at the begining just to get it to work

                    if (noScoop && sandbox && sandbox.nodeType !== 1) {
                        sandbox = sandbox.nextSibling;
                    }

                    do {
                        if (!tag || sandbox.nodeType === 1) {
                            els.push(sandbox);
                        }
                    } while (sandbox = sandbox.nextSibling);

                    for (i in els) {
                        if (els[i].parentNode) {
                            els[i].parentNode.removeChild(els[i]);
                        }
                    }

                    return els;

                } else if (_util.isNode(node)) {
                    return [node.cloneNode(true)];
                }
            }
        },

        // Grab childnodes

        grab = function(context, tag) {
            var ret = context.getElementsByTagName(tag || '*');
            return tag === undefined || tag && _util.nodeName(context, tag) ?
                _util.merge([context], ret) :
                ret;
        },

        // Removes the data associated with an element

        clearData = function(elems) {

            // No point to continue clearing events if the events.js module
            // are not installed

            if (!hAzzle.installed.Events) {
                hAzzle.err(true, 17, 'events.js module are not installed');
            }

            var elem, i = 0;

            // If instanceof hAzzle...

            if (elems instanceof hAzzle) {
                elems = [elems.elements[0]];
            } else {
                elems = elems.length ? elems : [elems];
            }

            for (;
                (elem = elems[i]) !== undefined; i++) {
                // Remove all eventListeners
                hAzzle(elem).off();
            }
        },

        normalize = function(node, clone) {

            var i, l, ret;

            if (typeof node === 'string') {
                return create(node);
            }

            if (node instanceof hAzzle) {
                node = node.elements;
            }

            if (_types.isNode(node)) {
                node = [node];
            }

            if (clone) {
                ret = []; // don't change original array

                for (i = 0, l = node.length; i < l; i++) {
                    ret[i] = cloneElem(node[i], true);
                }
                return ret;
            }
            return node;
        },
        insertMethod = function(elem, content, method, state) {
            elem = getElem(elem);
            _util.each(normalize(content, state ? state : 0), function(relatedNode) {
                elem[method](relatedNode); // DOM Level 4
            });
        },
        // Internal method !!
        getElem = function(elem) {
            return elem instanceof hAzzle ? elem.elements[0] : elem;
        },
        //  Remove all child nodes of the set of matched elements from the DOM
        empty = function(elem) {
            elem = getElem(elem);
            // Do a 'deep each' and clear all listeners if any 
            deepEach(elem.children, clearData);
            while (elem.firstChild) {
                elem.removeChild(elem.firstChild);
            }
        },
        remove = function(elem) {
            elem = getElem(elem);
            deepEach(clearData);
            if (elem.parentElement) {
                elem.parentElement.removeChild(elem);
            }
        },
        replace = function(elem, html) {
            elem = getElem(elem);
            elem = elem.length ? elem : [elem];
            _util.each(elem, function(el, i) {
                _util.each(normalize(html, i), function(i) {
                    el.replace(i); // DOM Level 4
                });
            });
        };

    // insertAdjacentHTML method for append, prepend, before and after

    this.iAHMethod = function(method, html, fn) {
        return this.each(function(elem, index) {
            if (typeof html === 'string' &&
                _core.isHTML &&
                elem.parentElement && elem.parentElement.nodeType === 1) {
                elem.insertAdjacentHTML(method, html.replace(_htmlTag, '<$1></$2>'));
            } else {
                fn(elem, index);
            }
        });
    };

    this.domManip = function(content, fn, /*reverse */ rev) {

        var i = 0,
            r = [];

        // Nasty looking code, but this has to be fast

        var self = this.elements,
            elems, nodes;

        if (typeof content === 'string' &&
            content[0] === '<' &&
            content[content.length - 1] === '>' &&
            content.length >= 3) {
            nodes = content;

        } else {
            nodes = hAzzle(content);
        }

        // Start the iteration and loop through the content

        _util.each(normalize(nodes), function(elem, index) {
            _util.each(self, function(el) {
                elems = index > 0 ? el.cloneNode(true) : el;
                if (elem) {
                    fn(elem, elems);
                }
            }, null, rev);

        }, this, rev);
        self.length = i;
        _util.each(r, function(e) {
            self[--i] = e;
        }, null, !rev);
        return self;
    };

    this.appendTo = function(content) {
        return this.domManip(content, function(element, node) {
            element.appendChild(node);
        });
    };

    this.prependTo = function(content) {
        return this.domManip(content, function(element, node) {
            element.insertBefore(node, element.firstChild);
        });
    };

    this.insertBefore = function(content) {
        return this.domManip(content, function(element, node) {
            element.parentNode.insertBefore(node, element);
        });
    };

    this.insertAfter = function(content) {
        return this.domManip(content, function(element, node) {
            var sibling = element.nextSibling;
            sibling ?
                element.parentNode.insertBefore(node, sibling) :
                element.parentNode.appendChild(node);
        }, 1);
    };

    // Same as 'ReplaceWith' in jQuery

    this.replaceWith = function(html) {
        return replace(this.elements, html);
    };

    // Text

    this.text = function(value) {
        return value === undefined ?
            _text.getText(this.elements) :
            this.empty().each(function(elem) {
                if (elem.nodeType === 1 ||
                    elem.nodeType === 11 ||
                    elem.nodeType === 9) {
                    elem.textContent = value;
                }
            });
    };

    // HTML

    this.html = function(value) {

        var els = this.elements,
            elem = els[0],
            i = 0,
            l = this.length;

        if (value === undefined && els[0].nodeType === 1) {
            return els[0].innerHTML;
        }
        // See if we can take a shortcut and just use innerHTML

        if (typeof value === 'string' && !_scriptStyle.test(value) &&
            !tagMap[(_tagName.exec(value) || ['', ''])[1].toLowerCase()]) {

            value = value.replace(_htmlTag, '<$1></$2>'); // DOM Level 4

            try {

                for (; i < l; i++) {

                    elem = els[i] || {};

                    // Remove element nodes and prevent memory leaks
                    if (elem.nodeType === 1) {
                        clearData(grab(elem, false));
                        elem.innerHTML = value;
                    }
                }

                elem = 0;

                // If using innerHTML throws an exception, use the fallback method
            } catch (e) {}
        }

        if (elem) {
            return this.empty().append(value);
        }
    };

    this.deepEach = function(fn, scope) {
        return deepEach(this.elements, fn, scope);
    };

    this.detach = function() {
        return this.each(function(elem) {
            if (elem.parentElement) {
                elem.parentElement.removeChild(elem);
            }
        });
    };

    this.empty = function() {
        return this.each(function(elem) {
            empty(elem);
        });
    };

    this.remove = function() {
        this.deepEach(clearData);
        return this.detach();
    };

    // Creates a copy of a DOM element, and returns the clone.

    this.clone = function( /*bool:true - event cloning*/ deep, evtName) {

        // Better performance with a 'normal' for-loop then
        // map() or each()       
        var elems = this.elements,
            ret = [],
            i = 0,
            l = this.length;

        for (; i < l; i++) {
            ret[i] = cloneElem(elems[i], deep, evtName);
        }
        return hAzzle(ret);
    };

    _util.each({

        // Insert content, specified by the parameter, to the end of 
        // each element in the set of matched elements.

        append: 'beforeend',

        // Insert content, specified by the parameter, to the beginning 
        // of each element in the set of matched elements.

        prepend: 'afterbegin',

        // Insert content, specified by the parameter, before each 
        // element in the set of matched elements.

        before: 'beforebegin',

        // Insert content, specified by the parameter, after each element 
        // in the set of matched elements.  

        after: 'afterend'

    }, function(iah, prop) {
        this[prop] = function(content) {
            return this.iAHMethod(iah, content, function(elem, state) {
                var nodeType = elem ? elem.nodeType : undefined;
                if (nodeType && (nodeType === 1 || nodeType === 11 || nodeType === 9)) {
                    insertMethod(elem, content, prop, state);
                }
            });
        };

    }.bind(this));

    return {
        clearData: clearData,
        create: create,
        createHTML: createHTML,
        clone: cloneElem,
        insert: insertMethod,
        replace: replace,
        empty: empty,
        remove: remove
    };
});
