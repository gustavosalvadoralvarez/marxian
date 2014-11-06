var Filter = require('../../util/filter.js')

module.exports = function ajax_worker(self) {
	self._fns;
	self.addEventListener('message', function ajax_req(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		filter = Filter(request.filter);
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
			setInterval(exec_req, request.frequency);

			function exec_req() {
				transport = new XMLHttpRequest();
				transport.onload = function(res) {
					var res = JSON.parse(this.responseText);
					if (this.responseText !== last) {
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
					last = this.responseText
				}
				transport.open(request.method, request.url);
				transport.send();
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