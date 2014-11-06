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

var ticker_view = function update_ticker (key, val) {
	document.getElementById('bitfinex').innerHTML = val;
}

ticker.request({
	frequency: 300,
	method: "get",
	url: 'https://s2.bitcoinwisdom.com/ticker?',
	key: "bitfinex-compare",
	filter: "standard",
	processes: [ticker_processor]
}).consumer(ticker_view);

var wisdom = state.worker('wisdom', 'WebSocket');

var wisdom_processor = function get_trades(prev, cur, callback) {
	return callback(null, {
		trades: cur['sdepth']['return']
	})
}

var wisdom_view = function update_trades(key, val) {
	document.getElementById('wisdom').innerHTML = val;
}

wisdom.request({
	url: 'wss://d5.bitcoinwisdom.com/',
	querystring: '?symbol=bitfinexbtcusd',
	key: "wisdom",
	filter: "standard",
	processes: [wisdom_processor]
}).consumer(wisdom_view)