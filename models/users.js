var mongoose = require('mongoose');

var usersSchema = mongoose.Schema ({ 
	firstName:    {type:String, require:true},
	headline:     {type:String, require:true},
	category:     {type:String, require:true},
	id:           {type:String, require:true},
	industry:     {type:String, require:true},
	emailAddress: {type:String, require:true},
	password:     {type:String, require:true},
	credit:       {type:Number, require:true, default:10},
	active:       {type:Boolean, require: true, default:false},
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
		},
		languages:{
			type:[String], require:false
		},
		functions:{
			type:[String], require:false	
		},
		experience:{
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
		},
		languages:{
			type:[String], require:false
		},
		functions:{
			type:[String], require:false	
		},
		experience:{
			type:[String], require:false
		}
	},
	siteStandardProfileRequest:{
		url:{type:String, require:false}
	},
    lastName:   {type:String, require:true},
   	friends:    {type:[{
					id:              {type: mongoose.Schema.Types.ObjectId, require:true},
					status:          {type: String, require:true},
					date_connection: {type: Date, require:true},
					last_update:     {type: Date, require:true},
				}],
				require:true
	},
	invitationsSent:     {type:[mongoose.Schema.Types.ObjectId], require:true},
	invitationsReceived: {type:[mongoose.Schema.Types.ObjectId], require:true},
    trash:               {type:[mongoose.Schema.Types.ObjectId], require:true},
    saved:               {type:[mongoose.Schema.Types.ObjectId], require:true}
});

{
	
}


usersSchema.methods.comparePassword = function(password, cb) {
	debugger;
	return (password === this.password)?cb(true):cb(false);
};


module.exports = mongoose.model('users',usersSchema);
