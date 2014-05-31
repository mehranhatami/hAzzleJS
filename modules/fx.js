/**
 * hAzzle CSS animation engine hAzzle Animation Core engine ( hACE )
 *
 * Note! Need hACE!
 *
 */


hAzzle.extend({
	
	fadeIn: function(){
		
	return this.each(function(el) {
		
		
		new hAzzle.hACE()
                    .from(0)
					.to(1)
					.duration(1400)
					.ease(hAzzle.easing.easeOutBounce)
					.step(function(val) {
						hAzzle(el).css('opacity', val);
					})
					.start();
		
		
	});
	},
	
	fadeOut: function(){
	return this.each(function(el) {
		

		new hAzzle.hACE()
                    .from(1)
					.to(0)
					.duration(1400)
					.ease(hAzzle.easing.easeOutBounce)
					.step(function(val) {

						hAzzle(el).css('opacity', val);
					})
					.start();
		
		
	});
	
	}
	
	
	}) 