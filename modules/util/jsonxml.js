// jsonxml.js
hAzzle.define('Jsonxml', function() {

    // Parse JSON    

    var parseJSON = function(data) {
            return typeof data === 'string' ?
                JSON.parse(data + '') :
                data;
        },

        // Parse XML

        parseXML = function(data) {

            var xml, tmp;

            // If no string, return null 

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
               hAzzle.err(true, 8, 'Invalid XML: "' + data + '"');
            }
            return xml;
        };
        
    return {
        parseJSON: parseJSON,
        parseXML: parseXML
    };
});