// detection.js
var i, ua = navigator.userAgent,
    Detection = {

        Mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        Android: /Android/i.test(ua),

        // Feature detection

        Opera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        Firefox: typeof InstallTrigger !== 'undefined', // Firefox
        Chrome: window.chrome,
        Safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        IE: false || !!document.documentMode, // IE
        // Webkit detection
        Webkit: 'WebkitAppearance' in document.documentElement.style,
    }, // Feature support
    fSupport = {
        // Xpath
        Xpath: !!(document.evaluate),
        Air: !!(window.runtime)
    }

// Expose
hAzzle.each(Detection, function(bool, name) {
    hAzzle['is' + name] = bool;
});
// Example: hAzzle.supportXpath or hAzzle.supportAir
hAzzle.each(fSupport, function(bool, name) {
    hAzzle['support' + name] = bool;
});