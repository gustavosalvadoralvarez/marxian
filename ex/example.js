var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})


// init stuff
var ticker = state.worker('#ticker', "XMLHttpRequest");

var get_bitfinex = function bitfinex_filter(prev, cur, callback) {
	return callback(null, {'.row': 
		[{
			price: prev.bitfinexbtcusd.last,
			date: prev.bitfinexbtcusd.date,
			name: "bitfinexbtcusd",
		}, {
			price: prev.bitstampbtcusd.last,
			date: prev.bitstampbtcusd.date,
			name: "bitstampbtcusd",
		}, {
			price: prev.btcebtcusd.last,
			date: prev.btcebtcusd.date,
			name: "btcebtcusd",
		}, {
			price: prev.huobibtccny.last,
			date: prev.huobibtccny.date,
			name: "huobibtccny",
		}]
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
		key: "bitfinex-ticker",
		//key related this request with a particular view
		filter: "standard",
		// collapse into processes?
		processes: [get_bitfinex],
		//what to do with data before passing on to view
	})
	.view(
		'bitfinex-ticker', //key relating this view to the request above
		'appendChild', //method to use on parent element (#ticker from line 9) to insert view element

		[
			'<div id="rows">',
			'<div class="row">',
			'<p>Name:</p>',
			'<p class="name"></p>',
			'<p>Price:</p>',
			'<p class="price"></p>',
			'<p>Date:</p>',
			'<p class="date"></p>',
			'</br>',
			'</div>',
			'</div>'
		].join(''), {
			'.row': [{
				'.name': 'name',
				'.price': 'price',
				'.date': 'date'
			}]
		});


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