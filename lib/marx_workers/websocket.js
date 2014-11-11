var Filter = require('../../util/filter.js');
var cheerio = require('cheerio'); //had to modify cheerio to fix webworker bug, dont want to update


module.exports = function websocket_worker(self) {
	self.sockets = {}; // cache sockets
	self.addEventListener('message', function open_ws(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		filter = Filter(request.filter);
		//console.log(request)
		if (request.processes) { // init request processes 
			var processes = request.processes.map(function mk_process(fnbody) {
				var fn;
				try {
					fn = new Function('prev', 'cur', 'callback', 'req', fnbody);
					return fn;
				} catch (e) {
					return self.postMessage({
						error: {
							message: e,
							request: request
						}
					})
				}
			})
		}
		try {
			function out(data, args) {
				var value, template;
				template = args ? args.template : request.template;
				console.log(data)
				console.log(args)
				if (template) {
					if (Array.isArray(data)) {
						value = data.map(function(v) {
							return render_template(template, v)
						})
					} else {
						value = render_template(template, data)
					}

				} else {
					value = JSON.stringify(data);
				}
				//console.log(value)
				return self.postMessage({
					"set": {
						key: args.key || request.key,
						value: value
					}
				})

				function render_template(template, data) {
					var parent = cheerio.load(template),
						child, attributes, attribute, str, res;
					for (child in data) {
						attributes = data[child];
						for (attribute in attributes) {
							str = String(attributes[attribute]);
							if (attribute === '_text') {
								parent(child).text(str);
							} else if (attribute === '_html') {
								parent(child).html(str);
							} else {
								parent(child).attr(attribute, str);
							}

						}

					}
					res = parent.html();
					return res;
				}
			}
			return exec_req();

			function exec_req() {
				var endpoint = request.url + (request.querystring || ''),
					handler, transport;
				handler = function(msg) {
					var res = JSON.parse(msg.data);
					if (res.type === 'ping') {
						return
					}
					if (msg.data !== last) {
						if (processes) {
							var counter = 0,
								ores = res,
								_callback;
							_callback = function(err, nres, args) {
								if (err) {
									callback(err);
								}
								if (++counter === processes.length) {
									out(nres, args);
								} else {
									processes[counter](ores, nres, _callback, args || request);
								}
								ores = nres;
								return
							}
							return processes[0](last, res, _callback, request);
						} else {
							out(res);
						}
					}
					last = msg.data;
				}
				if (self.sockets[endpoint]) {
					transport = self.sockets[endpoint];
					transport.addEventListener('message', handler);
					return
				}
				self.sockets[endpoint] = transport = new WebSocket(endpoint);
				transport.onopen = function() {
					console.log("socket opened for " + request.url);
				};
				transport.onclose = function() {
					if (request.persist) {
						open_ws(msg);
					}
				}
				transport.addEventListener('message', handler);
			}
		} catch (e) {
			console.log(e)
		}
	})
}