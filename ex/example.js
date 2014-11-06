var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})

var ticker = state.worker('ticker', "XMLHttpRequest");

var ticker_processor = function compare_bitfinex(prev, cur, callback) {
	return callback(null, {
		last: prev.bitfinexbtcusd,
		now: cur.bitfinexbtcusd
	})
}

var ticker_view = function update_ticker(key, val) {
	document.getElementById('bitfinex').innerHTML = val;
}

ticker.request({
	frequency: 300,
	method: "get",
	url: 'https://s2.bitcoinwisdom.com/ticker?',
	key: "bitfinex",
	filter: "standard",
	processes: [ticker_processor]
}).consumer({
	'bitfinex': ticker_view
});

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