
var DB = require('./db');
var SMTP = require('./SMTPmailConfig.js');
/*user: "smix.1234890@gmail.com",
	        pass: "1234.Smix"*/

var main = {
	development: {
		name: 'WishMe',
		port: process.env.PORT || 3500
	},
	production: {
		name: 'WishMe',
		port: process.env.PORT || 3500
	},
	db: new DB(),
	smtp_config: {
	    host: "smtp.gmail.com",
	    port: 465,
	    secure: true, 
	    auth: {
	        user: "karthisg.sg@gmail.com",
	        pass: "vijisgk97"
	    }
	},
	sms_config: {
		apikey: '3S6LNE20K8ZPQXJ2PGOWTYBIJ18K7HAT',
		secret: '4C82O55NQ4AION21',
		senderid: 'karthisgk',
		usetype: 'stage'
	},
	session_time: 999999999999,
	liveUrl: 'https://bday.karthisgk.be',
	initApp: function(dir){
		main.app_dir = dir;
		return main;
	},
	setSMTPConfig: function(cb){
		main.db.get('settings', {}, (settings) => {
			var smtp;
			if(settings.length > 0)
				smtp = new SMTP(settings[0].smtp_config);
			else
				smtp = new SMTP(main.smtp_config);
			cb(smtp);
		});
	}
};

module.exports = main;
