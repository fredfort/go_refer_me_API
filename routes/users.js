var user = require('../models/users.js');
var jwt = require('jwt-simple');
var moment = require('moment');
var nodemailer = require('../utils/email.js');
var _ =  require("lodash");
var ObjectId = require("mongoose").Types.ObjectId;

var connectionStatus = {
	CONNECTED:'connected'
};

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

		nodemailer.sendMail(userObject,token);

	});
};

updateUser = function(newUser,existingUser, res){
	existingUser.firstName    = newUser.firstName;
	existingUser.headline     = newUser.headline;
	existingUser.location     = newUser.location;
	existingUser.pictureUrl   = newUser.pictureUrl;
    existingUser.lastName     = newUser.lastName;
    existingUser.emailAddress = newUser.emailAddress;
    existingUser.active       = newUser.active;

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

exports.me = function(req, res){
	var currentUser = req.user;
	if(!currentUser){
		res.send('Invalid request', 405);
	}else{
		res.send(currentUser._doc);
	}
}

exports.search = function(req, res) {
	var currentUser = req.user;
	if(currentUser.category === 'referer'){
		var locations = currentUser.search.locations,
		industries    = currentUser.search.industries,
		languages     = currentUser.search.languages,
		functions     = currentUser.search.functions,
		experience    = currentUser.search.experience;
		var search = user.find();

		if(currentUser.search.all_criteria){
			if(locations.length > 0){
				search.where('wants.locations').in(locations);
			}
			if(industries.length > 0){
				search.where('wants.industries').in(industries);
			}
			if(languages.length > 0){
				search.where('wants.languages').in(languages);
			}
			if(functions.length > 0){
				search.where('wants.functions').in(functions);
			}
			if(experience.length > 0){
				search.where('wants.experience').in(experience);
			}
		}else{
			if(locations.length || industries.length || languages.length || functions.length || experience.length){
				search.or([
				  { 'wants.locations' : { $in: locations } },
				  { 'wants.industries' : { $in: industries } },
				  { 'wants.languages' : { $in: languages } },
				  { 'wants.functions' : { $in: functions } },
				  { 'wants.experience' : { $in: experience } }
				]);
			}
		}
		search.where('category').equals('looking_for_job')
		.exec(function(err, result){
			if(err)return console.log(err);
			res.send(result);
		});
	}else if(currentUser.category === 'looking_for_job'){
		var locations = currentUser.wants.locations,
		industries    = currentUser.wants.industries,
		companies     = currentUser.wants.companies,
		languages     = currentUser.wants.languages,
		functions     = currentUser.wants.functions,
		experience    = currentUser.wants.experience;
		var search = user.find();

		if(currentUser.wants.all_criteria){
			if(companies.length > 0){
				search.where('currentJob.company').in(companies);
			}
			if(locations.length > 0){
				search.where('search.locations').in(locations);
			}
			if(industries.length > 0){
				search.where('industry').in(industries);
			}
			if(languages.length > 0){
				search.where('search.languages').in(languages);
			}
			if(functions.length > 0){
				search.where('search.functions').in(functions);
			}
			if(experience.length > 0){
				search.where('search.experience').in(experience);
			}
		}else{
			if(locations.length || companies.length || languages.length || functions.length || experience.length){
				search.or([
				  { 'search.locations' : { $in: locations } },
				  { 'search.languages' : { $in: languages } },
				  { 'search.functions' : { $in: functions } },
				  { 'search.experience' : { $in: experience } },
				  { 'currentJob.company' : { $in:companies} },
				  { 'industry' : { $in:industries} },
				]);
			}
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
	var newUser = req.body.user || '';
	user.findOne({_id : ObjectId(newUser._id)},function(err, existingUser){
   		if(err)return console.log(err);
   		existingUser.search  = newUser.search;
   		existingUser.wants    = newUser.wants;
   		existingUser.category = newUser.category;

   		existingUser.save(function(err, newUser){
   			if(err) return console.log(err);
   			res.send(newUser.toJSON());
   		});
 	});
};

exports.create = function(req, res) {
 	var newUser = req.body.user || ''; 
	 if (!newUser || newUser.length === 0) {
	    return res.send(401);
	 }
	 if(!newUser.id){//User create manually
	 	createUser(newUser, res);
	 }else{//User created with linkedin connection
		 user.findOne({id : newUser.id},function(err, existingUser){
	   		if(err)return console.log(err);
   			newUser.active = true;//user logged with linkedin are active by default
	   		if(existingUser){
	   			updateUser(newUser,existingUser, res);
	   		}else{
	   			createUser(newUser, res);
	   		}
	 	});
	}
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

exports.invite = function(req, res){
	var currentUser = req.user;
	var userInvited = req.body.user || '';
	if (!currentUser || currentUser.length === 0 || !userInvited || userInvited.length === 0) {
	    return res.send(401);
	}
	var invitationsSent = currentUser.invitationsSent;
	if(invitationsSent.indexOf(userInvited._id) === -1){
		invitationsSent.push(userInvited._id);
	}

	user.update({ _id: currentUser._id },{invitationsSent: invitationsSent}, function(err,success){
		if(err)return console.log(err);

		var invitationsReceived = userInvited.invitationsReceived;
		if(invitationsReceived.indexOf(currentUser._id) === -1){
			invitationsReceived.push(currentUser._id);
		}
		user.update({ _id: userInvited._id },{invitationsReceived: invitationsReceived}, function(err2,success2){
			if(err2)return console.log(err2);
			res.send(currentUser._doc);
		});	
	});
}

exports.acceptInvitation = function(req,res){
	var currentUser = req.user;
	var userAccepted = req.body.user || '';
	//Check that we really got the invitation
	var invitation_user_id = _.find(currentUser.invitationsReceived, function(userId){
		return userId.equals(userAccepted._id);
	});
	if(!invitation_user_id){
		return res.send(403);//Forbidden
	}else{
		//current user is updated (+ 1 friends, -1 invitationsReceived)
		currentUser.invitationsReceived = _.without(currentUser.invitationsReceived, invitation_user_id);
		var friends = currentUser.friends;
		var friendsIds = _.map(friends, function(friend){
			return friend.id;
		});
		

		if(friendsIds.indexOf(invitation_user_id) === -1){//check that the user is not a friend already
			var newFriend = {
				id:invitation_user_id,
				status: connectionStatus.CONNECTED,
				date_connection: new Date(),
				last_update: new Date()
			};
			friends.push(newFriend);
		}
		user.update({ _id: currentUser._id },{invitationsReceived: currentUser.invitationsReceived, friends:friends }, function(err,success){
			if(err)return console.log(err);

			//accepted user is updated (+ 1 friends, -1 invitationsSent)
			var invitationsSent = _.without(userAccepted.invitationsSent, currentUser._id.toString());
			friends = userAccepted.friends;
			var friendsIds = _.map(friends, function(friend){
				return friend.id;
			});
			if(friendsIds.indexOf(currentUser._id) === -1){//check that the user is not a friend already
				var newFriend = {
					id:currentUser._id,
					status: connectionStatus.CONNECTED,
					date_connection: new Date(),
					last_update: new Date()
				};
				friends.push(newFriend);
			}
			user.update({ _id: userAccepted._id },{invitationsSent: invitationsSent, friends:friends}, function(err2,success2){
				if(err2)return console.log(err2);
				res.send(currentUser._doc);//the response is finally sent
			});
		});
	}
}

exports.denyInvitation = function(req,res){
	var currentUser = req.user;
	var userDenied = req.body.user || '';
		//Check that we really got the invitation
	var invitation_user_id = _.find(currentUser.invitationsReceived, function(userId){
		return userId.equals(userDenied._id);
	});
	if(!invitation_user_id){
		return res.send(403);//Forbidden
	}else{
		//current user is updated (-1 invitationsReceived)
		currentUser.invitationsReceived = _.without(currentUser.invitationsReceived, invitation_user_id);
		user.update({ _id: currentUser._id },{invitationsReceived: currentUser.invitationsReceived }, function(err,success){
			if(err)return console.log(err);

			//accepted user is updated ( -1 invitationsSent)
			var invitationsSent = _.without(userDenied.invitationsSent, currentUser._id.toString());
		
			user.update({ _id: userDenied._id },{invitationsSent: invitationsSent}, function(err2,success2){
				if(err2)return console.log(err2);
				res.send(currentUser._doc);//the response is finally sent
			});
		});
	}
};

exports.unFriend = function(req, res){
	var currentUser = req.user;
	var userUnfriended = req.body.user || '';

	//Check that users are friends
	var friend = _.find(currentUser.friends, function(friend){
		return friend.id.equals(userUnfriended._id);
	});

	//current user is updated (-1 friend)

	currentUser.friends = _.without(currentUser.friends, friend);
	user.update({ _id: currentUser._id },{friends: currentUser.friends }, function(err,success){
		if(err)return console.log(err);

		friend = _.find(userUnfriended.friends, function(friend){
			return friend.id === currentUser._id.toString();

		});

		//unfriended user is updated (-1 friend)
		userUnfriended.friends = _.without(userUnfriended.friends, currentUser._id.toString());
		user.update({ _id: userUnfriended._id },{friends: userUnfriended.friends}, function(err2,success2){
			if(err2)return console.log(err2);
			res.send(currentUser._doc);//the response is finally sent
		});
	});
};

exports.cancelInvitation = function(req, res){
	var currentUser = req.user;
	var userUnfriended = req.body.user || '';

	//Check that the invitation has been sent
	var friend_id = _.find(currentUser.invitationsSent, function(userId){
		return userId.equals(userUnfriended._id);
	});

	//current user is updated (-1 invitationsSent)

	currentUser.invitationsSent = _.without(currentUser.invitationsSent, friend_id);
	user.update({ _id: currentUser._id },{invitationsSent: currentUser.invitationsSent }, function(err,success){
		if(err)return console.log(err);

		//unfriended user is updated (-1 invitationsReceived)
		userUnfriended.invitationsReceived = _.without(userUnfriended.invitationsReceived, currentUser._id.toString());
		user.update({ _id: userUnfriended._id },{invitationsReceived: userUnfriended.invitationsReceived}, function(err2,success2){
			if(err2)return console.log(err2);
			res.send(currentUser._doc);//the response is finally sent
		});
	});
};

exports.login = function(req, res){

	var emailAddress = req.body.emailAddress || '';
	var password = req.body.password || '';

	if (!emailAddress || emailAddress.length === 0 || !password || password.length === 0) {
	    return res.send(400);
	}
	user.findOne({emailAddress: emailAddress}, function (err, userFound) {
	    if (err) {
	      console.log(err);
	      return res.send({credentials:false});
	    }

	    if(!userFound){
	    	return res.send({credentials:false, error:'Login and/or password incorrect'});
	    }

	    if(!userFound.active){
	    	return res.send({credentials:false, error:'Your account haven\'t been activated yet.'});
	    }

		userFound.comparePassword(password,function(ok){
			if(ok){
				var expires = moment().add('days', 7).valueOf();
				var token = jwt.encode({
					iss: userFound._id,
					exp: expires
				}, 'fatcap32');
				userFound.password = null;
				res.json({
				  token : token,
				  expires: expires,
				  user: userFound.toJSON()
				});	
			}else{
				return res.send({credentials:false, error:'Login and/or password incorrect'});
			}
		});
	});
};

exports.reinitPassword = function(req, res){
	var emailAddress = req.body.emailAddress || '';
	if (!emailAddress || emailAddress.length === 0) {
	    res.send(400,'emailAddress has to be sent');
	}
	user.findOne({emailAddress: emailAddress}, function (err, userFound) {
	    if (err) {
	      console.log(err);
	      res.send({credentials:false});
	    }

	    nodemailer.sendNewPasswordMail(userFound, function(){
	    	res.send({ok:true});
	    }, function(){
	    	res.send({ok:false, message:'The mail could not be sent to '+emailAddress});
	    });

	    
	});
};

exports.changePassword = function(req, res){
	var currentUser = req.user;
	var password = req.body.password;
	if (!password || password.length === 0) {
	    res.send(400,'password has to be sent');
	}

	user.update({ _id: currentUser._id },{password: password }, function(err,success){
		if(err)return console.log(err);
			res.send({ok:true});//the response is finally sent
	});
};

exports.changeFriendShipStatus = function(req, res){
	var currentUser = req.user;
	var userId = req.body.userId,
		status = req.body.status;

	if (!userId || userId.length === 0 || !status || !status.length === 0) {
	    res.send(400,'An user Id and a status are required');
	}

	var found = false;
	currentUser.friends.forEach(function(friend){
		if(friend.id.toString() === userId){
			friend.status = status;
			friend.last_update = new Date();
			found = true;
			return;
		}
	});

	if(!found){
		 res.send(404,'User not found');
	}

	user.update({ _id: currentUser._id },{friends: currentUser.friends }, function(err,success){
		if(err)return console.log(err);
		res.send({ok:true});//the response is finally sent
	});
};

exports.activateAccount = function(req, res){
	var currentUser = req.user;
	user.update({ _id: currentUser._id },{active:true }, function(err,success){
		if(err)return console.log(err);
		res.send({ok:true});//the response is sent
	});
};