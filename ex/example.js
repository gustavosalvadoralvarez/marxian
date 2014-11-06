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