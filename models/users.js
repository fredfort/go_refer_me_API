var mongoose = require('mongoose');
/*
firstName: "Frédéric"
headline: "Software Engineer at Cognovi Ltd"
id: "ohXfEaVSft"
industry: "Internet"
lastName: "FORT"
location: Object
country: Object
name: "Ireland"
__proto__: Object
numConnections: 107
pictureUrl: "https://media.licdn.com/mpr/mprx/0_bIomh7udcYecH33z5dIjhD7QcUOqekAz52OAh2pUHZoXBh6vIDVCmuevJ1YII_rJQHHKfwCEeADm"
search: Object
industries: Array[0]
locations: Array[0]
*/
var country = mongoose.Schema({name: {type:String, require:true}});

var usersSchema = mongoose.Schema ({ 
	firstName:  {type:String, require:true},
	headline:   {type:String, require:true},
	category:   {type:String, require:true},
	id:         {type:String, require:true},
	industry:   {type:String, require:true},
	location:    {
		name: {
			type:String,
			require:true
		}
	},
	currentJob : {
      id:      {type:String, require:true},
      company: {type:String, require:true},
      title:   {type:String, require:true},
      summary: {type:String, require:true},
    },
	pictureUrl: {type:String, require:true},
	search: {
		locations:{
			type:[String], require:false
		},
		industries:{
			type:[String], require:false
		}
	},
	wants: {
		locations:{
			type:[String], require:false
		},
		industries:{
			type:[String], require:false
		},
		companies:{
			type:[String], require:false
		}
	},
	siteStandardProfileRequest:{
		url:{type:String, require:false}
	},
    lastName:   {type:String, require:true},
    trash:{type:[mongoose.Schema.Types.ObjectId], require:true},
    saved:{type:[mongoose.Schema.Types.ObjectId], require:true}
});


usersSchema.methods.comparePassword = function(password, cb) {
	return (password === this.password)?cb(true):cb(false);
};


module.exports = mongoose.model('users',usersSchema);
