var hyperglue = require('hyperglue');

module.exports = function mk_render(html, map) {
	return function render(data) {
		var hgmap = {},
			smap, sghmap, selector, attr;
		data = JSON.parse(data);
		for (selector in map) {
			smap = map[selector];
			if (Array.isArray(smap)) {
				var rowdata = data[selector],
					rowmap = smap[0];
				hgmap[selector] = rowdata.map(function _mk(row) {
					var row_el = {};
					console.log(row)
					for (attr in rowmap) {
						row_el[attr] = row[rowmap[attr]];
						//console.log(attr)
						//console.log(rowmap[attr])
					}
					return row_el
				})
			} else {
				shgmap = hgmap[selector] = {};
				for (attr in smap) {
					shgmap[attr] = data[smap[attr]];
				}
			}
		}
		console.log(hgmap)
		console.log(data)
		return hyperglue(html, hgmap)
	}
}

var data = {
	'a': 'dta1',
	'b': 'data2',
	'c': 'data3'
}
var m = {
	'.row': {
		_html: [{
			'.name': 'a',
			'.price': 'b'
		}],
		id: 'c'
	}
}

var mapped = map(m, data);
console.log(mapped)


function map(obj, data) {
	return _map(obj)
	function _map(obj) {
		var key, val;
		if (Array.isArray(obj)) {
			return obj.map(function(val) {
				if (typeof val === 'object') {
					return _map(val);
				} else if (data[val]) {
					return data[val];
				} else {
					console.log(val + ' not found in data')
				}
			})
		}
		for (key in obj) {
			val = obj[key];
			if (typeof val === 'object') {
				obj[key] = _map(val);
			} else if (data[val]) {
				obj[key] = data[val];
			} else {
				console.log(key + ' not found in data')
			}
		}
		return obj
	}
}