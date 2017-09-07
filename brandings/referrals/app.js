window.onload = function() {
    console.log("window.onload");
    $(document).ready(function() {
        console.log("$(document).ready");
        rogerthat.callbacks.ready(onRogerthatReady);
    });
}; 

var onRogerthatReady = function() {
    console.log("onRogerthatReady()");
    rogerthat.api.callbacks.resultReceived(onReceivedApiResult);

    $(document).on("click", ".set-referrer-button", function() {
    	sendInvitationCode();
    });
};

var onReceivedApiResult = function(method, result, error, tag) {
    console.log("onReceivedApiResult");
    console.log("method: " + method);
    console.log("result: " + result);
    console.log("error: " + error);

    if (method == "referrals.set") {
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
};

var sendInvitationCode = function() {
    $.mobile.loading( 'show', {
        text: "Validating you invitation code",
        textVisible: true,
        theme: 'a',
        html: ""
    });
    
    $(".set-referrer-result").hide();
	$(".set-referrer-error").hide();
    $(".set-referrer").hide();
    
    var p = JSON.stringify({
        'code' : $('#invitation_code').val()
    });
    rogerthat.api.call("referrals.set", p, "");
};

var hideLoading = function() {
    console.log('hiding loading');
    $.mobile.loading('hide');
};
