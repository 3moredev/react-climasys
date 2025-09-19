

function CurrentDateShowing(e) {
    if (!e.get_selectedDate() || !e.get_element().value) {
        e._selectedDate = (new Date()).getDateOnly();
    }
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
}


function SelectDateFollwup() {
    var dt_followupDate = document.getElementById("ContentPlaceHolder1_txtDateOFRebook").value;
    debugger
    
    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                       "Oct", "Nov", "Dec");


    debugger;   
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;



        var followupDate = parseDMY(dt_followupDate);
        var todaysdate = parseDMY(currentDate);

        if (followupDate < todaysdate) {

            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(PAST_DATE_Follow);
            $("#ContentPlaceHolder1_txtDateOFAdmission").addClass('adj_treatplan_errorborder');
            $("html, body").animate({
                scrollTop: 0
            }, 600);
            return false;
        }

}



function SelectDate() {
    debugger;
    $("#ContentPlaceHolder1_txtDateOFAdmission").removeClass('adj_treatplan_errorborder');
    $("#ContentPlaceHolder1_txtDateOfDischarge").removeClass('adj_treatplan_errorborder');
    $("#ContentPlaceHolder1_txtOperationStartDate").removeClass('adj_treatplan_errorborder');

    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    $("#ContentPlaceHolder1_lblsuccessmsg").empty();
    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();

    var dt_AdmissionDate = document.getElementById("ContentPlaceHolder1_txtDateOFAdmission").value;
    var dt_Dischargedate = document.getElementById("ContentPlaceHolder1_txtDateOfDischarge").value;
    var dt_OperationStartDate = document.getElementById("ContentPlaceHolder1_txtOperationStartDate").value;
    var dt_OperationEndDate = document.getElementById("ContentPlaceHolder1_txtOperationEndDate").value;
    var dt_AdvanceDate = document.getElementById("ContentPlaceHolder1_txtLastAdvanceDate").value;

   

    



    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");

    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2);

    if ((dt_AdmissionDate != "") || (dt_Dischargedate != "")) {
        var d = new Date();
        var curr_date = d.getDate();
        var curr_month = d.getMonth();
        var curr_year = d.getFullYear();
        currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;


        var todaysdate = parseDMY(currentDate);

        var admissiondate = parseDMY(dt_AdmissionDate);

        var dischargeDate = parseDMY(dt_Dischargedate);

        var OperationStartDate = parseDMY(dt_OperationStartDate);

        var OperationEndDate = parseDMY(dt_OperationEndDate);

        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + 2);

        //    var currentDatepre = parseDMY(currentDate);

        if (dt_Dischargedate < dt_AdvanceDate) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append("Please select Discharge Date greater than Advance Date");
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
            return false;
        }

        if (admissiondate > todaysdate) {

            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
            $("#ContentPlaceHolder1_txtDateOFAdmission").addClass('adj_treatplan_errorborder');
            return false;
        }




        if (dischargeDate > currentDate && dischargeDate > todaysdate) {

            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
            $("#ContentPlaceHolder1_txtDateOfDischarge").addClass('adj_treatplan_errorborder');
            return false;
        }


        if (admissiondate > dischargeDate) {

            $("#ContentPlaceHolder1_lblsuccessmsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_ADMISSION_DATE);
            return false;
        }
        if (OperationStartDate > todaysdate) {

            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
            $("#ContentPlaceHolder1_txtOperationStartDate").addClass('adj_treatplan_errorborder');
            return false;
        }
        if (OperationEndDate > todaysdate) {

            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
            $("#ContentPlaceHolder1_txtOperationEndDate").addClass('adj_treatplan_errorborder');
            return false;
        }


        $("#ContentPlaceHolder1_txtDateOFAdmission").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_txtDateOfDischarge").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_txtOperationStartDate").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_txtOperationEndDate").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
        $("#ContentPlaceHolder1_lblsuccessmsg").empty();
    }
    else {
        return false;
    }
   
}

function ResetErrorMessage() {
    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    $("#ContentPlaceHolder1_lblappointmentsuccess").empty();
    $("#ContentPlaceHolder1_lblErrorDateMsg").empty();
    $("#ContentPlaceHolder1_lblErrorMsgInvoice").empty();
    $("#ContentPlaceHolder1_lblsuccessmsg").empty();
    $("#ContentPlaceHolder1_lbl_Pat_Reg_ErrorMsg").empty();
    $("#ContentPlaceHolder1_lbl_Pat_Reg_successmsg").empty();
}



function parseDMY(s) {
    return new Date(s.replace(/^(\d+)\W+(\w+)\W+/, '$2 $1 '));
}











function validatedate(value) {

    var dt_AdmissionDate = document.getElementById("ContentPlaceHolder1_txtDateOFAdmission").value;
    var dt_Dischargedate = document.getElementById("ContentPlaceHolder1_txtDateOfDischarge").value;

    ResetErrorMessage();

    var rxDatePattern = /^(\d{1,2})(\-)([a-zA-Z]{3})(\-)(\d{4})$/;
    var dtArray = dt_AdmissionDate.match(rxDatePattern); // is format OK?


    var dtDay = parseInt(dtArray[1]);
    var dtMonth = dtArray[3];
    var dtYear = parseInt(dtArray[5]);

    switch (dtMonth.toLowerCase()) {
        case 'jan':
            dtMonth = '01';
            break;
        case 'feb':
            dtMonth = '02';
            break;
        case 'mar':
            dtMonth = '03';
            break;
        case 'apr':
            dtMonth = '04';
            break;
        case 'may':
            dtMonth = '05';
            break;
        case 'jun':
            dtMonth = '06';
            break;
        case 'jul':
            dtMonth = '07';
            break;
        case 'aug':
            dtMonth = '08';
            break;
        case 'sep':
            dtMonth = '09';
            break;
        case 'oct':
            dtMonth = '10';
            break;
        case 'nov':
            dtMonth = '11';
            break;
        case 'dec':
            dtMonth = '12';
            break;
    }

    // convert date to number
    dtMonth = parseInt(dtMonth);
    var today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
    var currentDate = today;



    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");

    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;



    var date1 = parseDMY(currentDate);

    var date2 = parseDMY(dt_AdmissionDate);

    var todate = parseDMY(dt_Dischargedate);

    if (isNaN(dtMonth)) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        return false;
    }
    else if (dtMonth < 1 || dtMonth > 12) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        return false;
    }
    else if (dtDay < 1 || dtDay > 31) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        return false;
    }
    else if ((dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) && dtDay == 31) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        return false;
    }
    else if (dtMonth == 2) {
        var isleap = (dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0));
        if (dtDay > 29 || (dtDay == 29 && !isleap)) {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();
            $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
            return false;
        }
    }
    else {

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    }
}



function validdate() {
    var dt_AdmissionDate = document.getElementById("ContentPlaceHolder1_txtDateOFAdmission").value;


    document.getElementById("ContentPlaceHolder1_txtDateOfDischarge").value = dt_AdmissionDate;

}

function validdate1() {
    var dt_OperationStartdate = document.getElementById("ContentPlaceHolder1_txtOperationStartDate").value;
    document.getElementById("ContentPlaceHolder1_txtOperationEndDate").value = dt_OperationStartdate;

}



function validateform() {
    debugger;
    var rxDatePattern = /^(\d{1,2})(\-)([a-zA-Z]{3})(\-)(\d{4})$/

    var dt_AdmissionDate = document.getElementById("ContentPlaceHolder1_txtDateOFAdmission").value;
    var dt_Dischargedate = document.getElementById("ContentPlaceHolder1_txtDateOfDischarge").value;

    var dt_AdmissionTime_Hours = $("#ContentPlaceHolder1_ddlAdmissionHours option:selected").text();
    var dt_AdmissionTime_Min = $("#ContentPlaceHolder1_ddlAdmissionMinutes option:selected").text();

    var dt_DischargeTime_Hours = $("#ContentPlaceHolder1_ddlDischargeHours option:selected").text();
    var dt_DischargeTime_Min = $("#ContentPlaceHolder1_ddlDischargeMinutes option:selected").text();

    var hdn_Reg_Date = document.getElementById('ContentPlaceHolder1_hdn_RegistrationDate').value;

    var dt_LastAdvanceDate = document.getElementById("ContentPlaceHolder1_txtLastAdvanceDate").value;

    var dt_OperationStartDate = document.getElementById("ContentPlaceHolder1_txtOperationStartDate").value;
    var dt_OperationEndDate = document.getElementById("ContentPlaceHolder1_txtOperationEndDate").value;


    //    var dt_AdmissionTime = document.getElementById("ContentPlaceHolder1_txtadmissiontime").value;
    //    var dt_DischargeTime = document.getElementById("ContentPlaceHolder1_txtDischargetime").value;
    var IPD_number = document.getElementById("ContentPlaceHolder1_txtIPDNo").value;
    var var_keyword = document.getElementById("ContentPlaceHolder1_ddlKeyword").value;
    var var_diagnosis = document.getElementById("ContentPlaceHolder1_txtdiagnosis").value;
    var var_complaints = document.getElementById("ContentPlaceHolder1_txtcomplaints").value;
    var var_history = document.getElementById("ContentPlaceHolder1_txthistory").value;
    var var_investigation = document.getElementById("ContentPlaceHolder1_txtinvestigation").value;
    var var_OE = document.getElementById("ContentPlaceHolder1_txtOE").value;
    var var_SE = document.getElementById("ContentPlaceHolder1_txtSE").value;
    var var_Procedure = document.getElementById("ContentPlaceHolder1_txtProcedure").value;
    var var_Treatment = document.getElementById("ContentPlaceHolder1_txttreatment").value;
    var var_Discharge = document.getElementById("ContentPlaceHolder1_txtdischarge").value;
    var var_Instruction = document.getElementById("ContentPlaceHolder1_txtInstructions").value;

    //    var var_ddlOperation_Start_Time_Hours =$("#ContentPlaceHolder1_ddlOperation_Start_Time_Hours option:selected").text();
    //    var var_ddlOperation_End_Time_Hours =$("#ContentPlaceHolder1_ddlOperation_End_Time_Hours option:selected").text();


    var dt_OperationStartTime_Hours = $("#ContentPlaceHolder1_ddlOperation_Start_Time_Hours option:selected").text();
    var dt_OperationStartTime_Min = $("#ContentPlaceHolder1_ddlOperation_Start_Time_Minutes option:selected").text();

    var dt_OperationEndTime_Hours = $("#ContentPlaceHolder1_ddlOperation_End_Time_Hours option:selected").text();
    var dt_OperationEndTime_Min = $("#ContentPlaceHolder1_ddlOperation_End_Time_Minutes option:selected").text();

    /******************************************************/
    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");


    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;


    var todaysdate = parseDMY(currentDate);

    var admissiondate = parseDMY(dt_AdmissionDate);

    var dischargeDate = parseDMY(dt_Dischargedate);

    var hdn_RegistrationDate = parseDMY(hdn_Reg_Date);

    var OperationStart_Date = parseDMY(dt_OperationStartDate);

    var OperationEnd_Date = parseDMY(dt_OperationEndDate);

    /******************************************************/
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 2);

    var time_rejex = /^(10|11|12|01|02|03|04|05|06|07|08|09|[1-9]):[0-5][0-9]$/;

   

    if (dt_AdmissionDate == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_ADMISSION_DATE);
        return false;

    }
   
    
    else if (dt_AdmissionDate != "" && !dt_AdmissionDate.match(rxDatePattern)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        $("#ContentPlaceHolder1_txtDateOFAdmission").addClass('adj_treatplan_errorborder');
        return false;
    }
    else if (admissiondate > todaysdate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
        $("#ContentPlaceHolder1_txtDateOFAdmission").addClass('adj_treatplan_errorborder');
        return false;
    }
    //    else if (admissiondate < hdn_RegistrationDate) {

    //        $("html, body").animate({
    //            scrollTop: 0
    //        }, 600);
    //        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    //        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_ADMISSION_DATE_REGDATE);
    //        //$("#ContentPlaceHolder1_txtDateOFAdmission").addClass('adj_treatplan_errorborder');
    //        return false;
    //    }
    else if (dt_AdmissionTime_Hours == "HH") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_ADMISSION_TIME);

        return false;

    }
    else if (dt_AdmissionTime_Min == "MM") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_ADMISSION_TIME);

        return false;

    }

    else if (dt_Dischargedate == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_DISCHARGE_DATE);
        return false;

    }
    else if (dt_Dischargedate != "" && !dt_Dischargedate.match(rxDatePattern)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        $("#ContentPlaceHolder1_txtDateOfDischarge").addClass('adj_treatplan_errorborder');
        return false;
    }
    //        else if (dischargeDate > todaysdate) {

    //            $("html, body").animate({
    //                scrollTop: 0
    //            }, 600);
    //            $("#ContentPlaceHolder1_lblErrorMsg").empty();
    //            $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
    //            $("#ContentPlaceHolder1_txtDateOfDischarge").addClass('adj_treatplan_errorborder');
    //            return false;
    //        }

    else if (dischargeDate > currentDate && dischargeDate > todaysdate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
        $("#ContentPlaceHolder1_txtDateOfDischarge").addClass('adj_treatplan_errorborder');
        return false;
    }

    else if (admissiondate > dischargeDate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_ADMISSION_DATE);
        return false;
    }
    else if (dt_DischargeTime_Hours == 'HH') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_DISCHARGE_TIME);
        return false;

    }
    else if (dt_DischargeTime_Min == 'MM') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_DISCHARGE_TIME);
        return false;

    }
    else if (dt_OperationStartDate != "" && !dt_OperationStartDate.match(rxDatePattern)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        $("#ContentPlaceHolder1_txtOperationStartDate").addClass('adj_treatplan_errorborder');
        return false;
    }
    else if (dt_OperationStartDate != "" && OperationStart_Date > todaysdate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
        $("#ContentPlaceHolder1_txtOperationStartDate").addClass('adj_treatplan_errorborder');
        return false;
    }
    else if (dt_OperationStartDate != "" && dt_OperationStartTime_Hours == "HH") {


        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPEARTION_START_TIME);

        return false;

    }
    else if (dt_OperationStartDate != "" && dt_OperationStartTime_Min == "MM") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPEARTION_START_TIME);

        return false;

    }
    else if (dt_OperationStartDate != "" && dt_OperationEndDate == "") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPERATION_END_DATE);

        return false;

    }
    else if (dt_OperationEndDate != "" && dt_OperationStartDate == "") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPERATION_START_DATE);

        return false;

    }
    else if (dt_OperationEndDate != "" && !dt_OperationEndDate.match(rxDatePattern)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
        $("#ContentPlaceHolder1_txtOperationEndDate").addClass('adj_treatplan_errorborder');
        return false;
    }
    else if (dt_OperationEndDate != "" && OperationEnd_Date > todaysdate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(FUTURE_DATE);
        $("#ContentPlaceHolder1_txtOperationEndDate").addClass('adj_treatplan_errorborder');
        return false;
    }
    else if (dt_OperationEndDate != "" && dt_OperationEndTime_Hours == "HH") {


        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPERATION_END_TIME);

        return false;

    }
    else if (dt_OperationEndDate != "" && dt_OperationEndTime_Min == "MM") {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_OPERATION_END_TIME);

        return false;

    }
    else if (OperationStart_Date > OperationEnd_Date) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_OPERATION_DATE);
        return false;
    }
    else if (dt_OperationStartDate != "" && (OperationStart_Date < admissiondate || OperationStart_Date > dischargeDate)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_OPERATION_DATE_BET);
        return false;
    }
    else if (dt_OperationEndDate != "" && (OperationEnd_Date < admissiondate || OperationEnd_Date > dischargeDate)) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_OPERATION_DATE_BET);
        return false;
    }

    else if (IPD_number == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_IPD);
        return false;

    }

    else if (dt_LastAdvanceDate != "") {


        var Con_dt_DischargeDate = parseDMY(dt_Dischargedate);
        var Dis_date = Con_dt_DischargeDate.getDate();
        var Dis_month = Con_dt_DischargeDate.getMonth();
        var Dis_year = Con_dt_DischargeDate.getFullYear();
        var New_dt_DischargeDate1 = Dis_date + "-" + m_names[Dis_month] + "-" + Dis_year;

        var New_dt_DischargeDate = parseDMY(New_dt_DischargeDate1);

        var Con_dt_LastAdvanceDate = parseDMY(dt_LastAdvanceDate);
        var Avd_date = Con_dt_LastAdvanceDate.getDate();
        var Avd_month = Con_dt_LastAdvanceDate.getMonth();
        var Avd_year = Con_dt_LastAdvanceDate.getFullYear();
        var New_dt_LastAdvanceDate1 = Avd_date + "-" + m_names[Avd_month] + "-" + Avd_year;

        var New_dt_LastAdvanceDate = parseDMY(New_dt_LastAdvanceDate1);

         if (New_dt_DischargeDate < New_dt_LastAdvanceDate) {

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append("Please select Discharge Date greater than Last Advance Date");
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        return false
    }
        
    }



    else {
      //  var a = validate_Confirm_DischargeForm();


        $("#ContentPlaceHolder1_txtDateOFAdmission").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_txtDateOfDischarge").removeClass('adj_treatplan_errorborder');
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblsuccessmsg").empty();

      //  return a;
    }

    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");

    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;


    var date1 = parseDMY(currentDate);

//    var fromdate = parseDMY(dt_currVal_Fromdate);

//    var todate = parseDMY(dt_currVal_Todate);

//    //alert(date1 + fromdate + todate);

//    if (fromdate > date1) {

//        $("#ContentPlaceHolder1_lblErrorMsg").empty();
//        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
//        return false;
//    }
//    else if (todate > date1) {

//        $("#ContentPlaceHolder1_lblErrorMsg").empty();
//        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
//        return false;
//    }
//    else if (fromdate > todate) {

//        $("#ContentPlaceHolder1_lblErrorMsg").empty();
//        $("#ContentPlaceHolder1_lblErrorMsg").append(FR_DOB_PAT);
//        return false;
//    }
//    // else if()

//    else {
//        $("#ContentPlaceHolder1_lblErrorMsg").empty();
//        $("#ContentPlaceHolder1_lblErrorDateMsg").empty();


//        return true;
//    }
}

function ClientItemSelectedSearchPatient(sender, e) {

    $get("<%=txtsearchpatient.ClientID %>").value = e.get_value();
}

function ClientItemSelectedSearchPatientInvoice(sender, e) {

    $get("<%=txtsearchpatientInvoice.ClientID %>").value = e.get_value();
}


function ClientItemSelectedSearchPatientBill(sender, e) {

    $get("<%=txtsearchpatientBill.ClientID %>").value = e.get_value();
}

function ClientItemSelectedSearchPrintDischarge(sender, e) {

    $get("<%=txtsearchpatientPrintDischarge.ClientID %>").value = e.get_value();
}




function isNumberKeyOnlyWeight(event) {

    var numbersAndWhiteSpace = /[.0-9 ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsgInvoice").empty();

        return true;
    }
    else {

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsgInvoice").empty();
        //$("#ContentPlaceHolder1_lblErrorMsg").append(FR_NUM);
        return false;
    }
}

function isNumberTime(event) {

    var numbersAndWhiteSpace = /[:0-9 ]/g;
    var key = String.fromCharCode(event.which);

    if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();

        return true;
    }
    else {

        $("#ContentPlaceHolder1_lblErrorMsg").empty();

        //$("#ContentPlaceHolder1_lblErrorMsg").append(FR_NUM);
        return false;
    }
}

/*
*  Method Name - bindattachment 
*  Created By  - Varsha Khandre
*  Created On  - 25 May 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to check file upload count
*/

function bindattachment(bool) {

    $("#ContentPlaceHolder1_lblErrorMsg").empty();
    var allowedFiles = [".jpeg", ".pdf", ".png", ".jpg", ".docx", ".xlsx", ".xls", ".doc"];
    var fileUpload = $("#ContentPlaceHolder1_FU_AttachDocument").get(0);
    var array = ['jpg', 'jpeg', 'pdf', 'png', 'docx', 'xlsx', 'xls', 'doc'];
    var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");
    var flag = true;
    var var_FilePath = $(fileUpload).val();

    if (var_FilePath.length == 0) {
        return true;
    }
    else {

        if ((fileUpload.files.length > 3) && ((fileUpload.files.length != 0))) {

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

                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_ATTACHMENT);
                flag = false;
            }

        }
        if (flag == false) {
            $(fileUpload).val('');
            return false;
        }

    }

}


function validatePatientProfileForm() {

    var str_confirm = confirm('Do you want to submit?');
    if (str_confirm == true) {

        return true;
    }
    else {

        return false;
    }

}

function validateform_Invoice() {

    var rxDatePattern = /^(\d{1,2})(\-)([a-zA-Z]{3})(\-)(\d{4})$/

    var dt_TotalAmount = document.getElementById("ContentPlaceHolder1_txtTotalAmount").value;
    var dt_Discount = document.getElementById("ContentPlaceHolder1_txtDiscount").value;
    var dt_NetAmount = document.getElementById("ContentPlaceHolder1_txtNetAmount").value;
    var dt_Collection = document.getElementById("ContentPlaceHolder1_txtCollectedAmount").value;
    var dt_Balance = document.getElementById("ContentPlaceHolder1_txtBalance").value;


    if (dt_TotalAmount == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_TotalAmount);
        return false;

    }
    else if ((dt_Discount != '') && (parseFloat(dt_Discount) > parseFloat(dt_TotalAmount))) {
        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_DISCOUNT);
        return false;

    }
    //    else if (dt_Discount=='') {

    //        $("html, body").animate({
    //            scrollTop: 0
    //        }, 600);
    //        $("#ContentPlaceHolder1_lblErrorMsg").empty();
    //        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_DISCOUNT);
    //        return false;
    //    }
    else if (dt_NetAmount == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_NETAMOUNT);
        //$("#ContentPlaceHolder1_txtadmissiontime").addClass('adj_treatplan_errorborder');

        return false;

    }

    else if (dt_Collection == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_COLLECTED);
        return false;

    }
    else if ((dt_Collection != '') && (parseFloat(dt_Collection) > parseFloat(dt_TotalAmount))) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_COLLECTION);
        return false;

    }
    else if ((dt_Collection != '') && (parseFloat(dt_Collection) > parseFloat(dt_NetAmount))) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(INVALID_COLLECTION_NET);
        return false;

    }

    else if (dt_Balance == '') {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(EMPTY_BALANCE);
        //$("#ContentPlaceHolder1_txtDischargetime").addClass('adj_treatplan_errorborder');
        return false;

    }

    else {
        var a = validatePatientProfileForm();

        $("#ContentPlaceHolder1_lblErrorMsg").empty();

        return a;
    }

}


function CheckCharacterMedicine(textBox, maxLength) {

    if (textBox.value.length > maxLength) {
        textBox.value = textBox.value.substr(0, maxLength);
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();

    }
}


function isNumberKeyForFeesToCollect(event) {

    //var numbersAndWhiteSpace = /^\d*\.?\d*$/;
    var numbersAndWhiteSpace = /[.0-9 ]/g;
    var key = String.fromCharCode(event.which || event.keyCode);
    var charCode = (event.keyCode ? event.keyCode : event.which);


    if (charCode == 9 || charCode == 13 || charCode == 8 || charCode == 37 || charCode == 39 || numbersAndWhiteSpace.test(key)) {
        if (charCode == 8) { return true; }
        if (charCode == 9) { return true; }
        if (charCode == 32) { return true; }

        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        return true;
    }



    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        return false;
    }
}


function validateFloatKeyPress(el, evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode;
    var number = el.value.split('.');
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    //just one dot
    if (number.length > 1 && charCode == 46) {
        return false;
    }
    //get the carat position
    var caratPos = getSelectionStart(el);
    var dotPos = el.value.indexOf(".");
    if (caratPos > dotPos && dotPos > -1 && (number[1].length > 1)) {
        return false;
    }
    return true;
}




function validatePrint() {
    debugger;
    $("#ContentPlaceHolder1_lblsuccessmsg").empty();

    var dt_Dischargedate = document.getElementById("ContentPlaceHolder1_txtDateOfDischarge").value;
    var dischargeDate = parseDMY(dt_Dischargedate);

    var m_names = new Array("Jan", "Feb", "Mar",
                                            "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                                            "Oct", "Nov", "Dec");


    var d = new Date();
    var curr_date = d.getDate();
    var curr_month = d.getMonth();
    var curr_year = d.getFullYear();
    currentDate = curr_date + "-" + m_names[curr_month] + "-" + curr_year;


    var todaysdate = parseDMY(currentDate);


    if (dischargeDate > todaysdate) {

        $("html, body").animate({
            scrollTop: 0
        }, 600);
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorMsg").append(PRINT_ERROR);
        $("#ContentPlaceHolder1_txtDateOfDischarge").addClass('adj_treatplan_errorborder');
        return false;
    }
    else {
        $("#ContentPlaceHolder1_lblErrorMsg").empty();
        $("#ContentPlaceHolder1_lblErrorDateMsg").empty();


        return true;
    }
}