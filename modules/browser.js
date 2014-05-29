/*!
 * Browser
 *
 * Mehran! I re-wrote this function because jshint say it's to complex
 *
 */
hAzzle.extend({

    browser: function () {

        // Return the result as an Object

        var ua = window.navigator.userAgent.toLowerCase(),
            browserParts = /(ie|rv|msie|trident|firefox|chrome|crios|crmo|safari|opera|opr|sailfish|seamonkey|iceweasel|silk|tizen)(?:.*version)?(?:[ \/])?([\w.]+)/.exec(ua),
            platform = /(mac|win|linux|freebsd|mobile|iphone|ipod|ipad|android|blackberry|j2me|webtv|cros|window phone)/.exec(ua)[1],
            mobile = false,
            desktop = false,
            tablet = false,
            webkit = false,
            browser = browserParts[1] || "",
            version = browserParts[2] || "0"; // version

        // Rename OSx

        if (platform === 'mac') {
            platform = 'osx';
        }

        // Adjust Safari version

        if (version === "safari") {

            version = version.substr(0, 1);
        }

        // Fix older Chrome and newer Chrome

        if (browser === "crios" || browser === "crmo") {

            browser = "chrome";
        }
        
		// Normalize name for Internet Explorer 11
        
		if (browser === "trident" || browser === "crmo") {
            browser = "msie";
        }

        // Mobile platforms

        if (platform === "android" ||
            platform === "ipad" ||
            platform === "iphone" ||
            platform === "windows phone") {
            mobile = true;
        }

        // Desktop platforms

        if (browser === "cros" ||
            browser === "mac" ||
            platform === "linux" ||
            platform === "win") {
            desktop = true;
        }

        // Tablet check

        if (browser === "firefox" || browser === "chrome") {
            if (/\((tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
                tablet = true;
            } else
            if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
                mobile = true;
            }
        }

        // Chrome, Opera 15+ and Safari are webkit based browsers
        if (browser === "chrome" || browser === "opr" || browser === "safari") {
            webkit = true;
        }

        // Avoid making Apple angry - normalize the name

        if (browser === "iphone") {
            browser = "iPhone";
        }

        if (browser === "ipad") {
            browser = "iPad";
        }

        if (browser === "ipod") {
            browser = "iPod";
        }

        return {
            // IE11 has a new token so we will assign it msie to avoid breaking changes
            browser: browser === "rv" ? "msie" : browser,
            version: version,
            platform: platform,
            mobile: mobile,
            desktop: desktop,
            webkit: webkit

        };
    }

}, hAzzle);