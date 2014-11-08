var hyperglue = require('hyperglue');

module.exports = function mk_render(html, obj) {
	return function render(data) {
		data = JSON.parse(data)
		console.log(data)
		var hgmap = mk_hgmap(data);
		return hyperglue(html, hgmap)
	}
	function mk_hgmap(data) {
		return _map(obj)

		function _map(obj) {
			var key, val;
			console.log(obj)

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
					console.log(val + ' not found in data')
				}
			}
			return obj
		}
	}
}