// has.js- feature detection
hAzzle.define('has', function() {

    var
        ua = navigator.userAgent,
        win = window,
        doc = win.document,
        element = doc && doc.createElement('div'),
        hasCache = {},

        // IE feature detection
        // Props: Velocity.js 
        ie = (function() {

            if (doc.documentMode) {
                return doc.documentMode;
            } else {
                for (var i = 7; i > 4; i--) {
                    var div = doc.createElement('div');

                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        div = null;

                        return i;
                    }
                }
            }

            return undefined;
        })(),
        // Return the current value of the named feature
        has = function(name) {
               if(typeof hasCache[name] == 'function'){
            hasCache[name] = hasCache[name](win, doc, element);
        }
        return hasCache[name]; // Boolean
        },
        // Register a new feature test for some named feature.
        add = function(name, test, now) {
           hasCache[name] = now ? test(win, doc, element) : test; 
        },
        // Deletes the contents of the element passed to test functions.
        clearElement = function(elem) {
            if (elem) {
                while (elem.lastChild) {
                    elem.removeChild(elem.lastChild);
                }
            }
            return elem;
        };

    // XPath

    add('xpath', function() {
        return !!(doc.evaluate);
    });

    // Air 

    add('air', function() {
        return !!(win.runtime);
    });

    // Detects native support for the Dart programming language

    add('dart', function() {
        return !!(win.startDart || doc.startDart);
    });

    // Detects native support for promises

    add('promise', function() {
        return !!(win.Promise);
    });

    // mobile

    add('mobile', function() {
        return /^Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    });

    // android

    add('android', function() {
        return /^Android/i.test(ua);
    });

    // opera
    add('opera', function() {
        return !!win.opera || ua.indexOf(' OPR/') >= 0;
    });


    // Firefox
    add('firefox', function() {
        return typeof InstallTrigger !== 'undefined';
    });

    // Chrome
    add('chrome', function() {
        return win.chrome;
    });

    // Webkit
    add('webkit', function() {
        return 'WebkitAppearance' in doc.documentElement.style;
    });

    // Safari
    add('safari', function() {
        return Object.prototype.toString.call(win.HTMLElement).indexOf('Constructor') > 0;
    });

    // Safari
    add('ie', function() {
        return false || !!doc.documentMode;
    });

    // Touch support

    add('touch', function() {
        return 'ontouchstart' in document ||
            ('onpointerdown' in document && navigator.maxTouchPoints > 0) ||
            window.navigator.msMaxTouchPoints;
    });

    // Touch events 

    add('touchEvents', function() {
        return 'ontouchstart' in document;
    });

    // Pointer Events

    add('pointerEvents', function() {
        return 'onpointerdown' in document;
    });

    add('MSPointer', function() {
        return 'msMaxTouchPoints' in navigator; //IE10+
    });

    return {
        has: has,
        add: add,
        clearElement: clearElement,
        ie: ie
    };
});