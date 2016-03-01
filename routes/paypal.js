exports.getToken = function(req, res) {
	
	var login = 'AaXUslTalDdKwLv12T-lwl26cobhxm3W5rOkZSWXmp6Tersdk-aWbFObw47UvwBiWLzu7Pl3rdn-llPf',
	password  = 'EChfsF8ZlpGh7NG_BGgOW2bIiatxhuYco2w1Igb8xNNqWZi6rWCA2_7OnpNosp25e4O0ntA3x1rAJ5RP';

	var request = require('request');

	request.post({
	    uri: "https://api.sandbox.paypal.com/v1/oauth2/token",
	    headers: {
	        "Accept": "application/json",
	        "Accept-Language": "en_US",
	        "content-type": "application/x-www-form-urlencoded"
	    },
	    auth: {
	    'user': login,
	    'pass': password,
	  },
	  form: {
	    "grant_type": "client_credentials"
	  }
	}, function(error, response, body) {
	    res.json(JSON.parse(body));
	});
};