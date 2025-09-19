$(window).load(function () {
    GetFamilyFolders();
   
});





function GetFamilyFolders() {
    var hostName = window.location.host;

    var var_url = "http://localhost:64824/Services/CMSV2Services.asmx/SearchAllFolderName";
    //alert(var_url);
    var htmlstr = '';
    $.ajax({
        type: 'POST',

        url: var_url,
        async: false,
        success: function (response) {
            var data = response;
            //alert(data.length)
            for (var i = 0; i < data.length; i++) {
                //alert(data[i].Folder_No);
                htmlstr += '<option data-toggle="tooltip" title="' + data[i].Folder_No + '" id="' + data[i].Folder_No + '" value="' + data[i].Folder_No + '" >' + data[i].Folder_No + '</option>';
                // alert(htmlstr);

            }
            $('#ddlSample').append(htmlstr);
            $(".chosen").chosen();

        }

    });
}




function GetFamilyFoldersDetails(id) {
    var hostName = window.location.host;
    //alert(id);
    var var_url = "http://localhost:64824/Services/CMSV2Services.asmx/get_folder_details";
   
    var htmlstr = '';
    $.ajax({
        type: 'GET',
        data: {
            str_folder_no: id,
            p_int_LanguageId: '1'
        },
        url: var_url,
        async: false,
        success: function (response) {
            var data = response;
            htmlstr += "<table border=1 class='familydetl'><tr><td>Name</td><td>Mobile</td><td>Age</td><td>Gender</td><td>Area</td>";
            for (var i = 0; i < data.length; i++) {

                // htmlstr += data[i].Name + '"  "' + data[i].Mobile_1 + '"  "' + data[i].Age_Given + '"  "' + data[i].Gender_Description + '"  "' + data[i].Area_Name;

                htmlstr += '<tr><td>' + data[i].Name + '</td><td>' + data[i].Mobile_1 + '</td><td>' + data[i].Age_Given + '</td><td>' + data[i].Gender_Description + '</td><td>' + data[i].Area_Name + '</td></tr>';

                $(".chosen").chosen();
            }
            htmlstr += "</table>";
            $("#lbldisplaydetails").html(htmlstr);
            

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


function GetPatientLastFiveBPDetails() {

    var values = document.getElementById('ContentPlaceHolder1_hdn_BP_values').value;

    var value_duplicate = values.split(',');

    var hostName = window.location.host;
    var var_url = "http://" + hostName + "/Services/CMSV2Services.asmx/Get_PatientLastFiveBPDetails";


    var htmlstr = '';
    $.ajax({
        type: 'POST',
        data: {
            p_str_Patient_Id: value_duplicate[0],
            p_str_Doctor_Id: value_duplicate[1],
            p_str_Clinic_Id: value_duplicate[2],
            p_int_shift_id: value_duplicate[3]
        },
        url: var_url,
        dataType: 'json',
        success: function (response) {
            var data = response;

            for (var i = 0; i < data.length; i++) {

                htmlstr += '<option id="' + i + '" value="' + i + '" >' + data[i].LastFiveBpValues + '</option>';
            }
            $('#ddlSample').append(htmlstr);
            alert(htmlstr);
            $("#ddlSample").chosen({ max_selected_options: 5 });

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