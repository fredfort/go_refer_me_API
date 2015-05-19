var nodemailer = require('nodemailer');

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
  var template = '<b>Hello</b><br />'+newUser.firstName+' has subscribe to  to Refer to me!<br/>'+
  '<br><br> You can find his/her profile here: <a href="'+newUser.siteStandardProfileRequest.url+'">'+newUser.siteStandardProfileRequest.url+'</a>';
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