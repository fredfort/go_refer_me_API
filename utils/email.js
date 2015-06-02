var nodemailer = require('nodemailer');
var jwt = require('jwt-simple');
var moment = require('moment');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'goreferme@gmail.com',
        pass: 'Jeeb0eek'
    },
    tls: {
        rejectUnauthorized: false
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Refer to me <goreferme@gmail.com>', // sender address
    subject: 'Hello', // Subject line
}; 

// send mail with defined transport object
exports.sendMail = function(newUser){
  var template = '<b>Hello</b><br />'+newUser.firstName+' has subscribe to  to Refer to me!<br/>';
  if(newUser.siteStandardProfileRequest && newUser.siteStandardProfileRequest.url){
    template += '<br><br> You can find his/her profile here: <a href="'+newUser.siteStandardProfileRequest.url+'">'+newUser.siteStandardProfileRequest.url+'</a>';
  }else{
    template += '<br>This profile does not have a linkedin account<br>';
  }
  mailOptions.to= 'goreferme@gmail.com', // list of receivers
  mailOptions.html = template;

  // html body
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
  });
}

exports.sendNewPasswordMail = function(newUser, successCB, errorCB){
  var template = '<b>Hello</b><br />'+newUser.firstName+'<br/>';


  var expires = moment().add('days', 7).valueOf();
  var token = jwt.encode({
    iss: newUser._id,
    exp: expires
  }, 'fatcap32');

  //url = 'http://localhost:9003/#/reinitPassword/'+token;
  url = 'http://goreferme.s3-website-eu-west-1.amazonaws.com/#/reinitPassword/'+token;
  template += '<br><br> Click the following links to reset your password <a href="'+url+'"> here</a>';

  mailOptions.to= newUser.emailAddress; // list of receivers
  mailOptions.bcc='goreferme@gmail.com';
  mailOptions.html = template;

  // html body
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        errorCB();
    }else{
        console.log('Message sent: ' + info.response);
        successCB();
    }
  });
}