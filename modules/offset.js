//  offset.js
hAzzle.Core.offset = function(options) {
       if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					setOffset( this, options, i );
				});
		}
    
    var elem = this[0];
    
    if (!elem || 
      // Make sure it's not a disconnected DOM node 
      !hAzzle.contains(document.documentElement, elem)) {
    
    return {
        top: 0,
        left: 0,
        height: 0,
        width: 0
    };
}
    var de = elem.ownerDocument.documentElement,
        bcr = elem.getBoundingClientRect(),
        scroll = getWindowScroll();

    return {
        top:  bcr.top + scroll.y - Math.max(0, de && de.clientTop, document.body.clientTop),
        left: bcr.left + scroll.x - Math.max(0, de && de.clientLeft, document.body.clientLeft),
        height: elem.offsetHeight,
        width: elem.offsetWidth
    };
};


function getWindowScroll() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

 function setOffset( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = curCSS( elem, "position" ),
			curElem = hAzzle( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = curCSS( elem, "top" );
		curCSSLeft = curCSS( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either
		// top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( hAzzle.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}