var i, ua = navigator.userAgent, Detection = {

    mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
    android: /Android/i.test(navigator.userAgent),

    // Feature detection

    opera: !!window.opera || ua.indexOf(' OPR/') >= 0,
    Firefox: typeof InstallTrigger !== 'undefined', // Firefox
    Chrome: !!window.chrome && !isOpera, // Chrome 1+
    Safari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
    IE: false || !!document.documentMode // IE
}

// Expose

for (i in Detection) {
    hAzzle['is' + i] = Detection[i]
}