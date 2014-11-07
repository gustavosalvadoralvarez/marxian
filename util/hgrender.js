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
					var row_el={};
					console.log(row)
					for (attr in rowmap) {
						row_el[attr] = row[rowmap[attr]];
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