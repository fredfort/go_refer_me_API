var user = require('../models/users.js');
var jwt = require('jwt-simple');
 
module.exports = function(req, res, next) {
	var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];
	console.log('token '+token);
	if (token) {
	  try {
	    var decoded = jwt.decode(token, 'fatcap32');
	 
	    if (decoded.exp <= Date.now()) {
		  res.send('Access token has expired', 401);
		}
		user.findOne({ _id: decoded.iss}, function(err, user) {
			if (err) {
		        console.log(err);
		        return res.send('Cannot find the user',401);
		    }
			req.id = user.id;
			req.user = user;
			next();
		});
	  } catch (err) {
	    res.send('Token invalid', 401);
	  }
	} else {
		res.send('No token found', 401);
	}
};