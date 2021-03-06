
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
		_subs = {},
		_tmps = {},
		_index = {},
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
		var val;
		if (!key){
			_index[collection].forEach(function(v){
				val +=  Store[_key(collection, key)]
			})
		}
		var data = Store[_key(collection, key)];
		return callback(null, key, data)
	}

	function _set(collection, key, value, callback) {
		var indx = _index[collection] = _index[collection] || []; 
		if (indx.indexOf(key) === -1){
			indx.push(key);
		}
		if (typeof value !== 'string'){
			value = JSON.stringify(value)
		}
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
					var sub, ksub;
					sub = _subs[collection] || {};
					ksub = sub[data['set'].key] || null;
					//console.log(data['set'].key)
					//console.log(sub)
					if (ksub) {
						ksub.forEach(function _call(fn) {
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

	self.subscribe = function subscribe(collection, sub) {
		var _sub = _subs[collection] = _subs[collection] || {},
			scribers;
		for (scribers in sub) {
			var ksub = _sub[scribers] = _sub[scribers] || [];
			ksub.push(sub[scribers])
		}
	}
	window._marx = self;
	return self;
}