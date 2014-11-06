var inherits = require('util').inherits;
var ee = require('events').EventEmitter;

module.exports = Marx_db;


function Marx_db(storage) {
	////////////////////////////////////////////////////////////
	// :: string
	// storage is one of: object,
	// 'local', 'session', 'global', if missing Marx_db maintains an in-process object
	// ==> Marx_db instance
	// 
	// Wraps Storage in asynchroneous get and set methods 
	// Provides 'consumer' pubsub attach api method for Web Workers and callables 
	var self = this,
		_wsubs = {},
		_subs = {},
		Store;
	console.log("Marx_db initializing...")
	if ((function supports_html5_Store() {
		try {
			return 'Storage' in window && window['Storage'] !== null;
		} catch (e) {
			return false;
		}
	})()) {
		switch (storage) {
			case 'local':
				Store = window.localStorage;
				break;
			case 'session':
				Store = window.sessionStorage;
				break;
			case 'global':
				Store = window.globalStorage
				break;
			case 'object':
				Store = window['storage'] = {};
			default:
				throw new Error("Marx: unknown Storage type");
		}
	} else { // fail gracefully, but loudly
		console.log("Marx: WARNING!\
			\nNo " + Store + " support detected in browser,\ndefaulting to javascript object");
		Store = {};
	}
	// asynchroneous wrappers for get and set methods
	function get(collection, key, callback) {
		var nxt = _get.bind(null, collection, key, callback);
		return process.nextTick(nxt)
	}

	function set(collection, key, value, callback) {
		var nxt = _set.bind(null, collection, key, value, callback);
		return process.nextTick(nxt)
	}

	function _get(collection, key, callback) {
		var data = Store[_key(collection, key)];
		return callback(null, key, data)
	}

	function _set(collection, key, value, callback) {
		Store[_key(collection, key)] = value;
		return callback(null, key, value);
	}

	function _key(collection, key) {
		return collection + "!" + key;
	}

	// Worker utility/pubsub methods
	self.attach = function attach(worker, collection) {
		console.log("Attaching worker for " + collection)
		worker.addEventListener('message', function listener(msg) {
			var data = msg.data;
			if (data['set']) {
				set(collection, data['set'].key, data['set'].value, function update_subs(err, key, updated) {
					console.log('UPDATE')
					var wsub, sub;
					wsub = _wsubs[collection];
					sub = _subs[collection];
					if (wsub) {
						wsub.forEach(function _update(worker) {
							worker.postMessage({
								"update": {
									"key": data['set'].key,
									"value": updated
								}
							});
						})
					}
					if (sub) {
						sub.forEach(function _call(fn) {
							fn(data['set'].key, updated);
						})
					}
				});
			} else if (data['get']) {
				var res = data;
				get(collection, data.key, function(err, data) {
					res.value = data;
					worker.postMessage(res);
				})
			}
		})
		return worker
	}

	self.subscribe_worker = function wsubscribe(worker, collection) {
		var sub = _wsubs[collection] = _wsubs[collection] || [];
		sub.push(worker);
	}
	self.subscribe = function subscribe(fn, collection) {
		var sub = _subs[collection] = _subs[collection] || [];
		sub.push(fn);
	}
	return self;
}