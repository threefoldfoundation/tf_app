$(document).ready(function () {
    console.log("$(document).ready");
    rogerthat.callbacks.ready(onRogerthatReady);
});

function onRogerthatReady() {
    console.log("onRogerthatReady()");
    rogerthat.api.callbacks.resultReceived(onReceivedApiResult);

}

function onReceivedApiResult(method, result, error, tag) {
    console.log("onReceivedApiResult");
    console.log("method: " + method);
    console.log("result: " + result);
    console.log("error: " + error);

    if (method === "referrals.set") {
        hideLoading();
        if (result) {
            $(".set-referrer-result").show();
            $(".set-referrer-result p").text(result);
        } else {
            $(".set-referrer-error").show();
            $(".set-referrer").show();
            $(".set-referrer-error p").text(error);
        }
    }
}

function sendInvitationCode() {
    $.mobile.loading('show', {
        text: "Validating invitation code",
        textVisible: true,
        theme: 'a',
        html: ""
    });

    $(".set-referrer-result").hide();
    $(".set-referrer-error").hide();
    $(".set-referrer").hide();
    var p = JSON.stringify({
        'code': $('#invitation_code').val()
    });
    rogerthat.api.call("referrals.set", p, "");
}

$('#invitation_code').keyup(function () {
    var dis = $(this);
    if (dis.val()) {
        dis.val(dis.val().toLowerCase());
    }
});
$('#set-referrer').submit(function (e) {
    e.preventDefault();
    sendInvitationCode();
});

function hideLoading() {
    console.log('hiding loading');
    $.mobile.loading('hide');
}
