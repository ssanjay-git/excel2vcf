/**
 * PreviewProgramController
 *
 * @description :: Server-side logic for managing Previewprograms
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var fs = require('fs');
var node_xj = require("xls-to-json");;
var vCard = require( 'vcf');

module.exports = {
  /**
   * Uplaod image or doc to local directory(assets/images)
   *
   * @param      {Object}  req     The request
   * @param      {Object}  res     The resource
   * @return     {Object}          json response
   */
  uploadFileToLocal: function(req, res) {
    console.log('in reques tfile');
    var dirPath = 'assets/';
    
    var uploadPath = require('path').resolve(sails.config.appPath, dirPath);

    req.file('file').upload({
      maxBytes: '500000000', //50 Mb file allowed to upload
      dirname: uploadPath
    },function(err, uploadedFiles) {
      if (err) {
        return res.serverError(err);
      }
      
      if (uploadedFiles && uploadedFiles[0]) {
        node_xj({
          input: uploadedFiles[0].fd,  // input xls
          output: null, // output json
          sheet: null // specific sheetname
        }, function(err, results) {
          if(!err) {
              var string = '';
            _.forEach(results, function(val) {
              var vcard = new vCard();
              vcard.add('fn');
              vcard.set('fn', val.name);
              vcard.add('tel');
              vcard.set('tel', val.contact_number, {type: [ 'cell', 'voice']});
              vcard.add('email');
              vcard.set('email', val.email);
              string = string + vcard.toString();
            });
            fs.writeFile('contacts.vcf', string, function(err) {
              if(!err) {
                res.download('contacts.vcf');
              }
            });
          } 
        });
      }
    });
  }
};