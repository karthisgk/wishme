var ObjectId = require('mongodb').ObjectId;
var config = require('../config/index.js');
var common = require('../public/common.js');

String.prototype.isNumeric = function(){
  return /^[0-9]+$/.test(this);
};

const Booking = function() {
	var self = this;
	self.db = config.db;

	this.openBooking = function(req, res){
		if(!req.isAdmin){
			res.json(common.getResponses('002', {}));
			return;
		}


		if(typeof req.body.date == 'undefined' || 
			typeof req.body.noi == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}

		var data = {
			_id: req.body.date,
			noi: parseInt(req.body.noi)
		};

		self.db.get('settings', {}, settings => {
			if(settings.length > 0)
				settings = settings[0];
			else
				settings = {rate: 12};
			self.db.get('booking', {_id: data._id}, book => {
				if(book.length > 0){
					self.db.update('booking', {_id: data._id}, {noi: data.noi}, (err, result) => {
						res.json(common.getResponses('001', {book_id: data._id}));
					});
				}else{
					self.db.insert('content', data, (err, result) => {
						res.json(common.getResponses('001', {book_id: data._id}));
					});
				}
			});
		});
	};

	this.saveBooking = function(req, res) {
		if(!req.isAdmin && typeof req.body.mobile == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}

		if(typeof req.body.booking_id == 'undefined' || 
			typeof req.body.qty == 'undefined' ||
			typeof req.body.name == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}

		if(typeof req.body.qty == 'string'){
			if(!req.body.qty.isNumeric()){
				res.json(common.getResponses('002', {}));
				return;
			}
		}

		var data = {
			booking_id: req.body.booking_id,
			qty: parseInt(req.body.qty),
			name: req.body.name,
			mobile: typeof req.body.mobile != 'undefined' ? req.body.mobile : '',
			status: isAdmin ? 1 : 0
		};

		var $wh = {_id: data.booking_id};
		var lookups = [
			{
				$lookup: {
					from: 'booking_list',
					localField: '_id',
					foreignField: 'booking_id',
					as: 'booking_list'
				}
			},
			{ $match: $wh}
		];	

		self.db.connect((db) => {
			db.collection('booking').aggregate(lookups, (err, book) => {
				if(book.length > 0){
					book = book[0];
					var totQty = 0;
					if(book.booking_list.length > 0){
						book.booking_list.forEach((bl, k) => {
							totQty = bl.qty + totQty;
						});
					}
					var availableQty = (book.noi - totQty);
					if(availableQty < data.qty){
						res.json(common.getResponses('002', {msg: 'qty exist'}));
						return;
					}

					callBack(book.booking_list);
				}else
					res.json(common.getResponses('002', {}));
			});
		});

		var callBack = function(bookList){
			data._id = data.booking_id + '_' + bookList.length + 1;
			self.db.insert('booking_list', data, (err, result) => {
				res.json(common.getResponses('001', {insert_id: data._id}));
			});
		};
	};

	this.updateBooking = function(req, res){

		if(typeof req.body.qty == 'string'){
			if(!req.body.qty.isNumeric()){
				res.json(common.getResponses('002', {}));
				return;
			}
		}

		if(typeof req.body.booking_id == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}

		if(typeof req.body.txn_id == 'undefined'
			&& typeof req.body.mobile == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}
		var match = {
			_id: typeof req.body.txn_id != 'undefined' ? req.body.txn_id : '',
			mobile: typeof req.body.mobile != 'undefined' ? req.body.mobile : ''
		};
		var data = {status: 1};
		if(typeof req.body.qty != 'undefined')
			data.qty = req.body.qty;

		if(typeof req.body.name != 'undefined')
			data.name = req.body.name;

		if(isAdmin && typeof req.body.mobile != 'undefined')
			data.mobile = req.body.mobile;
		var cond = {
			$or: [
				{_id: req.body.booking_id + '_' + match._id},
				{$and: [
					{booking_id: req.body.booking_id},
					{mobile: match.mobile}
				]}
			]
		};

		var $wh = {_id: req.body.booking_id};
		var lookups = [
			{
				$lookup: {
					from: 'booking_list',
					localField: '_id',
					foreignField: 'booking_id',
					as: 'booking_list'
				}
			},
			{ $match: $wh}
		];

		var callBack = function(exist_id, cb) {
			self.db.connect((db) => {
				db.collection('booking').aggregate(lookups, (err, book) => {
					if(book.length > 0){
						book = book[0];
						var totQty = 0;
						if(book.booking_list.length > 0){
							book.booking_list.forEach((bl, k) => {
								if(bl._id != exist_id)
									totQty = bl.qty + totQty;
							});
						}
						var availableQty = (book.noi - totQty);
						if(availableQty < data.qty){
							res.json(common.getResponses('002', {msg: 'qty exist'}));
							return;
						}
						cb();
					}else
						res.json(common.getResponses('002', {}));
				});
			});
		};

		self.db.get('booking_list', cond, bookList => {
			if(bookList.length > 0){
				bookList = bookList[0];

				var cb = function() {
					if(!isAdmin && bookList.status == 0){
						res.json(common.getResponses('002', {msg: 'not verified'}));
						return;
					}
					self.db.update('booking_list', {_id: bookList._id}, data, (err, result) => {
						res.json(common.getResponses('001', {}));
					});
				};

				if(typeof req.body.qty != 'undefined')
					callBack(bookList._id, cb);
				else
					cb();
			}else
				res.json(common.getResponses('002', {}));
		});
	};

	this.verifyBooking = function(req, res){
		if(typeof req.body.txn_id == 'undefined'){
			res.json(common.getResponses('002', {}));
			return;
		}

		self.db.update('booking_list', {_id: req.body.txn_id}, {status: 1}, (err, result) => {
			res.json(common.getResponses('001', {}));
		});
	};
};

 module.exports = Booking;