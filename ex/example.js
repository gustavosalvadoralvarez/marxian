var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})


// init stuff
var ticker = state.worker('#ticker', "XMLHttpRequest");

var ticker_template = '<div class="trade-event up">\
					<div class="ticker sup">BTCUSD</div>\
					<div class="exchange-short sub">BFX</div>\
					<div class="price sup">348.24</div>\
					<div class="amount sub">10.23</div>\
				</div>';

var get_ticker_data = function(prev, cur, callback) {
	return callback(null, [{
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BFX"
		},
		'.price': {
			_text: prev.bitfinexbtcusd.last
		},
		'.amount': {
			_text: prev.bitfinexbtcusd.date
		}
	}, {
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BTSP"
		},
		'.price': {
			_text: prev.bitstampbtcusd.last
		},
		'.amount': {
			_text: prev.bitstampbtcusd.date
		}
	}, {
		'.ticker': {
			_text: "BTCUSD"
		},
		'.exchange-short': {
			_text: "BTCEB"
		},
		'.price': {
			_text: prev.btcebtcusd.last
		},
		'.amount': {
			_text: prev.btcebtcusd.date
		}
	}, {
		'.ticker': {
			_text: "BTCCNY"
		},
		'.exchange-short': {
			_text: "HUOBI"
		},
		'.price': {
			_text: prev.huobibtccny.last
		},
		'.amount': {
			_text: prev.huobibtccny.date
		}
	}])
}

var update_ticker = state.util.view_buffer.lifo('ticker', 200)

ticker.data({
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
		template: ticker_template
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