var user = require('../models/users.js');
var jwt = require('jwt-simple');
var moment = require('moment');
var nodemailer = require('../utils/email.js');

createUser = function(userObject,res){
	var userToInsert = new user(userObject);
	userToInsert.save(function(err, newUser){
		console.log(err);
		if (err) {
	        console.log(err);
	        return res.send('email already present in database',406);
	  	}
	  var expires = moment().add('days', 7).valueOf();
		var token = jwt.encode({
		  iss: newUser._id,
		  exp: expires
		}, 'fatcap32');
		res.json({
		  token : token,
		  expires: expires,
		  user: newUser.toJSON()
		});

		nodemailer.sendMail(userObject);

	});
};

updateUser = function(newUser,existingUser, res){

	existingUser.firstName  = newUser.firstName;
	existingUser.headline   = newUser.headline;
	existingUser.location   = newUser.location;
	existingUser.pictureUrl = newUser.pictureUrl;
    existingUser.lastName   = newUser.lastName;

    existingUser.save();

	var expires = moment().add('days', 7).valueOf();
	var token = jwt.encode({
		iss: existingUser._id,
		exp: expires
	}, 'fatcap32');

	res.json({
	  token : token,
	  expires: expires,
	  user: existingUser.toJSON()
	});	
};

exports.search = function(req, res) {
	var currentUser = req.user;
	if(currentUser.category === 'referer'){
		var locations = currentUser.search.locations,
		industries    = currentUser.search.industries;
		var search = user.find();
		if(locations.length > 0){
			search.where('wants.location.name').in(locations);
		}
		if(industries.length > 0){
			search.where('wants.industry').in(industries);
		}
		search.where('category').equals('looking_for_job')
		.exec(function(err, result){
			if(err)return console.log(err);
			res.send(result);
		});
	}else if(currentUser.category === 'looking_for_job'){
		var locations = currentUser.wants.locations,
		industries    = currentUser.wants.industries;
		companies     = currentUser.wants.companies
		var search = user.find();
		if(companies.length > 0){
			search.where('currentJob.company').in(companies);
		}
		if(locations.length > 0){
			search.where('search.locations').in(locations);
		}
		if(industries.length > 0){
			search.where('search.industry').in(industries);
		}
		search.where('category').equals('referer')
		.exec(function(err, result){
			if(err)return console.log(err);
			res.send(result);
		});
	}else{
		res.send('Invalid user', 403);
	}
};

exports.searchByIds = function(req, res) {
	var ids = req.body.ids;
	user.find()
	.where('_id').in(ids)
	.exec(function(err, result){
		if(err)return console.log(err);
		res.send(result);
	});
};

exports.update = function(req, res) {
	var userObject = req.body.user || '';
	var query = { id: userObject.id };
	user.update(query, userObject,{}, function(err,updatedUser){
		if(err)return console.log(err);
		res.send(userObject);
	});
};

exports.create = function(req, res) {
 	var newUser = req.body.user || ''; 
	 if (!newUser || newUser.length === 0) {
	    return res.send(401);
	 }
	 user.findOne({id : newUser.id},function(err, existingUser){
   		if(err)return console.log(err);
   		
   		if(existingUser){
   			updateUser(newUser,existingUser, res);
   		}else{
   			createUser(newUser, res);
   		}
 	});
};

exports.getUserCompanies = function(req, res){
	user.find({},'currentJob.company')
	.where('category').equals('referer')
	.where('currentJob.company').ne(null)
	.exec(function(err, result){
   		if(err)return console.log(err);
 		res.send(result);
 	});
};