(function () {
  'use strict';
  console.log('test');
  var smsElem = $('#invite_sms');
  var emailElem = $('#invite_email');
  var codeElem = $('#invitation_code');
  rogerthat.callbacks.ready(function () {
    console.log('rogerthat is ready');
    var code = rogerthat.user.data.invitation_code;
    var userName = rogerthat.user.data.name || rogerthat.user.name;
    var appId = rogerthat.system.appId;
    var message = 'Hi,\n\n' +
      'I\'d like to invite you the ThreeFold community.' +
      ' You can download the Android or iOS app at https://rogerth.at/install?a=' + appId +
      '\n\n' +
      'To become a registered user in the app, you can use my invitation code ' + code + '.' +
      '\n\n' +
      'Welcome on board!\n' + userName;
    var subject = 'Invitation to Threefold community';
    var smsHref = 'sms:?body=' + encodeURIComponent(message);
    var emailHref = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
    smsElem.attr('href', smsHref);
    emailElem.attr('href', emailHref);
    codeElem.text(code);
  });
})();
