var i, ua = navigator.userAgent,
    Detection = {

        Mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        Android: /Android/i.test(ua),

        // Feature detection

        Opera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        Firefox: typeof InstallTrigger !== 'undefined', // Firefox
        Chrome: !!window.chrome && !window.opera || ua.indexOf(' OPR/') >= 0, // Chrome 1+
        Safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        IE: false || !!document.documentMode // IE
    }

// Expose
hAzzle.each(Detection, function(bool, name) {
    hAzzle['is' + name] = bool;
});

