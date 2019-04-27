
var mailer = require("nodemailer");
var fs = require('fs');


function SMTP(config){
	var self = this;
	this.smtp =  mailer.createTransport(config);
	this.getFile = function(data,cb){		
		var fileName = typeof data.fileName == 'undefined' ? 'mail.html' : data.fileName;
		fs.readFile(__dirname + '/../views/' + fileName, 'utf8', (err, html) => {
		  	if(err)
		  		cb({result: 'error', err: err});
		  	else{
		  		var keys = [];
				for(var k in data)
					keys.push(k);
				if(keys.length > 0) {
					keys.forEach((dataKey, ind) => {
						html = html.replace(new RegExp('{{' + dataKey + '}}', 'g'), data[dataKey]);
					});
				}
		  		cb({result: 'success', html: html});
		  	}
		});
	};
	this.sendMail = function(mail, cb){
		mail.to = typeof mail.to == 'string' ? mail.to : mail.to.join(',');
		self.smtp.sendMail(mail, function(error, response){
		    if(error)
		        cb(error, response);
		    else
		        cb(error, response);		    

		    self.smtp.close();
		});
	}
}
/*
	officical site 
		https://nodemailer.com/about/
	stackoverflow: 
		https://stackoverflow.com/questions/4113701/sending-emails-in-node-js
	configuration reference:
		https://www.arclab.com/en/kb/email/how-to-enable-imap-pop3-smtp-gmail-account.html
	gmail permission
		https://www.google.com/settings/security/lesssecureapps,
		https://accounts.google.com/DisplayUnlockCaptcha
*/

/*{
    from: "smix.1234890@gmail.com",
    to: "karthisg.sg@gmail.com",
    subject: "kjsdhfkjsdfhks hk",
    text: "adjsak",
    html: "<thmlasd>"
}*/



module.exports = SMTP;

