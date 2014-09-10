hAzzle.extend({

 queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || 'fx' ) + 'queue';
			queue = hAzzle.private( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || hAzzle.isArray( data ) ) {
					queue = hAzzle.private( elem, type, hAzzle.mergeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || 'fx';

		var queue = hAzzle.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = hAzzle._queueHooks( elem, type ),
			next = function() {
				hAzzle.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === 'inprogress' ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === 'fx' ) {
				queue.unshift( 'inprogress' );
			}

			// Clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// Not public - generate a queueHooks object, or return the current one
	_queueHooks: function( elem, type ) {
		var key = type + 'queueHooks';
		return hAzzle.private( elem, key ) || hAzzle.private( elem, key, {
			empty: hAzzle.Signals('once memory').add(function() {
				hAzzle.private( elem, [ type + 'queue', key ] );
			})
		});
	}

}, hAzzle);

hAzzle.extend({
  queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== 'string' ) {
			data = type;
			type = 'fx';
			setter--;
		}

		if ( arguments.length < setter ) {
			return hAzzle.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = hAzzle.queue( this, type, data );

				// Ensure a hooks for this queue
				hAzzle._queueHooks( this, type );

				if ( type === 'fx' && queue[0] !== 'inprogress' ) {
					hAzzle.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			hAzzle.dequeue( this, type );
		});
	},
	
	delay: function( time, type ) {
		time = hAzzle.fx ? hAzzle.fx.speeds[ time ] || time : time;
		type = type || 'fx';

		return this.queue( type, function( next, hooks ) {
			var timeout = setTimeout( next, time );
			hooks.stop = function() {
				clearTimeout( timeout );
			};
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || 'fx', [] );
	},

    promise: function(type, obj) {

        var tmp,
            count = 1,
            defer = hAzzle.Promises(),
            elements = this,
            i = this.length,
            resolve = function() {
                if (!(--count)) {
                    defer.resolveWith(elements, [elements]);
                }
            };

        if (typeof type !== 'string') {
            obj = type;
            type = undefined;
        }
        type = type || 'fx';

        while (i--) {
            tmp = hAzzle.getPrivate(elements[i], type + 'queueHooks');
            if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
            }
        }
        resolve();
        return defer.promise(obj);
    }
});