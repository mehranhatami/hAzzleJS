// detection.js
hAzzle.define('Detection', function () {

    var ua = navigator.userAgent,

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
        })();

    return {

        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
        isAndroid: /Android/i.test(ua),
        isOpera: !!window.opera || ua.indexOf(' OPR/') >= 0,
        isFirefox: typeof InstallTrigger !== 'undefined', // Firefox
        isChrome: window.chrome,
        isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        isIE: false || !!document.documentMode, // IE
        isWebkit: 'WebkitAppearance' in document.documentElement.style,
        ie: ie

    };
});