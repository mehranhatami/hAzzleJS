// has.js
hAzzle.define('has', function () {

 var 
     ua = navigator.userAgent,

        // Special detection for IE, because we got a lot of trouble
        // with it. Damn IE!!

        ie = (function () {

            if (document.documentMode) {
                return document.documentMode;
            } else {
                for (var i = 7; i > 4; i--) {
                    var div = document.createElement('div');

                    div.innerHTML = '<!--[if IE ' + i + ']><span></span><![endif]-->';

                    if (div.getElementsByTagName('span').length) {
                        div = null;

                        return i;
                    }
                }
            }

            return undefined;
        })(),
 
 
    isBrowser =
    // the most fundamental decision: are we in the browser?
    typeof window !== 'undefined' &&
    typeof location !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.location === location &&
    window.document === document,
    doc = isBrowser && document,
    element = doc && doc.createElement('DiV'),
    hasCache = {},
 
    has = function(name) {
        return typeof hasCache[name] === 'function' ?
            (hasCache[name] = hasCache[name](window, doc, element)) :
            hasCache[name]; // Boolean
    },

    add = function(name, test, now, force) {
        (typeof hasCache[name] == 'undefined' || force) && (hasCache[name] = test);
        return now && has(name);
    },
    clearElement = function(element) {
        if (element) {
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
        }
        return element;
    };

 // XPath

 add('xpath', function() {
    return !!(document.evaluate);
 });

 // Air 
 
 add('air', function() {
    return !!(window.runtime);
 });
 
 // mobile
 
 add('mobile', function() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
 });

 // android
 
 add('android', function() {
    return /Android/i.test(ua);
 });

 // opera
 add('opera', function() {
    return !!window.opera || ua.indexOf(' OPR/') >= 0;
 });


 // Firefox
 add('firefox', function() {
    return typeof InstallTrigger !== 'undefined';
 });

 // Chrome
 add('chrome', function() {
    return window.chrome;
 });

 // Webkit
 add('webkit', function() {
    return 'WebkitAppearance' in document.documentElement.style;
 });

 // Safari
 add('safari', function() {
    return Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
 });

 // Safari
 add('ie', function() {
    return false || !!document.documentMode;
 });
alert(has('firefox'))
return {
     has:has,
     add:add,
     clearElement:clearElement,
     ie:ie
     };
});