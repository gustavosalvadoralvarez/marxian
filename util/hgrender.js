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