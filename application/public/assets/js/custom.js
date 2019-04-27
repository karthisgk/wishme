jQuery(function(t){
    "use strict"

});

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

String.prototype.isURL = function(){
  var urlregex = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;
  return urlregex.test(this);
};

String.prototype.isEmail = function(){
  var pattern = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
  return pattern.test(this);
};

String.prototype.isJson = function(){
  try {
      JSON.parse(this);
  } catch (e) {
      return false;
  }
  return true;
};

String.prototype.input_validate = function(){
  return this.replace(/["'<>`{}|\\]/g, '');
};

String.prototype.alpha_numeric = function(){
  return this.replace(/\W+/g, '');
};

String.prototype.num_validate = function(opt = 0){

  if(this.trim() === '')
    return '';

  if(opt == 0) /*return integer*/
    return parseInt(this.replace(/[^0-9]/g, ""));
  else /*return float*/
    return parseFloat(this.replace(/[^0-9-.]/g, ""));
};

String.prototype.isNumeric = function(){
  return /^[0-9]+$/.test(this);
};

(function($, undefined) {

    $.fn.checkInput = function() {
      var rt = true;      
      $.each(this, function(k, ele){
        if(ele.value == '')
          rt = false;
        else{
          if($(ele).attr('type') == 'text')
            ele.value = ele.value.input_validate();
          else if($(ele).attr('type') == 'num' || $(ele).attr('type') == 'number'){
            ele.value = ele.value.num_validate();
            if(ele.value.match(/^[0-9]+$/) == null)
              rt = false;
          }
          else if($(ele).attr('type') == 'email'){
            if(!ele.value.isEmail())
              rt = false;
          }
          else if($(ele).attr('type') == 'url'){
            if(!ele.value.isURL())
              rt = false;
          }
        }
      });
      return rt;
    };

    $.fn.initPhoneCode = function(px = '22px'){
      this.off('focusin focusout');
      this.parent().find('.country-phone-code').hide();
      this.css('padding-left', px);
      this.focusin(function(){
          $(this).parent().find('.country-phone-code').show();
      });

      this.focusout(function(){
        if(this.value == '')
          $(this).parent().find('.country-phone-code').hide();
      });
    };

})(jQuery);

$.fn.makeFormData = function(reqlx) {
  var post = {};
  $.each(this, function(k, ele){
    var ind = $(ele).attr('id').replace(reqlx, '');
    post[ind] = ele.value;
  });
  return post;
};

$.fn.initPopup = function(opt = {}){
  var main = this;
  var option = {
    dummyForm: main.find('form.modal-form').length > 0 ? main.find('form.modal-form') : $(document.createElement('form')),
    dummyInputs: main.find('form.modal-form .modal-inputs').length > 0 ? main.find('form.modal-form .modal-inputs') : $(document.createElement('input')),
    dummySubmit: main.find('form.modal-form .modal-submit').length > 0 ? main.find('form.modal-form .modal-submit') : $(document.createElement('button')),
    modal: main
  };
  if(opt.form)
    option.form = option.modal.find(opt.form).length > 0 ? option.modal.find(opt.form) : option.dummyForm;
  else
    option.form = option.dummyForm;
  if(opt.inputs)
    option.inputs = option.form.find(opt.inputs).length > 0 ? option.form.find(opt.inputs) : option.dummyInputs;
  else
    option.inputs = option.dummyInputs;
  if(opt.submit)
    option.submit = option.form.find(opt.submit).length > 0 ? option.form.find(opt.submit) : option.dummySubmit;
  else
    option.submit = option.dummySubmit;
  option.isPhone = opt.isPhone ? true : false;
  option.shortKey = '';
  if(opt.shortKey)
    option.shortKey = opt.shortKey;
  var basic = {
    ele: {
      form: option.form,
      inputs: option.inputs,
      submit: option.submit,
      modal: option.modal,
      isPhone: option.isPhone,
    },
    formKey: option.shortKey,
    Events: 'keyup keypress blur change mouseenter mouseleave click',
    validate: function(){
      var rt = basic.ele.inputs.checkInput();    
      if(!rt)
        basic.ele.submit.prop('disabled', true);
      else
        basic.ele.submit.prop('disabled', false);
      return rt;
    },
    submit: function(){
      var validate = (!basic.ele.submit.prop('disabled') && basic.validate());
      if(validate)
        basic.ele.form.find('p.form-error-msg').text('').hide();
      var rt = validate ? basic.ele.inputs.makeFormData(new RegExp(basic.formKey)) : {};
      if(opt.afterSubmit)
        opt.afterSubmit(rt, validate);
    },
    resetForm: function(){
      basic.ele.inputs.parent().removeClass('form-group--active');
      basic.ele.inputs.val('');
      basic.ele.modal.find('*').off(basic.Events);
    },
    init: function(){
      basic.resetForm();
      basic.ele.modal.modal();
      basic.ele.submit.prop('disabled', true).click(basic.submit);
      basic.ele.inputs.on(Myevent, function(){
        basic.validate();
      }).change(function(){
        if(!$(this).checkInput())
          $(this).addClass('validate-error');
        else
          $(this).removeClass('validate-error');
      });
      if(basic.ele.isPhone) {
        basic.ele.form.find('.country-phone-code').hide();
        basic.ele.form.find('[type="number"]').initPhoneCode('32px');
      }
    }
  };
  basic.init();
  var rt = {reset: basic.resetForm, validate: basic.validate};
  rt.ajaxComplete = function(resp = {}){
    if($.isEmptyObject(resp))
      return;

    if(resp.result == 'success'){
      basic.ele.form.find('p.form-error-msg').text('').hide();
      basic.ele.modal.find('a.open-success').click();
      basic.resetForm();
      basic.ele.modal.find('.success-tab p.success-alert').text(changeLang(resp.message)).show();
    }else
      basic.ele.form.find('p.form-error-msg').text(changeLang(resp.message)).show();
  };
  rt.open = function(){
    basic.ele.modal.find('a.open-form').click();
  };
  return rt;
};

String.prototype.short_string = function(len) {
    return this.length > len ? this.substring(0, len)+'...' : this;
}

function timerCallback(interval, callback) {
  var i = 1;
  setTimeout(function(){
    if(i == 1)
      callback();
  },  interval);
}

function sweet_alert(callback, msg = ''){
  swal({
    title: changeLang('Are you sure?'),
    text: msg == '' ? changeLang('You Want to Delete it.') : changeLang(msg),
    type: "warning",
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: changeLang('Yes'),
    cancelButtonText: changeLang('No'),
    closeOnConfirm: false
  },callback);
}

var Base64={_keyStr:"abcdefghijklmnopqrstuvwxyz0123456789",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function uniqueid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

function round_num(num){
  return isFloat(num) == true ? parseFloat(num).toFixed(2) : num;
}

$(document).ready(function(){
  
});

function copysoon(id){
  var text = $(id).val().trim();

  var copyFrom = $('<textarea/>');
  copyFrom.css({
   position: "absolute",
   left: "-1000px",
   top: "-1000px",
  });
   copyFrom.text(text);
   $('body').append(copyFrom);
   copyFrom.select();
   document.execCommand('copy');
   $(id).select();
   $("#error_tag_success").text("Link Copied");
   return false;
}

function printDiv() {
     var printContents = document.getElementById('print_invoice').innerHTML;
     var originalContents = document.body.innerHTML;

     document.body.innerHTML = printContents;

     window.print();

     document.body.innerHTML = originalContents;
     
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function changeLang(msg){
  return msg;
}

function readURL(input,img_id) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $(img_id).attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function imagechange(event){        
    $('.watermark_valid').hide();
    var src = URL.createObjectURL(event.target.files[0]);
    var ext = $('#watermark').val().split('.').pop().toLowerCase();
    if($.inArray(ext, ['jpg','jpeg']) == -1) {
        $("#watermark").val('');
        $('#watermark_prev').attr('src','');
    }else{
        $('#watermark_prev').attr('src', src);
    }
}

