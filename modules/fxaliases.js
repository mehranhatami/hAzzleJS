// fxaliases.js

hAzzle.extend({

    animate: function(to, settings) {
        return this.each(function() {
            hAzzle.fx(this, to, settings);
        });
    },

    // CSS Transform	 

    transform: function(to, settings, fallback) {
        return this.each(function() {
            hAzzle.transform(this, to, settings, fallback);
        });
    },

    // Percentage animation	 

    percentage: function(to, settings) {

        return this.each(function() {
            hAzzle.percentage(this, to, settings);
        });
    },

	// Stop
    
	stop: function(jumpToEnd) {
	    return this.each(function() {
		hAzzle.stop(this, jumpToEnd);
     });
    }
});