function stdAttach( object, fnDone, fnFail, fnProgress ) {
	return object &&
		(
			hAzzle.isFunction( object.promise ) ?
				object.promise()
					.done( fnDone )
					.fail( fnFail )
					.progress( fnProgress ) :
				hAzzle.isFunction( object.then ) && object.then( fnDone, fnFail )
		);
}

function stdCallback( defer, callback ) {
	return hAzzle.isFunction( callback ) && function( value ) {
		setTimeout(function() {
			var returned;
			try {
				returned = callback( value );
			} catch ( e ) {
				return defer.reject( e );
			}
			if (
				!stdAttach(
					returned,
					defer.resolve,
					defer.reject,
					defer.notify
				)
			) {
				defer.resolve( returned );
			}
		});
	};
}

hAzzle.extend({

	Promises: function( func ) {
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
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( fnDone, fnFail ) {
					return hAzzle.Promises(function( newDefer ) {
						deferred
							.done( stdCallback( newDefer, fnDone ) )
							.fail( stdCallback( newDefer, fnFail ) );
					}).promise();
				},
				catch: function( fnFail ) {
					return promise.then( null, fnFail );
				},
				pipe: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return hAzzle.Promises(function( newDefer ) {
						hAzzle.each( tuples, function( tuple, i ) {
							var fn = hAzzle.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( !stdAttach(
										returned,
										newDefer.resolve,
										newDefer.reject,
										newDefer.notify
									)
								) {
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
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? hAzzle.shallowCopy( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Add list-specific methods
		hAzzle.each( tuples, function( tuple, i ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + 'With' ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + 'With' ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Promises helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && hAzzle.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Promises.
			// If resolveValues consist of only a single Promises, just use that.
			deferred = remaining === 1 ? subordinate : hAzzle.Promises(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// Add listeners to Promises subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if (
					!stdAttach(
						resolveValues[ i ],
						updateFunc( i, resolveContexts, resolveValues ),
						deferred.reject,
						updateFunc( i, progressContexts, progressValues )
					)
				) {
					--remaining;
				}
			}
		}

		// If we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
}, hAzzle);