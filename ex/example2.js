var Marx = require('../index.js');

var State = new Marx('example', {
	storage: 'session'
})


// init stuff
var ticker = State.worker('#ticker', "XMLHttpRequest");

var process_ticker_data = function(prev, cur, callback) {
	function unix_to_human(unix) {
		//console.log(unix)
		var human = new Date(unix * 1000);
		return human.getHours() + ':' + human.getMinutes();
	}
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
			_text: unix_to_human(prev.bitfinexbtcusd.date)
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
			_text: unix_to_human(prev.bitstampbtcusd.date)
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
			_text: unix_to_human(prev.btcebtcusd.date)
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
			_text: unix_to_human(prev.huobibtccny.date)
		}
	}], {
		template: '<div class="trade-event up">\
					<div class="ticker sup">BTCUSD</div>\
					<div class="exchange-short sub">BFX</div>\
					<div class="price sup">348.24</div>\
					<div class="amount sub">10.23</div>\
				</div>'
	})
}

ticker.source({
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
	processes: [process_ticker_data],
})


var btcwsdm_ws = 'wss://d5.bitcoinwisdom.com/?symbol=';

var btcwsdm_symbols = ["bitfinexbtcusd", "bitstampbtcusd", "btcebtcusd", "huobibtccny"];

var btcwsdm = State.worker('#btcwsdm', 'WebSocket');

var to_console = function(prev, cur, callback, req) {
	console.log(JSON.stringify(cur));
	callback(null, cur)
}

var process_btcwisdom = function(prev, cur, callback, req) {
	var symbol = req.key,
		args = {};
	console.log("pbtc")
	if (cur.trades) {
		args.template = '<div class="trade-event up">\
					<div class="ticker sup">BTCUSD</div>\
					<div class="exchange-short sub">BFX</div>\
					<div class="price sup">348.24</div>\
					<div class="amount sub">10.23</div>\
				</div>';
		args.key = symbol + "/trade_event";
		callback(null, {
			'.ticker': {
				_text: 'btc' + symbol.split('btc')[1]
			},
			'.exchange-short': {
				_text: symbol.split('btc')[0].replace(/i|e/g, '').toUpperCase()
			},
			'.price': {
				_text: cur.trades[0].price
			},
			'.amount': {
				_text: cur.trades[0].amount
			}
		}, args)
	} else if (cur.sdepth) {
		args.key = symbol + "/orderbook";
		callback(null, cur.sdepth.return, args)
	}
}

btcwsdm_symbols.forEach(function _data(symbol) {
	btcwsdm.source({
		url: btcwsdm_ws,
		querystring: symbol,
		key: symbol,
		filter: 'standard',
		processes: [process_btcwisdom]
	})

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