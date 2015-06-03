document.getElementById("submit").onclick = function () {

    if (document.getElementById("switch-inverse").checked) {

        chrome.runtime.sendMessage({method: "enablePopup"}, function (response) {
            alert('Your settings have been changed.');
            window.close();
        });
    }
    else {
        chrome.runtime.sendMessage({method: "disablePopup"}, function (response) {
            alert('Your settings have been changed.');
            window.close();
        });
    }
};


chrome.runtime.sendMessage({method: "checkPluginDisabled"}, function (response) {
    // if(response.message==='true'){
    // 	document.getElementById("option_yes").checked = true;
    // }
    // else{
    // 	document.getElementById("option_no").checked = true;
    // }
});