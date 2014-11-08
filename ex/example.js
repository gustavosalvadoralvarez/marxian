var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})


// init stuff
var ticker = state.worker('#ticker', "XMLHttpRequest");

var get_ticker_data = function(prev, cur, callback) {
	return callback(null, [{
		'.price': {
			_text: prev.bitfinexbtcusd.last
		},
		'.date': {
			_text: prev.bitfinexbtcusd.date
		},
		'.name': {
			_text: "bitfinexbtcusd"
		},
	}, {
		'.price': {
			_text: prev.bitstampbtcusd.last
		},
		'.date': {
			_text: prev.bitstampbtcusd.date
		},
		'.date': {
			_text: "bitstampbtcusd"
		},
	}, {
		'.price': {
			_text: prev.btcebtcusd.last
		},
		'.date': {
			_text: prev.btcebtcusd.date
		},
		'.name': {
			_text: "btcebtcusd"
		},
	}, {
		'.price': {
			_text: prev.huobibtccny.last
		},
		'.date': {
			_text: prev.huobibtccny.date
		},
		'.name': {
			_text: "huobibtccny"
		},
	}])
}
var update_ticker = function(key, updated) {
	console.log(updated)
	updated.forEach(function append(u) {
		var parent = document.getElementById('ticker')
		parent.childNodes()[0].outerHTML = u;

	})
}
ticker
	.data({
		frequency: 300,
		// poll how often?
		method: "get",
		// what HTTP method to use?
		url: 'https://s2.bitcoinwisdom.com/ticker?',
		// URL string
		key: "ticker",
		//key related this request with a particular view
		filter: "standard",
		// collapse into processes?
		processes: [get_ticker_data],
		//what to do with data before passing on to view (line 11)
		template: [
			'<div class="row">',
			'<p>Name:</p>',
			'<p class="name"></p>',
			'<p>Price:</p>',
			'<p class="price"></p>',
			'<p>Date:</p>',
			'<p class="date"></p>',
			'</br>',
			'</div>',
		].join('')
	}).consumer({
		'ticker': update_ticker
	})

/*
style="width:0,height:0,display:none;visibility:hidden"
			'<div class="marx-tag"style="width:0,height:0,display:none;visibility:hidden"
></div>',
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