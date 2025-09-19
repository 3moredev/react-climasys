function SaveForm() {

    ResetErrorMessage();
    var ele = $('.addmedicine');
    var rem = $('.addrem');

    var attachrem = $('.fileupload');
   

    var lastmedicine = '';
    var lastreminder = '';
    var lastattachdile = '';
    var val = true;
    filevalidation(val);


    if (filevalidation(val)) {
    if ((ele.length == 0) && (rem.length == 0) && (attachrem.length==0)) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_REM_MED);
        return false;
    }


    var txtpriority = 0;

    for (var i = 0; i < ele.length; i++) {
        var numbersAndWhiteSpace = /[1-9]/;
        var medicinename = $(ele[i]).find(".lblmedicine").text();
        var categoryname = $(ele[i]).find(".lblcategory").text();
        var subcategoryname = $(ele[i]).find(".lblsubcategory").text();
        var brandname = $(ele[i]).find(".hdn_brand_value").val();
        var txtpriority2 = $(ele[i]).find(".txtaddpriority").val();

        if ((txtpriority2 != '')) {
            if (/^\d+$/.test(txtpriority2) == false) {
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(AP_NUM_PRIORITY);
                return false;
            } else {

                txtpriority = Number(txtpriority2);
                //txtpriority == txtpriority++;
            }
        }

        if ((txtpriority2 == '')) {
            txtpriority == txtpriority++;
        }


        //var brand = document.getElementById('ContentPlaceHolder1_hdnbrandname').value;

        var medicinelist = categoryname + '#@' + subcategoryname + '#@' + medicinename + '#@' + brandname + '#@' + txtpriority;
        if (i == 0) {
            lastmedicine = medicinelist;
        }
        else {
            lastmedicine = lastmedicine + '@%&' + medicinelist;
        }
    }


    for (var i = 0; i < rem.length; i++) {

        var reminder = $(rem[i]).find(".lblreminder").text();
        if (i == 0) {
            lastreminder = reminder;
        }
        else {
            lastreminder = lastreminder + '@%&@' + reminder;
        }
    }



    var values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = values.split(',');

    var obj_file = $('#ContentPlaceHolder1_FU_AttachDocument');
    var img = $(obj_file).get(0).files;

  

    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    var files = fileUpload.files;

    var data = new FormData();
   
    for (var i = 0; i < files.length; i++) {
        var l = 0;
        for (var j = 0; j < validatedFiles.length; j++) {
            if (validatedFiles[j] == files[i].name) {
                l = 1;
                // alert("ma " + files[i].name);
            }
        }

        if (l == 0) {

            //alert("nma " + files[i].name);
            data.append(files[i].name, files[i]);
        }
    }


    data.append("p_str_Todays_Patient_VisitDate", value_medicine[0]);
    data.append("p_int_Shift_ID", value_medicine[1]);
    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[3]);
    data.append("p_int_MR_ID", value_medicine[4]);
    data.append("p_str_Visit_Time", value_medicine[5]);
    data.append("p_str_companyID", value_medicine[6]);
    data.append("p_str_medicinedetails", lastmedicine);
    data.append("p_str_MarketedBy", value_medicine[8]);
    data.append("p_bool_Isactive", value_medicine[9]);
    data.append("p_str_UserId", value_medicine[10]);
    data.append("p_float_morning", value_medicine[11]);
    data.append("p_float_afternoon", value_medicine[12]);
    data.append("p_float_night", value_medicine[13]);
    data.append("p_int_days", Number(value_medicine[14]));
    data.append("p_str_instruction", value_medicine[15]);
    data.append("p_str_reminder", lastreminder);


    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/Save_MR_Medicine_Reminders",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;
           
            for (var i = 0; i < data.length; i++) {

                var Status = data[0].SAVE_STATUS;
                if (Status == 0) {
                    $("html, body").animate({
                        scrollTop: 0
                    }, 600);
                    $("#ContentPlaceHolder1_lblmedsuccess").empty();
                    $("#ContentPlaceHolder1_lblErrorBrandName").empty();
                    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
                    $("#ContentPlaceHolder1_lblErrorMsg").empty();
                    $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_APPOINTMENT);
                    $('#ContentPlaceHolder1_txtsearchmedicine').val('');
                    $('#ContentPlaceHolder1_txtReminder').val('');
                    document.getElementById("btnaddmedicine").disabled = true;
                    document.getElementById("Button3").disabled = true;
                    document.getElementById("Button2").disabled = true;
                    document.getElementById("btnSubmit").disabled = true;
                    document.getElementById("btnCancel").disabled = true;

                    document.getElementById("btnrepeatreminder").disabled = true;
                    document.getElementById("btn_submit").disabled = true;
                    document.getElementById("btn_Cancel").disabled = true;
                    var ele_rem = $('.fa-pencil-square-o');
                    var ele_med = $('.fa-trash-o');
                    //alert(ele_rem.length);
                    $(ele_rem).attr('onclick', '');
                    $(ele_med).attr('onclick', '');
                    $("#ContentPlaceHolder1_txtsearchmedicine").attr("readonly", true);
                    $("#ContentPlaceHolder1_txtBrandName").attr("readonly", true);
                    $("#ContentPlaceHolder1_txtMedicineName").attr("readonly", true);
                    $("#ddlCatagory").attr("readonly", true);
                    $("#ddlSubCatagory").attr("readonly", true);
                }
                else {

                    $("#ContentPlaceHolder1_lblmedsuccess").empty();
                    $("#ContentPlaceHolder1_lblErrorBrandName").empty();
                    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
                    $("#ContentPlaceHolder1_lblappointmentsuccess").append(SAVE_SUCCESS);
                    $('#ContentPlaceHolder1_txtsearchmedicine').val('');
                    $('#ContentPlaceHolder1_txtReminder').val('');
                    document.getElementById("btnaddmedicine").disabled = true;
                    document.getElementById("Button3").disabled = true;
                    document.getElementById("Button2").disabled = true;
                    document.getElementById("btnSubmit").disabled = true;
                    document.getElementById("btnCancel").disabled = true;

                    document.getElementById("btnrepeatreminder").disabled = true;
                    document.getElementById("btn_submit").disabled = true;
                    document.getElementById("btn_Cancel").disabled = true;
                    var ele_rem = $('.fa-pencil-square-o');
                    var ele_med = $('.fa-trash-o');
                    //alert(ele_rem.length);
                    $(ele_rem).attr('onclick', '');
                    $(ele_med).attr('onclick', '');
                    $("#ContentPlaceHolder1_txtsearchmedicine").attr("readonly", true);
                    $("#ContentPlaceHolder1_txtBrandName").attr("readonly", true);
                    $("#ContentPlaceHolder1_txtMedicineName").attr("readonly", true);
                    $("#ddlCatagory").attr("readonly", true);
                    $("#ddlSubCatagory").attr("readonly", true);
                    alert("Data Saved Successfully!!");
                    window.location = "/MRLogout.aspx";
                }
            }

        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });

    return true;


        } else
        { return false; }
}

function showpopup(one) {

    

    var time = $("#" + one).val();
    var date = $("#" + one + "_1").val();

    var flag = "0";

    $('#reminderdiv').html('');
    $('#divaddmedPopUp').html('');
    var values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetPreviousMRVisitData",
        type: "POST",
        data: {
            p_str_Visit_Date: date,
            p_str_companyname: value_medicine[6],
            p_str_Clinic_ID: value_medicine[2],
            p_str_Doctor_ID: value_medicine[3],
            p_str_visittime: time
        },
        async: false,
        success: function (response) {

            var data = response;

            var reminder = "";
            var medicine = "";
            if (data.length > 0) {
                $find("mpe1").show();
            }
            var k = 0;


            for (var i = 0; i < data.length; i++) {

                

                if (data[i].TABLE0 != null) {
                    $('#ContentPlaceHolder1_lblcompany').html(data[i].Company_Name);
                    $('#ContentPlaceHolder1_lblGetDate').html(data[i].Visit_Date_Time_Shift);
                }

                if ((data[i].TABLE1 == null) || (data[i].TABLE1 === undefined)) {

                    //document.getElementById("btnrepeatreminder").disabled = true;
                } else {
                    flag = "1";

                }

                if (data[i].TABLE1 != null) {
                    //alert(data[i].Reminder_Text);
                    reminder += '<div class="addreminderdiv addremu">';
                    reminder += '<div class="col-md-10 lbldobadj"><span class="lbl-orange lblreminder lblreminderunique" >' + data[i].Reminder_Text + '</span></div>';
                    reminder += '</div>';

                }
                if (data[i].TABLE2 != null) {

                    medicine += '<div id="divaddmedPopUp" class="divaddmed">';
                    medicine += '<div class="row">';
                    medicine += ' <div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    medicine += '<div class="col-xs-6 col-sm-6 col-md-3"><span Class="label1">Brand/Prescription:</span></div>';

                    medicine += ' <div class="col-xs-9 col-sm-3 col-md-5">';
                    medicine += '<span Class="labelbold">' + data[i].Medicine_Name + '</span>';

                    medicine += '</div></div></div>';


                    medicine += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    medicine += '<div class="col-xs-6 col-sm-6 col-md-3"><span Class="label1">Category:</span></div>';



                    medicine += '<div class="col-xs-5 col-sm-6 col-md-5"><span Class="lbl-black">' + data[i].Cat_Short_Name + '</span>';


                    medicine += '</div></div></div>';

                    medicine += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    medicine += '<div class="col-xs-6 col-sm-6 col-md-3"><span Class="label1">SubCategory:</span></div>';



                    medicine += '<div class="col-xs-5 col-sm-6 col-md-5"><span Class="lbl-black">' + data[i].CatSub_Description + '</span>';

                    medicine += '</div></div></div>';

                    medicine += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    medicine += '<div class="col-xs-6 col-sm-6 col-md-3"><span Class="label1">Contains/Molecules:</span></div>';



                    medicine += '<div class="col-xs-5 col-sm-6 col-md-5"><span Class="lbl-black">' + data[i].Brand_Name + '</span>';

                    medicine += '</div></div></div>';

                    medicine += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    medicine += '<div class="col-xs-6 col-sm-6 col-md-3"><span Class="label1">Priority:</span></div>';

                    medicine += '<div class="col-xs-5 col-sm-6 col-md-2">';

                    medicine += '<span Class="lbl-black">' + data[i].MRPriority_Value + '</span>';

                    medicine += '</div></div></div>';

                    //                    medicine += '<div class="row"><div class="col-xs-12 col-sm-12 col-md-12 PPlabelname" style="text-align: left">';

                    //                    medicine += '<div class="col-xs-5 col-sm-6 col-md-3"><span Class="label1">Active:</span></div>';
                    //                    medicine += '<div class="col-xs-5 col-sm-6 col-md-2">';
                    //                    if (data[i].Active == 1) {
                    //                        medicine += '<input type="checkbox" disabled="disabled" checked />';
                    //                    }
                    //                    else {
                    //                        medicine += '<input type="checkbox" disabled="disabled" />';
                    //                    }

                    //                    medicine += '</div></div></div></div>';
                    medicine += '</div>';

                }


                if (data[i].TABLE3 != null) {

                    $('#ContentPlaceHolder1_lbl_MRname_PP').html(data[i].MRNAME);
                }
            }

            if (flag == "1") {
                document.getElementById("btnrepeatreminder").disabled = false;
            } else {
                document.getElementById("btnrepeatreminder").disabled = true;
            }
            $('#reminderdiv').append(reminder);
            $('#divaddmedPopUp').append(medicine);

            var hdnstatusid = document.getElementById('ContentPlaceHolder1_hdnstatusid').value;
            if (hdnstatusid == 2) {
                document.getElementById("btnrepeatreminder").disabled = true;
            }


        },
        error: function (jqXHR, exception) {
            //  alert('error');
            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}




function filevalidation(bool) {
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    var allowedFiles = [".jpeg", ".pdf", ".png", ".jpg"];
    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
  
    var array = ['jpg', 'jpeg', 'pdf', 'png'];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");

    var var_FilePath = $(fileUpload).val();
    var flag = true;
    if (var_FilePath.length == 0) {
        return true;
    }
    else {

        if ((fileUpload.files.length > 3) && ((fileUpload.files.length != 0))) {
            $("html, body").animate({
                scrollTop: 0
            }, 600);
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_REMINDERFILE_COUNT);
            flag = false;
        }

        var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
        var files = fileUpload.files;

        for (var i = 0; i < files.length; i++) {

            var name = files[i].name
            var Extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();

            if (array.indexOf(Extension) <= -1) {
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_REMINDERFILE);
                flag = false;

            }

        }
        if (flag == true) {
            var remindermaindiv = $('.oldfiles');

            for (var i = 0; i < remindermaindiv.length; i++) {

                var remindername = $(remindermaindiv[i]).find(".lblfileupload").text().trim();
                for (var j = 0; j < files.length; j++) {

                    var name = files[j].name;

                    if (name == remindername) {
                        $("#ContentPlaceHolder1_lblErrorMsg").empty();
                        $("#ContentPlaceHolder1_lblErrorMsg").append(DUPLICATE_ATTACH_REMINDER);
                        $("html, body").animate({
                            scrollTop: 0
                        }, 600);
                        flag = false;
                    }
                }
            }
        }
        if (flag == true) {
            return true;
        }
        else if (flag == false) {
        return false;
        }
    }
}


function bindattachment(bool) {
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    var allowedFiles = [".jpeg", ".pdf", ".png", ".jpg"];
    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    //  alert(fileUpload.files.length);
    var array = ['jpg', 'jpeg', 'pdf', 'png'];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    var flag = true;
    var var_FilePath = $(fileUpload).val();

    if (var_FilePath.length == 0) {
        return true;
    }
    else {

        if ((fileUpload.files.length > 3) && ((fileUpload.files.length != 0))) {
            $("html, body").animate({
                scrollTop: 0
            }, 600);
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_REMINDERFILE_COUNT);
            flag = false;

        }

        var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
        var files = fileUpload.files;

        for (var i = 0; i < files.length; i++) {

            var name = files[i].name
            var Extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();

            if (array.indexOf(Extension) <= -1) {
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_REMINDERFILE);
                flag = false;

            }

        }
        if (flag == true) {
            var remindermaindiv = $('.oldfiles');
           
            for (var i = 0; i < remindermaindiv.length; i++) {

                var remindername = $(remindermaindiv[i]).find(".lblfileupload").text().trim();
                for (var j = 0; j < files.length; j++) {

                    var name = files[j].name;

                    if (name == remindername) {
                        $("#ContentPlaceHolder1_lblErrorMsg").empty();
                        $("#ContentPlaceHolder1_lblErrorMsg").append(DUPLICATE_ATTACH_REMINDER);
                        $("html, body").animate({
                            scrollTop: 0
                        }, 600);
                        flag = false;
                    }
                }
            }
            /**********************************/
            if (flag == true) {
                $('#ContentPlaceHolder1_Files').html('');
                for (var i = 0; i < files.length; i++) {

                    var name = files[i].name

                    var fileuploaddiv = '<div id="addfileupload" class="addreminderdiv fileupload">' +

                            '<div class="col-md-10"><span Class="lbl-black lblfileupload">' + name + '</span></div>' +

                            '<div class="col-md-2" style="text-align: right;" ><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1" data-toggle="tooltip" title="Delete" aria-hidden="true" onclick="delete_function(this,\'' + i + '\')"></i></a></div>' +
                            '</div>';
                    $('#ContentPlaceHolder1_Files').show();
                    $('#ContentPlaceHolder1_Files').append(fileuploaddiv);
                }
                flag = true;
                return true;
            }
            if (flag == false) {
                return false;
            }
        }
    }
    
}


var validatedFiles = [];

function delete_function(evt, num) {


    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    var files = fileUpload.files;


    for (var i = 0; i < files.length; i++) {
        if (num == i) {
            validatedFiles.push(files[i].name);
            //            alert(files[i].name);
            files[i] = null

        }
    }
    $(evt).parent().parent().parent().remove();
}


function validateMedicine(bool) {

    //ResetErrorMessage();
    var numbersAndWhiteSpace = /[0-9]/g;
    var medicines_regex = /^(\d+)?([.]?\d{0,2})?$/;

    var str_MedicineName = $('#ContentPlaceHolder1_txtMedicineName').val();
    var str_BrandName = $('#ContentPlaceHolder1_txtBrandName').val();

    var str_Catagory = $("#ddlCatagory option:selected").text();
    var str_SubCatagory = $("#ddlSubCatagory option:selected").text();


    //var str_Priority = $('#ContentPlaceHolder1_txtpriority').val();



    var val = 1;

    if (str_Catagory == "" || str_Catagory == "--Select Catagory--") {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_BLANK_CATAGORY);

        val = 0;
    }

    else if (str_SubCatagory == "" || str_SubCatagory == "--Select SubCatagory--") {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_BLANK_SUBCATAGORYDESCR);
        val = 0;
    }

    else if (str_MedicineName == "") {

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_BLANK_MEDICINE);
        val = 0;
    }
    else if (str_BrandName == "") {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_BLANK_BRAND);
        val = 0;
    }
    //    else if (str_Priority == "") {
    //        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    //        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_BLANK_PRIORITY);
    //        val = 0;
    //    }
    //    else if (!str_Priority.match(numbersAndWhiteSpace)) {
    //        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    //        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_NUM_PRIORITY);
    //        val = 0;
    //    }


    if (val == 0) {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        return false;
    }
    else if (val == 1) {
        return true;
    }

}


function ResetErrorMessage() {
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
}

function Reset() {
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
    $('#ContentPlaceHolder1_txtsearchmedicine').val('');
    $('#ContentPlaceHolder1_txtReminder').val('');
    document.getElementById("ContentPlaceHolder1_FU_AttachDocument").value = '';
    $('#ContentPlaceHolder1_Wrapper').html('');
    $('#ContentPlaceHolder1_wraper').html('');

}

function editreminder(ele) {

    var maindiv = $(ele).parent().parent().parent();
    var lbl = maindiv.find('.lblreminder').text();

    $('#ContentPlaceHolder1_txtReminder').val(lbl);
    maindiv.remove();
}

function editTodaysreminder(ele) {

    var maindiv = $(ele).parent().parent().parent();
    var lbl = maindiv.find('.lblreminder').text();

    $('#ContentPlaceHolder1_txtReminder').val(lbl);
    maindiv.remove();
    deletereminder(ele);
}

function HideDiv() {
    $('#addmedicine').hide();
}

function copyreminder() {

    var remarr = [];
    var old_remm = [];
    var copy_rem = [];

    var remindermaindiv = $('.addreminderdiv').find('#lblreminder');
    var label = remindermaindiv.text();


    var old_rem = $('.addrem');

    for (var i = 0; i < old_rem.length; i++) {

        var reminder = $(old_rem[i]).find(".lblreminder").text();
        old_remm.push(reminder);
    }



    var remin = $('.addremu');



    for (var i = 0; i < remin.length; i++) {

        if (old_remm.indexOf($(remin[i]).find(".lblreminder").text().trim()) == -1) {
            copy_rem.push($(remin[i]).find(".lblreminder").text());
        }

    }




    for (var i = 0; i < copy_rem.length; i++) {

        reminderdiv = '<div id="addreminder" class="addreminderdiv addrem">' +

                            '<div class="col-md-10"><span Class="lbl-orange lblreminder">' + copy_rem[i] + '</span></div>' +

                            '<div class="col-md-2" style="text-align: right;"><a><i class="fa fa-pencil-square-o label1 lnkcursor" onclick="editreminder(this)" aria-hidden="true"></i></a><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1" data-toggle="tooltip" title="Delete" aria-hidden="true" onclick="deleterowdis(this,count)"></i></a></div>' +
                            '</div>';
        $('#ContentPlaceHolder1_wraper').show();
        $('#ContentPlaceHolder1_wraper').append(reminderdiv);

    }
    copy_rem = [];

    $find("mpe1").hide();
}

function numeralsOnly(event) {

    var numbersAndWhiteSpace = /[0-9]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || numbersAndWhiteSpace.test(key)) {
        if (event.keyCode == 13) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            //$("#ContentPlaceHolder1_txtArea").focus();
            return false;
        }
        else {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            return true;
        }
    }
    else {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(AP_NUM_PRIORITY);
        return false;
    }
}

function cancelnewmed() {

    $('#ContentPlaceHolder1_txtMedicineName').val("");
    $('#ContentPlaceHolder1_txtBrandName').val("");
    $('#ddlSubCatagory').val("0");
    $('#ddlCatagory').val("0");
    $("#ContentPlaceHolder1_lblmedsuccess").empty();
    $("#ContentPlaceHolder1_lblErrorBrandName").empty();
}

function closepopup() {
    $find("mpe1").hide();
}

$(document).ready(function () {
    var hostName = window.location.host;

    var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = Session_Values.split(',');

    var data = new FormData();
    data.append("p_str_Doctor_ID", value_medicine[3]);

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetCatagoryForMR",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {

            var data = response;

            $('#ddlCatagory').empty();
            $('#ddlCatagory').append("<option value='0'>--Select Catagory--</option>");
            for (var i = 0; i < data.length; i++) {

                $("#ddlCatagory").append($("<option></option>").val(data[i].Cat_Short_Name).html(data[i].Cat_Short_Name));
            }
            $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblmedsuccess").empty();
            $("#ContentPlaceHolder1_lblErrorBrandName").empty();
        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
});


function bind_subcategory(Catagory) {
    var selectedText = Catagory.options[ddlCatagory.selectedIndex].innerHTML;
    var selectedValue = Catagory.value;

    var hostName = window.location.host;

    var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = Session_Values.split(',');

    

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetMRSubCatagory",
        type: "POST",
        data: {
            p_str_CatagoryShortDescr: selectedValue,
            p_str_Doctor_ID: value_medicine[3]

        },
        async: false,
        success: function (response) {

            var data = response;

            $('#ddlSubCatagory').empty();
            $('#ddlSubCatagory').append("<option value='0'>--Select SubCatagory--</option>");
            for (var i = 0; i < data.length; i++) {

                $("#ddlSubCatagory").append($("<option></option>").val(data[i].CatSub_Description).html(data[i].CatSub_Description));
            }
            $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();

            $("#ContentPlaceHolder1_lblErrorBrandName").empty();
            $("#ContentPlaceHolder1_lblmedsuccess").empty();
        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}


function SaveNewMedicine() {
    ResetErrorMessage();
    var val = true;
    validateMedicine(val);

    if (validateMedicine(val)) {

        var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
        var value_medicine = Session_Values.split(',');

        var str_MedicineName = $('#ContentPlaceHolder1_txtMedicineName').val();
        var str_BrandName = $('#ContentPlaceHolder1_txtBrandName').val();

        var str_Catagory = $("#ddlCatagory option:selected").text();
        var str_SubCatagory = $("#ddlSubCatagory option:selected").text();

        var data = new FormData();

        data.append("p_str_Todays_Patient_VisitDate", value_medicine[0]);
        data.append("p_int_Shift_ID", value_medicine[1]);
        data.append("p_str_Clinic_ID", value_medicine[2]);
        data.append("p_str_Doctor_ID", value_medicine[3]);
        data.append("p_int_MR_ID", value_medicine[4]);
        data.append("p_str_Visit_Time", value_medicine[5]);
        data.append("p_str_companyID", value_medicine[6]);
        data.append("p_str_CatagoryShortDescr", str_Catagory);
        data.append("p_str_CatagorySubDescr", str_SubCatagory);
        data.append("p_str_MedicineName", str_MedicineName);
        data.append("p_str_BrandName", str_BrandName);
        data.append("p_str_MarketedBy", value_medicine[8]);
        data.append("p_bool_Isactive", value_medicine[9]);
        data.append("p_str_UserId", value_medicine[10]);
        data.append("p_int_priority", 0);
        data.append("p_float_morning", value_medicine[11]);
        data.append("p_float_afternoon", value_medicine[12]);
        data.append("p_float_night", value_medicine[13]);
        data.append("p_int_days", Number(value_medicine[14]));
        data.append("p_str_instruction", value_medicine[15]);


        var hostName = window.location.host;

        $.ajax({

            url: "http://" + hostName + "/Services/CMSV2Services.asmx/SaveMRMedicine",
            enctype: 'multipart/form-data',
            type: "POST",
            data: data,
            async: false,
            contentType: false,
            processData: false,
            success: function (response) {
                var data = response;
                for (var i = 0; i < data.length; i++) {
                    var Status = data[0].SAVE_STATUS;
                    if (Status == 0) {
                        $("#ContentPlaceHolder1_lblmedsuccess").empty();
                        $("#ContentPlaceHolder1_lblErrorBrandName").empty();
                        $("#ContentPlaceHolder1_lblErrorBrandName").append(DUPLICATE_PRESCRIPTION_EXIST_ERROR);
                    }
                    else {
                        $("#ContentPlaceHolder1_lblErrorBrandName").empty();
                        $("#ContentPlaceHolder1_lblmedsuccess").empty();
                        $("#ContentPlaceHolder1_lblmedsuccess").append(PRESCRIPTON_SUCCESS);
                        $('#ContentPlaceHolder1_txtMedicineName').val('');
                        $('#ContentPlaceHolder1_txtBrandName').val('');
                        $('#ddlCatagory').val('0');
                        $('#ddlSubCatagory').val('0');
                        $('#ddlSubCatagory option').remove();
                        $('#ContentPlaceHolder1_txtsearchmedicine').val('');
                        if (data[i].MEDTABLE === undefined)
                        { }
                        else {

                            if (data[i].MEDTABLE != null) {

                                var medicine = '';
                                medicine += "<div id='divaddmed' class='divaddmed addmedicine'>";
                                medicine += "<div class='row addmedrow'><div class='col-xs-12 col-sm-12 col-md-12 PPlabelname'>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-3'>";
                                medicine += "<span class='label1'>Brand/Prescription:</span></div>";
                                medicine += "<div class='col-xs-7 col-sm-10 col-md-5'>";
                                medicine += "<span class='labelbold lblmedicine'>" + data[i].MEDNAME + "</span></div>";
                                medicine += "<input type='hidden' id='hdn_brand_value' class='hdn_brand_value' value='" + data[i].BRANDNAME + "'/>";
                                medicine += "<div class='col-xs-2 col-md-2'></div>";
                                medicine += "<div class='col-xs-3 col-sm-2 col-md-2' style='text-align: right;'>";
                                medicine += "<a><i class='fa fa-trash-o lnkcursor label1' data-toggle='tooltip' title='Delete' aria-hidden='true' onclick='deletemedicine(this)'></i></a></div>";
                                medicine += "</div></div>";

                                medicine += "<div class='row addmedrow'><div class='col-xs-12 col-sm-12 col-md-12 PPlabelname'>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-3'>";
                                medicine += "<span class='label1'>Catagory:</span></div>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-5'>";
                                medicine += "<span class='lbl-black lblcategory'>" + data[i].CATSHORT + "</span></div></div></div>";

                                medicine += "<div class='row addmedrow'><div class='col-xs-12 col-sm-12 col-md-12 PPlabelname'>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-3'>";
                                medicine += "<span class='label1'>SubCatagory:</span></div>";

                                medicine += "<div class='col-xs-6 col-sm-6 col-md-5'>";
                                medicine += "<span class='lbl-black lblsubcategory'>" + data[i].CATSUB + "</span></div></div></div>";

                                medicine += "<div class='row addmedrow'><div class='col-xs-12 col-sm-12 col-md-12 PPlabelname'>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-3'>";
                                medicine += "<span class='label1'>Contains/Molecules:</span></div>";

                                medicine += "<div class='col-xs-6 col-sm-6 col-md-5'>";
                                medicine += "<span class='lbl-black lblbrand'>" + data[i].BRANDNAME + "</span></div></div></div>";

                                medicine += "<div class='row addmedrow'><div class='col-xs-12 col-sm-12 col-md-12 PPlabelname'>";
                                medicine += "<div class='col-xs-6 col-sm-6 col-md-3'>";
                                medicine += "<span class='label1'>Priority:</span></div>";

                                medicine += "<div class='col-xs-6 col-sm-6 col-md-2'>";
                                medicine += "<input type='text' class='form-control txtaddpriority'  maxlength='1' onkeypress='numeralsOnly(event)' /></div></div></div></div>";
                            }
                        }
                    }
                }
                $('#ContentPlaceHolder1_Wrapper').show();
                $('#ContentPlaceHolder1_Wrapper').append(medicine);
            },
            error: function (jqXHR, exception) {

                var msg = '';
                if (jqXHR.status === 0) {
                    msg = 'Not connect.\n Verify Network.';
                } else if (jqXHR.status == 404) {
                    msg = 'Requested page not found. [404]';
                } else if (jqXHR.status == 500) {
                    msg = 'Internal Server Error [500].';
                } else if (exception === 'parsererror') {
                    msg = 'Requested JSON parse failed.';
                } else if (exception === 'timeout') {
                    msg = 'Time out error.';
                } else if (exception === 'abort') {
                    msg = 'Ajax request aborted.';
                } else {
                    msg = 'Uncaught Error.\n' + jqXHR.responseText;
                }
                console.log(msg);
            }
        });
        return true;


    } else {
        return false;
    }
}

function deletereminder(reminder) {
    var maindiv = $(reminder).parent().parent().parent();
    var lbl = maindiv.find('.lblreminder').text();

    var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = Session_Values.split(',');


    var data = new FormData();

    data.append("p_str_Todays_Patient_VisitDate", value_medicine[0]);
    data.append("p_int_Shift_ID", value_medicine[1]);
    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[3]);



    data.append("p_int_MR_ID", value_medicine[4]);
    data.append("p_str_Visit_Time", value_medicine[5]);
    data.append("p_str_companyID", value_medicine[6]);
    data.append("p_str_remindertext", lbl);

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteReminder",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;
            //location.href = "AddMedicine.aspx";
            $(reminder).parent().parent().parent().remove();
        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });

}

function deletemedicine(medicine) {
    var maindiv = $(medicine).parent().parent().parent().parent().parent();
    var lblmedicine = maindiv.find('.lblmedicine').text();
    var lblcatshort = maindiv.find('.lblcategory').text();
    var lblcatsub = maindiv.find('.lblsubcategory').text();
    var lblbrand = maindiv.find('.lblbrand').text();

    var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = Session_Values.split(',');


    var data = new FormData();

    data.append("p_str_Todays_Patient_VisitDate", value_medicine[0]);
    data.append("p_int_Shift_ID", value_medicine[1]);
    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[3]);
    data.append("p_int_MR_ID", value_medicine[4]);
    data.append("p_str_Visit_Time", value_medicine[5]);
    data.append("p_str_companyID", value_medicine[6]);
    data.append("p_str_catshort", lblcatshort);
    data.append("p_str_catsub", lblcatsub);
    data.append("p_str_medicine", lblmedicine);
    data.append("p_str_brand", lblbrand);

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteMRMedicine",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;
            $(medicine).parent().parent().parent().parent().parent().remove();
            //location.href = "AddMedicine.aspx";
        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}

function alphanumericalOnly(event) {
    ResetErrorMessage();


    var englishAlphabetAndWhiteSpace = /[-A-Za-z\d ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || englishAlphabetAndWhiteSpace.test(key)) {

        return true;
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        //$("#ContentPlaceHolder1_lblErrorMsg").append(QR_NONNUM_LNAME);
        return false;
    }
}

function alphanumericalAndSpecialCharacters(event) {
   
    ResetErrorMessage();

    var regex = new RegExp("^[a-zA-Z0-9-,.%&-\+\/\[\\\] ]");

    var key = String.fromCharCode(event.which);

    if (key == "*") {

//        $("#ContentPlaceHolder1_lblErrorMsg").empty();
//        $("#ContentPlaceHolder1_lblErrorMsg").append(AS_INVALID_CHARACTER_AST);
        return false;
    }

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || event.keyCode == 13 || regex.test(key)) {

        return true;
    }
    
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
       
        return false;
    }
}

function downloadfile(path) {
    var hostName = window.location.host;

    var p = path;

    var path = 'http://' + hostName + '/' + path.replace('~/', '').replace('//', '/');

    path = path.replace(/\s/g, '');

    var a = $("<a>").attr("href", path).attr("download", "");
    a[0].click();
    a.remove();

    //var path = path.replace('~/', '').replace('//', '/');

//    var url2 = path;
//    
//    var a = url2.split('/');
//    var cnt = a.length;

//    var name = a[cnt - 1];


//    try {

//        var filename = name;
//        var xhr = new XMLHttpRequest();
//        xhr.responseType = 'blob';
//        xhr.onload = function () {
//            var a = document.createElement('a');
//            a.href = window.URL.createObjectURL(xhr.response); // xhr.response is a blob

//            a.download = filename; // Set the file name.
//            a.style.display = 'none';
//            document.body.appendChild(a);
//            a.click();
//            delete a;
//        };
//        xhr.open('POST', url2);
//        xhr.open('POST', path, true);
//        xhr.send();

//    }
//    catch (err) {
//        var path = 'http://' + hostName + '/' + p.replace('~/', '').replace('//', '/');

//        window.open(path, '_blank');
//        //window.location = 'www://' + path;
//    }

}

function delattachedfile(file) {
    var maindiv = $(file).parent().parent().parent();
    var lbl = maindiv.find('.lblfileupload').text();
    

    var Session_Values = document.getElementById('ContentPlaceHolder1_hdn_addrem_values').value;
    var value_medicine = Session_Values.split(',');


    var data = new FormData();

    data.append("p_str_Todays_Patient_VisitDate", value_medicine[0]);
    data.append("p_int_Shift_ID", value_medicine[1]);
    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[3]);
    data.append("p_int_MR_ID", value_medicine[4]);
    data.append("p_str_Visit_Time", value_medicine[5]);
    data.append("p_str_companyID", value_medicine[6]);
    data.append("p_str_attachfile", lbl);

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteAttachedReminder",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;
            //location.href = "AddMedicine.aspx";
            $(file).parent().parent().parent().remove();
        },
        error: function (jqXHR, exception) {

            var msg = '';
            if (jqXHR.status === 0) {
                msg = 'Not connect.\n Verify Network.';
            } else if (jqXHR.status == 404) {
                msg = 'Requested page not found. [404]';
            } else if (jqXHR.status == 500) {
                msg = 'Internal Server Error [500].';
            } else if (exception === 'parsererror') {
                msg = 'Requested JSON parse failed.';
            } else if (exception === 'timeout') {
                msg = 'Time out error.';
            } else if (exception === 'abort') {
                msg = 'Ajax request aborted.';
            } else {
                msg = 'Uncaught Error.\n' + jqXHR.responseText;
            }
            console.log(msg);
        }
    });
}

