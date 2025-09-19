/*
*  Method Name - OpenDemographic_PopUp 
*  Created By  - Varsha Khandre
*  Created On  - 04 Sep 2017
*  Modified By - 
*  Modified On - 
*  Purpose     - This function is used to open demographic pop up.
*/

function OpenDemographic_PopUp() {
    Bind_Demographic_RegistrationDetails();
    $find("DemoPU").show();
}


/*
*  Method Name     -   Bind_Demographic_RegistrationDetails 
*  Created By      -   Varsha Khandre
*  Created On      -   04 Sep 2017
*  Modified By     - 
*  Modified On     - 
*  Purpose         -   this fuction show the patient registration details on demography popup.
*/

function Bind_Demographic_RegistrationDetails() {

    var values = document.getElementById('ContentPlaceHolder1_hdn_Gynec_Get_Details').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetViewRegistrationForDoctor_JS",
        type: "POST",
        data: {

            p_str_PatientId: value_medicine[0],
            p_str_ClinicId: value_medicine[1],
            p_str_DoctorId: value_medicine[2],
            p_str_VisitDate: value_medicine[3],
            p_str_VisitNum: value_medicine[4],
            p_str_ShiftId: value_medicine[5],
            p_int_Language_Id: value_medicine[6]
        },
        async: false,
        success: function (response) {

            var data = response;

            for (var i = 0; i < data.length; i++) {

                if (data[i].TABLE3 != null) {
                    $("#ContentPlaceHolder1_lblPatinetID_Demo").html(data[i].ID);
                    $("#ContentPlaceHolder1_lblFolder_Id_Demo").html(data[i].Folder_No);
                    $("#ContentPlaceHolder1_lbllastname_Demo").html(data[i].Last_Name);
                    $("#ContentPlaceHolder1_lblFirstName_Demo").html(data[i].First_Name);
                    $("#ContentPlaceHolder1_lblMiddleName_Demo").html(data[i].Middle_Name);

                    $("#ContentPlaceHolder1_lblDob_Demo").html(data[i].Date_Of_Birth_JS);
                    $("#ContentPlaceHolder1_lblAge_Demo").html(data[i].AgeYearsIntRound);
                    $("#ContentPlaceHolder1_lblGender_Demo").html(data[i].GENDER);
                    $("#ContentPlaceHolder1_lblAddress_Demo").html(data[i].Address_1);
                    $("#ContentPlaceHolder1_lblArea_Demo").html(data[i].Area_Name);
                    $("#ContentPlaceHolder1_lblCity_Demo").html(data[i].City_Name);

                    $("#ContentPlaceHolder1_lblState_Demo").html(data[i].State_Name);
                    $("#ContentPlaceHolder1_lblResid_No_Demo").html(data[i].Residential_No);
                    $("#ContentPlaceHolder1_lblMobile_Demo").html(data[i].Mobile_1);
                    $("#ContentPlaceHolder1_lblMarital_Status_Demo").html(data[i].Marital_Status_Description);
                    $("#ContentPlaceHolder1_lblOccupation_Demo").html(data[i].Occupation_Description);
                    //$("#ContentPlaceHolder1_lblReg_Date_Demo").html(data[i].Date_Of_Registration_JS);

                    $("#ContentPlaceHolder1_lblBloodGroup_Demo").html(data[i].BloodGroup_Description);
                    $("#ContentPlaceHolder1_lblHeight_Demo").html(data[i].Height_In_CMS);
                    $("#ContentPlaceHolder1_lblWeight_Demo").html(data[i].Weight_IN_KGS);
                    $("#ContentPlaceHolder1_lblPincode_demo").html(data[i].Pincode);
                    $("#ContentPlaceHolder1_lblEmail_Demo").html(data[i].Email_ID);
                    $("#ContentPlaceHolder1_lblEmergencyCont_Name_Demo").html(data[i].Emergency_Name);


                    $("#ContentPlaceHolder1_lblEmer_Cont_No_Demo").html(data[i].Emergency_Number);
                    $("#ContentPlaceHolder1_lblReferBy_Demo").html(data[i].REFER_BY);
                    $("#ContentPlaceHolder1_lblDoctorNAme_Demo").html(data[i].Refer_Doctor_Details);
                    $("#ContentPlaceHolder1_lblDoctor_Address_Demo").html(data[i].Doctor_Address);
                    $("#ContentPlaceHolder1_lblDoctor_Contact").html(data[i].Doctor_Mobile);
                    $("#ContentPlaceHolder1_lblDoctorEmail_Demo").html(data[i].Doctor_Email);
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
*  Method Name     -   Bind_Demographic_RegistrationDetails 
*  Created By      -   Varsha Khandre
*  Created On      -   04 Sep 2017
*  Modified By     - 
*  Modified On     - 
*  Purpose         -   this fuction show the patient registration details on demography popup.
*/

function Bind_Medical_Details() {

    var values = document.getElementById('ContentPlaceHolder1_hdn_Gynec_Get_Details').value;
    var value_medicine = values.split(',');

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/GetViewRegistrationForDoctor_JS",
        type: "POST",
        data: {

            p_str_PatientId: value_medicine[0],
            p_str_ClinicId: value_medicine[1],
            p_str_DoctorId: value_medicine[2],
            p_str_VisitDate: value_medicine[3],
            p_str_VisitNum: value_medicine[4],
            p_str_ShiftId: value_medicine[5],
            p_int_Language_Id: value_medicine[6]
        },
        async: false,
        success: function (response) {

            var data = response;

            for (var i = 0; i < data.length; i++) {

                if (data[i].TABLE1 != null) {

                    if (data[i].Hypertension == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Hypertension").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Hypertension").prop("checked", false);
                    }

                    if (data[i].Diabetes == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Diabetes").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Diabetes").prop("checked", false);
                    }

                    if (data[i].Cholestrol == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Cholesterol").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Cholesterol").prop("checked", false);
                    }

                    if (data[i].IHD == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_IHD").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_IHD").prop("checked", false);

                    }
                    if (data[i].Asthama == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Asthma").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Asthma").prop("checked", false);

                    }

                    if (data[i].TH == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_TH").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_TH").prop("checked", false);

                    }
                    if (data[i].Smoking == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Smoking").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Smoking").prop("checked", false);

                    }
                    if (data[i].Tobaco == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Tobacco").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Tobacco").prop("checked", false);

                    }
                    if (data[i].Alchohol == 1) {
                        $("#ContentPlaceHolder1_chk_Gynec_Alcohol").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chk_Gynec_Alcohol").prop("checked", false);

                    }
                    $("#ContentPlaceHolder1_txtAllergyArea_Gynec").val(data[i].Allergy_Dtls);
                    $("#ContentPlaceHolder1_txtPreviousSergery_Gynec").val(data[i].Past_Surgeries);
                    $("#ContentPlaceHolder1_txtHabits_Gynec").val(data[i].Addiction_Comment);

                    /*********************************Bind Chronic details on patient treatment screen***************************************/

                    $("#ContentPlaceHolder1_txtAllergyDetails").val(data[i].Allergy_Dtls);
                    $("#ContentPlaceHolder1_txtHabitDetails").val(data[i].Addiction_Comment);

                    if (data[i].Hypertension == 1) {
                        $("#ContentPlaceHolder1_chkHypertension").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkHypertension").prop("checked", false);
                    }

                    if (data[i].Diabetes == 1) {
                        $("#ContentPlaceHolder1_chkDiabetes").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkDiabetes").prop("checked", false);
                    }

                    if (data[i].Cholestrol == 1) {
                        $("#ContentPlaceHolder1_chkCholesterol").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkCholesterol").prop("checked", false);
                    }

                    if (data[i].IHD == 1) {
                        $("#ContentPlaceHolder1_chkIHD").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkIHD").prop("checked", false);

                    }
                    if (data[i].Asthama == 1) {
                        $("#ContentPlaceHolder1_chkAsthma").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkAsthma").prop("checked", false);

                    }

                    if (data[i].TH == 1) {
                        $("#ContentPlaceHolder1_chkTH").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkTH").prop("checked", false);

                    }
                    if (data[i].Smoking == 1) {
                        $("#ContentPlaceHolder1_chkSmoking").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkSmoking").prop("checked", false);

                    }
                    if (data[i].Tobaco == 1) {
                        $("#ContentPlaceHolder1_chkTobaco").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkTobaco").prop("checked", false);

                    }
                    if (data[i].Alchohol == 1) {
                        $("#ContentPlaceHolder1_chkAlchohol").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkAlchohol").prop("checked", false);

                    }
                    /*********************************Bind Chronic details on patient treatment screen***************************************/

                }
                if (data[i].TABLE2 != null) {
                    if (data[i].Hypertension == 1) {
                        $("#ContentPlaceHolder1_chkFamilyHypertension_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyHypertension_Gynec").prop("checked", false);
                    }

                    if (data[i].Diabetes == 1) {
                        $("#ContentPlaceHolder1_chkFamilyDiabetes_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyDiabetes_Gynec").prop("checked", false);

                    }

                    if (data[i].Cholestrol == 1) {
                        $("#ContentPlaceHolder1_chkFamilyCholesterol_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyCholesterol_Gynec").prop("checked", false);

                    }

                    if (data[i].IHD == 1) {
                        $("#ContentPlaceHolder1_chkFamilyIHD_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyIHD_Gynec").prop("checked", false);

                    }
                    if (data[i].Asthama == 1) {
                        $("#ContentPlaceHolder1_chkFamilyAsthma_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyAsthma_Gynec").prop("checked", false);

                    }

                    if (data[i].TH == 1) {
                        $("#ContentPlaceHolder1_chkFamilyTH_Gynec").prop("checked", true);
                    }
                    else {
                        $("#ContentPlaceHolder1_chkFamilyTH_Gynec").prop("checked", false);

                    }
                    $("#ContentPlaceHolder1_txtFamilyHistory_Gynec").val(data[i].Family_History);
                    $("#ContentPlaceHolder1_txtFamily_Chronic_DiseaseComments_Gynec").val(data[i].Chronic_DiseaseComments);
                    $("#ContentPlaceHolder1_txtsupportivetest_Gynec").val(data[i].Supportive_Tests);
                }
                if (data[i].TABLE4 != null) {
                    $("#ContentPlaceHolder1_txtFMP").val(data[i].FMP);
                    $("#ContentPlaceHolder1_txtPRMC").val(data[i].PRMC);
                    $("#ContentPlaceHolder1_txtPAMC").val(data[i].PAMC);
                    $("#ContentPlaceHolder1_txtLMP").val(data[i].LMP);
                    $("#ContentPlaceHolder1_txtObstetricsHistory").val(data[i].Obstetrics_History);
                    $("#ContentPlaceHolder1_txtsurgicalHistory").val(data[i].Surgical_History_Past_History);
                    $("#ContentPlaceHolder1_txtMenstrual_Additionalcomment").val(data[i].Additional_Comments);
                }

               
                if (data[i].TABLE1 != null) {
                   
                    if (data[5].TABLE5 == 1) {
                  
                        if (data[5].IS_Submit_Gynec_Details == 1) {

                            $("#ContentPlaceHolder1_txtCurrentDisease_Gynec").val(data[1].Other_Chronic_Disease);
                            $("#ContentPlaceHolder1_txtMedicines_Gynec").val(data[1].Past_Medication);

                            $("#ContentPlaceHolder1_txtCurrentComplaints").val(data[1].Other_Chronic_Disease);
                            $("#ContentPlaceHolder1_txtcurrentMedicines").val(data[1].Past_Medication);
                            
                        }
                        else if (data[5].Is_Submit_Patient_Visit_Details == 1) {
                            $("#ContentPlaceHolder1_txtCurrentDisease_Gynec").val(data[5].Current_Complaints);
                            $("#ContentPlaceHolder1_txtMedicines_Gynec").val(data[5].Current_Medicines);
                        }
                        else {
                            $("#ContentPlaceHolder1_txtCurrentDisease_Gynec").val("");
                            $("#ContentPlaceHolder1_txtMedicines_Gynec").val("");
                        }
                    }
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
 *  Method Name  -   Clear_Gynec_PopUp 
 *  Created By   -   Varsha Khandre
 *  Created On   -   08 Sep 2017
 *  Modified By  - 
 *  Modified On  - 
 *  Purpose      -   this function is used to clear registration details of patient on gynec popup.
 */

function Clear_Gynec_PopUp() {

    $("#ContentPlaceHolder1_chk_Gynec_Hypertension").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Diabetes").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Alcohol").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Tobacco").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Smoking").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_TH").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Asthma").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_IHD").prop("checked", false);
    $("#ContentPlaceHolder1_chk_Gynec_Cholesterol").prop("checked", false);

    $("#ContentPlaceHolder1_chkFamilyTH_Gynec").prop("checked", false);
    $("#ContentPlaceHolder1_chkFamilyAsthma_Gynec").prop("checked", false);
    $("#ContentPlaceHolder1_chkFamilyIHD_Gynec").prop("checked", false);
    $("#ContentPlaceHolder1_chkFamilyCholesterol_Gynec").prop("checked", false);
    $("#ContentPlaceHolder1_chkFamilyDiabetes_Gynec").prop("checked", false);
    $("#ContentPlaceHolder1_chkFamilyHypertension_Gynec").prop("checked", false);

    $("#ContentPlaceHolder1_txtAllergyArea_Gynec").val("");
    $("#ContentPlaceHolder1_txtPreviousSergery_Gynec").val("");
    $("#ContentPlaceHolder1_txtHabits_Gynec").val("");

    $("#ContentPlaceHolder1_txtFamilyHistory_Gynec").val("");
    $("#ContentPlaceHolder1_txtFamily_Chronic_DiseaseComments_Gynec").val("");
    $("#ContentPlaceHolder1_txtsupportivetest_Gynec").val("");

    $("#ContentPlaceHolder1_txtFMP").val("");
    $("#ContentPlaceHolder1_txtPRMC").val("");
    $("#ContentPlaceHolder1_txtPAMC").val("");
    $("#ContentPlaceHolder1_txtLMP").val("");
    $("#ContentPlaceHolder1_txtObstetricsHistory").val("");
    $("#ContentPlaceHolder1_txtsurgicalHistory").val("");
    $("#ContentPlaceHolder1_txtMenstrual_Additionalcomment").val("");

    $("#ContentPlaceHolder1_txtCurrentDisease_Gynec").val("");
    $("#ContentPlaceHolder1_txtMedicines_Gynec").val("");

    Bind_Medical_Details();
}

/*
*  Method Name  -   Save_Gynec_Details() 
*  Created By   -   Varsha Khandre
*  Created On   -   09 Sep 2017
*  Modified By  -   
*  Modified On  - 
*  Purpose      -   this function is used to save patient full registration details for gynec.
*/

function Save_Gynec_Details() {

    var values = document.getElementById('ContentPlaceHolder1_hdn_Gynec_Get_Details').value;
    var value_medicine = values.split(',');

    var chk_Gynec_Asthma = $("#ContentPlaceHolder1_chk_Gynec_Asthma").is(":checked");
    var chk_Gynec_Hypertension = $("#ContentPlaceHolder1_chk_Gynec_Hypertension").is(":checked");
    var chk_Gynec_Diabetes = $("#ContentPlaceHolder1_chk_Gynec_Diabetes").is(":checked");
    var chk_Gynec_Cholesterol = $("#ContentPlaceHolder1_chk_Gynec_Cholesterol").is(":checked");
    var chk_Gynec_IHD = $("#ContentPlaceHolder1_chk_Gynec_IHD").is(":checked");
    var chk_Gynec_TH = $("#ContentPlaceHolder1_chk_Gynec_TH").is(":checked");
    var chk_Gynec_Smoking = $("#ContentPlaceHolder1_chk_Gynec_Smoking").is(":checked");
    var chk_Gynec_Tobacco = $("#ContentPlaceHolder1_chk_Gynec_Tobacco").is(":checked");
    var chk_Gynec_Alcohol = $("#ContentPlaceHolder1_chk_Gynec_Alcohol").is(":checked");

    var txtPreviousSergery_Gynec = $("#ContentPlaceHolder1_txtPreviousSergery_Gynec").val();
    var txtAllergyArea_Gynec = $("#ContentPlaceHolder1_txtAllergyArea_Gynec").val();
    var txtMedicines_Gynec = $("#ContentPlaceHolder1_txtMedicines_Gynec").val();
    var txtHabits_Gynec = $("#ContentPlaceHolder1_txtHabits_Gynec").val();
    var txtCurrentDisease_Gynec = $("#ContentPlaceHolder1_txtCurrentDisease_Gynec").val();

    var chkFamilyAsthma_Gynec = $("#ContentPlaceHolder1_chkFamilyAsthma_Gynec").is(":checked");
    var chkFamilyHypertension_Gynec = $("#ContentPlaceHolder1_chkFamilyHypertension_Gynec").is(":checked");
    var chkFamilyDiabetes_Gynec = $("#ContentPlaceHolder1_chkFamilyDiabetes_Gynec").is(":checked");
    var chkFamilyCholesterol_Gynec = $("#ContentPlaceHolder1_chkFamilyCholesterol_Gynec").is(":checked");
    var chkFamilyIHD_Gynec = $("#ContentPlaceHolder1_chkFamilyIHD_Gynec").is(":checked");
    var chkFamilyTH_Gynec = $("#ContentPlaceHolder1_chkFamilyTH_Gynec").is(":checked");

    var txtFamily_Chronic_DiseaseComments_Gynec = $("#ContentPlaceHolder1_txtFamily_Chronic_DiseaseComments_Gynec").val();
    var txtFamilyHistory_Gynec = $("#ContentPlaceHolder1_txtFamilyHistory_Gynec").val();
    var txtsupportivetest_Gynec = $("#ContentPlaceHolder1_txtsupportivetest_Gynec").val();

    var txtFMP = $("#ContentPlaceHolder1_txtFMP").val();
    var txtPRMC = $("#ContentPlaceHolder1_txtPRMC").val();
    var txtPAMC = $("#ContentPlaceHolder1_txtPAMC").val();
    var txtLMP = $("#ContentPlaceHolder1_txtLMP").val();
    var txtObstetricsHistory = $("#ContentPlaceHolder1_txtObstetricsHistory").val();
    var txtsurgicalHistory = $("#ContentPlaceHolder1_txtsurgicalHistory").val();
    var txtMenstrual_Additionalcomment = $("#ContentPlaceHolder1_txtMenstrual_Additionalcomment").val();

    var hostName = window.location.host;

    $.ajax({
        url: "http://" + hostName + "/Services/CMSV2Services.asmx/Save_FullRegistrationDetails_For_Gynec",
        type: "POST",
        data: {

            p_str_Patient_Id: value_medicine[0],
            p_str_Doctor_Id: value_medicine[2],

            p_bool_Asthama: chk_Gynec_Asthma,
            p_bool_Hypertension: chk_Gynec_Hypertension,
            p_bool_Diabetes: chk_Gynec_Diabetes,
            p_bool_Cholestrol: chk_Gynec_Cholesterol,
            p_bool_IHD: chk_Gynec_IHD,
            p_bool_TH: chk_Gynec_TH,
            p_bool_Smoking: chk_Gynec_Smoking,
            p_bool_Tobaco: chk_Gynec_Tobacco,
            p_bool_Alchohol: chk_Gynec_Alcohol,

            p_str_Past_Surgeries: txtPreviousSergery_Gynec,
            p_str_Allergy_Dtls: txtAllergyArea_Gynec,
            p_str_Past_Medication: txtMedicines_Gynec,
            p_str_Chronic_DiseaseComments: '',
            p_str_Habits_Comments: txtHabits_Gynec,
            p_str_Other_Chronic_Disease: txtCurrentDisease_Gynec,

            p_bool_Family_Asthama: chkFamilyAsthma_Gynec,
            p_bool_Family_Hypertension: chkFamilyHypertension_Gynec,
            p_bool_Family_Diabetes: chkFamilyDiabetes_Gynec,
            p_bool_Family_Cholestrol: chkFamilyCholesterol_Gynec,
            p_bool_Family_IHD: chkFamilyIHD_Gynec,
            p_bool_Family_TH: chkFamilyTH_Gynec,

            p_str_Family_Chronic_DiseaseComments: txtFamily_Chronic_DiseaseComments_Gynec,
            p_str_Family_History: txtFamilyHistory_Gynec,
            p_str_UserId: value_medicine[7],
            p_str_AdditionalComment: '',
            p_str_AddictionComment: txtHabits_Gynec,
            p_str_FamilyAdditionalComment: txtFamily_Chronic_DiseaseComments_Gynec,

            p_str_SupportiveTests: txtsupportivetest_Gynec,
            p_str_FMP: txtFMP,
            p_str_PRMC: txtPRMC,
            p_str_PAMC: txtPAMC,
            p_str_LMP: txtLMP,
            p_str_ObstetricHistory: txtObstetricsHistory,

            p_str_SurgicalHistory: txtsurgicalHistory,
            p_str_Menstrual_Add_Comments: txtMenstrual_Additionalcomment,
            p_int_Visit_No: value_medicine[4]
        },
        async: false,
        success: function (response) {

            var data = response;

            $("#ContentPlaceHolder1_lblsuccessGynecPopUp").empty();
            $("#ContentPlaceHolder1_lblsuccessGynecPopUp").append(PATIENT_GYNEC_SUBMIT_POPUP);

            Bind_Medical_Details();

            $("#ContentPlaceHolder1_txtAllergyDetails").focus();

            var seconds = 2;
            setTimeout(function () {
                $find("ADGP").hide();
            }, seconds * 1000);



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
*  Method Name  -   btnCloseDemography_Click 
*  Created By   -   Varsha Khandre
*  Created On   -   09 Sep 2017
*  Modified By  - 
*  Modified On  - 
*  Purpose      -   this close button function close the demography popup.
*/

function Close_Demography_Popup() {
    $find("DemoPU").hide();
}