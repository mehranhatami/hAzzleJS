var i, ua = navigator.userAgent,
    Detection = {

        Mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        Android: /Android/i.test(ua),

        // Feature detection

        opera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        Firefox: typeof InstallTrigger !== 'undefined', // Firefox
        Chrome: !!window.chrome && !window.opera || ua.indexOf(' OPR/') >= 0, // Chrome 1+
        Safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        IE: false || !!document.documentMode // IE
    }

// Expose

for (i in Detection) {
    hAzzle['is' + i] = Detection[i]
}

// Get correct mobile / Tablet device

hAzzle.getMobile = function() {

    var agen = ua.toLowerCase();

    // Return if no mobile device

    if (!hAzzle.isMobile) {
        return null;
    }

    if (agent.indexOf('iphone') !== -1 || agent.indexOf('ipad') !== -1) {
        return 'ios';
    }

    if (agent.indexOf('android') !== -1 || agent.indexOf('applewebkit') !== -1) {
        return 'android';

    }

    if (agent.indexOf('msie') !== -1) {
        return 'winMobile';
    }

    return null;
}