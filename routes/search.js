var user = require('../models/users.js');

exports.search = function(req, res) {
	var currentUser = req.user;
	if(req.query && req.query.category && req.query.category !== 'null' && req.query.category !== 'undefined'){
		currentUser.category = req.query.category;
	}

	var pageSize = (req.query.pageSize)?req.query.pageSize:5;
	var skip = (req.query.page -1)  * pageSize || 0;
	

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
			//doesnt not filter if the 2 differents experiences are ticked
			if(experience.length > 0 && experience.length < 3){
				search.or([
					{'wants.experience':{ $in: experience } },
					{'wants.experience':{$size: 0} }
				]);
			}
		}else{
			console.log('Heya')
			if(locations.length || industries.length || languages.length || functions.length || (experience.length && experience.length < 3)){
				search.or([
				  { 'wants.locations' : { $in: locations } },
				  { 'wants.industries' : { $in: industries } },
				  { 'wants.languages' : { $in: languages } },
				  { 'wants.functions' : { $in: functions } },
				  { 'wants.experience' : { $in: experience } }
				]);
			}
		}
		search.limit(pageSize).skip(skip);
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
			if(experience.length > 0 && experience.length < 3 ){
				search.or([
					{'search.experience':{ $in: experience } },
					{'search.experience':{$size: 0} }
				]);
			}
		}else{
			if(locations.length || companies.length || languages.length || functions.length || (experience.length && experience.length < 3)){
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
		search.limit(pageSize).skip(skip);
		search.where('category').equals('referer');
		search.exec(function(err, result){
			if(err)return console.log(err);
			res.send(result);
		});
	}else{
		res.send({message:'Unknow category '+currentUser.category });
	}
};