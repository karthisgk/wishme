
window.onload = function () {
	var chart1 = document.getElementById("line-chart");
	if(chart1 != null) {
		chart1 = chart1.getContext("2d");
		window.myLine = new Chart(chart1).Line(lineChartData, {
			responsive: true,
			scaleLineColor: "rgba(0,0,0,.2)",
			scaleGridLineColor: "rgba(0,0,0,.05)",
			scaleFontColor: "#c5c7cc"
		});
	}
};

function get_time_difference(earlierDate, laterDate) 
{
    var oDiff = new Object();

    //  Calculate Differences
    //  -------------------------------------------------------------------  //
    laterDate = new Date(laterDate);
    earlierDate = new Date(earlierDate);
    var nTotalDiff = laterDate.getTime() - earlierDate.getTime();

    oDiff.days = Math.floor(nTotalDiff / 1000 / 60 / 60 / 24);
    nTotalDiff -= oDiff.days * 1000 * 60 * 60 * 24;

    oDiff.hours = Math.floor(nTotalDiff / 1000 / 60 / 60);
    nTotalDiff -= oDiff.hours * 1000 * 60 * 60;

    oDiff.minutes = Math.floor(nTotalDiff / 1000 / 60);
    nTotalDiff -= oDiff.minutes * 1000 * 60;

    oDiff.seconds = Math.floor(nTotalDiff / 1000);
    //  -------------------------------------------------------------------  //

    //  Format Duration
    //  -------------------------------------------------------------------  //
    //  Format Hours
    var hourtext = '00';
    if (oDiff.days > 0){ hourtext = String(oDiff.days);}
    if (hourtext.length == 1){hourtext = '0' + hourtext};

    //  Format Minutes
    var mintext = '00';
    if (oDiff.minutes > 0){ mintext = String(oDiff.minutes);}
    if (mintext.length == 1) { mintext = '0' + mintext };

    //  Format Seconds
    var sectext = '00';
    if (oDiff.seconds > 0) { sectext = String(oDiff.seconds); }
    if (sectext.length == 1) { sectext = '0' + sectext };

    //  Set Duration
    var sDuration = hourtext + ':' + mintext + ':' + sectext;
    oDiff.duration = sDuration;
    //  -------------------------------------------------------------------  //
    var d =oDiff;
    d.string = '';
    if(d.days > 0){
      d.string += d.days == 1 ? d.days+' Day' : d.days+' Days';
      if(d.hours != 0)
        d.string += d.hours == 1 ? ' '+d.hours+' Hr' : ' '+d.hours+' Hrs';
      if(d.minutes != 0)
          d.string += d.minutes == 1 ? ' '+d.minutes+' min' : ' '+d.minutes+' mins';
      if(d.seconds != 0)
            d.string += d.seconds == 1 ? ' '+d.seconds+' sec' : ' '+d.seconds+' secs';
    }
    else if(d.days == 0){
      if(d.hours > 0){
        d.string += d.hours == 1 ? d.hours+' Hr' : d.hours+' Hrs';
        if(d.minutes != 0)
          d.string += d.minutes == 1 ? ' '+d.minutes+' min' : ' '+d.minutes+' mins';
        if(d.seconds != 0)
          d.string += d.seconds == 1 ? ' '+d.seconds+' sec' : ' '+d.seconds+' secs';
      }
      else{
        if(d.minutes > 0){
          d.string += d.minutes == 1 ? d.minutes+' min' : d.minutes+' mins';
          if(d.seconds != 0)
            d.string += d.seconds == 1 ? ' '+d.seconds+' sec' : ' '+d.seconds+' secs';
        }else
          d.string += d.seconds <= 1 ? d.seconds+' sec' : d.seconds+' secs';
      }
    }
    return d;
}

function current_time(t) {
  var t = typeof t === 'undefined' ? '' : t;
  if(t != '')
    t = typeof t !== 'object' ? new Date( t ) : t;
  var time = t == '' ? new Date() : t;
  var date = 
    time.getFullYear() +'-'+ 
    ('0' + (time.getMonth() + 1)).slice(-2) +'-'+
    ('0' + time.getDate()).slice(-2);
  var format = 
    ("0" + time.getHours()).slice(-2)   + ":" + 
    ("0" + time.getMinutes()).slice(-2) + ":" + 
    ("0" + time.getSeconds()).slice(-2);
  return date+' '+format;
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

var Spinner = $('<i class="fa fa-spinner fa-spin" style="font-size:24px"></i>');

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
          else if($(ele).attr('type') == 'password'){
            var eq_id = $(ele).attr('data-equalto');
            if(ele.value != $(eq_id).val())
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

var Myevent = 'keyup keypress blur change mouseenter mouseleave click';

$.fn.makeFormData = function(reqlx) {
  var post = {};
  $.each(this, function(k, ele){
    var ind = $(ele).attr('id').replace(reqlx, '');
    post[ind] = ele.value;
  });
  return post;
};

$.fn.setValue = function(d, reqlx) {
  $.each(this, function(k, ele){
    var ind = $(ele).attr('id').replace(reqlx, '');
    if($('select#'+$(ele).attr('id')).length == 0)
      ele.value = d[ind];
    else
      $(ele).val(d[ind]).change();
  });
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
          $(this).parent().addClass('has-error');
        else
          $(this).parent().removeClass('has-error');
        if($(this).attr('type') == 'password'){
          if(typeof $(this).attr('data-equalto') !== 'undefined' && $(this).checkInput())
            $($(this).attr('data-equalto')).removeClass('has-error');
        }
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

function changeLang(msg = ''){return msg};

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

function uniqueid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

function intGallery(imageArray) {
  /*$('#gallery').flexPhotoGallery({
      imageArray: imageArray,
      isViewImageOnClick: true
  });*/
  $('#gallery').html('');
  if(imageArray.length > 0) {
    imageArray.forEach((d, k) => {
      var id = 'gal-' + uniqueid();
      var $ele = '<div class="col-lg-4 col-sm-6 col-xs-12 grid" data-id="'+d.id+'" id="'+id+'">\
                    <i class="fa fa-close remove-pic"></i>\
                    <div style="background: url(\'' + d.url + '\');">\
                    </div>\
                  </div>';
      $('#gallery').append($ele);
      $('#gallery').children('#'+id).mouseover(function(){
        console.log(this.getAttribute('data-id'));
      });
    });
  }
}

var defUrl = baseurl;
var ajx = function(req, d){
  reqUrl = typeof reqUrl == 'undefined' ? defUrl : reqUrl;
  var xhr = new XMLHttpRequest();xhr.open(typeof req.method == 'undefined' ? 'GET' : req.method, reqUrl + req.path);
  if(typeof req.token != 'undefined')
    xhr.setRequestHeader('token', req.token);
  xhr.send(d);
  return xhr;
}

var addHour = function(t, h) {    
   t.setTime(t.getTime() + (h*60*60*1000)); 
   return t;   
};

var $ajx = function(req, d){
  reqUrl = typeof reqUrl == 'undefined' ? defUrl : reqUrl;
  var cfg = {
      type: typeof req.method == 'undefined' ? 'GET' : req.method,
      url: reqUrl + req.path,
    data: d
  };
  if(typeof req.head != 'undefined')
    cfg.headers = req.head;
  if(typeof req.token != 'undefined')
    cfg.headers = {token: req.token};
  return $.ajax(cfg);
}

var files = [];
var imageArray = [];
$(document).ready(function(){
  $('#gallery').html('');
  $('.form-control.form-input').prop('required', true);
  if($('#inputs input[data-id="bDay"]').length > 0){
    var today = addHour(new Date(), 24).toISOString().split('T')[0];
    $('#inputs input[data-id="bDay"]')[0].setAttribute('min', today);
  }

  var content_id = $('#inputs input[data-id="_id"]').val();
  if(content_id != '' && typeof triggerWish == 'undefined'){
    $('#loading').show();
    $ajx({path: '/getcontent/' + content_id}).done((data) => {
      if(data.code == 'SGK_001'){
        $.each($('.form-input'), function(k, ele){
          $(ele).val(data.data.content[ele.getAttribute('data-id')]);
        });

        var count = 0;
        files = files.concat(data.data.content.images);
        data.data.content.images.forEach((img, k) => {                   
              /*ar g = new Image();
              g.onload = function(){
                var img = {};
                img.url = g.src;
                img.width = this.width;
                img.height = this.height;
                imageArray[k] = img;           
                count++;
                if(count == data.data.content.images.length){
                  $('#loading').hide();
                  intGallery(imageArray);
                }
              };
              g.src = img;*/
              var id = 'pic-' + uniqueid();
              imageArray[k] = {url: img, id: id};
              count++;
              if(count == data.data.content.images.length){
                $('#loading').hide();
                intGallery(imageArray);
              }
        });
      }
    });
  }

  $('#pic').change(function(){
    for (var i = 0; i < this.files.length; i++) {
      var ext = this.files[i].name.split('.').pop().toLowerCase();
      if($.inArray(ext, ['png','jpg','jpeg']) != -1)
        files.push(this.files[i]);
    };

    var count = 0;
    $('#loading').show();
    files.forEach((f, k) => {
      if(typeof f.name != 'undefined'){             
          /*var g = new Image();
          g.onload = function(){
            var img = {};
            img.url = g.src;
            img.width = this.width;
            img.height = this.height;
            imageArray[k] = img;           
            count++;
            if(count == files.length){
              $('#loading').hide();
              intGallery(imageArray);
            }
          };
          g.src = URL.createObjectURL(f);*/
          count++;
          var id = 'pic-' + uniqueid();
          imageArray[k] = {url: URL.createObjectURL(f), id: id};
          if(count == files.length){
            $('#loading').hide();
            intGallery(imageArray);
          }
      }else
        count++;
    });    
  });

  $('#submit').off().click(function(){
    $('#custom-error-tag').hide();
    $('#inputs input[data-id="bDay"]').removeAttr('min');
    if(!$('#s-form').parsley().validate())
        return;

    var toEmail = $('#inputs input[data-id="toEmail"]').val();
    if(!toEmail.isEmail()){
      if(toEmail.length < 10 || !toEmail.isNumeric()){
          $('#custom-error-tag').show().find('li').text('Enter valid email address or mobile number');
          return;
      }
    }

    var today = addHour(new Date(), 24).toISOString().split('T')[0];
    if(current_time().split(' ')[0] >= $('#inputs input[data-id="bDay"]').val()){
      $('#custom-error-tag').show().find('li').text('Select Future Date');
      return;
    }
    var fd = new FormData();
    fd.append('_id', $('#inputs input[data-id="_id"]').val());
    fd.append('name', $('#inputs input[data-id="name"]').val());
    fd.append('toEmail', toEmail);
    fd.append('message', $('#inputs [data-id="message"]').val());
    fd.append('bDay', $('#inputs input[data-id="bDay"]').val());
    files.forEach((f, k) => {
      if(typeof f.name != 'undefined')
        fd.append('photos', f);
    });
    if($('#inputs input[data-id="_id"]').val() == '' && fd.getAll('photos').length < 2){
      $('#custom-error-tag').show().find('li').text('Must upload 2 images');
      return;
    }
    $('#loading').show();
    var xhr = ajx({path: '/upload', method: 'post'}, fd);
    var complete = function(){
      $('#loading').hide();
      var res = JSON.parse(xhr.responseText);
      if(res.code == 'SGK_001'){
        location.href = baseurl + '/upd/' + res.data.content_id;
      }else
        $('#custom-error-tag').show().find('li').text(res.message);
    };
    xhr.addEventListener('load', complete);
  });


  $(document).keyup(function(e){
    if(e.keyCode == 39){
      if($('#modal-container.blowup .modal-next-button').css('display') != 'none')
        $('#modal-container.blowup .modal-next-button').click();
    }
    else if(e.keyCode == 37){
      if($('#modal-container.blowup .modal-prev-button').css('display') != 'none')
        $('#modal-container.blowup .modal-prev-button').click();
    }
  })
});