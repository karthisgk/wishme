var appConfig = require('../config').initApp(__dirname);
var config = appConfig[process.env.NODE_ENV || 'development'];
var common = require('../public/common.js');
var multer  = require('multer');
var path = require('path');
const fs = require('fs');
var request = require('request');
var Booking = require('./Booking.js');

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dir = './application/uploads/tmp/';
		if (!fs.existsSync(dir)){
		    fs.mkdirSync(dir);
		}
	    cb(null, dir);
	},
	filename: function (req, file, cb) {
	    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});
var upload = multer({ storage: storage, 
	fileFilter: function (req, file, cb) {
	    if(['image/png', 'image/jpg', 'image/jpeg'].indexOf(file.mimetype) != -1){
	    	cb(null, true);
	    	return;
		}else{
			//req.json(common.getResponses('MNS036', {}));
			req.fileError = '004';
			return cb(null, false, new Error('Not an image'));
		}
	} });

var passData = {};
var baseurl = appConfig.liveUrl;

String.prototype.isNumeric = function(){
  return /^[0-9]+$/.test(this);
};

String.prototype.isEmail = function(){
  var pattern = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
  return pattern.test(this);
};

function Routes(app){
	var self = this;
	self.db = require('../config').db;
	appConfig.setSMTPConfig((smtp) => {
		this.smtp = smtp;
	});
	Booking = new Booking();

	this.sendMailorSms = function(cont){
		var title = config.name;
		var adminMail = appConfig.smtp_config.auth.user;
		var content = '<h3>'+title+'</h3>';
		content += '<p>You have a wishes from ' + title + ' </p>'; 
		content += '<p><a href="'+baseurl + '/wish/' + cont._id +'">click here</a>' 
		+' to show your wish from <b>'+ cont.name.toUpperCase() +'</b></p>';
		if(cont.toEmail.isEmail()){
			self.smtp.getFile({title: title, content: content}, (d) => {
				var mail = {
				    from: adminMail,
				    to: cont.toEmail,
				    subject: title + " | " + cont.name + ' wish you to happy Birthday',
				    html: d.html
				};
				self.smtp.sendMail(mail, (err, res) => {
					if (err) {console.log(err);}
				});
			});
		}
		else if(cont.toEmail.isNumeric()){
			var paramData = appConfig.sms_config;
			paramData.phone = cont.toEmail;
			paramData.message = cont.name + ' wish you to happy Birthday\n';
			paramData.message += 'copen the link to show your wish from ' + cont.name.toUpperCase() + '\n';
			paramData.message += baseurl + '/wish/' + cont._id;
			var clientServerOptions = {
			    uri: 'http://www.way2sms.com/api/v1/sendCampaign',
			    body: JSON.stringify(paramData),
			    method: 'POST',
			    headers: {
			        'Content-Type': 'application/json'
			    }
			}
			request(clientServerOptions, function (error, response) {
			    /*console.log(error,response.body);
			    return;*/
			});
		}
	};
	setInterval(function(){
		
		var ct = common.current_time();
		if(ct.split(' ')[1] >= "00:00:00" && ct.split(' ')[1] < "00:00:11"){
			var $wh = {bDay: ct.split(' ')[0], isComplete: {$ne: 4}};
			self.db.connect(function(newdb){

				self.db.get('content', $wh, conts => {
					if(conts.length > 0){
						conts.forEach((dt, k) => {
							self.sendMailorSms(dt);
						});				
						newdb.collection('content').updateMany($wh, {$set: {isComplete: 4}}, (err, r) => {});
					}
				});				
			});
		}
	}, 100 * 100);

	app.get('/', function(req, res) {
		var d = {title : config.name, baseurl: baseurl, content_id: ''};
		res.render('index', d);		
	});

	app.get('/upd/:ID', function(req, res) {
		var d = {title : config.name, baseurl: baseurl};		
		self.db.get('content', {_id: req.params.ID}, data => {
			if(data.length > 0){
				if(common.current_time().split(' ')[0] >= data[0].bDay){
					res.render('page404', d);
					return;
				}
				d.content_id = req.params.ID;
				res.render('index', d);
			}else
				res.redirect(baseurl);
		});
	});

	app.get('/getcontent/:ID', function(req, res){
		self.db.get('content', {_id: req.params.ID}, data => {
			if(data.length > 0){
				var images = [];
				data[0].images.forEach((img, k) => {
					images.push(baseurl + '/image/' + img);
				});
				var d = {};
				d.content = data[0];
				d.content.images = images;
				res.json(common.getResponses('001', d));
			}else
				res.json(common.getResponses('006', {}));
		});
	});

	app.get('/wish/:ID', function(req, res) {
		var d = {title : config.name, baseurl: baseurl};		
		self.db.get('content', {_id: req.params.ID}, data => {
			if(data.length > 0){
				data = data[0];

				d.content_id = req.params.ID;
				d.images = [];
				data.images.forEach((img, k) => {
					d.images.push(baseurl + '/image/' + img);
				});
				d.title = data.name + ' wish you to happy Birthday';
				d.wisherMessage = data.message;
				res.render('wish', d);
			}else
				res.render('page404', d);
		});
	});

	app.post('/upload', upload.array('photos'), function(req, res){	

		var removeUpload = function(){
			if(req.files.length > 0){
				req.files.forEach((file, k) => {
					if (fs.existsSync(file.path))
						fs.unlinkSync(file.path);
				});
			}
		};	

		if(typeof req.body._id == 'undefined' ||
			typeof req.body.name == 'undefined' ||
			typeof req.body.toEmail == 'undefined' ||
			typeof req.body.message == 'undefined' ||
			typeof req.body.bDay == 'undefined'){
			removeUpload();
			res.json(common.getResponses('002', {}));
			return;
		}

		if(req.body.name == '' ||
			req.body.toEmail == '' ||
			req.body.bDay == ''){
			removeUpload();
			res.json(common.getResponses('002', {}));
			return;
		}

		var toEmail = req.body.toEmail;
	    if(!toEmail.isEmail()){
		    if(toEmail.length < 10 || !toEmail.isNumeric()){
		        removeUpload();
				res.json(common.getResponses('008', {}));
		        return;
		    }
	    }

		if(common.current_time().split(' ')[0] >= req.body.bDay){
			removeUpload();
			res.json(common.getResponses('007', {}));
			return;
		}

		var isAdd = req.body._id == '';
		if(isAdd && req.files.length < 2){
			removeUpload();
			res.json(common.getResponses('005', {}));
			return;
		}
		if(typeof req.fileError != 'undefined'){
			removeUpload();
			res.json(common.getResponses(req.fileError, {}));
			return;
		}

		var _id = isAdd ? common.getMongoObjectId() : req.body._id;
		var newRecord = {
			name: req.body.name,
			toEmail: req.body.toEmail,
			message: req.body.message,
			bDay: req.body.bDay,
			images: []
		};

		var triggerUpload = function(ID){
			if(req.files.length > 0){
				var imageDir = './application/uploads/images/';	
				var imageFileName = imageTargetPath = '';			
				try {
					if (!fs.existsSync(imageDir))
					    fs.mkdirSync(imageDir);
				} catch (err) {
					removeUpload();
					res.json(common.getResponses('003', {}));
					return;
				}
				req.files.forEach((file, k) => {
					var imageExt = path.extname(file.path);
					imageFileName = 'SGK_' + ID  + common.uniqueid() + imageExt;
					imageTargetPath = imageDir + imageFileName;
					newRecord.images.push(imageFileName);
					try {
			       		fs.renameSync(file.path, imageTargetPath);
			       	} catch (err) {
			       		res.json(common.getResponses('003', {}));
						return;
			       	}
				});
			}
		};
		self.db.get('content', {_id: _id}, data => {
			if(data.length > 0){
				newRecord.images = newRecord.images.concat(data[0].images);
				triggerUpload(_id);		
				self.db.update('content', {_id: _id}, newRecord, (err, result) => {
					res.json(common.getResponses('001', {content_id: _id}));
				});
			}else{
				newRecord._id = req.body._id != '' ? common.getMongoObjectId() : _id;
				triggerUpload(newRecord._id);
				self.db.insert('content', newRecord, (err, result) => {
					res.json(common.getResponses('001', {content_id: newRecord._id}));
				});
			}
		});
	});
	app.get('/session', function(req, res) {
		res.send(JSON.stringify(req.session));
	});

	app.get('/image/:img', function(req, res){

		if(!req.params.hasOwnProperty('img')){
			res.send('404 Error');
			return;
		}
		var imgPath = __dirname + '/../uploads/images/' + req.params.img;
		if (fs.existsSync(imgPath))
			res.sendFile(path.resolve(imgPath));
		else
			res.status(404).send('404 Error');
	});

	app.get('/profileimage', function(req, res){
		var html = '<form action="'+baseurl+'/profileimage" method="post" enctype="multipart/form-data">\
		  <p><input type="file" name="prof">\
		  <p><button type="submit">Submit</button>\
		</form>';
		res.send(html);
	});

	app.post('/profileimage', upload.single('prof'), function(req, res){
		var file = req.file;				
		var imageExt = path.extname(file.path);
		imageFileName = 'sg' + imageExt;
		imageTargetPath = './application/public/resume/images/' + imageFileName;
		if (fs.existsSync(imageTargetPath))
			fs.unlinkSync(imageTargetPath);
		try {
       		fs.renameSync(file.path, imageTargetPath);
       		if (fs.existsSync(file.path))
				fs.unlinkSync(file.path);
       		res.redirect(baseurl + '/profileimage');
       	} catch (err) {
       		res.json(common.getResponses('003', {}));
			return;
       	}
	});

	self.r = app;
}

/*var fieds = { fieldname: 'photos',
  originalname: '7.JPG',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  destination: './application/public/uploads/tmp/',
  filename: 'photos-1555156134847.JPG',
  path: 'application/public/uploads/tmp/photos-1555156134847.JPG',
  size: 325768 }*/

module.exports = Routes;