var Filter = require('../../util/filter.js')

module.exports = function websocket_worker(self) {
	self.addEventListener('message', function open_ws(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		filter = Filter(request.filter);
		console.log(request)
		if (request.processes) { //cache request processes 
			var processes = request.processes.map(function mk_process(fnbody) {
				var fn;
				try {
					fn = new Function('prev', 'cur', 'callback', fnbody);
					return fn;
				} catch (e) {
					return self.postMessage({
						error: {
							message: err,
							request: request
						}
					})
				}
			})
		}
		try {
			return exec_req();
			function exec_req() {
				var endpoint = request.url + (request.querystring || '');
				transport = new WebSocket(endpoint);
				transport.onopen = function() {
					console.log("socket opened for " + request.url);
				};
				transport.onclose = function () {
					if (request.persist) {
						open_ws(msg);
					}
				}
				transport.onmessage = function(msg) {
					var res = JSON.parse(msg.data);
					if (res.type === 'ping'){
						return
					}
					if (msg.data !== last) {
						filter(last, res, function process_runner(err, fres) {
							if (processes) {
								var counter = 0,
									ores = fres,
									_callback;
								_callback = function(err, nres) {
									if (err) {
										callback(err);
									}
									if (++counter === processes.length) {
										self.postMessage({
											"set": {
												key: request.key || '!',
												value: JSON.stringify(nres)
											}
										})
									} else {
										processes[counter](ores, nres, _callback);
									}
									ores = nres;
									return
								}
								return processes[0](res, fres, _callback);
							} else {
								self.postMessage({
									"set": {
										key: request.key || '!',
										value: JSON.stringify(res)
									}
								})
							}
						})
					}
					last = msg.data;
				}
			}
		} catch (e) {
			self.postMessage({
				error: {
					message: err,
					request: request
				}
			})
		}
	})
}



