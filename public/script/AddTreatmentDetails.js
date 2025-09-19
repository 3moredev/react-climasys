/*********************************************************************Treatment Plan and Details Functionality****************************************************************************/

$(document).ready(function () {
    var scrolled = 0;


    $("#btnAddTreatment").on("click", function () {

        scrolled = scrolled + 300;

        $(".treatplanscroll").animate({
            scrollTop: scrolled
        });

    });

});

/*
*  Method Name - AddNewTreatmentPlan 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to add new treatment plan
*/

var seq_no;
var ddl_id = 0;

function AddNewTreatmentPlan(sid) {

    seq_no = $('.bindstatus').length;

    seq_no = seq_no + 1;

//    if (seq_no < 10) {
//        seq_no = '0' + seq_no;
//    }
//    else {
//        seq_no = seq_no;
//    }

  
    var treatmentplan_div =

                        '<div id="TreatmentPlan" class="row textalign adj_treatplan_rowmargin AddTreatPlan">' +

                        '<div class="col-md-1" style="width:2%">' +
                        '<input type="radio" class="radiobutton_adj Radio_Plan" name="select_plan"> ' +
                        '</div>' +
                        '<div class="col-md-1" style="width:8%">' +
                        '<textarea name="textarea" class="form-control adj_treatPlan_maxwidth Treat_Plan_Seq notationcolorSeq" rows="2" cols="3" placeholder="Steps" onkeydown="return isNumberOnly(event);" onkeypress="return isNumberOnly(event);">' + seq_no + '</textarea></div>' +
                       '<div class="col-md-3 paddingleft" style="width:22%"><textarea autofocus id="txt_auto_inc_'+sid+'"  name="textarea" rows="2" cols="34" class="form-control adj_treatPlan_maxwidth Treat_Plan_AdviceDetail notationcolorAdvise" placeholder="Advised Details" id="txt_advicedetail" onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);"></textarea> </div>' +
                       '<div class="col-md-2 paddingbothempty"  style="width:14%"><div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text1" class="form-control adj_treatPlan_text Treat_Plan_OperSeq1 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text2" class="form-control adj_treatPlan_text Treat_Plan_OperSeq2 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" />' +
                       '</div>' +

                       '<div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text3" class="form-control adj_treatPlan_text Treat_Plan_OperSeq3 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text4" class="form-control adj_treatPlan_text Treat_Plan_OperSeq4 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft" style="width:12%">' +
                       ' <div class="input-icon right">' +
                       '<i class="fa fa-calendar adj_treatplan_date" id="Icon_Calendar"></i>' +
                       '<textarea id="txtAdvicedate" name="textarea" rows="2" cols="10"  class="form-control adj_treatPlan_maxwidth Treat_Plan_AdvisedDate notationcolordate"  onclick="return ClearErrorMsg(event);"  placeholder="DD-MMM-YYYY"></textarea>' +

                       '</div>' +
                       '</div>' +
                       '<div class="col-md-2 paddingleft" style="width:10%">' +
                       '<select id="ddlTreatment_Status_' + ddl_id + '" class="form-control adj_treatPlan_ddl bindstatus notationcolorddl" onchange="return ClearErrorMsg(event);">' +

                       '</select>' +
                       '</div>' +
                       '<div class="col-md-3 paddingleft">' +
                       '<textarea name="textarea" rows="2" class="form-control adj_treatPlan_maxwidth Treat_Plan_Comment" cols="34" placeholder="Comments"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,1000);"></textarea>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft adj_treatPlan_btn"  style="width:5%">' +

                        '<a><i class="fa fa-floppy-o label1 lnkcursor fa_size" id="editrem" onclick="saveTreatmentPlan(this)" aria-hidden="true"></i></a><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1 fa_size" data-toggle="tooltip" title="Delete" aria-hidden="true" id="deleterem" onclick="deleteTreatmentPlan(this)"></i></a>' +
                       
                        '</div>' +

                        '</div>';

    

    $('#ContentPlaceHolder1_wraper').show();
    $('#ContentPlaceHolder1_wraper').append(treatmentplan_div);

    var ele = $('.AddTreatPlan');

    for (var y = 0; y < ele.length; y++) {
        var var_AdvisedDate = $(ele[y]).find(".Treat_Plan_AdvisedDate");

        $(var_AdvisedDate).dcalendarpicker({
            format: 'dd-mmm-yyyy'

        });

        var var_radiobutton = $(ele[y]).find(".Radio_Plan");
        var_radiobutton.attr('disabled', true);
    }

    BindStatus_HTML($('#ddlTreatment_Status_' + ddl_id), 0);

}


/*
*  Method Name - AddNewTreatmentDetail 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to add new treatment detail on add button click.
*/


function AddNewTreatmentDetail(Seq_No) {

    var Selected_Seq_No = Seq_No;

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    locale = "en-us",

         month = today.toLocaleString(locale, { month: "short" });


    //        var today = dd + '-' + mm + '-' + yyyy;
    var today = dd + ' ' + month + ' ' + yyyy;

    var treatmentplan_div =

                        '<div id="TreatmentDetails" class="row textalign adj_treatplan_rowmargin AddNewDetail">' +

                        '<div class="col-md-1" style="width:8%">' +
                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Seq_No color_orange" onkeydown="return isNumberOnly(event);" onkeypress="return isNumberOnly(event);" placeholder="Steps"  value="' + Selected_Seq_No + '" disabled/>' +
                        '</div>' +
                        '<div class="col-md-1 paddingleft" style="width:6%">' +
                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Number Numbercolorerror color_orange" placeholder="No" onkeydown="return isNumberOnly(event);" onkeypress="return isNumberOnly(event);"></input>' +
                        '</div>' +
                        '<div class="col-md-4 paddingbothempty"  style="width:37%">' +

                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Treatment Treatmentcolorerror color_orange" onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);" placeholder="Treatment"></input>' +
                        '</div>' +

                        '<div class="col-md-3 paddingright" style="width:27%">' +
                        '<input type="text" rows="2" cols="15" placeholder="Remarks"  class="form-control adj_treatPlan_maxwidth Detail_Remark color_orange"  onkeyup="CheckCharacterMedicine(this,1000);" onkeypress="return ClearErrorMsg(event);"></input>' +

                        '</div>' +
                        '<div class="col-md-2">' +
                        '<input type="text"  placeholder="Date"  class="form-control adj_treatPlan_maxwidth Detail_Date color_orange"  onkeyup="CheckCharacterMedicine(this,1000);" onkeypress="return ClearErrorMsg(event);"  value="' + today + '" disabled/>' +

                        '</div>' +
                         '<div class="col-md-1 paddingleft" style="width:5%">' +
                         '<a><i class="fa fa-trash-o lnkcursor label1 fa_size" data-toggle="tooltip" title="Delete" aria-hidden="true" id="deleterem" onclick="deleteTreatmentDetail(this)"></i></a>' +
//                         '<input type="button" ID="Button23" class="btn btn-primary adj_treatPlan_maxwidth" value="Delete" onclick="deleteTreatmentDetail(this)"/>' +
                        '</div>' +

                        '</div>';

    $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').show();
    $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').append(treatmentplan_div);

}



/*
*  Method Name - AddNewTreatmentPlanForDetail 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to add new treatment plan on add button click on Add treatment Detail PopUp
*/


function AddNewTreatmentPlanForDetail() {

    var detail_plan_seq_no; 

    detail_plan_seq_no = $('.bind_detail_status').length;

    detail_plan_seq_no = detail_plan_seq_no + 1;

//    if (detail_plan_seq_no < 10) {
//        detail_plan_seq_no = '0' + detail_plan_seq_no;
//    }
//    else {
//        detail_plan_seq_no = detail_plan_seq_no;
//    }

    var treatmentplan_div =

                         '<div id="TreatmentPlan_For_Detail" class="row textalign adj_treatplan_rowmargin AddTreatPlanForDetail">' +

                        '<div class="col-md-1" style="width:8%"><textarea name="textarea" class="form-control adj_treatPlan_maxwidth Treat_Plan_Seq" rows="2" cols="3" placeholder="Steps" onkeydown="return isNumberOnly(event);"  onkeypress="return isNumberOnly(event);" disabled></textarea></div>' +
                       '<div class="col-md-3 paddingleft" style="width:30%"><textarea name="textarea" rows="2" cols="34" class="form-control adj_treatPlan_maxwidth Treat_Plan_AdviceDetail" placeholder="Advised Details"  onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);" disabled></textarea> </div>' +
                       '<div class="col-md-2 paddingbothempty"  style="width:14%"><div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text1" class="form-control adj_treatPlan_text Treat_Plan_OperSeq1 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" disabled/>' +
                       '<input type="text" id="Text2" class="form-control adj_treatPlan_text Treat_Plan_OperSeq2 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"  disabled/>' +
                       '</div>' +

                       '<div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text3" class="form-control adj_treatPlan_text Treat_Plan_OperSeq3 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" disabled/>' +
                       '<input type="text" id="Text4" class="form-control adj_treatPlan_text Treat_Plan_OperSeq4 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" disabled/>' +
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft" style="width:12%">' +
                       ' <div class="input-icon right">' +
                       '<i class="fa fa-calendar adj_treatplan_date" id="Icon_Calendar"></i>' +
                       '<textarea id="txtAdvicedate" name="textarea" rows="2" cols="10"  class="form-control adj_treatPlan_maxwidth Treat_Plan_AdvisedDate notationcolordate"  onclick="return ClearErrorMsg(event);"  placeholder="DD-MMM-YYYY" disabled></textarea>' +
                      
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-2 paddingleft" style="width:10%">' +
                       '<select id="ddlTreatmentDetail_Status_' + detail_plan_seq_no + '" class="form-control adj_treatPlan_ddl bind_detail_status notationcolorddl" onchange="return ClearErrorMsg(event);" disabled>' +

                       '</select>' +
                       '</div>' +
                       '<div class="col-md-3 paddingleft" style="width:26%">' +
                       '<textarea name="textarea" rows="2" class="form-control adj_treatPlan_maxwidth Treat_Plan_Comment" cols="34" placeholder="Comments"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,1000);" disabled></textarea>' +
                       '</div>' +
                        '</div>';

    $('#ContentPlaceHolder1_Wrapper_Details').show();
    $('#ContentPlaceHolder1_Wrapper_Details').append(treatmentplan_div);


    BindStatus_HTML_ForDetail($('#ddlTreatmentDetail_Status_' + detail_plan_seq_no), 0);
}


/*
*  Method Name - bindattachment 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to add new treatment plan on add button click on Add treatment Detail PopUp
*/

function bindattachment(bool) {
    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    var allowedFiles = [".jpeg", ".pdf", ".png", ".jpg", ".docx", ".xlsx", ".xls", ".doc"];
    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    var array = ['jpg', 'jpeg', 'pdf', 'png', 'docx', 'xlsx', 'xls','doc'];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    var flag = true;
    var var_FilePath = $(fileUpload).val();

    if (var_FilePath.length == 0) {
        return true;
    }
    else {

        //        if ((fileUpload.files.length > 5) && ((fileUpload.files.length != 0))) {

        //            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
        //            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_REMINDERFILE_COUNT);
        //            flag = false;

        //        }

        var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
        var files = fileUpload.files;

        for (var i = 0; i < files.length; i++) {

            var name = files[i].name
            var Extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();

            if (array.indexOf(Extension) <= -1) {

                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_ATTACHMENT);
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
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(DUPLICATE_ATTACHMENT);

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



/*
*  Method Name - BindStatus_HTML 
*  Created By  - Varsha Khandre
*  Created On  - 29 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to bind treatment plan status dropdown.
*/

function BindStatus_HTML(obj_select, selected) {


    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetStatusForTreatmentPlan",
        type: "POST",
        data: {

            p_int_LanguageId: value_medicine[7]

        },
        async: false,
        success: function (response) {

            var data = response;

            var ddlstatus_div = $('.bindstatus');

            var Html = "";

            Html += "<option value='0'>--Select--</option>";
            for (var i = 0; i < data.length; i++) {

                if (data[i].Treatment_Plan_Status_ID == selected) {

                    Html += "<option value='" + data[i].Treatment_Plan_Status_ID + "' selected>" + data[i].Treatment_Plan_Status_Description + "</option>";
                } else {

                    Html += "<option value='" + data[i].Treatment_Plan_Status_ID + "'>" + data[i].Treatment_Plan_Status_Description + "</option>";
                }

            }

            $(obj_select).append(Html);


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

/*
*  Method Name - BindStatus_HTML_ForDetail 
*  Created By  - Varsha Khandre
*  Created On  - 29 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to bind treatment plan status dropdown.
*/

function BindStatus_HTML_ForDetail(obj_select, selected) {

    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;
    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetStatusForTreatmentPlan",
        type: "POST",
        data: {

            p_int_LanguageId: value_medicine[7]

        },
        async: false,
        success: function (response) {

            var data = response;

            var ddlstatus_div = $('.bind_detail_status');

            var Html_detail = "";

            Html_detail += "<option value='0'>--Select--</option>";
            for (var i = 0; i < data.length; i++) {
                if (data[i].Treatment_Plan_Status_ID == selected) {
                    Html_detail += "<option value='" + data[i].Treatment_Plan_Status_ID + "' selected>" + data[i].Treatment_Plan_Status_Description + "</option>";
                } else {
                    Html_detail += "<option value='" + data[i].Treatment_Plan_Status_ID + "'>" + data[i].Treatment_Plan_Status_Description + "</option>";
                }

            }

            $(obj_select).append(Html_detail);




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



/*
*  Method Name - BindStatus_ddl 
*  Created By  - Varsha Khandre
*  Created On  - 29 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to bind treatment plan status dropdown.
*/

function BindStatus_ddl() {

    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');


    var hostName = window.location.host;
    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetStatusForTreatmentPlan",
        type: "POST",
        data: {

            p_int_LanguageId: value_medicine[7]

        },
        async: false,

        success: function (response) {

            var data = response;

            var ddlstatus_div = $('.bindstatus');
            var ddlstatus_detail_div = $('.bind_detail_status');


            $('.bindstatus').each(function (index) {

                $(this).empty();
                $(this).append("<option value='0'>--Select--</option>");

                for (var i = 0; i < data.length; i++) {

                    $(this).append($("<option></option>").val(data[i].Treatment_Plan_Status_ID).html(data[i].Treatment_Plan_Status_Description));
                }


            });

            $('.bind_detail_status').each(function (index) {

                $(this).empty();
                $(this).append("<option value='0'>--Select--</option>");

                for (var i = 0; i < data.length; i++) {

                    $(this).append($("<option></option>").val(data[i].Treatment_Plan_Status_ID).html(data[i].Treatment_Plan_Status_Description));
                }


            });

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

function parseDMY(s) {
    return new Date(s.replace(/^(\d+)\W+(\w+)\W+/, '$2 $1 '));
}

/*
*  Method Name - SaveTreatmentPlanDetails 
*  Created By  - Varsha Khandre
*  Created On  - 29 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to save treatment plan pop up details on submit button.
*/

function SaveTreatmentPlanDetails() {

    var count = 0;

    var ele = $('.AddTreatPlan');

    if (ele.length == 0) {
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(TP_EMPTY_TREATMENTPLAN);
        return false;
    }

    var var_OperationSeq1 = '';
    var var_OperationSeq2 = '';
    var var_OperationSeq3 = '';
    var var_OperationSeq4 = '';
    var var_Comment = '';
    var lastTreatmentPlan_List = '';

    for (var l = 0; l < ele.length; l++) {

        var Curr_Seq_No = $(ele[l]).find(".Treat_Plan_Seq").val();

        for (var m = l + 1; m < ele.length; m++) {

            var next_seq_no = $(ele[m]).find(".Treat_Plan_Seq").val();

            if (parseInt(next_seq_no) == parseInt(Curr_Seq_No)) {
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                $(ele[m]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(DUPLICATE_TREATMENTPLAN);
                return false;
            }
        }
    }

    for (var i = 0; i < ele.length; i++) {

        var var_Seq_No = $(ele[i]).find(".Treat_Plan_Seq").val();
        var var_Advicedetail = $(ele[i]).find(".Treat_Plan_AdviceDetail").val();
        var var_OperationSeq1 = $(ele[i]).find(".Treat_Plan_OperSeq1").val();
        var var_OperationSeq2 = $(ele[i]).find(".Treat_Plan_OperSeq2").val();
        var var_OperationSeq3 = $(ele[i]).find(".Treat_Plan_OperSeq3").val();
        var var_OperationSeq4 = $(ele[i]).find(".Treat_Plan_OperSeq4").val();
        var var_AdvisedDate = $(ele[i]).find(".Treat_Plan_AdvisedDate").val();
        var var_Status = $(ele[i]).find(".bindstatus").val();
        var var_Comment = $(ele[i]).find(".Treat_Plan_Comment").val();





        var Date_of_Birth = /^(\d{1,2})(-)(?:(\d{1,2})|(jan)|(feb)|(mar)|(apr)|(may)|(jun)|(jul)|(aug)|(sep)|(oct)|(nov)|(dec)|(JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OCT)|(NOV)|(DEC)|(Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec))(-)(\d{4})$/;

        var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;

        var date_current = parseDMY(currentDate);
        var date_adviseddate = parseDMY(var_AdvisedDate);


        var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
        var value_medicine = values.split(',');

        if (var_OperationSeq1 == "") {
            var_OperationSeq1 = " ";
        }

        if (var_OperationSeq2 == "") {
            var_OperationSeq2 = " ";
        }

        if (var_OperationSeq3 == "") {
            var_OperationSeq3 = " ";
        }
        if (var_OperationSeq4 == "") {
            var_OperationSeq4 = " ";
        }

        if (var_Comment == "") {
            var_Comment = " ";
        }

        if (var_Seq_No != '') {
            if (parseInt(var_Seq_No) > 999) {

                $(ele[i]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(INVALID_SEQNO);
                return false;

            }
            if (var_Advicedetail != '') {

                count = count + 1;


                if (var_AdvisedDate == '') {

                    $(ele[i]).find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_ADVISED_DATE);
                    return false;
                }

                else if ((var_AdvisedDate != '') && (!var_AdvisedDate.match(Date_of_Birth))) {

                    $(ele[i]).find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(FR_DOB_PAT);
                    return false;
                }
                else if (!var_AdvisedDate.match(/^(\d{1,2})(\/|-)([a-zA-Z]{3})(\/|-)(\d{4})$/)) {

                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(FR_DOB_PAT);
                    return false;
                }

                else if (var_Status == 0) {
                    $(ele[i]).find(".notationcolorddl").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_STATUS);
                    return false;
                }


                else {

                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

                    var TreatmentPlan_List = var_Seq_No + '#@' + var_Advicedetail + '#@' + var_OperationSeq1 + '#@' + var_OperationSeq2 + '#@' + var_OperationSeq3 + '#@' + var_OperationSeq4 + '#@' + var_AdvisedDate + '#@' + var_Status + '#@' + var_Comment;

                    if (i == 0) {
                        lastTreatmentPlan_List = TreatmentPlan_List;
                    }
                    else {
                        lastTreatmentPlan_List = lastTreatmentPlan_List + '@%&' + TreatmentPlan_List;
                    }
                    $(ele[i]).find(".Treat_Plan_Seq").attr('disabled', true);

                }
            }
            else if (var_Advicedetail == '') {

                $(ele[i]).find(".notationcolorAdvise").addClass('adj_treatplan_errorborder');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_ADVISEDETAIL);
                return false;
            }
        }
        else if ((var_Advicedetail != '') || (var_AdvisedDate != '') || (var_Status != 0)) {

            $(ele[i]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_STEP);
            return false;
        }


        if (count == 0) {
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box'); 
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_PLAN);
            return false;
        }
    }



    var data = new FormData();

    data.append("p_str_Doctor_ID", value_medicine[1]);
    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_int_Patient_ID", value_medicine[0]);
    data.append("p_int_Shift_ID", Number(value_medicine[3]));
    data.append("p_str_Visit_No", Number(value_medicine[4]));
    data.append("p_str_Todays_Patient_VisitDate", value_medicine[5]);
    data.append("p_str_treatmentdetails", lastTreatmentPlan_List);
    data.append("p_str_UserId", value_medicine[6]);

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/Save_TreatmentDetails_Plan",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;

            document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'yellow';

            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('success-message-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(TREAT_PLAN_SUCCESS);
            $('#ContentPlaceHolder1_hdn_TreatButtons_Colors').val('1');

            show_status_colors();


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

/*
*  Method Name - CheckCharacter 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to allow characters to enter according to size.
*/

function CheckCharacter(textBox, maxLength) {

    if (textBox.value.length > maxLength) {
        textBox.value = textBox.value.substr(0, maxLength);
    }
    else {
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

    }
}


/*
*  Method Name - isNumberOnly 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to allow only numbers and restrict other than numbers.
*/
function isNumberOnly(event) {

    var numbersAndWhiteSpace = /[0-9]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
        ClearErrorMsg(event);
        return true;
    }
    else {
        $("html, body").animate({
            scrollTop: 600
        }, 0);
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(FR_NUM);
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(FR_NUM);
        return false;
    }
}



/*
*  Method Name - ClearErrorMsg 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to clear error message and the input borders on click
*/
function ClearErrorMsg(event) {

    var ele = $('.AddTreatPlan');
    for (var i = 0; i < ele.length; i++) {
        $(ele[i]).find(".notationcolor").removeClass('adj_treatplan_errorborder');
        $(ele[i]).find(".notationcolordate").removeClass('adj_treatplan_errorborder');
        $(ele[i]).find(".notationcolorddl").removeClass('adj_treatplan_errorborder');
        $(ele[i]).find(".notationcolorSeq").removeClass('adj_treatplan_errorborder');
        $(ele[i]).find(".notationcolorAdvise").removeClass('adj_treatplan_errorborder');

        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
    }

    var ele_detail = $('.AddTreatPlanForDetail');
    for (var j = 0; j < ele_detail.length; j++) {
        $(ele_detail[j]).find(".notationcolor").removeClass('adj_treatplan_errorborder');
        $(ele_detail[j]).find(".notationcolordate").removeClass('adj_treatplan_errorborder');
        $(ele_detail[j]).find(".notationcolorddl").removeClass('adj_treatplan_errorborder');
        $(ele_detail[j]).find(".notationcolorSeq").removeClass('adj_treatplan_errorborder');
        $(ele_detail[j]).find(".notationcolorAdvise").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    }

    var ele_onlydetail = $('.AddNewDetail');
    for (var k = 0; k < ele_onlydetail.length; k++) {
        $(ele_onlydetail[k]).find(".notationcolorSeq").removeClass('adj_treatplan_errorborder');
        $(ele_onlydetail[k]).find(".Numbercolorerror").removeClass('adj_treatplan_errorborder');
        $(ele_onlydetail[k]).find(".Treatmentcolorerror").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    }

}


/*
*  Method Name - Show_Treatment_Plans 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to shoe treatment plans on button click.
*/
function Show_Treatment_Plans() {

    
    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetPatientTreatmentPlans",
        type: "POST",
        data: {

            p_str_Clinic_ID: value_medicine[2],
            p_str_Doctor_ID: value_medicine[1],
            p_str_PatientID: value_medicine[0],
            p_int_stepno: 0
        },
        async: false,
        success: function (response) {

            var data = response;

            if (data.length > 0) {

                $('#ContentPlaceHolder1_hdn_Delete_Plans').val('1');

            }
            else {
                $('#ContentPlaceHolder1_hdn_Delete_Plans').val('0');
            }

            var var_del_flag = document.getElementById('ContentPlaceHolder1_hdn_Delete_Plans').value;


            var treatmentplan_div = "";

            var j = 0;



            for (var i = 0; i < data.length; i++) {

                if (data[i].TABLE0 != null) {

                    if (j < 3) {

                        ddl_id = ddl_id + 1;

                        var ele = $('.AddTreatPlan');

                        var var_Seq_No = $(ele[j]).find(".Treat_Plan_Seq");
                        var var_Advicedetail = $(ele[j]).find(".Treat_Plan_AdviceDetail");
                        var var_OperationSeq1 = $(ele[j]).find(".Treat_Plan_OperSeq1");
                        var var_OperationSeq2 = $(ele[j]).find(".Treat_Plan_OperSeq2");
                        var var_OperationSeq3 = $(ele[j]).find(".Treat_Plan_OperSeq3");
                        var var_OperationSeq4 = $(ele[j]).find(".Treat_Plan_OperSeq4");
                        var var_AdvisedDate = $(ele[j]).find(".Treat_Plan_AdvisedDate");
                        var var_Status = $(ele[j]).find(".bindstatus");
                        var var_Comment = $(ele[j]).find(".Treat_Plan_Comment");
                        var var_radiobutton = $(ele[j]).find(".Radio_Plan");

                        //                        if (data[i].Step_No < 10) {
                        //                            data[i].Step_No = "0" + data[i].Step_No;
                        //                            $(var_Status).attr("id", "ddlTreatment_Status_" + data[i].Step_No);
                        //                        }
                        //                        else {
                        $(var_Status).attr("id", "ddlTreatment_Status_" + ddl_id);
                        //}

                        $(var_AdvisedDate).dcalendarpicker({
                            format: 'dd-mmm-yyyy'

                        });

                        $(var_Seq_No).val(data[i].Step_No);
                        $(var_Advicedetail).val(data[i].Advised_Details);
                        $(var_OperationSeq1).val(data[i].Notation_Sequence1);
                        $(var_OperationSeq2).val(data[i].Notation_Sequence2);
                        $(var_OperationSeq3).val(data[i].Notation_Sequence3);
                        $(var_OperationSeq4).val(data[i].Notation_Sequence4);
                        $(var_AdvisedDate).val(data[i].Advised_Date);
                        $(var_Status).val(data[i].Treatment_Plan_Status_ID);
                        $(var_Comment).val(data[i].Comments);



                        if ($(var_Status).val() == '1') {

                            $(ele[j]).find(".notationcolorSeq").addClass('color_blue');
                            $(ele[j]).find(".notationcolorAdvise").addClass('color_blue');
                            $(ele[j]).find('.notationcolorddl').addClass('color_blue');
                            $(ele[j]).find('.notationcolor').addClass('color_blue');
                            $(ele[j]).find('.notationcolordate').addClass('color_blue');
                            $(ele[j]).find('.Treat_Plan_Comment').addClass('color_blue');

                            var_radiobutton.attr('disabled', true);
                        }
                        else if ($(var_Status).val() == '2') {
                            $(ele[j]).find('.notationcolorSeq').addClass('color_orange');
                            $(ele[j]).find('.notationcolorAdvise').addClass('color_orange');
                            $(ele[j]).find('.notationcolorddl').addClass('color_orange');
                            $(ele[j]).find('.notationcolor').addClass('color_orange');
                            $(ele[j]).find('.notationcolordate').addClass('color_orange');
                            $(ele[j]).find('.Treat_Plan_Comment').addClass('color_orange');
                            var_radiobutton.attr('disabled', false);
                        }
                        else if ($(var_Status).val() == '3') {
                            $(ele[j]).find('.notationcolorSeq').addClass('color_green');
                            $(ele[j]).find('.notationcolorAdvise').addClass('color_green');
                            $(ele[j]).find('.notationcolorddl').addClass('color_green');
                            $(ele[j]).find('.notationcolor').addClass('color_green');
                            $(ele[j]).find('.notationcolordate').addClass('color_green');
                            $(ele[j]).find('.Treat_Plan_Comment').addClass('color_green');
                            var_radiobutton.attr('disabled', false);
                            var_Seq_No.attr('disabled', true);
                            var_Advicedetail.attr('disabled', true);
                            var_OperationSeq1.attr('disabled', true);
                            var_OperationSeq2.attr('disabled', true);
                            var_OperationSeq3.attr('disabled', true);
                            var_OperationSeq4.attr('disabled', true);
                            var_AdvisedDate.attr('disabled', true);
                            var_Status.attr('disabled', true);
                            var_Comment.attr('disabled', true);
                        }

                        var_Seq_No.attr('disabled', true);

                        

                        j = j + 1;



                    } else {

                        ddl_id = ddl_id + 1;

                        var treatment_Plan_div = '<div id="TreatmentPlan" class="row textalign adj_treatplan_rowmargin AddTreatPlan GetPlan">' +
                        '<div class="col-md-1" style="width:2%">' +
                         '<input type="radio" class="radiobutton_adj Radio_Plan" name="select_plan"> ' +
                         '</div>' +
                        '<div class="col-md-1" style="width:8%"><textarea name="textarea" class="form-control adj_treatPlan_maxwidth Treat_Plan_Seq notationcolorSeq"  rows="2" cols="3" placeholder="Steps" onkeydown="return isNumberOnly(event);"  onkeypress="return isNumberOnly(event);"  disabled>' + data[i].Step_No + '</textarea></div>' +
                       '<div class="col-md-3 paddingleft" style="width:22%"><textarea name="textarea" rows="2" cols="34" class="form-control adj_treatPlan_maxwidth Treat_Plan_AdviceDetail notationcolorAdvise" placeholder="Advised Details"  onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);">' + data[i].Advised_Details + '</textarea> </div>' +
                       '<div class="col-md-2 paddingbothempty"  style="width:14%"><div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text1" class="form-control adj_treatPlan_text Treat_Plan_OperSeq1 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" value="' + data[i].Notation_Sequence1 + '"/>' +
                       '<input type="text" id="Text2" class="form-control adj_treatPlan_text Treat_Plan_OperSeq2 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"  value="' + data[i].Notation_Sequence2 + '"/>' +
                       '</div>' +

                       '<div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text3" class="form-control adj_treatPlan_text Treat_Plan_OperSeq3 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"  value="' + data[i].Notation_Sequence3 + '"/>' +
                       '<input type="text" id="Text4" class="form-control adj_treatPlan_text Treat_Plan_OperSeq4 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"  value="' + data[i].Notation_Sequence4 + '"/>' +
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft" style="width:12%">' +
                       ' <div class="input-icon right">' +
                       '<i class="fa fa-calendar adj_treatplan_date" id="Icon_Calendar"></i>' +

                       '<textarea id="txtAdvicedate" name="textarea" rows="2" cols="10"  class="form-control adj_treatPlan_maxwidth Treat_Plan_AdvisedDate notationcolordate"  onclick="return ClearErrorMsg(event);"  placeholder="DD-MMM-YYYY">' + data[i].Advised_Date + '</textarea>' +

                       '</div>' +
                       '</div>' +
                       '<div class="col-md-2 paddingleft" style="width:10%">' +
                       '<select id="ddlTreatment_Status_' + ddl_id + '" class="form-control adj_treatPlan_ddl bindstatus notationcolorddl" onchange="return ClearErrorMsg(event);" value="' + data[i].Treatment_Plan_Status_ID + '">' +

                       '</select>' +
                       '</div>' +
                       '<div class="col-md-3 paddingleft">' +
                       '<textarea name="textarea" rows="2" class="form-control adj_treatPlan_maxwidth Treat_Plan_Comment Treat_Plan_Comment" cols="34" placeholder="Comments"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,1000);">' + data[i].Comments + '</textarea>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft adj_treatPlan_btn"  style="width:5%">' +

                        '<a><i class="fa fa-floppy-o label1 lnkcursor fa_size" id="editrem" onclick="saveTreatmentPlan(this)" aria-hidden="true"></i></a><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1 fa_size" data-toggle="tooltip" title="Delete" aria-hidden="true" id="deleterem" onclick="deleteTreatmentPlan(this)"></i></a>' +

                        '</div>' +

                        '</div>';


                        $('#ContentPlaceHolder1_wraper').append(treatment_Plan_div);

                        BindStatus_HTML($('#ddlTreatment_Status_' + ddl_id), data[i].Treatment_Plan_Status_ID)

                        var ele1 = $('.GetPlan');

                        for (var y = 0; y < ele1.length; y++) {

                            var var_AdvisedDate = $(ele1[y]).find(".Treat_Plan_AdvisedDate");
                            var var_Status = $(ele1[y]).find(".bindstatus");
                            var var_radiobutton = $(ele1[y]).find(".Radio_Plan");

                            var var_Seq_No = $(ele1[y]).find(".Treat_Plan_Seq");
                            var var_Advicedetail = $(ele1[y]).find(".Treat_Plan_AdviceDetail");
                            var var_OperationSeq1 = $(ele1[y]).find(".Treat_Plan_OperSeq1");
                            var var_OperationSeq2 = $(ele1[y]).find(".Treat_Plan_OperSeq2");
                            var var_OperationSeq3 = $(ele1[y]).find(".Treat_Plan_OperSeq3");
                            var var_OperationSeq4 = $(ele1[y]).find(".Treat_Plan_OperSeq4");
                            var var_Comment = $(ele1[y]).find(".Treat_Plan_Comment");

                            $(var_AdvisedDate).dcalendarpicker({

                                format: 'dd-mmm-yyyy'

                            });

                            if ($(var_Status).val() == '1') {

                                $(ele1[y]).find(".notationcolorSeq").addClass('color_blue');
                                $(ele1[y]).find(".notationcolorAdvise").addClass('color_blue');
                                $(ele1[y]).find('.notationcolorddl').addClass('color_blue');
                                $(ele1[y]).find('.notationcolor').addClass('color_blue');
                                $(ele1[y]).find('.notationcolordate').addClass('color_blue');
                                $(ele1[y]).find('.Treat_Plan_Comment').addClass('color_blue');

                                var_radiobutton.attr('disabled', true);
                            }
                            else if ($(var_Status).val() == '2') {
                                $(ele1[y]).find('.notationcolorSeq').addClass('color_orange');
                                $(ele1[y]).find('.notationcolorAdvise').addClass('color_orange');
                                $(ele1[y]).find('.notationcolorddl').addClass('color_orange');
                                $(ele1[y]).find('.notationcolor').addClass('color_orange');
                                $(ele1[y]).find('.notationcolordate').addClass('color_orange');
                                $(ele1[y]).find('.Treat_Plan_Comment').addClass('color_orange');
                                var_radiobutton.attr('disabled', false);
                            }
                            else if ($(var_Status).val() == '3') {
                                $(ele1[y]).find('.notationcolorSeq').addClass('color_green');
                                $(ele1[y]).find('.notationcolorAdvise').addClass('color_green');
                                $(ele1[y]).find('.notationcolorddl').addClass('color_green');
                                $(ele1[y]).find('.notationcolor').addClass('color_green');
                                $(ele1[y]).find('.notationcolordate').addClass('color_green');
                                $(ele1[y]).find('.Treat_Plan_Comment').addClass('color_green');
                                var_radiobutton.attr('disabled', false);
                                var_Seq_No.attr('disabled', true);
                                var_Advicedetail.attr('disabled', true);
                                var_OperationSeq1.attr('disabled', true);
                                var_OperationSeq2.attr('disabled', true);
                                var_OperationSeq3.attr('disabled', true);
                                var_OperationSeq4.attr('disabled', true);
                                var_AdvisedDate.attr('disabled', true);
                                var_Status.attr('disabled', true);
                                var_Comment.attr('disabled', true);
                            }
                        }
                    }

                }

                $('#ContentPlaceHolder1_wraper').show();
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



/*
*  Method Name - OpenTreatmentPlan_PopUp 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to open treatment plans popup on button click.
*/
function OpenTreatmentPlan_PopUp() {

    for (var i = 0; i <= 2; i++) {

        AddNewTreatmentPlan(i);
        ddl_id = ddl_id + 1;

        var ele = $('.AddTreatPlan');

        for (var y = 0; y < ele.length; y++) {
            var var_AdvisedDate = $(ele[y]).find(".Treat_Plan_AdvisedDate");

            $(var_AdvisedDate).dcalendarpicker({
                format: 'dd-mmm-yyyy',
                constrainInput: false

            });
        }

    }

    Show_Treatment_Plans();
  
    var var_del_flag = document.getElementById('ContentPlaceHolder1_hdn_Delete_Plans').value;
   
    if (var_del_flag == '1') {

        var ele2 = $('.AddTreatPlan');
        for (var j = 0; j < ele2.length; j++) {
            var var_Seq_No = $(ele2[j]).find(".Treat_Plan_Seq");
            var var_Advicedetail = $(ele2[j]).find(".Treat_Plan_AdviceDetail").val();

            if (var_Advicedetail == '') {
                var_Seq_No.val('');
            }
        }
    }
       


   

    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

    var hdn_Status_ID = document.getElementById('ContentPlaceHolder1_hdn_Status_ID').value;

    if ((hdn_Status_ID.toString() == '4') || (hdn_Status_ID.toString() == '5')) {

        document.getElementById("btnSubmit_TreatPlan").disabled = true;
        document.getElementById("btnResetPlan").disabled = true;
        document.getElementById("btnAddTreatment").disabled = true;
        $('#treat_plan_div').find('select,textarea').prop('disabled', true);
        $('#treat_plan_div').find('.notationcolor').prop('disabled', true);
        var ele_delete = $('.fa-trash-o');
        $(ele_delete).attr('onclick', '');
        var ele_save = $('.fa-floppy-o');
        $(ele_save).attr('onclick', '');
        $(ele_delete).addClass('nocursor');
        $(ele_save).addClass('nocursor');
       
    }

    $find("ATP").show();
}


/*
*  Method Name - clear_TreatmentPlan_PopUp 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to clear treatment plans popup details.
*/
function clear_TreatmentPlan_PopUp() {

    $('#ContentPlaceHolder1_wraper').html('');

    $find("ATP").hide();
}



/*
*  Method Name - deleteTreatmentPlan 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to delete treatment plan.
*/


function deleteTreatmentPlan(Plan) {

    var var_inc = $(Plan).parent().parent().parent().find('.Treat_Plan_Seq').val();

    var var_TreatmentPlanStatus = $(Plan).parent().parent().parent().find('.bindstatus').val();

    if ((var_TreatmentPlanStatus == '2') || (var_TreatmentPlanStatus == '3')) {

        if (var_inc != '') {
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(TREAT_PLAN_DELETE_ERROR);
            return false;
        }
    }

   
    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    var maindiv = $(Plan).parent().parent().parent();

    var var_Seq_No = maindiv.find(".Treat_Plan_Seq");

    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');

    var data = new FormData();

    data.append("p_str_Clinic_ID", value_medicine[2]);

    data.append("p_str_Doctor_ID", value_medicine[1]);
    data.append("p_str_Patient_ID", value_medicine[0]);
    data.append("p_int_StepNo", var_Seq_No.val());


    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteTreatmentPlan",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {

            var data = response;
            $(Plan).parent().parent().parent().remove();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

            var var_seqno = $(Plan).parent().parent().parent().find('.Treat_Plan_Seq').val();

            var detail_div = $('.AddNewDetail');

            for (var u = 0; u < detail_div.length; u++) {

                var det_seq = $(detail_div[u]).find('.Detail_Seq_No');

                var det_seq_no = $(detail_div[u]).find('.Detail_Seq_No').val();

                if (parseInt(det_seq_no) == parseInt(var_seqno)) {
                    $(det_seq).parent().parent().parent().remove();
                }
            }

            var count_existrows = 0;
            var ele2 = $('.AddTreatPlan');
            for (var j = 0; j < ele2.length; j++) {
                var var_Seq_No = $(ele2[j]).find(".Treat_Plan_Seq");
                var var_Advicedetail = $(ele2[j]).find(".Treat_Plan_AdviceDetail").val();

                if (var_Seq_No != '') {
                    if (var_Advicedetail != '') {
                        count_existrows = count_existrows + 1;
                    }
                }
            }

            if (count_existrows == 0) {
                $('#ContentPlaceHolder1_hdn_TreatButtons_Colors').val('0');
                document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'white';
            }
            else {
                $('#ContentPlaceHolder1_hdn_TreatButtons_Colors').val('1');
                document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'yellow';
            }


            var var_del_flag = document.getElementById('ContentPlaceHolder1_hdn_Delete_Plans').value;



            if (var_del_flag == 0) {

                var ele = $('.AddTreatPlan');

                var nmbr = Number(var_inc);

                for (var k = 0; k < ele.length; k++) {

                    nmbr = nmbr + 1;
                    var varl = $(ele[k]).find('.Treat_Plan_Seq').val();
                    var num_k = k + 1;
                    var num_k_str = num_k
                    //                    if (num_k < 10) {
                    //                        num_k_str = "0" + num_k
                    //                    }

                    $(ele[k]).find('.Treat_Plan_Seq').val(num_k_str);

                    $(ele[k]).find('.bindstatus').attr("id", "ddlTreatment_Status_" + num_k_str);

                }

                var ele = $('.AddTreatPlanForDetail');
                for (var k = 0; k < ele.length; k++) {
                    nmbr = nmbr + 1;
                    var varl = $(ele[k]).find('.Treat_Plan_Seq').val();
                    var num_k = k + 1;
                    var num_k_str = num_k
                    //                    if (num_k < 10) {
                    //                        num_k_str = "0" + num_k
                    //                    }

                    $(ele[k]).find('.Treat_Plan_Seq').val(num_k_str);

                    $(ele[k]).find('.bind_detail_status ').attr("id", "ddlTreatment_Status_" + num_k_str);
                }
            }
            else {


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
}


/*
*  Method Name - OpenTreatmentDetailPlan_PopUp 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to open treatment detail pop up.
*/

function OpenTreatmentDetailPlan_PopUp() {

    var count_radiobtn = 0;
    var count_Seq_Duplicate = 0;

    var getseqno = $('.AddTreatPlan');

    for (var p = 0; p < getseqno.length; p++) {


        var var_radiobtn = $(getseqno[p]).find(".Radio_Plan");

        if ($(var_radiobtn).is(":checked")) {

            var var_Seq_No = $(getseqno[p]).find(".Treat_Plan_Seq").val();
            var var_Status = $(getseqno[p]).find(".bindstatus").val();


            if (var_Seq_No != '') {

                if (parseInt(var_Seq_No) > 999) {

                    $(getseqno[p]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');    
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(INVALID_SEQNO);
                    return false;

                }

                var ele = $('.AddTreatPlan');

                for (var m = 0; m < ele.length; m++) {

                    var next_seq_no = $(ele[m]).find(".Treat_Plan_Seq").val();

                    if (var_Seq_No == next_seq_no) {
                        count_Seq_Duplicate = count_Seq_Duplicate + 1;
                    }


                    if (parseInt(count_Seq_Duplicate) > 1) {
                        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                        $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                        $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                        $(getseqno[p]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
                        $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(DUPLICATE_TREATMENTPLAN_ONDETAILCLICK);
                        return false;
                    }

                }
                if ((var_Status == '1') || (var_Status == '0')) {
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $(getseqno[p]).find(".notationcolorddl").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(INVALID_STATUS);
                    return false;
                }
            }

            count_radiobtn = count_radiobtn + 1;

        }

    }

    if (count_radiobtn == '0') {
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
        $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_PLAN_SELECTION);
        return false;
    }
    else {

        AddNewTreatmentPlanForDetail();
        Show_Treatment_Plans_ForDetailPU();
    }
       
    

    var hdn_Status_ID = document.getElementById('ContentPlaceHolder1_hdn_Status_ID').value;

    if ((hdn_Status_ID.toString() == '4') || (hdn_Status_ID.toString() == '5')) {
        //document.getElementById("Button29").disabled = true;
        document.getElementById("Button24").disabled = true;
        document.getElementById("Button21").disabled = true;
        document.getElementById("btnReset").disabled = true;
        document.getElementById("ContentPlaceHolder1_FU_AttachDocument").disabled = true;
        $('#treat_detail_div').find(':input').prop('disabled', true);
        var ele_attachfile = $('.fa-trash-o');
        $(ele_attachfile).attr('onclick', '');
        $(ele_attachfile).addClass('nocursor');
    }
    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
    $("#ContentPlaceHolder1_FU_AttachDocument").val('');
    $find("TDPU").show();
}


/*
*  Method Name - VisibleButtons 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to make treatment advice button visible if tretament_detail parameter is on.
*/
//function VisibleButtons() {

//    $('#btnTreatmentPlan').hide();

////    $('#btnTreatmentPlan').removeClass('displaybuttons');
////    $('#btnTreatmentDetails').removeClass('displaybuttons');

//}


/*
*  Method Name - VisibleButtons 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to make treatment advice button invisible if tretament_detail parameter is on.
*/
//function InvisibleButtons() {

//    $('#btnTreatmentPlan').addClass('displaybuttons');
//    $('#btnTreatmentDetails').addClass('displaybuttons');
//}

/*
*  Method Name - ButtonsText 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to change treatment advice button text when the visit is complete.
*/
function ButtonsText() {

    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").value = "View Treatment Advice";
    //document.getElementById("btnTreatmentDetails").value = "View Treatment Details";
}


/*
*  Method Name - buttons_color 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to change treatment advice button color when the data is added into treatment plan popup.
*/
function buttons_color() {
    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'yellow';
}



/*
*  Method Name - disablebutton_TreatPlan 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to disable treatment advice button  when the no data is added.
*/

function disablebutton_TreatPlan() {
    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").disabled = true;
}




/*
*  Method Name - btnColorWhite 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to change treatment advice button color when all records are deleted from treatment plan popup.
*/

function btnColorWhite() {
    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'white';
    //document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").style.color = 'white';
}



/*
*  Method Name - Show_Treatment_Plans_ForDetailPU 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to show treatment details popup on button click 
*/

function Show_Treatment_Plans_ForDetailPU() {

    var Selected_Seq_No;
    var var_Status;

    var getseqno = $('.AddTreatPlan');

    for (var p = 0; p < getseqno.length; p++) {


        var var_radiobtn = $(getseqno[p]).find(".Radio_Plan");

        if ($(var_radiobtn).is(":checked")) {

            var var_Seq_No = $(getseqno[p]).find(".Treat_Plan_Seq").val();
            var var_Advicedetail = $(getseqno[p]).find(".Treat_Plan_AdviceDetail").val();
            var var_OperationSeq1 = $(getseqno[p]).find(".Treat_Plan_OperSeq1").val();
            var var_OperationSeq2 = $(getseqno[p]).find(".Treat_Plan_OperSeq2").val();
            var var_OperationSeq3 = $(getseqno[p]).find(".Treat_Plan_OperSeq3").val();
            var var_OperationSeq4 = $(getseqno[p]).find(".Treat_Plan_OperSeq4").val();
            var var_AdvisedDate = $(getseqno[p]).find(".Treat_Plan_AdvisedDate").val();
            var_Status = $(getseqno[p]).find(".bindstatus").val();
            var var_Comment = $(getseqno[p]).find(".Treat_Plan_Comment").val();

            Selected_Seq_No = var_Seq_No;
            $('#ContentPlaceHolder1_hdnSelected_Seq_No').val(var_Seq_No);


            var ele = $('.AddTreatPlanForDetail');

            var var_Seq_No_Detail = $(ele).find(".Treat_Plan_Seq");
            var var_Advicedetail_Detail = $(ele).find(".Treat_Plan_AdviceDetail");
            var var_OperationSeq1_Detail = $(ele).find(".Treat_Plan_OperSeq1");
            var var_OperationSeq2_Detail = $(ele).find(".Treat_Plan_OperSeq2");
            var var_OperationSeq3_Detail = $(ele).find(".Treat_Plan_OperSeq3");
            var var_OperationSeq4_Detail = $(ele).find(".Treat_Plan_OperSeq4");
            var var_AdvisedDate_Detail = $(ele).find(".Treat_Plan_AdvisedDate");
            var var_Status_Detail = $(ele).find(".bind_detail_status");
            var var_Comment_Detail = $(ele).find(".Treat_Plan_Comment");

            

            $(var_Seq_No_Detail).val(var_Seq_No);
            $(var_Advicedetail_Detail).val(var_Advicedetail);
            $(var_OperationSeq1_Detail).val(var_OperationSeq1);
            $(var_OperationSeq2_Detail).val(var_OperationSeq2);
            $(var_OperationSeq3_Detail).val(var_OperationSeq3);
            $(var_OperationSeq4_Detail).val(var_OperationSeq4);
            $(var_AdvisedDate_Detail).val(var_AdvisedDate);
            $(var_Status_Detail).val(var_Status);
            $(var_Comment_Detail).val(var_Comment);

        }

    }

    
//    for (var i = 0; i <= 2; i++) {

        AddNewTreatmentDetail(Selected_Seq_No);
//    }

    
    

    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetPatientTreatmentPlans",
        type: "POST",
        data: {

            p_str_Clinic_ID: value_medicine[2],
            p_str_Doctor_ID: value_medicine[1],
            p_str_PatientID: value_medicine[0],
            p_int_stepno: Selected_Seq_No
        },
        async: false,
        success: function (response) {

            var data = response;

            if (data.length > 0) {

                $('#ContentPlaceHolder1_hdn_Delete_Plans').val('1');
            }
            else {
                $('#ContentPlaceHolder1_hdn_Delete_Plans').val('0');

                $('#ContentPlaceHolder1_PreviousFiles').html('');

            }

            var treatmentplan_div = "";

            var j = 0;
            var l = 0;
            for (var i = 0; i < data.length; i++) {



                if (data[i].TABLE1 != null) {

                    if (l < 1) {


                        var ele_detail = $('.AddNewDetail');

                        var var_Seq_No = $(ele_detail[l]).find(".Detail_Seq_No");
                        var var_DetailNo = $(ele_detail[l]).find(".Detail_Number");
                        var var_ActualTreatment = $(ele_detail[l]).find(".Detail_Treatment");
                        var var_DetailRemark = $(ele_detail[l]).find(".Detail_Remark");
                        var var_DetailDate = $(ele_detail[l]).find(".Detail_Date");

                        $(var_Seq_No).val(data[i].Step_No);
                        $(var_DetailNo).val(data[i].Detail_Step_No);
                        $(var_ActualTreatment).val(data[i].Actual_Treatment);
                        $(var_DetailRemark).val(data[i].Remarks);
                        $(var_DetailDate).val(data[i].Visit_Date);

                        $(var_Seq_No).removeClass('color_orange');
                        $(var_DetailNo).removeClass('color_orange');
                        $(var_ActualTreatment).removeClass('color_orange');
                        $(var_DetailRemark).removeClass('color_orange');
                        $(var_DetailDate).removeClass('color_orange');

                        $(var_Seq_No).addClass('color_blue');
                        $(var_DetailNo).addClass('color_blue');
                        $(var_ActualTreatment).addClass('color_blue');
                        $(var_DetailRemark).addClass('color_blue');
                        var_DetailNo.attr('disabled', true);
                        $(var_DetailDate).addClass('color_blue');


                        l = l + 1;

                    } else {

                       

                        var treatment_detail_div = '<div id="TreatmentDetails" class="row textalign adj_treatplan_rowmargin AddNewDetail">' +

                        '<div class="col-md-1" style="width:8%">' +
                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Seq_No color_blue" rows="2" cols="3" onkeydown="return isNumberOnly(event);" onkeypress="return isNumberOnly(event);" placeholder="Steps" value="' + data[i].Step_No + '" disabled/>' +
                        '</div>' +
                        '<div class="col-md-1 paddingleft" style="width:6%">' +
                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Number Numbercolorerror color_blue" rows="2" cols="3" placeholder="No" onkeydown="return isNumberOnly(event);" onkeypress="return isNumberOnly(event)(event);" value="' + data[i].Detail_Step_No + '" disabled/>' +
                        '</div>' +
                        '<div class="col-md-4 paddingbothempty" style="width:37%">' +

                        '<input type="text" class="form-control adj_treatPlan_maxwidth Detail_Treatment Treatmentcolorerror color_blue" onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);" placeholder="Treatment"  value="' + data[i].Actual_Treatment + '"/>' +
                        '</div>' +

                        '<div class="col-md-3 paddingright" style="width:27%">' +
                        '<input type="text"  placeholder="Remarks"  class="form-control adj_treatPlan_maxwidth Detail_Remark color_blue"  onkeyup="CheckCharacterMedicine(this,1000);" onkeypress="return ClearErrorMsg(event);" value="' + data[i].Remarks + '"/>' +

                        '</div>' +

                        '<div class="col-md-2">' +
                        '<input type="text"  placeholder="Date"  class="form-control adj_treatPlan_maxwidth Detail_Date color_blue"  onkeyup="CheckCharacterMedicine(this,1000);" onkeypress="return ClearErrorMsg(event);" value="' + data[i].Visit_Date + '" disabled/>' +

                        '</div>' +

                        '<div class="col-md-1 paddingleft" style="width:5%">' +
                        '<a><i class="fa fa-trash-o lnkcursor label1 fa_size" data-toggle="tooltip" title="Delete" aria-hidden="true" id="deleterem" onclick="deleteTreatmentDetail(this)"></i></a>' +
                        '</div>' +

                        '</div>';

                        $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').append(treatment_detail_div);


                    }
                    $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').show();
                }

                if (var_Status == '3') {

                    document.getElementById("Button24").disabled = true;
                    document.getElementById("Button21").disabled = true;
                    document.getElementById("btnReset").disabled = true;
                    document.getElementById("ContentPlaceHolder1_FU_AttachDocument").disabled = true;

                    var ele_detail = $('.AddNewDetail');

                    for (var a = 0; a < ele_detail.length; a++) {

                        var var_ActualTreatment = $(ele_detail[a]).find(".Detail_Treatment");
                        var var_DetailRemark = $(ele_detail[a]).find(".Detail_Remark");
                        var var_DetailNo = $(ele_detail[a]).find(".Detail_Number");
                        var ele_attachfile = $(ele_detail[a]).find('.fa-trash-o');
                       

                        $(ele_attachfile).addClass('nocursor');
                        $(ele_attachfile).attr('onclick', '');
                        var_ActualTreatment.attr('disabled', true);
                        var_DetailRemark.attr('disabled', true);
                        var_DetailNo.attr('disabled', true);

                    }

                }
                else {
                    document.getElementById("Button24").disabled = false;
                    document.getElementById("Button21").disabled = false;
                    document.getElementById("btnReset").disabled = false;
                    document.getElementById("ContentPlaceHolder1_FU_AttachDocument").disabled = false;
                }

                if (data[i].TABLE2 != null) {
                    var str_filepath = data[i].FilePath_Name;
                    var split_path = str_filepath.split('/');

                    var fileuploaddiv = '<div id="addfileupload" class="addreminderdiv fileupload oldfiles">' +
                                        '<div class="col-md-10"><u><span Class="lbl-black lblfileupload cursor" onclick="downloadfile(\'' + data[i].FilePath_Name + '\')">' + split_path[3].toString() + '</span></u></div>' +
                                        '<div class="col-md-2" style="text-align: right;"><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1" data-toggle="tooltip" title="Delete" aria-hidden="true" onclick="delattachedfile(this)"></i></a></div>' +
                                        '<input type="hidden" id="hdn_filepath" class="hdn_filepath" value="' + data[i].FilePath_Name + '"/>';
                    '</div>';

                    $('#ContentPlaceHolder1_PreviousFiles').show();
                    $('#ContentPlaceHolder1_PreviousFiles').append(fileuploaddiv);

                    if (var_Status == '3') {
                        var ele_del_attach = $('.oldfiles');
                        for (var b = 0; b < ele_del_attach.length; b++) {

                            var ele_attachfile = $(ele_del_attach[b]).find('.fa-trash-o');
                            $(ele_attachfile).attr('onclick', '');
                            $(ele_attachfile).addClass('nocursor');
                        }
                    }
                }
                else {
                    $('#ContentPlaceHolder1_PreviousFiles').html('');
                }
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


/*
*  Method Name - clear_TreatmentDetail_PopUp 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to clear treatment details popup on close button click 
*/

function clear_TreatmentDetail_PopUp() {
   
    $('#ContentPlaceHolder1_Wrapper_Details').html('');
    $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').html('');
    $('#ContentPlaceHolder1_PreviousFiles').html('');
    $('#ContentPlaceHolder1_Files').html('');
    $find("TDPU").hide();
   
}

/*
*  Method Name - SaveTreatment_And_Details 
*  Created By  - Varsha Khandre
*  Created On  - 02 June 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to save treatment details pop up details on submit button.
*/

function SaveTreatment_And_Details() {

    var val = true;
    var count_plan = 0;
    var count_detail = 0;

    filevalidation(val);

    if (filevalidation(val)) {

        var ele = $('.AddTreatPlanForDetail');

        if (ele.length == 0) {
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(TP_EMPTY_TREATMENTPLAN);
            return false;
        }

        var var_OperationSeq1 = '';
        var var_OperationSeq2 = '';
        var var_OperationSeq3 = '';
        var var_OperationSeq4 = '';
        var var_Comment = '';
        var lastTreatmentPlan_List = '';
        var lastTreatmentDetail_List = '';

        for (var l = 0; l < ele.length; l++) {

            var Curr_Seq_No = $(ele[l]).find(".Treat_Plan_Seq").val();

            for (var m = l + 1; m < ele.length; m++) {

                var next_seq_no = $(ele[m]).find(".Treat_Plan_Seq").val();

                if (parseInt(next_seq_no) == parseInt(Curr_Seq_No)) {
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(DUPLICATE_TREATMENTPLAN);
                    return false;
                }
            }
        }


        for (var i = 0; i < ele.length; i++) {

            var var_Seq_No = $(ele[i]).find(".Treat_Plan_Seq").val();
            var var_Advicedetail = $(ele[i]).find(".Treat_Plan_AdviceDetail").val();
            var var_OperationSeq1 = $(ele[i]).find(".Treat_Plan_OperSeq1").val();
            var var_OperationSeq2 = $(ele[i]).find(".Treat_Plan_OperSeq2").val();
            var var_OperationSeq3 = $(ele[i]).find(".Treat_Plan_OperSeq3").val();
            var var_OperationSeq4 = $(ele[i]).find(".Treat_Plan_OperSeq4").val();
            var var_AdvisedDate = $(ele[i]).find(".Treat_Plan_AdvisedDate").val();
            var var_Status = $(ele[i]).find(".bind_detail_status").val();
            var var_Comment = $(ele[i]).find(".Treat_Plan_Comment").val();


            var Date_of_Birth = /^(\d{1,2})(-)(?:(\d{1,2})|(jan)|(feb)|(mar)|(apr)|(may)|(jun)|(jul)|(aug)|(sep)|(oct)|(nov)|(dec)|(JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OCT)|(NOV)|(DEC)|(Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec))(-)(\d{4})$/;

            var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");
            var d = new Date();
            var curr_date = d.getDate();
            var curr_month = d.getMonth();
            var curr_year = d.getFullYear();
            currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;

            var date_current = parseDMY(currentDate);
            var date_adviseddate = parseDMY(var_AdvisedDate);

            var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
            var value_medicine = values.split(',');

            if (var_OperationSeq1 == "") {
                var_OperationSeq1 = " ";
            }

            if (var_OperationSeq2 == "") {
                var_OperationSeq2 = " ";
            }

            if (var_OperationSeq3 == "") {
                var_OperationSeq3 = " ";
            }
            if (var_OperationSeq4 == "") {
                var_OperationSeq4 = " ";
            }

            if (var_Comment == "") {
                var_Comment = " ";
            }


            if (var_Advicedetail != '') {

                count_plan = count_plan + 1;


                 if (var_AdvisedDate == '') {

                    $(ele[i]).find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_ADVISED_DATE);
                    return false;
                }

                else if ((var_AdvisedDate != '') && (!var_AdvisedDate.match(Date_of_Birth))) {

                    $(ele[i]).find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(FR_DOB_PAT);
                    return false;
                }
                else if (!var_AdvisedDate.match(/^(\d{1,2})(\/|-)([a-zA-Z]{3})(\/|-)(\d{4})$/)) {

                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(FR_DOB_PAT);
                    return false;
                }
                //                else if (date_current > date_adviseddate) {

                //                    $(ele[i]).find(".notationcolordate").addClass('adj_treatplan_errorborder');
                //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_ADVISED_DATE);
                //                    return false;

                //                }
                else if (var_Status == 0) {
                    $(ele[i]).find(".notationcolorddl").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_STATUS);
                    return false;
                }

                else {

                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();

                    var TreatmentPlan_List = var_Seq_No + '#@' + var_Advicedetail + '#@' + var_OperationSeq1 + '#@' + var_OperationSeq2 + '#@' + var_OperationSeq3 + '#@' + var_OperationSeq4 + '#@' + var_AdvisedDate + '#@' + var_Status + '#@' + var_Comment;

                    if (i == 0) {
                        lastTreatmentPlan_List = TreatmentPlan_List;
                    }
                    else {
                        lastTreatmentPlan_List = lastTreatmentPlan_List + '@%&' + TreatmentPlan_List;
                    }
                }
            }
        }

        /*****************************************************Save Details**********************************************************/

        var AddDetail_Div = $('.AddNewDetail');

        if (AddDetail_Div.length == 0) {
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_DETAIL);
            return false;
        }
        var IDs = [];
        for (var k = 0; k < AddDetail_Div.length; k++) {


            var var_Seq_No = $(AddDetail_Div[k]).find(".Detail_Seq_No").val();
            var var_Number = $(AddDetail_Div[k]).find(".Detail_Number").val();
            var var_ActualTreament = $(AddDetail_Div[k]).find(".Detail_Treatment").val();
            var var_Remark = $(AddDetail_Div[k]).find(".Detail_Remark").val();
            if ((var_Seq_No != '') && (var_Number != '')) {

                IDs.push([parseInt(var_Seq_No), parseInt(var_Number)]);
            }

           if(var_Number != '') {

               if (parseInt(var_Number) > 999) {

                    $(AddDetail_Div[k]).find(".Numbercolorerror").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_NO);
                    return false;

                }
            }

            var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
            var value_medicine = values.split(',');

            if (var_Remark == "") {
                var_Remark = " ";
            }

            if (var_Seq_No != '') {

                if (parseInt(var_Seq_No) > 999) {

                    $(AddDetail_Div[k]).find(".notationcolorSeq").addClass('adj_treatplan_errorborder');    
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_SEQNO);
                    return false;

                }

                if (var_Number != '') {


                    //                    $(AddDetail_Div[k]).find(".Numbercolorerror").addClass('adj_treatplan_errorborder');

                    //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    //                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_NUMBER);
                    //                    return false;


                    if (var_ActualTreament == '') {

                        $(AddDetail_Div[k]).find(".Treatmentcolorerror").addClass('adj_treatplan_errorborder');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_ACTUAL_TREATMENT);
                        return false;
                    }


                    else {

                        count_detail = count_detail + 1;

                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();

                        var TreatmentDetail_List = var_Seq_No + '#@' + var_Number + '#@' + var_ActualTreament + '#@' + var_Remark;

                        if (k == 0) {
                            lastTreatmentDetail_List = TreatmentDetail_List;
                        }
                        else {
                            lastTreatmentDetail_List = lastTreatmentDetail_List + '@%&' + TreatmentDetail_List;
                        }
                    }
                }
            }
        }

       
        for (var i = 0; i < IDs.length; i++) {

            for (var j = i + 1; j < IDs.length; j++) {
                if ((IDs[i][0] == IDs[j][0]) && (IDs[i][1] == IDs[j][1])) {
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(DUPLICATE_TREATMENTDETAIL);
                    return false;
                }
            }
        }


        if (count_plan == 0) {
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(TP_EMPTY_TREATMENTPLAN);
            return false;
        }
        else if (count_plan != 0) {

            if (count_detail == 0) {
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(EMPTY_DETAIL);
                return false;
            }
        }

        var data = new FormData();


        var obj_file = $('#ContentPlaceHolder1_FU_AttachDocument');
        var img = $(obj_file).get(0).files;

        var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
        var files = fileUpload.files;

        for (var i = 0; i < files.length; i++) {
            var l = 0;
            for (var j = 0; j < validatedFiles.length; j++) {
                if (validatedFiles[j] == files[i].name) {
                    l = 1;
                }
            }

            if (l == 0) {
                data.append(files[i].name, files[i]);
            }
        }






        data.append("p_str_Doctor_ID", value_medicine[1]);
        data.append("p_str_Clinic_ID", value_medicine[2]);
        data.append("p_int_Patient_ID", value_medicine[0]);
        data.append("p_int_Shift_ID", Number(value_medicine[3]));
        data.append("p_str_Visit_No", Number(value_medicine[4]));
        data.append("p_str_Todays_Patient_VisitDate", value_medicine[5]);
        data.append("p_str_treatmentdetails", lastTreatmentPlan_List);
        data.append("p_str_onlydetails", lastTreatmentDetail_List);
        data.append("p_str_UserId", value_medicine[6]);

        var hostName = window.location.host;

        $.ajax({

            url: "http://" + hostName + "/Services/CMSV2Services.asmx/Save_Treatment_Plan_And_Details",
            enctype: 'multipart/form-data',
            type: "POST",
            data: data,
            async: false,
            contentType: false,
            processData: false,
            success: function (response) {
                var data = response;


                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('error-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('success-message-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(TREAT_DETAIL_SUCCESS);

                

                var treatplan_div = $('.AddNewDetail');
                for (var i = 0; i < treatplan_div.length; i++) {

                    var seqno = $(treatplan_div[i]).find(".Detail_Seq_No");
                    var getseq_no = $(treatplan_div[i]).find(".Detail_Seq_No").val();
                    var no = $(treatplan_div[i]).find(".Detail_Number");
                    var getno = $(treatplan_div[i]).find(".Detail_Number").val();

                    if ((getseq_no != '') && (getno!='')) {
                        seqno.attr('disabled', true);
                        no.attr('disabled', true);

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
    }
    else {
        return false;
    }

}


/*
*  Method Name - deleteTreatmentDetail 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to delete treatment details delete button click 
*/

function deleteTreatmentDetail(Plan) {

    var maindiv = $(Plan).parent().parent().parent();

    var var_Seq_No = maindiv.find(".Detail_Seq_No");
    var var_Detail_No = maindiv.find(".Detail_Number ");


    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');


    var data = new FormData();


    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[1]);
    data.append("p_str_Patient_ID", value_medicine[0]);
    data.append("p_int_StepNo", var_Seq_No.val());
    data.append("p_int_DetailNo", var_Detail_No.val());


    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteTreatmentDetail",
        enctype: 'multipart/form-data',
        type: "POST",
        data: data,
        async: false,
        contentType: false,
        processData: false,
        success: function (response) {
            var data = response;
            $(Plan).parent().parent().parent().remove();
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
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

/*
*  Method Name - delete_function 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to delete attachments added on detail pop up on button click 
*/

var validatedFiles = [];


function delete_function(evt, num) {


    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    var files = fileUpload.files;


    for (var i = 0; i < files.length; i++) {
        if (num == i) {
            validatedFiles.push(files[i].name);

            files[i] = null

        }
    }
    $(evt).parent().parent().parent().remove();
}


/*
*  Method Name - filevalidation 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to validate attachments added on detail pop up on button click 
*/

function filevalidation(bool) {
    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    var allowedFiles = [".jpeg", ".pdf", ".png", ".jpg", ".docx", ".xlsx", ".xls",".doc"];
    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);

    var array = ['jpg', 'jpeg', 'pdf', 'png', 'docx', 'xlsx', 'xls','doc'];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");

    var var_FilePath = $(fileUpload).val();
    var flag = true;
    if (var_FilePath.length == 0) {
        return true;
    }
    else {

        var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
        var files = fileUpload.files;

        for (var i = 0; i < files.length; i++) {

            var name = files[i].name
            var Extension = name.substring(name.lastIndexOf('.') + 1).toLowerCase();

            if (array.indexOf(Extension) <= -1) {

                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(INVALID_ATTACHMENT);
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
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").removeClass('success-message-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").addClass('error-box');
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
                        $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").append(DUPLICATE_ATTACHMENT);

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


/*
*  Method Name - downloadfile 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to download attachments added on detail pop up on button click 
*/

function downloadfile(path) {

   
    var hostName = window.location.host;

    var p = path;
   
    var path = 'http://' + hostName + '/' + path.replace('~/', '').replace('//', '/');
  
    //path = path.replace(/\s/g, '');
  
    var a = $("<a>").attr("href", path).attr("download", "");
    a[0].click();
    a.remove();

}

/*
*  Method Name - delattachedfile 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to delete attachments added on detail pop up on button click 
*/

function delattachedfile(file) {

    var maindiv = $(file).parent().parent().parent();
    var lbl = maindiv.find('.hdn_filepath').val();

    var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
    var value_medicine = values.split(',');


    var data = new FormData();

    data.append("p_str_Clinic_ID", value_medicine[2]);
    data.append("p_str_Doctor_ID", value_medicine[1]);
    data.append("p_int_Patient_ID", value_medicine[0]);
    data.append("p_str_attachfile", lbl);

    var hostName = window.location.host;

    $.ajax({

        url: "http://" + hostName + "/Services/CMSV2Services.asmx/DeleteAttachedTreatmentDetails",
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
            $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
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


/*
*  Method Name - reset_treatmentplan 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to reset treatment plan data on reset button click on treatment plan popup.
*/

function reset_treatmentplan() {

    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
    $('#ContentPlaceHolder1_wraper').html('');

    for (var i = 0; i <= 2; i++) {
        AddNewTreatmentPlan(i);
        ddl_id = ddl_id + 1;
    }


    Show_Treatment_Plans();

    var var_del_flag = document.getElementById('ContentPlaceHolder1_hdn_Delete_Plans').value;

    

    if (var_del_flag == '1') {

        var ele2 = $('.AddTreatPlan');
        for (var j = 0; j < ele2.length; j++) {
            var var_Seq_No = $(ele2[j]).find(".Treat_Plan_Seq");
            var var_Advicedetail = $(ele2[j]).find(".Treat_Plan_AdviceDetail").val();

            if (var_Advicedetail == '') {
                var_Seq_No.val('');
            }
        }
    }


}


/*
*  Method Name - reset_treatmentdetail 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to reset treatment detail data on reset button click on treatment detail popup.
*/

function reset_treatmentdetail() {

    $("#ContentPlaceHolder1_lbl_Error_TreatmentDetail").empty();
    $('#ContentPlaceHolder1_Wrapper_Details').html('');
    $('#ContentPlaceHolder1_TreatmentDetails_Wrapper').html('');
    $('#ContentPlaceHolder1_PreviousFiles').html('');
    $('#ContentPlaceHolder1_Files').html('');

    AddNewTreatmentPlanForDetail();

    Show_Treatment_Plans_ForDetailPU();
    $("#ContentPlaceHolder1_FU_AttachDocument").val('');
}


/*
*  Method Name - disableonload 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to disable button on page load for offline functionality.
*/

function disableonload() {
    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").disabled = true;
    //document.getElementById("btnTreatmentDetails").disabled = true;
}


/*
*  Method Name - enablecontrol 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to enable button on book appointment for offline functionality.
*/

function enablecontrol() {
    document.getElementById("ContentPlaceHolder1_btnTreatmentPlan").disabled = false;
}


function parseDMY(s) {
    return new Date(s.replace(/^(\d+)\W+(\w+)\W+/, '$2 $1 '));
}


/*
*  Method Name - AddNewTreatmentPlanOnButtonClick 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to add new treatment plan on add advise detail button click.
*/

function AddNewTreatmentPlanOnButtonClick() {

   
    
    seq_no = 0;

    seq_no = $('.bindstatus').length;

    seq_no = seq_no + 1;

    ddl_id = ddl_id + 1;


   

        var treatmentplan_div =

                         '<div id="TreatmentPlan" class="row textalign adj_treatplan_rowmargin AddTreatPlan">' +

                        '<div class="col-md-1" style="width:2%">' +
                        '<input type="radio" class="radiobutton_adj Radio_Plan" name="select_plan" disabled> ' +
                        '</div>' +
                        '<div class="col-md-1" style="width:8%">' +
                        '<textarea name="textarea" class="form-control adj_treatPlan_maxwidth Treat_Plan_Seq notationcolorSeq" rows="2" cols="3" placeholder="Steps" onkeydown="return isNumberOnly(event);"  onkeypress="return isNumberOnly(event);"></textarea></div>' +
                       '<div class="col-md-3 paddingleft" style="width:22%"><textarea autofocus id="txt_advise_' + ddl_id + '" name="textarea" rows="2" cols="34" class="form-control adj_treatPlan_maxwidth Treat_Plan_AdviceDetail notationcolorAdvise" placeholder="Advised Details"  onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);"></textarea> </div>' +
                       '<div class="col-md-2 paddingbothempty"  style="width:14%"><div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text1" class="form-control adj_treatPlan_text Treat_Plan_OperSeq1 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text2" class="form-control adj_treatPlan_text Treat_Plan_OperSeq2 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" />' +
                       '</div>' +

                       '<div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text3" class="form-control adj_treatPlan_text Treat_Plan_OperSeq3 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text4" class="form-control adj_treatPlan_text Treat_Plan_OperSeq4 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft" style="width:12%">' +
                       ' <div class="input-icon right">' +
                       '<i class="fa fa-calendar adj_treatplan_date" id="Icon_Calendar"></i>' +
                       '<textarea id="txtAdvicedate" name="textarea" rows="2" cols="10"  class="form-control adj_treatPlan_maxwidth Treat_Plan_AdvisedDate notationcolordate"  onclick="return ClearErrorMsg(event);"  placeholder="DD-MMM-YYYY"></textarea>' +

                       '</div>' +
                       '</div>' +
                       '<div class="col-md-2 paddingleft" style="width:10%">' +
                       '<select id="ddlTreatment_Status_' + ddl_id + '" class="form-control adj_treatPlan_ddl bindstatus notationcolorddl" onchange="return ClearErrorMsg(event);">' +

                       '</select>' +
                       '</div>' +
                       '<div class="col-md-3 paddingleft">' +
                       '<textarea name="textarea" rows="2" class="form-control adj_treatPlan_maxwidth Treat_Plan_Comment" cols="34" placeholder="Comments"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,1000);"></textarea>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft adj_treatPlan_btn"  style="width:5%">' +

                        '<a><i class="fa fa-floppy-o label1 lnkcursor fa_size" id="editrem" onclick="saveTreatmentPlan(this)" aria-hidden="true"></i></a><a>&nbsp;&nbsp;&nbsp;&nbsp;<i class="fa fa-trash-o lnkcursor label1 fa_size" data-toggle="tooltip" title="Delete" aria-hidden="true" id="deleterem" onclick="deleteTreatmentPlan(this)"></i></a>' +

                        '</div>' +

                        '</div>';



    $('#ContentPlaceHolder1_wraper').show();
    $('#ContentPlaceHolder1_wraper').append(treatmentplan_div);

    var ele = $('.AddTreatPlan');

    for (var y = 0; y < ele.length; y++) {
        var var_AdvisedDate = $(ele[y]).find(".Treat_Plan_AdvisedDate");

        $(var_AdvisedDate).dcalendarpicker({
            format: 'dd-mmm-yyyy'

        });
    }

    $(document).ajaxComplete(function () {
        $("#txt_advise_" + ddl_id).focus();
    });

    BindStatus_HTML($('#ddlTreatment_Status_' + ddl_id), 0);

    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

//    $(".treatplanscroll").animate({
//        scrollTop: 600
//    }, 0);

}



function AddNewTreatmentPlanForDetail_ButtonClick() {

    var detail_plan_seq_no = "0";

    detail_plan_seq_no = $('.bind_detail_status').length;

    detail_plan_seq_no = detail_plan_seq_no + 1;



   
    var treatmentplan_div =

                         '<div id="TreatmentPlan_For_Detail" class="row textalign adj_treatplan_rowmargin AddTreatPlanForDetail">' +

                        '<div class="col-md-1" style="width:8%"><textarea name="textarea" class="form-control adj_treatPlan_maxwidth Treat_Plan_Seq" rows="2" cols="3" placeholder="Steps" onkeydown="return isNumberOnly(event);"  onkeypress="return isNumberOnly(event);"></textarea></div>' +
                       '<div class="col-md-3 paddingleft" style="width:22%"><textarea name="textarea" rows="2" cols="34" class="form-control adj_treatPlan_maxwidth Treat_Plan_AdviceDetail" placeholder="Advised Details"  onkeyup="CheckCharacterMedicine(this,500);" onkeypress="return ClearErrorMsg(event);"></textarea> </div>' +
                       '<div class="col-md-2 paddingbothempty"  style="width:14%"><div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text1" class="form-control adj_treatPlan_text Treat_Plan_OperSeq1 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text2" class="form-control adj_treatPlan_text Treat_Plan_OperSeq2 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);" />' +
                       '</div>' +

                       '<div class="col-md-6 paddingbothempty">' +
                       '<input type="text" id="Text3" class="form-control adj_treatPlan_text Treat_Plan_OperSeq3 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '<input type="text" id="Text4" class="form-control adj_treatPlan_text Treat_Plan_OperSeq4 notationcolor paddingbothempty"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,10);"/>' +
                       '</div>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft" style="width:12%">' +
                       ' <div class="input-icon right">' +
                       '<i class="fa fa-calendar adj_treatplan_date" id="Icon_Calendar"></i>' +
                       '<textarea id="txtAdvicedate" name="textarea" rows="2" cols="10"  class="form-control adj_treatPlan_maxwidth Treat_Plan_AdvisedDate notationcolordate"  onclick="return ClearErrorMsg(event);"  placeholder="DD-MMM-YYYY"></textarea>' +

                       '</div>' +
                       '</div>' +
                       '<div class="col-md-2 paddingleft" style="width:10%">' +
                       '<select id="ddlTreatment_Status_' + detail_plan_seq_no + '" class="form-control adj_treatPlan_ddl bind_detail_status notationcolorddl" onchange="return ClearErrorMsg(event);">' +

                       '</select>' +
                       '</div>' +
                       '<div class="col-md-3 paddingleft">' +
                       '<textarea name="textarea" rows="2" class="form-control adj_treatPlan_maxwidth Treat_Plan_Comment" cols="34" placeholder="Comments"  onkeypress="return ClearErrorMsg(event);" onkeyup="CheckCharacterMedicine(this,1000);"></textarea>' +
                       '</div>' +
                       '<div class="col-md-1 paddingleft adj_treatPlan_btn">' +

                        '<input type="button" ID="btn_delete" class="btn btn-primary adj_treatPlan_maxwidth" value="Delete" onclick="deleteTreatmentPlan(this)"/>' +
                        '</div>' +

                        '</div>';

    $('#ContentPlaceHolder1_Wrapper_Details').show();
    $('#ContentPlaceHolder1_Wrapper_Details').append(treatmentplan_div);

    var ele = $('.AddTreatPlanForDetail');

    for (var y = 0; y < ele.length; y++) {
        var var_AdvisedDate = $(ele[y]).find(".Treat_Plan_AdvisedDate");

        $(var_AdvisedDate).dcalendarpicker({
            format: 'dd-mmm-yyyy'

        });
    }


    BindStatus_HTML($('#ddlTreatment_Status_' + detail_plan_seq_no), 0);
}

/********************************************************12 June 2017************************************************************/


/*
*  Method Name - saveTreatmentPlan 
*  Created By  - Varsha Khandre
*  Created On  - 12 June 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to save treatment plan temporary on save button click.
*/

function saveTreatmentPlan(Plan) {

   
    var var_Seq_No = $(Plan).parent().parent().parent().find('.Treat_Plan_Seq').val();
    var var_Advicedetail = $(Plan).parent().parent().parent().find(".Treat_Plan_AdviceDetail").val();
    var var_AdvisedDate = $(Plan).parent().parent().parent().find(".Treat_Plan_AdvisedDate").val();
    var var_Status = $(Plan).parent().parent().parent().find(".bindstatus").val();
    var var_OperationSeq1 = $(Plan).parent().parent().parent().find(".Treat_Plan_OperSeq1").val();
    var var_OperationSeq2 = $(Plan).parent().parent().parent().find(".Treat_Plan_OperSeq2").val();
    var var_OperationSeq3 = $(Plan).parent().parent().parent().find(".Treat_Plan_OperSeq3").val();
    var var_OperationSeq4 = $(Plan).parent().parent().parent().find(".Treat_Plan_OperSeq4").val();
    var var_Comment = $(Plan).parent().parent().parent().find(".Treat_Plan_Comment").val();
    var var_radiobutton = $(Plan).parent().parent().parent().find(".Radio_Plan");

    var text_Status = $(Plan).parent().parent().parent().find("option:selected").text();
    

    var count_Seq_Duplicate = 0;

    if (var_Seq_No != '') {

        if (parseInt(var_Seq_No) > 999) {

            $(Plan).parent().parent().parent().find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(INVALID_SEQNO);
            return false;

        }

       

        var ele = $('.AddTreatPlan');

            for (var m = 0; m < ele.length; m++) {

                var next_seq_no = $(ele[m]).find(".Treat_Plan_Seq").val();

                if (var_Seq_No == next_seq_no) {
                    count_Seq_Duplicate = count_Seq_Duplicate + 1;
                }
                

                if (parseInt(count_Seq_Duplicate)>1) {
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $(Plan).parent().parent().parent().find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(DUPLICATE_TREATMENTPLAN);
                    return false;
                }
                
        }
    }


    var Date_of_Birth = /^(\d{1,2})(-)(?:(\d{1,2})|(jan)|(feb)|(mar)|(apr)|(may)|(jun)|(jul)|(aug)|(sep)|(oct)|(nov)|(dec)|(JAN)|(FEB)|(MAR)|(APR)|(MAY)|(JUN)|(JUL)|(AUG)|(SEP)|(OCT)|(NOV)|(DEC)|(Jan)|(Feb)|(Mar)|(Apr)|(May)|(Jun)|(Jul)|(Aug)|(Sep)|(Oct)|(Nov)|(Dec))(-)(\d{4})$/;

        var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;

        var date_current = parseDMY(currentDate);
        var date_adviseddate = parseDMY(var_AdvisedDate);


        var values = document.getElementById('ContentPlaceHolder1_hdn_TreatmentPlan_SaveParameters').value;
        var value_medicine = values.split(',');



        if (var_Seq_No != '') {

            if (parseInt(var_Seq_No) > 999) {

                $(Plan).parent().parent().parent().find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(INVALID_SEQNO);
                return false;

            }
           
            if (var_Advicedetail != '') {

                if (var_AdvisedDate == '') {

                    $(Plan).parent().parent().parent().find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_ADVISED_DATE);
                    return false;
                }

                else if ((var_AdvisedDate != '') && (!var_AdvisedDate.match(Date_of_Birth))) {

                    $(Plan).parent().parent().parent().find(".notationcolordate").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(FR_DOB_PAT);
                    return false;
                }
                else if (!var_AdvisedDate.match(/^(\d{1,2})(\/|-)([a-zA-Z]{3})(\/|-)(\d{4})$/)) {

                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(FR_DOB_PAT);
                    return false;
                }

                else if (var_Status == 0) {
                    $(Plan).parent().parent().parent().find(".notationcolorddl").addClass('adj_treatplan_errorborder');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_STATUS);
                    return false;
                }


                else {

                    $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();

                    var TreatmentPlan_List = var_Seq_No + '#@' + var_Advicedetail + '#@' + var_OperationSeq1 + '#@' + var_OperationSeq2 + '#@' + var_OperationSeq3 + '#@' + var_OperationSeq4 + '#@' + var_AdvisedDate + '#@' + var_Status + '#@' + var_Comment;

                    if (var_Status == '1') {
                        $(Plan).parent().parent().parent().find('.notationcolorSeq').removeClass('color_green color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').removeClass('color_green color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').removeClass('color_green color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolor').removeClass('color_green color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolordate').removeClass('color_green color_orange');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').removeClass('color_green color_orange');

                        $(Plan).parent().parent().parent().find('.notationcolorSeq').addClass('color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').addClass('color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').addClass('color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolor').addClass('color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolordate').addClass('color_blue');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').addClass('color_blue');

                        var_radiobutton.attr('checked',false);
                        var_radiobutton.attr('disabled', true);
                    }
                    else if (var_Status == '2') {
                        $(Plan).parent().parent().parent().find('.notationcolorSeq').removeClass('color_green color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').removeClass('color_green color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').removeClass('color_green color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolor').removeClass('color_green color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolordate').removeClass('color_green color_blue');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').removeClass('color_green color_blue');

                        $(Plan).parent().parent().parent().find('.notationcolorSeq').addClass('color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').addClass('color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').addClass('color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolor').addClass('color_orange');
                        $(Plan).parent().parent().parent().find('.notationcolordate').addClass('color_orange');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').addClass('color_orange');
                        var_radiobutton.attr('disabled', false);
                    }
                    else if (var_Status == '3') {

                        if (confirm("Do you want to continue with status" + ' ' +text_Status + "?") == true) {

                        $(Plan).parent().parent().parent().find('.notationcolorSeq').removeClass('color_orange color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').removeClass('color_orange color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').removeClass('color_orange color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolor').removeClass('color_orange color_blue');
                        $(Plan).parent().parent().parent().find('.notationcolordate').removeClass('color_orange color_blue');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').removeClass('color_orange color_blue');

                        $(Plan).parent().parent().parent().find('.notationcolorSeq').addClass('color_green');
                        $(Plan).parent().parent().parent().find('.notationcolorAdvise').addClass('color_green');
                        $(Plan).parent().parent().parent().find('.notationcolorddl').addClass('color_green');
                        $(Plan).parent().parent().parent().find('.notationcolor').addClass('color_green');
                        $(Plan).parent().parent().parent().find('.notationcolordate').addClass('color_green');
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').addClass('color_green');

                        var_radiobutton.attr('disabled', false);
                        var_radiobutton.attr('checked', false);

                        $(Plan).parent().parent().parent().find('.Treat_Plan_Seq').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_AdviceDetail').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_AdvisedDate').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.bindstatus').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_OperSeq1').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_OperSeq2').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_OperSeq3').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_OperSeq4').attr('disabled', true);
                        $(Plan).parent().parent().parent().find('.Treat_Plan_Comment').attr('disabled', true);
                    }
                    else {
                    }
                    }
                }
            }
            else {
                $(Plan).parent().parent().parent().find(".notationcolorAdvise").addClass('adj_treatplan_errorborder');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
                $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_ADVISEDETAIL);
                return false;
            }

        }

        else {
            $(Plan).parent().parent().parent().find(".notationcolorSeq").addClass('adj_treatplan_errorborder');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").empty();
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").removeClass('success-message-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").addClass('error-box');
            $("#ContentPlaceHolder1_lblError_TreatmentPlan").append(EMPTY_STEP);
            return false;
        }
    }


    /*
    *  Method Name - show_status_colors 
    *  Created By  - Varsha Khandre
    *  Created On  - 12 June 2017
    *  Modified By - 
    *  Modified On - 
    *  Purpose     - This function is used to show treatment plan colors according to status.
    */

    function show_status_colors() {

        
        var ele = $('.AddTreatPlan');

        for (var j = 0; j < ele.length; j++) {

            var var_Seq_No = $(ele[j]).find(".Treat_Plan_Seq");
            var var_Advicedetail = $(ele[j]).find(".Treat_Plan_AdviceDetail");
            var var_OperationSeq1 = $(ele[j]).find(".Treat_Plan_OperSeq1");
            var var_OperationSeq2 = $(ele[j]).find(".Treat_Plan_OperSeq2");
            var var_OperationSeq3 = $(ele[j]).find(".Treat_Plan_OperSeq3");
            var var_OperationSeq4 = $(ele[j]).find(".Treat_Plan_OperSeq4");
            var var_AdvisedDate = $(ele[j]).find(".Treat_Plan_AdvisedDate");
            var var_Status = $(ele[j]).find(".bindstatus");
            var var_Comment = $(ele[j]).find(".Treat_Plan_Comment");
            var var_radiobutton = $(ele[j]).find(".Radio_Plan");

            if ($(var_Status).val() == '1') {

                $(ele[j]).find('.notationcolorSeq').removeClass('color_orange color_green');
                $(ele[j]).find('.notationcolorAdvise').removeClass('color_orange color_green');
                $(ele[j]).find('.notationcolorddl').removeClass('color_orange color_green');
                $(ele[j]).find('.notationcolor').removeClass('color_orange color_green');
                $(ele[j]).find('.notationcolordate').removeClass('color_orange color_green');
                $(ele[j]).find('.Treat_Plan_Comment').removeClass('color_orange color_green');

                $(ele[j]).find(".notationcolorSeq").addClass('color_blue');
                $(ele[j]).find(".notationcolorAdvise").addClass('color_blue');
                $(ele[j]).find('.notationcolorddl').addClass('color_blue');
                $(ele[j]).find('.notationcolor').addClass('color_blue');
                $(ele[j]).find('.notationcolordate').addClass('color_blue');
                $(ele[j]).find('.Treat_Plan_Comment').addClass('color_blue');

                var_radiobutton.attr('disabled', true);
            }
            else if ($(var_Status).val() == '2') {

                $(ele[j]).find('.notationcolorSeq').removeClass('color_green color_blue');
                $(ele[j]).find('.notationcolorAdvise').removeClass('color_green color_blue');
                $(ele[j]).find('.notationcolorddl').removeClass('color_green color_blue');
                $(ele[j]).find('.notationcolor').removeClass('color_green color_blue');
                $(ele[j]).find('.notationcolordate').removeClass('color_green color_blue');
                $(ele[j]).find('.Treat_Plan_Comment').removeClass('color_green color_blue');

                $(ele[j]).find('.notationcolorSeq').addClass('color_orange');
                $(ele[j]).find('.notationcolorAdvise').addClass('color_orange');
                $(ele[j]).find('.notationcolorddl').addClass('color_orange');
                $(ele[j]).find('.notationcolor').addClass('color_orange');
                $(ele[j]).find('.notationcolordate').addClass('color_orange');
                $(ele[j]).find('.Treat_Plan_Comment').addClass('color_orange');
                var_radiobutton.attr('disabled', false);
            }
            else if ($(var_Status).val() == '3') {
                $(ele[j]).find('.notationcolorSeq').removeClass('color_orange color_blue');
                $(ele[j]).find('.notationcolorAdvise').removeClass('color_orange color_blue');
                $(ele[j]).find('.notationcolorddl').removeClass('color_orange color_blue');
                $(ele[j]).find('.notationcolor').removeClass('color_orange color_blue');
                $(ele[j]).find('.notationcolordate').removeClass('color_orange color_blue');
                $(ele[j]).find('.Treat_Plan_Comment').removeClass('color_orange color_blue');

                $(ele[j]).find('.notationcolorSeq').addClass('color_green');
                $(ele[j]).find('.notationcolorAdvise').addClass('color_green');
                $(ele[j]).find('.notationcolorddl').addClass('color_green');
                $(ele[j]).find('.notationcolor').addClass('color_green');
                $(ele[j]).find('.notationcolordate').addClass('color_green');
                $(ele[j]).find('.Treat_Plan_Comment').addClass('color_green');
                var_radiobutton.attr('disabled', false);
                var_radiobutton.attr('checked', false);
                var_Seq_No.attr('disabled', true);
                var_Advicedetail.attr('disabled', true);
                var_OperationSeq1.attr('disabled', true);
                var_OperationSeq2.attr('disabled', true);
                var_OperationSeq3.attr('disabled', true);
                var_OperationSeq4.attr('disabled', true);
                var_AdvisedDate.attr('disabled', true);
                var_Status.attr('disabled', true);
                var_Comment.attr('disabled', true);
               
            }
        }
    }

   