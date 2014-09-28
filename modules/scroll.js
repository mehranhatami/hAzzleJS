// scroll.js

hAzzle.each( { scrollLeft: 'pageXOffset', scrollTop: 'pageYOffset' }, function( prop, method ) {
	var top = 'pageYOffset' === prop;

	hAzzle.Core[ method ] = function( val ) {
		return setter( this, function( elem, method, val ) {
			var win = hAzzle.isWindow( elem ) ? 
                      elem : elem.nodeType === 9 && elem.defaultView;

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});