/*!
 * Browser
 */
; (function ($) {

    var nav = navigator,
	    ua = nav.userAgent,
        t = true,
        iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase(),
        likeAndroid = /like android/i.test(ua),
        android = !likeAndroid && /android/i.test(ua),
        versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
        tablet = /tablet/i.test(ua),
        mobile = !tablet && /[^-]mobi/i.test(ua),
        result,

     // Browser regEx	

        pShort = /phantom/i,
        blackbShort = /blackberry|\bbb\d+/i,
        operaShort = /opera|opr/i,
        chromeShort = /chrome|crios|crmo/i,
        ieShort = /msie|trident/i,
        sailfishShort = /sailfish/i,
        seamonkeyShort = /seamonkey\//i,
        ffShort = /firefox|iceweasel/i,
        webOsShort = /(web|hpw)os/i,
        silkShort = /silk/i,
        safariShort = /safari/i,
        seamokeyShort = /seamonkey\//i,
        badaShort = /bada/i,
        tizenShort = /tizen/i,
        geckoShort = /gecko\//i,
        ffMobTab = /\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i,
        opera = /(?:opera|opr)[\s\/](\d+(\.\d+)?)/i,
        chrome = /(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i,
        Firefox = /(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i,
        msie = /(?:msie |rv:)(\d+(\.\d+)?)/i,
        iemobile = /iemobile\/(\d+(\.\d+)?)/i,
        winPhone = /windows phone/i,
        sailfish = /sailfish\s?browser\/(\d+(\.\d+)?)/i,
        seamonkey = /seamonkey\/(\d+(\.\d+)?)/i,
        phantom = /phantomjs\/(\d+(\.\d+)?)/i,
        BlackBerry = /blackberry[\d]+\/(\d+(\.\d+)?)/i,
        osBrowser = /w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i,
        bada = /dolfin\/(\d+(\.\d+)?)/i,
        tizen = /(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i,
        appleWebkit = /(apple)?webkit/i,
        gecko = /gecko\/(\d+(\.\d+)?)/i,
        touchPad = /touchpad\//i,
        silk = /silk\/(\d+(\.\d+)?)/i;

    function getFirstMatch(regex) {
        var match = ua.match(regex);
        return (match && match.length > 1 && match[1]) || '';
    }


hAzzle.extend ({
    browser: function () {
        operaShort.test(ua) ? result = {
            name: "Opera",
            opera: t,
            version: versionIdentifier || getFirstMatch(opera)
        } : winPhone.test(ua) ? result = {
            name: "Windows Phone",
            windowsphone: t,
            msie: t,
            version: getFirstMatch(iemobile)
        } : ieShort.test(ua) ? result = {
            name: "Internet Explorer",
            msie: t,
            version: getFirstMatch(msie)
        } : chromeShort.test(ua) ? result = {
            name: "Chrome",
            chrome: t,
            version: getFirstMatch(chrome)
        } : iosdevice ? (result = {
            name: "iphone" == iosdevice ? "iPhone" : "ipad" == iosdevice ? "iPad" : "iPod"
        }, versionIdentifier && (result.version = versionIdentifier)) : sailfishShort.test(ua) ? result = {
            name: "Sailfish",
            sailfish: t,
            version: getFirstMatch(sailfish)
        } : seamokeyShort.test(ua) ? result = {
            name: "SeaMonkey",
            seamonkey: t,
            version: getFirstMatch(seamonkey)
        } : ffShort.test(ua) ? (result = {
            name: "Firefox",
            firefox: t,
            version: getFirstMatch(Firefox)
        }, ffMobTab.test(ua) && (result.firefoxos = t)) : silkShort.test(ua) ? result = {
            name: "Amazon Silk",
            silk: t,
            version: getFirstMatch(silk)
        } : android ? result = {
            name: "Android",
            version: versionIdentifier
        } : pShort.test(ua) ? result = {
            name: "PhantomJS",
            phantom: t,
            version: getFirstMatch(phantom)
        } : blackbShort.test(ua) || /rim\stablet/i.test(ua) ? result = {
            name: "BlackBerry",
            blackberry: t,
            version: versionIdentifier || getFirstMatch(BlackBerry)
        } : webOsShort.test(ua) ? (result = {
                name: "WebOS",
                webos: t,
                version: versionIdentifier || getFirstMatch(osBrowser)
            }, touchPad.test(ua) &&
            (result.touchpad = t)) : result = badaShort.test(ua) ? {
            name: "Bada",
            bada: t,
            version: getFirstMatch(bada)
        } : tizenShort.test(ua) ? {
            name: "Tizen",
            tizen: t,
            version: getFirstMatch(tizen) || versionIdentifier
        } : safariShort.test(ua) ? {
            name: "Safari",
            safari: t,
            version: versionIdentifier
        } : {};

        // set webkit or gecko flag for browsers based on these engines
        if (appleWebkit.test(ua)) {
            result.name = result.name || "Webkit";
            result.webkit = t;
            if (!result.version && versionIdentifier) {
                result.version = versionIdentifier;
            }
        } else if (!result.opera && geckoShort.test(ua)) {
            result.name = result.name || "Gecko";
            result.gecko = t;
            result.version = result.version || getFirstMatch(gecko);
        }

        // set OS flags for platforms that have multiple browsers
        if (android || result.silk) {
            result.android = t;
        } else if (iosdevice) {
            result[iosdevice] = t;
            result.ios = t;
        }

        // OS version extraction
        var osVersion = '';
        if (iosdevice) {
            osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
            osVersion = osVersion.replace(/[_\s]/g, '.');
        } else if (android) {
            osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
        } else if (result.windowsphone) {
            osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
        } else if (result.webos) {
            osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
        } else if (result.blackberry) {
            osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
        } else if (result.bada) {
            osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
        } else if (result.tizen) {
            osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
        }
        if (osVersion) {
            result.osversion = osVersion;
        }

        // device type extraction
        var osMajorVersion = osVersion.split('.')[0];
        if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
            result.tablet = t;
        } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
            result.mobile = t;
        }

        // Graded Browser Support
        // http://developer.yahoo.com/yui/articles/gbs
        if ((result.msie && result.version >= 9) ||
            (result.chrome && result.version >= 20) ||
            (result.firefox && result.version >= 10.0) ||
            (result.safari && result.version >= 5) ||
            (result.opera && result.version >= 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] >= 6)
        ) {
            result.a = t;
        } else if ((result.msie && result.version < 9) ||
            (result.chrome && result.version < 20) ||
            (result.firefox && result.version < 10.0) ||
            (result.safari && result.version < 5) ||
            (result.opera && result.version < 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
            result.c = t;
        } else result.x = t;

        return result;
    }	
})

})(hAzzle);