var common = require('../../public/common.js');
var collection = {};
collection.createContent = function(db, cb) {
   db.createCollection("content", {
      validator: {
         $jsonSchema: {
            bsonType: "object",
            required: [ "toEmail", "message" ],
            properties: {
               First_Name: {
                  toEmail: "string",
                  description: "must be a string and is required"
               },
               message: {
                  bsonType: "string",
                  description: "must be a string and is required"
               }
            }
         }
      }
   }, (err, collection) => {
      cb();
   });
};

module.exports = collection;