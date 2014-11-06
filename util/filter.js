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