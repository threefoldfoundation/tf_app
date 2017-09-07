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
    	if (result) {
    		$(".set-referrer-result").show();
    		$(".set-referrer-error").hide();
    		$(".set-referrer").hide();
            $(".set-referrer-result p").text(error);
    	} else {
    		$(".set-referrer-result").hide();
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
    
    var p = JSON.stringify({
        'code' : $('#invitation_code').text()
    });
    rogerthat.api.call("referrals.set", p, "");
};
