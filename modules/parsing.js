// Parsing
hAzzle.extend({

    /**
     * Cross-browser JSON parsing
     *
     * @param {String} data
     */

    parseJSON: function (data) {
        return JSON.parse(data + "");
    },

    parseXML: function (data) {
        var xml, tmp;
        if (!data || typeof data !== "string") {
            return null;
        }

        // Support: IE9
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
        } catch (e) {
            xml = undefined;
        }

        if (!xml || xml.getElementsByTagName("parsererror").length) {
            return new Error("Invalid XML: " + data);
        }
        return xml;
    }

});