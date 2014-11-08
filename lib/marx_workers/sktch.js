var cheerio = require('cheerio');
var data = [{
	".price": {
		"_text": 344.7
	},
	".date": {
		"_text": 1415416088
	},
	".name": {
		"_text": 'bitfinexbtcusd'
	}
}, {
	".price": {
		"_text": 344.7
	},
	".date": {
		"_text": 1415416088
	},
	".name": {
		"_text": 'bitfinexbtcusd'
	}
}, {
	".price": {
		"_text": 344.7
	},
	".date": {
		"_text": 1415416088
	},
	".name": {
		"_text": 'bitfinexbtcusd'
	}
}, {
	".price": {
		"_text": 344.7
	},
	".date": {
		"_text": 1415416088
	},
	".name": {
		"_text": 'bitfinexbtcusd'
	}
}];
var template = [
	'<div class="row">',
	'<p>Name:</p>',
	'<p class="name"></p>',
	'<p>Price:</p>',
	'<p class="price"></p>',
	'<p>Date:</p>',
	'<p class="date"></p>',
	'</br>',
	'</div>',
].join('');
process(data)

function process(data) {
	var value;
	if (Array.isArray(data)) {
		value = data.map(function(v) {
			return render_template(template, v)
		})
	} else {
		value = render_template(request.template, data)
	}
	console.log(JSON.stringify(value))

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