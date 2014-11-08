var Filter = require('../../util/filter.js');
var cheerio = require('cheerio');

module.exports = function ajax_worker(self) {
	self.addEventListener('message', function ajax_req(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		console.log(request);
		filter = Filter(request.filter);
		if (request.processes) { //cache request processes 
			var processes = request.processes.map(function mk_process(fnbody) {
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

			function out(data) {
				var value;
				if (Array.isArray(data)) {
					value = data.map(function(v) {
						return render_template(request.template, v)
					})
				} else {
					value = render_template(request.template, data)
				}
				console.log(value)
				self.postMessage({
					"set":{
						key: request.key,
						value: value
					}
				})

				function render_template(template, data) {
					var parent = cheerio.load(template),
						child, attributes, attribute, str;
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
										out(nres)
									} else {
										processes[counter](ores, nres, _callback);
									}
									ores = nres;
									return
								}
								return processes[0](res, fres, _callback);
							} else {
								out(res);
							}
						})
						last = this.responseText
					}
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