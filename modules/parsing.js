// Parsing
hAzzle.extend({

    /**
     * Cross-browser JSON parsing
     *
     * @param {String} data
     */

    parseJSON: function (data) {
        return JSON.parse(data + '');
    },

    parseXML: function (data) {
        var xml, tmp;

        if (!data || typeof data !== 'string') {

            return null;
        }

        // Support: IE9
        try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, 'text/xml');
        } catch (e) {
            xml = undefined;
        }

        if (!xml || xml.getElementsByTagName('parsererror').length) {
            return new Error('Invalid XML: ' + data);
        }
        return xml;
    }

}, hAzzle);

hAzzle.extend({


    /**
     * Submits a form as an XML string
     */
    form2xml: function () {
        var formname = this.name || 'form',
            xml = '',
            a = this.serializeArray();
        hAzzle.each(a, function () {
            var elt = this.name.replace(/\[\]/g, ''),
                node = this.value || '';
            xml += '<' + elt + '>' + encodeURIComponent(node) + '</' + elt + '>';
        });
        return '<' + formname + '>' + xml + '</' + formname + '>';
    }


});