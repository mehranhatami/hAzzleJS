// csshooks.js
hAzzle.define('cssHooks', function() {

    var _util = hAzzle.require('Util'),
        _detection = hAzzle.require('Detection'),
        _style = hAzzle.require('Style'),
        _types = hAzzle.require('Types'),
        _ccs = hAzzle.require('curCSS');

    // Fixes Chrome bug / issue

    if (_detection.isChrome) {
        _style.cssHooks.textDecoration = {
            get: function(elem, computed) {
                if (computed) {

                    //Chrome 31-36 return text-decoration-line and text-decoration-color
                    //which are not expected yet.
                    //see https://code.google.com/p/chromium/issues/detail?id=342126
                    var ret = _ccs.curCSS(elem, 'text-decoration');
                    //We cannot assume the first word as 'text-decoration-style'
                    if (/\b(inherit|(?:und|ov)erline|blink|line\-through|none)\b/.test(ret)) {
                        return RegExp.$1;
                    }
                }
            }
        };
    }

    if (_detection.opera) {
        _style.cssHooks.get.textShadow = function(elem) {
            var val = _ccs.curCSS(elem, 'textShadow');
            if (val && val !== 'none') {
                return val.replace(/(.+)(rgb.+)/, '$2' + ' $1');
            }
        };
    }

    _util.each({

        padding: 'paddingTop paddingRight paddingBottom paddingLeft',
        margin: 'marginTop marginRight marginBottom marginLeft',
        borderWidth: 'borderTopWidth borderRightWidth borderBottomWidth borderLeftWidth',
        borderColor: 'borderTopColor borderRightColor borderBottomColor borderLeftColor',
        borderRadius: 'borderTopLeftRadius borderTopRightRadius borderBottomRightRadius borderBottomLeftRadius'

    }, function(vals, name) {
        vals = vals.split(' ');
        _style.cssHooks.get[name] = function(elem) {
            return _ccs.curCSS(elem, vals[0]) + ' ' +
                _ccs.curCSS(elem, vals[1]) + ' ' +
                _ccs.curCSS(elem, vals[2]) + ' ' +
                _ccs.curCSS(elem, vals[3]);
        };
    });
    
       // Getter    
    _util.extend(_style.cssHooks.get, {
        'opacity': function(elem, computed) {
            if (computed) {
                // We should always get a number back from opacity
                var ret = _ccs.curCSS(elem, 'opacity');
                return ret === '' ? '1' : ret;
            }
        },
        'zIndex': function( elem ){
        var val = _ccs.curCSS( elem, 'zIndex' );
        return val === 'auto' ? 0 : val;
    },
    'height': function(elem) {

       var docElem;
            
            if( !elem ){
                return;
            }
            
            if( _types.isWindow(elem) ){
                return elem.document.documentElement.clientHeight;
            }
    
            if( elem.nodeType === 9 ){      
                docElem = elem.documentElement;
                return Math.max( docElem.scrollHeight, docElem.clientHeight ) ;
            }
            
            return _style.swap( elem, function(){
                return _ccs.curCSS( elem, 'height' );
            });
     },
    'width': function(elem) {

       var docElem;
            
            if( !elem ){
                return;
            }
            
            if( _types.isWindow(elem) ){
                return elem.document.documentElement.clientWidth;
            }
    
            if( elem.nodeType === 9 ){      
                docElem = elem.documentElement;
                return Math.max( docElem.scrollWidth, docElem.clientWidth ) ;
            }
            
            return _style.swap( elem, function(){
                return _ccs.curCSS( elem, 'Width' );
            });
     },
    });

    return {};
});