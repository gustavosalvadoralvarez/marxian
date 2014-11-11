var Filter = require('../../util/filter.js');
var cheerio = require('cheerio'); //had to modify cheerio to fix webworker bug, dont want to update

module.exports = function ajax_worker(self) {
	self.addEventListener('message', function ajax_req(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		//console.log(request);
		filter = Filter(request.filter);
		if (request.processes) { //cache request processes 
			var processes = request.processes.map(function mk_process(fnbody) {
				try {
					fn = new Function('prev', 'cur', 'callback', 'req', fnbody);
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

			function out(data, args) {
				var value, template;
				console.log(args)
				template = args ? args.template : request.template;
				if (template) {
					if (Array.isArray(data)) {
						value = data.map(function(v) {
							return render_template(template, v)
						})
					} else {
						value = render_template(template, data)
					}

				} else {
					value = JSON.stringifu(data)
				}
				//console.log(value)
				return self.postMessage({
					"set": {
						key: request.key || args.key,
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
								_callback = function(err, nres, args) {
									if (err) {
										callback(err);
									}
									if (++counter === processes.length) {
										console.log(args)
										out(nres, args)
									} else {
										processes[counter](ores, nres, _callback, args || request);
									}
									ores = nres;
									return
								}
								return processes[0](res, fres, _callback, request);
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
				error: e
			})
		}
	})
}