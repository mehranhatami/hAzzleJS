// promises.js

hAzzle.Promises = function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ 'resolve', 'done', hAzzle.Signals('once memory'), 'resolved' ],
				[ 'reject', 'fail', hAzzle.Signals('once memory'), 'rejected' ],
				[ 'notify', 'progress', hAzzle.Signals('memory') ]
			],
			state = 'pending',
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					promised.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					
					return hAzzle.Promises(function( newDefer ) {
						hAzzle.each( tuples, function( tuple, i ) {
							var fn = hAzzle.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							promised[ tuple[1] ](function() {
								
								var returned = fn && fn.apply( this, arguments );
								if ( returned && hAzzle.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + 'With' ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this promised
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? hAzzle.shallowCopy( obj, promise ) : promise;
				}
			},
			promised = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods

     var list,
	     tuple, 
		 stateString,
         i = tuples.length;
	
       while(i--) {
         
		 tuple = tuples[i];
			
         list =  tuples[i][ 2 ];
         stateString =  tuples[i][ 3 ];

			promise[  tuples[i][1] ] = list.add;

			// Handle state

			if ( stateString ) {
				
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			promised[  tuples[i][0] ] = function() {
				
				promised[  tuples[i][0] + 'With' ]( this === promised ? promise : this, arguments );
				return this;
			};
			
			promised[  tuples[i][0] + 'With' ] = list.fireWith;
		}

		// Make the promised a promise
		
		promise.promise( promised );

		// Call given func if any
		
		if ( func ) {
			func.call( promised, promised );
		}

		// All done!
		return promised;
	};

	// Promise helper
    
	hAzzle.when = function( subordinate /* , ..., subordinateN */ ) {
		
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && hAzzle.isFunction( subordinate.promise ) ) ? length : 0,

			// the master promised.
			// If resolveValues consist of only a single promised, just use that.
			promised = remaining === 1 ? subordinate : hAzzle.Promises(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						promised.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						promised.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to promised subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && hAzzle.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( promised.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			promised.resolveWith( resolveContexts, resolveValues );
		}

		return promised.promise();
	}