function CurrentDateShowing(e) {
    if (!e.get_selectedDate() || !e.get_element().value) {
        e._selectedDate = (new Date()).getDateOnly();
    }
}

function numeralsOnly(event) {
    var numbersAndWhiteSpace = /[0-9]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || numbersAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_txtArea").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(QR_NUM_MOBNO);
        return false;
    }
}


function numeralsOnlyAge(event) {
    var numbersAndWhiteSpace = /[0-9]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || numbersAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_ddlGender").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(QR_NUM_AGE);
        return false;
    }
}

function LastName(event) {
    var englishAlphabetAndWhiteSpace = /[-A-Za-z ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || englishAlphabetAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_txtFirstName").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblsuccessmsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(QR_NONNUM_LNAME);
        return false;
    }
}

function FirstName(event) {
    var englishAlphabetAndWhiteSpace = /[A-Za-z ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || englishAlphabetAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_txtMiddleName").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(QR_NONNUM_FNAME);
        return false;
    }
}


function MiddleName(event) {
    var englishAlphabetAndWhiteSpace = /[A-Za-z. ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || englishAlphabetAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_txtMobileNo").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(QR_NONNUM_MNAME);
        return false;
    }
}





function Check_Mob_No(event) {
    if (ContentPlaceHolder1_txtMobileNo.value.length < 10) {
        if (ContentPlaceHolder1_txtMobileNo.value.length == 0) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return false;
        }
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        return true;
    }
}


function isNumberKey(event) {
    ResetErrorMessage();
    var numbersAndWhiteSpace = /[0-9]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        return true;
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_NUM);
        return false;
    }
}

function ResetErrorMessage() {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    };

function RadioCheck(rb) {
    var gv = $("#ContentPlaceHolder1_grdTodaysAppointments");
    var rbs = $(gv).find("input");
    var row = rb.parentNode.parentNode;

    for (var i = 0; i < rbs.length; i++) {
        if (rbs[i].type == "radio") {
            if (rbs[i].checked && rbs[i] != rb) {
                rbs[i].checked = false;
                break;
            }
        }
    }
}


