// detection.js
var i, ua = navigator.userAgent,
    Detection = {
        Mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        Android: /Android/i.test(ua),
        Opera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        Firefox: typeof InstallTrigger !== 'undefined', // Firefox
        Chrome: window.chrome,
        Safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        IE: false || !!document.documentMode, // IE
        Webkit: 'WebkitAppearance' in document.documentElement.style,
    }

// Expose
hAzzle.each(Detection, function(bool, name) {
    hAzzle['is' + name] = bool;
});