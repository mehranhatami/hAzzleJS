// queue.js		
hAzzle.extend({

	queue: function( elem, type, data ) {
		var q;
		
		if ( elem ) {

			type = ( type || "fx" ) + "queue";
			q = hAzzle.data( elem, type );
			

			
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || hAzzle.isArray(data) ) {

					q = hAzzle.data( elem, type, hAzzle.mergeArray(data) );
				} else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	dequeue: function( elem, type ){
	type = type || "fx";

		var queue = hAzzle.queue( elem, type ),
			fn = queue.shift(),
			hooks = {};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			hAzzle.data( elem, type + ".run", hooks );
			fn.call( elem, function() {
				hAzzle.dequeue( elem, type );
			}, hooks );
		}

		if ( !queue.length ) {
			hAzzle.removeData( elem, type + "queue " + type + ".run", true );

		}
	}
	}, hAzzle)
	
	

	
hAzzle.extend({


 queue: function(type, data){
var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return hAzzle.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = hAzzle.queue( this, type, data );

//				if ( type === "fx" && queue[0] !== "inprogress" ) {
					hAzzle.dequeue( this, type );
	//			}
			});
	},
	dequeue: function(type){
		return this.each(function() {
			hAzzle.dequeue( this, type );
		});
	},

	// Based off of the plugin by Clint Helfers, with permission.
	// http://blindsignals.com/index.php/2009/07/hAzzle-delay/
	delay: function( time, type ) {
		time = hAzzle.fx ? hAzzle.fx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				hAzzle.dequeue( elem, type );
			}, time );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
});