(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})



var ticker = state.worker('#ticker', "XMLHttpRequest");

var ticker_processor = function get_bitfinex(prev, cur, callback) {
	return callback(null, {
		price: prev.bitfinexbtcusd.last,
		date: prev.bitfinexbtcusd.date,
		name: "bitfinexbtcusd",
	})
}

ticker.data({
	frequency: 300, // poll how often?
	method: "get", //what http method to use?
	url: 'https://s2.bitcoinwisdom.com/ticker?', //
	key: "bitfinex-ticker", //key is a queryselector that picks out element's view container
	filter: "standard", // collapse [rpcesses into filter?
	processes: [ticker_processor], //what to do with data before passing on to view
})
var template_html = "<div class='ticker-el'> \
			<p><strong>Name:</strong></p>\
			<p class='ticker-name'></p> \
			<p><strong>Price:</strong></p>\
			<p class='ticker-price'></p> \
			<p><strong>Name:</strong></p>\
			<p class='ticker-date'></p> \
		</div>";
var map = {
	'.ticker-name': {
		_text: 'name'
	},
	'.ticker-price': {
		_text: 'price'
	},
	'.ticker-date': {
		_text: 'date'
	}
}
ticker.view('bitfinex-ticker', 'appendChild', template_html, map);


/*


var ticker_view = function update_ticker(key, val) {
	var map = {
		'.ticker-name': {
			_text: 'name'
		},
		'.ticker-price': {
			_text: 'price'
		},
		'.ticker-date': {
			_text: 'date'
		}
	}
	var template_html = "<div class='ticker-el'> \
			<p><strong>Name:</strong></p>\
			<p class='ticker-name'></p> \
			<p><strong>Price:</strong></p>\
			<p class='ticker-price'></p> \
			<p><strong>Name:</strong></p>\
			<p class='ticker-date'></p> \
		</div>";
	var render = state.view(template_html, map)
	return document.getElementById('ticker').appendChild(render(val));
}

var wisdom = state.worker('wisdom', 'WebSocket');

var wisdom_processor = function get_trades(prev, cur, callback) {
	console.log(prev)
	return callback(null, {
		trades: cur['sdepth']['return']
	})
}

var symbols = ["bitfinexbtcusd", "bitstampbtcusd", "btcebtcusd", "btceltcbtc", "btceltcusd", "huobibtccny"];

symbols.forEach(function(symbol) {
	var consumer = {};
	consumer[symbol] = function(key, val) {
		document.getElementById(symbol).innerHTML = val;
	}
	wisdom.request({
		url: 'wss://d5.bitcoinwisdom.com/',
		querystring: '?symbol=' + symbol,
		key: symbol,
		filter: "standard",
		processes: [wisdom_processor]
	}).consumer(consumer)
})
*/
},{"../index.js":3}],3:[function(require,module,exports){
var Store = require('./lib/marx-store.js'); 
var Resource = require('./lib/marx-resource.js')
var Render = require('./util/hgrender.js')

module.exports = function Marx(name, ops){ 
	var self = this, store;
	self.db = store = new Store(ops.storage); 
	self._workers = {};
	self.worker = function add_resource(name, typ) { 
		var resource;
		self._workers[name] = resource = new Resource.input(name, typ, store);
		return resource;
	}
	self.view = Render;
	return self
}
},{"./lib/marx-resource.js":4,"./lib/marx-store.js":5,"./util/hgrender.js":12}],4:[function(require,module,exports){
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
	self.data = function request(requestobj) {
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
	self.consumer = function subscription(sub) {
		console.log(sub)
		store.subscribe(name, sub);
		return self;
	}
	self.view = function add_view(key, typ, template, map){
		store.add_view(name, key, typ, template, map);
	}
	return self;
}
},{"./marx_workers/ajax.js":6,"./marx_workers/websocket.js":7,"webworkify":10}],5:[function(require,module,exports){
(function (process){

var Render = require('../util/hgrender.js'); 


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
					var sub, ksub;
					sub = _subs[collection];
					ksub = sub[data['set'].key] || null;
					console.log(data['set'].key)
					console.log(sub)
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

	self.add_view = function mk_view(collection, key, typ, template, map) {
		var render, view, sub={};
		render = Render(template, map);;
		view = function (k, val){
			return document.querySelector(collection)[typ](render(val));
		}
		sub[key] = view
		self.subscribe(collection, sub);
		console.log(collection);
		console.log(sub)
	}
	return self;
}
}).call(this,require('_process'))
},{"../util/hgrender.js":12,"_process":1}],6:[function(require,module,exports){
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
},{"../../util/filter.js":11}],7:[function(require,module,exports){
var Filter = require('../../util/filter.js')

module.exports = function websocket_worker(self) {
	self.addEventListener('message', function open_ws(msg) {
		var last = '',
			request = msg.data,
			filter, transport;
		filter = Filter(request.filter);
		//console.log(request)
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




},{"../../util/filter.js":11}],8:[function(require,module,exports){
var domify = require('domify');
module.exports = hyperglue;

var outer = null;

function hyperglue (src, updates) {
    if (!updates) updates = {};
    
    var dom = typeof src === 'object' ? [ src ] : domify(src);
    if (!outer) outer = document.createElement('div');
    
    forEach(objectKeys(updates), function (selector) {
        var value = updates[selector];
        forEach(dom, function (d) {
            var parentNode = d.parentNode;
            
            if (selector === ':first') {
                bind(d, value);
            }
            else if (/:first$/.test(selector)) {
                var k = selector.replace(/:first$/, '');
                if (parentNode) parentNode.removeChild(d);
                outer.appendChild(d);
                
                var elem = outer.querySelector(k);
                outer.removeChild(d);
                
                if (parentNode) parentNode.appendChild(d);
                if (elem) bind(elem, value);
            }
            else {
                if (parentNode) parentNode.removeChild(d);
                outer.appendChild(d);
                
                var nodes = d.parentNode.querySelectorAll(selector);
                outer.removeChild(d);
                
                if (parentNode) parentNode.appendChild(d);
                
                if (nodes.length === 0) return;
                for (var i = 0; i < nodes.length; i++) {
                    bind(nodes[i], value);
                }
            }
        });
    });
    return dom.length === 1 ? dom[0] : dom;
}

function bind (node, value) {
    if (isElement(value)) {
        node.innerHTML = '';
        node.appendChild(value);
    }
    else if (isArray(value)) {
        for (var i = 0; i < value.length; i++) {
            var e = hyperglue(node.cloneNode(true), value[i]);
            node.parentNode.insertBefore(e, node);
        }
        node.parentNode.removeChild(node);
    }
    else if (value && typeof value === 'object') {
        forEach(objectKeys(value), function (key) {
            if (key === '_text') {
                setText(node, value[key]);
            }
            else if (key === '_html' && isElement(value[key])) {
                node.innerHTML = '';
                node.appendChild(value[key]);
            }
            else if (key === '_html') {
                node.innerHTML = value[key];
            }
            else node.setAttribute(key, value[key]);
        });
    }
    else setText(node, value);
}

function forEach(xs, f) {
    if (xs.forEach) return xs.forEach(f);
    for (var i = 0; i < xs.length; i++) f(xs[i], i)
}

var objectKeys = Object.keys || function (obj) {
    var res = [];
    for (var key in obj) res.push(key);
    return res;
};

function isElement (e) {
    return e && typeof e === 'object' && e.childNodes
        && (typeof e.appendChild === 'function'
        || typeof e.appendChild === 'object')
    ;
}

var isArray = Array.isArray || function (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

function setText (e, s) {
    e.innerHTML = '';
    var txt = document.createTextNode(String(s));
    e.appendChild(txt);
}

},{"domify":9}],9:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');
  
  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];
  
  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return [el.removeChild(el.lastChild)];
  }
  
  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  return orphan(el.children);
}

/**
 * Orphan `els` and return an array.
 *
 * @param {NodeList} els
 * @return {Array}
 * @api private
 */

function orphan(els) {
  var ret = [];

  while (els.length) {
    ret.push(els[0].parentNode.removeChild(els[0]));
  }

  return ret;
}

},{}],10:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn) {
    var keys = [];
    var wkey;
    var cacheKeys = Object.keys(cache);
    
    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        if (cache[key].exports === fn) {
            wkey = key;
            break;
        }
    }
    
    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
    
    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'],'require(' + stringify(wkey) + ')(self)'),
        scache
    ];
    
    var src = '(' + bundleFn + ')({'
        + Object.keys(sources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;
    return new Worker(window.URL.createObjectURL(
        new Blob([src], { type: 'text/javascript' })
    ));
};

},{}],11:[function(require,module,exports){
module.exports = function(fn) {
	if (RegExp('^.*(callback\(.*\)).*').test(fn_body)) {
		var fn_body = decap_func(fn);
		return new Function('prev', 'cur', 'callback', fn_body);
	} else {
		return standard;
	}
}

function decap_func(fn) {
	var fn_str = fn.toString(),
		decap;
	dcap = fn_str.replace(RegExp(cap_re));
	return dcap.substring(0, dcap.lastIndexOf('}'));
}

function standard(prev, cur, callback) {
	return keep_new(prev, cur, callback, {});

	function keep_new(objold, objnew, callback, container) {
		try {
			var nkeys = Object.keys(objnew);
		} catch (e) {
			console.log(e);
			console.log(objnew)
		}

		if (!objold) {
			return callback(null, objnew);
		}

		function compare(key, _callback) {
			var valnew = objnew[key],
				valold;
			try {
				valold = objold[key];
			} catch (err) {
				return _callback(null, valnew);
			}
			if (typeof valnew === 'object' && !Array.isArray(valnew)) { // if valnew is object,
				container[key] = {}; // compare it by passing container ref
				keep_new(valold, valnew, _callback, container[key]);
			} else if (String(valnew) !== String(valold)) { //coerce all non-objects to strings
				_callback(null, valnew)
			} else {
				_callback(null, null)
			}
		}
		// run async loop
		var counter = 0;
		nkeys.forEach(function call_compare(k, i) {
			compare(k, function keep_results(err, val) {
				if (err) {
					return callback(err);
				}
				if (val !== null) {
					container[nkeys[i]] = val;
				}
				if (++counter === nkeys.length) {
					return callback(null, container);
				}
			})
		})
	}
}

/*
var old = {
	'a': 'a',
	'b': 'b',
	'c': {
		'c': ['d', 'e']
	}
}

var new1 = {
	'a': 'a',
	'b': 'b',
	'c': {
		'c': ['d', 't']
	}
}

var new2 = {
	'a': 'a',
	'b': 'e',
	'c': {
		'r': {
			'q': 'y',
			'z': ['q', 't']
		},
		'c': ['d', 'e']
	}
}

standard(old, new2, function(err, res) {
	console.log(res)
})
*/
},{}],12:[function(require,module,exports){
var hyperglue = require('hyperglue');

module.exports = function mk_render(html, map) {
	return function render (data) {
		var hgmap={}, smap, sghmap, selector, attr;
		data = JSON.parse(data);
		for (selector in map){
			smap = map[selector],
			shgmap = hgmap[selector] = {};
			for (attr in smap){
				shgmap[attr] = data[smap[attr]];
				console.log(data[attr])
			}
		}
		console.log(hgmap)
		console.log(data)
		return hyperglue(html, hgmap)
	}
}
},{"hyperglue":8}]},{},[2]);
