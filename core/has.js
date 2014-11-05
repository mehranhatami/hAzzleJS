// has.js
hAzzle.define('has', function() {

    var
        ua = navigator.userAgent,
        win = window,
        doc = win.document,
        element = doc.createElement('div'),
        oString = Object.prototype.toString,
        cache = {},

        // IE feature detection
        ie = (function() {

            if (doc.documentMode) {
                return doc.documentMode;
            } else {
                var i = 7,
                    div;
                for (; i > 4; i--) {

                    div = doc.createElement('div');

                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        div = null; // Release memory in IE
                        return i;
                    }
                }
            }

            return undefined;
        })(),
        // Return the current value of the named feature
        has = function(name) {
            return typeof cache[name] === 'function' ? (cache[name] = cache[name](win, doc, element)) : cache[name];
        },
        // Register a new feature test for some named feature
        add = function(name, test, now, force) {
            (typeof cache[name] === 'undefined' || force) && (cache[name] = test);
            return now && has(name);
        },
        // Conditional loading of AMD modules based on a has feature test value.
        load = function(id, parentRequire, loaded) {
            if (id) {
                parentRequire([id], loaded);
            } else {
                loaded();
            }
        },
        // Delete the content of the element passed to test functions.
        clear = function(elem) {
            elem.innerHTML = '';
            return elem;
        };

    // Detect if the classList API supports multiple arguments
    // IE11-- don't support it

    add('multiArgs', function() {
        var mu, div = document.createElement('div');
        div.classList.add('a', 'b');
        mu = /(^| )a( |$)/.test(div.className) && /(^| )b( |$)/.test(div.className);
        // release memory in IE
        div = null;
        return mu;
    });

    // XPath

    add('xpath', !!doc.evaluate);

    // Air 

    add('air', !!win.runtime);

    // Detects native support for the Dart programming language

    add('dart', !!(win.startDart || doc.startDart));

    // Detects native support for promises

    add('promise', !!win.Promise);

    // mobile

    add('mobile', /^Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua));

    // android

    add('android', /^Android/i.test(ua));

    // opera
    add('opera', 
        // Opera 8.x+ can be detected with `window.opera`
        // This is a safer inference than plain boolean type conversion of `window.opera`
        // But note that the newer Opera versions (15.x+) are using the webkit engine
        oString.call(window.opera) === '[object Opera]'
    );

    // Firefox
    add('firefox', typeof InstallTrigger !== 'undefined');

    // Chrome
    add('chrome', win.chrome);

    // Webkit
    add('webkit', 'WebkitAppearance' in doc.documentElement.style);

    // Safari
    add('safari', oString.call(window.HTMLElement).indexOf('Constructor') > 0);

    // Safari
    add('ie', function() {
        return false || !!doc.documentMode;
    });

    // Touch support

    add('touch', 'ontouchstart' in document ||
            ('onpointerdown' in document && navigator.maxTouchPoints > 0) ||
            window.navigator.msMaxTouchPoints);

    // Touch events 

    add('touchEvents', 'ontouchstart' in document);

    // Pointer Events

    add('pointerEvents', 'onpointerdown' in document);

    add('MSPointer', 'msMaxTouchPoints' in navigator); //IE10+

    // querySelectorAll
    add('qsa', !!document.querySelectorAll);

    // ClassList
    add('classlist', !!document.documentElement.classList);

    return {
        has: has,
        add: add,
        load: load,
        cache: cache,
        clear: clear,
        ie: ie
    };
});