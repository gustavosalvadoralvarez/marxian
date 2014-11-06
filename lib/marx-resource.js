var webworkify = require('webworkify');

module.exports.input = function Input_Resource(name, typ, store, fltr) {
	////////////////////////////////////////////////////////////////////
	// :: string, object, Marx_db instance, url
	//
	var self = this,
		worker;
	switch (typ) {
		case "XMLHttpRequest":
			worker = webworkify(require('./marx_workers/ajax.js'));
			break;
		case "WebSocket":
			worker = webworkify(require('./marx_workers/websocket.js'));
			break;
		default:
			if (RegExp('^.*(.js)$').test(typ)) {
				worker = webworkify(require(typ));
			} else {
				return new Error("Resoource type " + typ + " not supported");
			}
	}
	store.attach(worker, name);
	self.request = function request(requestobj) {
		if (requestobj.processes) {
			var cap_re = RegExp('^(function [^{].*)');
			requestobj.processes = requestobj.processes.map(
				function decap_func(fn) {
					var fn_str = fn.toString(),
						decap;
					dcap = fn_str.replace(RegExp(cap_re));
					return dcap.substring(0, dcap.lastIndexOf('}'));
				})
		}
		worker.postMessage(requestobj);
		return self;
	}
	self.consumer = function subscription(fn) {
		store.subscribe(fn, name);
		return self;
	}
	return self;
}