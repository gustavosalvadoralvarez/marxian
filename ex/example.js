var Marx = require('../index.js');

var state = new Marx('example', {
	storage: 'session'
})


// init stuff
var ticker = state.worker('#ticker', "XMLHttpRequest");

var ticker_template = '<div class="trade-event up">\
						<div class="ticker sup"></div>\
						<div class="exchange-short sub"></div>\
						<div class="price sup"></div>\
						<div class="amount sub"></div>\
					  </div>';

var get_ticker_data = function(prev, cur, callback) {
	function unix_to_human(unix){
		//console.log(unix)
		var human = new Date(unix*1000);
		return human.getHours() + ':'+human.getMinutes();
	}
	return callback(null, [{    // all processses must either return an object of the form
		'.ticker': {             // { selector: { attribute: value }}
			_text: "BTCUSD"      // or an array of objects in that form
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
	}])
}

ticker.source({
	frequency: 300,
	// poll how often?
	method: "get",
	// what HTTP method to use?
	url: 'https://s2.bitcoinwisdom.com/ticker?',
	// URL string
	key: "ticker",
	//key related this request with a particular entry in storage
	filter: "standard",
	// collapse into processes?
	processes: [get_ticker_data],
	//what to do with data before passing on to view 
	template: ticker_template
})

