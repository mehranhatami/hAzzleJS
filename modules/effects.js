





var cssExpand = [ "Top", "Right", "Bottom", "Left" ];



function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}


// Generate shortcuts for custom animations
hAzzle.each({
	slideDown: genFx( "show"),
	slideUp: genFx( "hide"),
	slideToggle: genFx( "toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( props, name ) {
	hAzzle.Core[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});