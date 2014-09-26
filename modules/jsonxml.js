// jsonxml.js
// Parse JSON
hAzzle.parseJSON = function(data) {
    return JSON.parse( data + '' );
};

// Parse XML

hAzzle.parseXML = function(data) {

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

        return hAzzle.error('Invalid XML: ' + data);
    }
    return xml;
};