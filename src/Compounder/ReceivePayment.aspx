<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage/CMS.Master" AutoEventWireup="true"
    CodeBehind="ReceivePayment.aspx.cs" Inherits="ClinicManagementSystem.Compounder.ReceivePayment" %>

<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc1" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc2" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc6" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <script src="../script/jquery-1.10.2.min.js" type="text/javascript"></script>
    <link href="../css/waitMe.css" rel="stylesheet" type="text/css" />
    <link href="../styles/waitMe.min.css" rel="stylesheet" type="text/css" />
    <script src="../script/waitMe.min.js" type="text/javascript"></script>
    <script src="../script/waitMe.js" type="text/javascript"></script>
     <%-- <script src="../script/js/bootstrap-multiselect-collapsible-groups.js" type="text/javascript"></script>
    <script src="../script/js/bootstrap-multiselect.js" type="text/javascript"></script>
    <link href="../css/bootstrap-multiselect.css" rel="stylesheet" type="text/css" />--%>
     <script src="../script/jquery.multiselect.js" type="text/javascript"></script>
    <script src="../script/jquery.actual.js" type="text/javascript"></script>
    <script src="../script/jquery.actual.min.js" type="text/javascript"></script>
    <link href="../css/jquery.multiselect.css" rel="stylesheet" type="text/css" />
        <style type="text/css">
             .initialhide
        {
        	display:none;
        }
        .Calendar
        {
            padding: 0;
            background: white;
            border: 1px solid #646464;
        }
        .NoDisplay
        {
            display: none;
        }
        .Calendar .ajax__calendar_footer
        {
            display: none;
        }
        .Calendar .ajax__calendar_active
        {
            color: #E51736;
            font-weight: bold;
            background-color: #ddd;
            border: 2px solid grey;
            font-size: 12px;
        }
        .Background
        {
            background-color: Black;
            filter: alpha(opacity=90);
            opacity: 0.8;
        }
        .Popup
        {
            width: 800px;
            height: 600px;
        }
        .lbl
        {
            font-size: 16px;
            font-style: italic;
            font-weight: bold;
        }
        iframe
        {
            width: 800px;
            height: 5000px;
        }
        /*.modal-lg
        {
            width: 800px;
            margin-left: -215px;
            overflow-y: scroll;
            max-height: 85%;
        }*/
        .txtamountadj
        {
            padding-left:2.5%;
            padding-right:17px;
        }
        .lblinstructionadj
        {
            float: left;
             margin-left: -7px !important;
        }
        @media (min-width: 768px)
        {
            /*.modal-dialog
            {
                width: 600px;
                margin: 85px auto;
            }*/
            .compounder-modal-dialog-adjs
            {
                max-height:90% !important;
            }
            .lbl-meddet-adj
            {
                margin-left:8px;
            }
            .lbl-pervisdetail-adj
            {
                margin-right: -60px;
            }
            .txtinstruction
            {
                margin-left: 37px;
            }
        }
        /*******30 March*******/
        @media only screen and (min-width: 241px) and (max-width: 319px)
        {
            iframe
            {
                width: 240px;
                height: 700px;
            }
            .Popup
            {
                width: 240px;
                height: 700px;
            }
            /*.modal-dialog
            {
                width: 240px;
                margin: 10px auto;
            }*/
            table td span
            {
                font-size: 11px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 240px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
            .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 320px) and (max-width: 360px)
        {
            iframe
            {
                width: 320px;
                height: 700px;
            }
            .Popup
            {
                width: 320px;
                height: 700px;
            }
            /*.modal-dialog
            {
                width: 300px;
                margin: 10px auto;
            }*/
            table td span
            {
                font-size: 12px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 320px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
             .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 361px) and (max-width: 400px)
        {
            iframe
            {
                width: 360px;
                height: 700px;
            }
            .Popup
            {
                width: 360px;
                height: 700px;
            }
            /*.modal-dialog
            {
                width: 350px;
                margin: 10px auto;
            }*/
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 360px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
             .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 401px) and (max-width: 480px)
        {
            iframe
            {
                width: 400px;
                height: 700px;
            }
            .Popup
            {
                width: 400px;
                height: 700px;
            }
            .modal-dialog
            {
                width: 380px;
                margin: 10px auto;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 400px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
            .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 481px) and (max-width: 600px)
        {
            .Popup
            {
                width: 480px;
                height: 700px;
            }
            iframe
            {
                width: 480px;
                height: 700px;
            }
            .modal-dialog
            {
                width: 440px;
                margin: 10px auto;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 480px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
            .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 601px) and (max-width: 700px)
        {
            iframe
            {
                width: 600px;
                height: 700px;
            }
            .Popup
            {
                width: 600px;
                height: 700px;
            }
            .modal-dialog
            {
                width: 550px;
                margin: 10px auto;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 600px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
             .btn-adj 
            {
                float: left;
            }
            .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 701px) and (max-width: 767px)
        {
            iframe
            {
                width: 700px;
                height: 700px;
            }
            .Popup
            {
                width: 700px;
                height: 700px;
            }
            .modal-dialog
            {
                width: 600px;
                margin: 10px auto;
            }
            table td span
            {
                font-size: 14px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 700px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
            }
            .PVpopup
            {
                margin-left:0px !important;
            }
        }
        @media only screen and (min-width: 768px) and (max-width: 992px)
        {
            iframe
            {
                width: 768px;
                height: 700px;
            }
            .modal-dialog
            {
                width: 600px;
                margin: 10px auto;
            }
            table td span
            {
                font-size: 14px;
            }
            table td
            {
                width: 25%;
            }
            .modal-lg
            {
                width: 768px;
                margin-left: -215px;
            }
            .btn-adj 
            {
                float: left;
            }
            .txtbpadj
             {
                width: 20%;
            }
        }
        
        /*05 july*/
        @media only screen and (min-width: 768px)
        {
        
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
        }
        @media only screen and (min-width: 600px)
        {
            .btn-adj 
            {
                float: left;
            }
            .txtbpadj
            {
                margin-top:-13px;
            }
        }
        .imgbtn
        {
            height: 25px;
            width: 70px;
            float: right;
            border-width: 0px;
        }
        /*.modal-lg
        {
            width: 800px;
            margin-left: -215px;
            overflow-y: scroll;
            max-height: 85%;
        }*/
    </style>
    <script type="text/javascript">

        $(window).load(function () {
           
           

            $(document).keyup(function (e) {
                if (e.keyCode == 27) {

                    $find("mpe2").hide();
                    $find("mpe1").hide();
                    
                }
            });
        });

        $(document).ready(function () {
//            $('#PrintPres').addClass("printpres");
            $('#PrintPres').hide();
            $('#PrintInvest').hide();

            
            BindMultiselect();

        });
        function PrintPanel() {
       
            var panel = document.getElementById("<%=pnlContents.ClientID %>");
            var printWindow = window.open('', '', 'width=1800,height=1600,resizeable,scrollbars');
            printWindow.document.write('<html><head><title></title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(panel.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            setTimeout(function () {
                printWindow.print();
            }, 500);
            return false;
        }

        function PrintPanelinvestigation() {
            var panel = document.getElementById("<%=pnlInvest.ClientID %>");
            var printWindow = window.open('', '', 'width=1800,height=1600,resizeable,scrollbars');
            printWindow.document.write('<html><head><title></title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(panel.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();

            setTimeout(function () {
                printWindow.print();
            }, 500);
            return false;
        }
        function BindMultiselect() {

//            $('[id*=ddlMedicine]').multiselect({
//                numberDisplayed: 0
//            });

//            $('[id*=ddlPrescription]').multiselect({
//                numberDisplayed: 0
            //            });

            $('[id*=ddlMedicine]').multiselect({
                columns: 4,
                search: true,
                 texts: {
           
            search:          'Search Medicines',   
            },
                placeholder: 'Select Medicines'
            });
            $('[id*=ddlPrescription]').multiselect({
                columns: 4,
                search: true,
                 texts: {
           
            search:          'Search Medicines',   
            },
                placeholder: 'Select Prescriptions'
            });
            $('#medicineddl').removeClass('initialhide');
            $('#presddl').removeClass('initialhide');

             $('.ms-options-wrap button').click(function(){
               // alert('in');
                $(this).parent().children(':eq(1)').children(':eq(0)').children().focus();
               
            }); 
        }



        function isNumberKey(event) {

            //  var numbersAndWhiteSpace = /[0-9 ]/g;
            var numbersAndWhiteSpace = /[.0-9 ]/g;
            var key = String.fromCharCode(event.which);

            if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {



                $("#ContentPlaceHolder1_lblErrMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").empty();
                return true;
            }
            else {
                $("#ContentPlaceHolder1_lblErrMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").append(PP_NONTEXT_MEDICINE_DAYS);
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                return false;
            }
        }




        function isNumberAmount(event, e) {

            var numbersAndWhiteSpace = /^\d*\.?\d*$/;
            var key = String.fromCharCode(event.which || event.keyCode);
            var charCode = (event.keyCode ? event.keyCode : event.which);
            var txt_amount = $("#ContentPlaceHolder1_txtAmountPaid").val();


            if (charCode == 9 || charCode == 32 || charCode == 8 || charCode == 37 || charCode == 39 || numbersAndWhiteSpace.test(key)) {


                if (charCode == 8) { return true; }
                if (charCode == 9) { return true; }
                if (charCode == 32) { return true; }



                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                return true;
            }
            else if (charCode == 13) {
                event.preventDefault();
                return false;
            }

            else {

                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(PP_NONTEXT_MEDICINE_DAYS);
                return false;
            }


        }

        function validate_feestobecollected() {

            var numbersAndWhiteSpace = /^\d*\.?\d*$/;
            var str_amount_expression = /^(-?\d{0,3})((\.(\d{0,2})?)?)$/;
            var str = /^\d{0,2}\.?\d{1,2}$/;


            var dec_amount_topaid = $("#ContentPlaceHolder1_txtAmountPaid").val();
            var dec_amount_to_collect=$("#ContentPlaceHolder1_txtAmountTobeCollected").val();

            if (dec_amount_topaid == "") {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(RP_EMPTY_AMOUNT);
                return false;
            }
            else if (dec_amount_to_collect == "") {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(PP_EMPTY_AMOUNT);
                return false;
            }
            else if (str_amount_expression.test(dec_amount_topaid) == false) {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(RP_INVALID_AMOUNT);
                return false;
            }
             else if (str_amount_expression.test(dec_amount_to_collect) == false) {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(RP_INVALID_AMOUNT);
                return false;
            }
            else if (!dec_amount_topaid.match(numbersAndWhiteSpace)) {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(PP_NONTEXT_MEDICINE_DAYS);
                return false;
            }
             else if (!dec_amount_to_collect.match(numbersAndWhiteSpace)) {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(PP_NONTEXT_MEDICINE_DAYS);
                return false;
            }
            else {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                return true;
            }
        }


        function isNumberKeyPres(event) {

            // var numbersAndWhiteSpace = /[0-9 ]/g;
            var numbersAndWhiteSpace = /[.0-9 ]/g;
            var key = String.fromCharCode(event.which);

            if (event.keyCode == 8 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 9 || numbersAndWhiteSpace.test(key)) {

                $("#ContentPlaceHolder1_lblEr").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").empty();
                return true;
            }
            else {
                $("#ContentPlaceHolder1_lblEr").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").empty();
                $("#ContentPlaceHolder1_lblErrorMessage").append(PP_NONTEXT_MEDICINE_DAYS);
                $("html, body").animate({
                    scrollTop: 0
                }, 600);
                return false;
            }
        }



       

        function Loading() {

            $('#mainpage').waitMe({
                effect: 'ios',
                text: '',
                bg: 'rgba(255,255,255,0.7)',
                color: '#000',
                maxSize: '',
                source: ''
            });

           
            //return true;
            setTimeout(function () {
                $('#mainpage').waitMe('hide');
            }, 2000);

        }

       
    </script>
    <script type="text/javascript">
        $(function () {

            var start = $('#header-fixed').offset().top;

            $.event.add(window, "scroll", function () {
                var p = $(window).scrollTop();
                if (p > start) {
                    $('#header-fixed').addClass('header-fixed-top');

                    $('#ContentPlaceHolder1_lblPatient_Name').removeClass('labelname1');
                    $('#ContentPlaceHolder1_lblPatient_Name').addClass('labelcolor');

                    $('#ContentPlaceHolder1_lblLastVisitDate').removeClass('label');
                    $('#ContentPlaceHolder1_lblLastVisitDate').addClass('labelchange');

                    $('#ContentPlaceHolder1_lblPatientAge').removeClass('label');
                    $('#ContentPlaceHolder1_lblPatientAge').addClass('labelchange');

                    $('#ContentPlaceHolder1_lblLastVisit').removeClass('label1');
                    $('#ContentPlaceHolder1_lblLastVisit').addClass('labelchangesmall');

                    $('#ContentPlaceHolder1_lblPatient_Age').removeClass('lbl-black');
                    $('#ContentPlaceHolder1_lblPatient_Age').addClass('labelchangesmall');

                    $('#ContentPlaceHolder1_lblPatient_Birthdate').removeClass('label1');
                    $('#ContentPlaceHolder1_lblPatient_Birthdate').addClass('labelchangesmall');

                    $('#span').removeClass('label1');
                    $('#span').addClass('labelchangesmall');

                    $('#ContentPlaceHolder1_lblPersonIn').removeClass('label');
                    $('#ContentPlaceHolder1_lblPersonIn').addClass('labelchange');

                }
                else {
                    $('#header-fixed').removeClass('header-fixed-top');

                    $('#ContentPlaceHolder1_lblPatient_Name').removeClass('labelcolor');
                    $('#ContentPlaceHolder1_lblPatient_Name').addClass('labelname1');

                    $('#ContentPlaceHolder1_lblLastVisitDate').removeClass('labelchange');
                    $('#ContentPlaceHolder1_lblLastVisitDate').addClass('label');

                    $('#ContentPlaceHolder1_lblPatientAge').removeClass('labelchange');
                    $('#ContentPlaceHolder1_lblPatientAge').addClass('label');

                    $('#ContentPlaceHolder1_lblLastVisit').removeClass('labelchangesmall');
                    $('#ContentPlaceHolder1_lblLastVisit').addClass('label1');

                    $('#ContentPlaceHolder1_lblPatient_Age').removeClass('labelchangesmall');
                    $('#ContentPlaceHolder1_lblPatient_Age').addClass('lbl-black');

                    $('#ContentPlaceHolder1_lblPatient_Birthdate').removeClass('labelchangesmall');
                    $('#ContentPlaceHolder1_lblPatient_Birthdate').addClass('label1');

                    $('#span').removeClass('labelchangesmall');
                    $('#span').addClass('label1');

                    $('#ContentPlaceHolder1_lblPersonIn').removeClass('labelchange');
                    $('#ContentPlaceHolder1_lblPersonIn').addClass('label');

                }


            });

            //$('#header-fixed').scroll 
        });
    </script>

    <script type="text/javascript">
        $(function () {

            var start = $('#header-name').offset().top;

            $.event.add(window, "scroll", function () {
                var p = $(window).scrollTop();
                if (p > start) {
                    $('#header-name').addClass('col-md-offset-1');
                    $('#header-name').addClass('col-md-4');
                }
                else {
                    $('#header-name').removeClass('col-md-offset-1');
                    $('#header-name').removeClass('col-md-4');
                    $('#header-name').addClass('col-md-5');
                }


            });

            //$('#header-fixed').scroll 
        });
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="title-breadcrumb-option-demo" class="page-title-breadcrumb">
        <div class="row">
            <div class="page-header Page_Title_Align">
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <div class="page-heading">
                        Receive Payment</div>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <span class="errorBox">
                        <asp:Label ID="lblErrorMessage" runat="server"></asp:Label>
                    </span>
                    <asp:Label ID="lbl_success_msg" runat="server" CssClass="success-message-box"></asp:Label>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <ol class="breadcrumb page-breadcrumb pull-right">
                        <li><i class="fa fa-home"></i>&nbsp;<asp:HyperLink ID="HyperLinkPR" NavigateUrl="CompounderDashBoard.aspx"
                            runat="server">Home</asp:HyperLink>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;
                        </li>
                        <li class="hidden">
                            <asp:HyperLink ID="HyperLink1" NavigateUrl="#" runat="server"> Receive Payment</asp:HyperLink>&nbsp;&nbsp;<i
                                class="fa fa-angle-right"></i>&nbsp;&nbsp; </li>
                        <li class="active"></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <br />
    <div id="mainpage">
        <div class="container-fluid">
            <div class="row">
                <div class="col-md-10 col-md-offset-1">
                    

                      <div class="row">
                    <div id="header-fixed">
                      <div class="col-md-5" id="header-name">
                        <b>
                            <asp:Label ID="lblPatient_Name" CssClass="labelname1" runat="server" Text=""></asp:Label></b>

                    </div>
                     
                      <div class="col-md-3">
                        <asp:Label ID="lblVisitNo" Visible="false" CssClass="label" runat="server"></asp:Label>
                        <asp:Label ID="lblPatientAge" CssClass="label" runat="server" Text="Age:" ></asp:Label>
                        <asp:Label ID="lblPatient_Age" CssClass="lbl-black" data-toggle="tooltip"  aria-hidden="true" runat="server" Text=""></asp:Label><%--<span id="span" class="label1">/</span>--%>
                        <asp:Label ID="lblPatient_Birthdate" CssClass="label1" Visible="false"  runat="server" Text=""></asp:Label>
                    </div>
                    <div class="col-md-3">
                         <asp:Label ID="lblPersonIn" CssClass="label" runat="server" Text="In Person:"></asp:Label>
                         <asp:CheckBox runat="server" ID="chkInPerson" Enabled="false"/>
                        </div>
                    </div>
                </div>
                  
                    <br />
                    <div class="row">
                        <div class="col-xs-12 col-sm-6 col-md-6">
                            <asp:Label ID="lblAppointOnCall" CssClass="label" runat="server" Text="Appointment: With Doctor (On Phone)"
                                Visible="false"></asp:Label></div>
                    </div>
                    <br />
                    <div class="row checkbox-adjs">
                        <div class="col-xs-12 col-sm-12 col-md-4 ">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-4">
                                    <div class="form-group">
                                        <div class="col-md-12">
                                            <asp:Label ID="lblAllergyDetails" CssClass="label" runat="server" Text="Allergy Details:"></asp:Label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-8">
                                    <div class="">
                                        <div class="col-md-12">
                                            <asp:TextBox ID="txtAllergyDetails" onkeyup="CheckCharacterMedicine(this,250);" runat="server"
                                                CssClass="form-control multitextarea allergytext" TextMode="MultiLine"
                                                MaxLength="500"></asp:TextBox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-4 ">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-4">
                                    <div class="form-group">
                                        <div class="col-md-12">
                                            <asp:Label ID="lblHabitDetails" CssClass="label" runat="server" Text="Habits Details:"></asp:Label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-8">
                                    <div class="">
                                        <div class="col-md-12">
                                            <asp:TextBox ID="txtHabitDetails" onkeyup="CheckCharacterMedicine(this, 500);"
                                                runat="server" CssClass="form-control multitextarea" TextMode="MultiLine" MaxLength="500"></asp:TextBox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div class="col-xs-12 col-sm-12 col-md-4 ">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-4">
                                    <div class="form-group">
                                        <div class="col-md-12">
                                          <asp:Label ID="lbl_bloodpressure" CssClass="label" runat="server" Text="Blood Pressure:"></asp:Label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-8">
                                    <div class="">
                                        <div class="col-md-12">
                                          <asp:TextBox ID="txtBloodPressure" runat="server" placeholder="Blood Pressure" class="form-control" 
                                MaxLength="10"></asp:TextBox>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  
                 
             <%--    <asp:UpdatePanel ID="UpdatePanel4" runat="server">
                                <ContentTemplate>
--%>
                    <div class="row">
                        <div class="col-md-12">
                            <br />
                            <div class="row">
                                <div class="col-md-6 adjs-textbox">
                                    <div class="table-responsive">
                                        <asp:GridView ID="grd_CompounderSymptom" runat="server" AutoGenerateColumns="False"
                                            ShowHeaderWhenEmpty="true" Style="font-weight: 500;" Width="100%">
                                            <AlternatingRowStyle BackColor="White" />
                                            <Columns>
                                                <asp:TemplateField HeaderText="Symptoms" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float gridlabel">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblRegistrationNo" CssClass="label1" runat="server" Text='<%# Bind("Complaint_Description") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                            </Columns>
                                            <EmptyDataTemplate>
                                                <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                            </EmptyDataTemplate>
                                            <AlternatingRowStyle BackColor="White" />
                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                            <PagerSettings Mode="NextPreviousFirstLast" />
                                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                        </asp:GridView>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="table-responsive">
                                        <asp:GridView ID="grd_CompounderDisease" runat="server" AutoGenerateColumns="False"
                                            ShowHeaderWhenEmpty="true" Style="font-weight: 500;" Width="100%">
                                            <AlternatingRowStyle BackColor="White" />
                                            <Columns>
                                                <asp:TemplateField HeaderText="Disease" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float gridlabel">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblRegistrationNo" CssClass="label1" runat="server" Text='<%# Bind("Desease_Description") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                            </Columns>
                                            <EmptyDataTemplate>
                                                <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                            </EmptyDataTemplate>
                                            <AlternatingRowStyle BackColor="White" />
                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                            <PagerSettings Mode="NextPreviousFirstLast" />
                                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                        </asp:GridView>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <div class="row">
                                <div class="col-md-6 adjs-textbox">
                                    <div class="table-responsive">
                                        <asp:GridView ID="grdDressing" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                            Style="font-weight: 500;" Width="100%">
                                            <AlternatingRowStyle BackColor="White" />
                                            <Columns>
                                                <asp:TemplateField HeaderText="Dressing" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float gridlabel">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblDressing" CssClass="label1" runat="server" Text='<%# Bind("LongDressing_Description") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                            </Columns>
                                            <EmptyDataTemplate>
                                                <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                            </EmptyDataTemplate>
                                            <AlternatingRowStyle BackColor="White" />
                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                            <PagerSettings Mode="NextPreviousFirstLast" />
                                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                        </asp:GridView>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="table-responsive">
                                    <asp:GridView ID="grdInvestigations" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                            Style="font-weight: 500;" Width="100%">
                                            <AlternatingRowStyle BackColor="White" />
                                            <Columns>
                                                <asp:TemplateField HeaderText="Investigations" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1 PP-color">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblinvestigation" CssClass="label1" runat="server" Text='<%# Bind("Lab_Test_Description") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                            </Columns>
                                            <EmptyDataTemplate>
                                                <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                            </EmptyDataTemplate>
                                            <AlternatingRowStyle BackColor="White" />
                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                            <PagerSettings Mode="NextPreviousFirstLast" />
                                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                        </asp:GridView>
                                    </div>
                                    </div>
                            </div>
                            <br />
                         <%--   <asp:UpdatePanel ID="UpdatePanel4" runat="server">
                                <ContentTemplate>--%>
                                    <div class="row">
                                        <div class="col-md-12">
                                           <%-- <div class="sublabelFull2 lblreceive">
                                              <b>  Medicines :</b></div>--%>
                                            <div class="row">
                                                <div class="col-md-11 initialhide" id="medicineddl">
                                                  <%--  <asp:DropDownList ID="ddlMedicine" Font-Names="Courier New"  runat="server" CssClass="form-control" Style="line-height: 28px;">
                                                    </asp:DropDownList>--%>
                                                     <asp:ListBox id="ddlMedicine" runat="server" SelectionMode="Multiple">
                            </asp:ListBox>
                                                </div>
                                                <div class="col-md-1">
                                                    <asp:Button ID="btnMedicine" CssClass="btn btn-primary btn-adj" runat="server" Text="Add" data-toggle="tooltip" title="Add Medicine" aria-hidden="true"
                                                        OnClick="btnAddMedicine_Click" OnClientClick="return Loading();" />

                                                         
                                                </div>
                                            </div>
                                           <%-- <br />--%>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblErrMsg" class="error-box" Text="" runat="server"></asp:Label>
                                                </div>
                                            </div>
                                            <%--<br />--%>
                                            <div class="row">
                                            <div class="col-md-11">
                                            <div class="table-responsive">
                                                <div class="adjs-textbox">
                                                <asp:UpdatePanel ID="UpdatePanel4" runat="server">
                                <ContentTemplate>
                                                    <asp:GridView ID="grd_Internal_Medicine" OnRowDataBound="grdMedicine_rowdatabound" OnRowCommand="grd_Internal_Medicine_RowCommand"
                                                        runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true" Style="font-weight: 500;"
                                                        Width="100%">
                                                        <AlternatingRowStyle BackColor="White" />
                                                        <Columns>
                                                            <asp:TemplateField HeaderText="Sr." ItemStyle-ForeColor="Black" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                                                </ItemTemplate>
                                                                <ItemStyle Width="5%" />
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Medicines" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:HiddenField ID="hdnDesrId" Value='<%# Bind("ID") %>' runat="server" />
                                                                    <asp:Label ID="lblMedicine" runat="server" CssClass="label1" Text='<%# Bind("Medicines") %>'></asp:Label>
                                                                    <asp:HiddenField ID="hdnMedicine" Value='<%# Bind("Medicines") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnVisitDate" Value='<%# Bind("Visit_Date") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnPatientVisitNo" Value='<%# Bind("Patient_Visit_No") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnShiftId" Value='<%# Bind("Shift_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnClinicId" Value='<%# Bind("Clinic_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnDoctorId" Value='<%# Bind("Doctor_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnPatientId" Value='<%# Bind("Patient_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnShortDescription" Value='<%# Bind("Short_Description") %>'
                                                                        runat="server" />
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="B" ItemStyle-Width="8%" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtMorning" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKey(event);" MaxLength="4" Text='<%# Bind("Morning") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="L" ItemStyle-Width="8%" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtAfternoon" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKey(event);" MaxLength="4" Text='<%# Bind("Afternoon") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="D" ItemStyle-Width="8%" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtNight" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKey(event);" MaxLength="4" Text='<%# Bind("Night") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Days" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtNoOfDays" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKey(event);" MaxLength="3" Text='<%# Bind("No_Of_Days") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="250px" ItemStyle-VerticalAlign="Middle"
                                                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float gridlabel">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtInstruction" Style="width: 100%; border-color: White; border: none"
                                                                        Text='<%# Bind("Instruction") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Action" ItemStyle-HorizontalAlign="Center" ItemStyle-Width="30px">
                                                                <ItemTemplate>
                                                                    <asp:LinkButton ID="lnkDeleteMedicine" CommandName="delete" Style="width: 100%; color: Black;"
                                                                        OnClick="lnkDeleteMedicine_onclick" OnClientClick="return confirm('Are you sure you want to delete this Medicine?');"
                                                                        runat="server">
                                                                    <i class="fa fa-trash-o glyphi" data-toggle="tooltip" title="Delete" aria-hidden="true"></i>
                                                                    </asp:LinkButton>
                                                                    <%-- <asp:CheckBox ID="ChkDelete" runat="server" />--%>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                        </Columns>
                                                        <EmptyDataTemplate>
                                                            <center>
                                                                <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                        </EmptyDataTemplate>
                                                        <AlternatingRowStyle BackColor="White" />
                                                        <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                        <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                        <PagerSettings Mode="NextPreviousFirstLast" />
                                                        <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                        <RowStyle BackColor="#EFF3FB" />
                                                        <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                    </asp:GridView>
                                                     </ContentTemplate>
                            </asp:UpdatePanel>
                                                </div>
                                            </div>
                                            </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-12">
                                        <br />
                                            <%--<div class="sublabelFull2 lblreceive">
                                               <b> Prescription :</b></div>--%>
                                            <div class="row">
                                             <div class="col-md-11 initialhide" id="presddl">
                                                 <%--   <asp:DropDownList ID="ddlPrescription" Font-Names="Courier New"  runat="server" CssClass="form-control" Style="line-height: 28px;">
                                                    </asp:DropDownList>--%>
                                                     <asp:ListBox id="ddlPrescription" runat="server" SelectionMode="Multiple">
                                                        </asp:ListBox>
                                                </div>
                                                <div class="col-md-1">
                                                    <asp:Button ID="btnAddPrescription" CssClass="btn btn-primary btn-adj" runat="server" Text="Add" data-toggle="tooltip" title="Add Prescription" aria-hidden="true"
                                                        OnClick="btnAddPrescription_Click" OnClientClick="return Loading();" />
                                                </div>
                                            </div>
                                            <%--<br />--%>
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblEr" Text="" class="error-box" runat="server"></asp:Label>
                                                </div>
                                            </div>
                                            <%--<br />--%>
                                            <div class="row">
                                            <div class="col-md-11">
                                            <div class="table-responsive">
                                                <div class="adjs-textbox">
                                                   <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                                                    <ContentTemplate>
                               
                                                    <asp:GridView ID="grd_Prescription" OnRowDataBound="grdPrescription_rowdatabound" OnRowCommand="grd_Prescription_RowCommand" runat="server"
                                                        AutoGenerateColumns="False" ShowHeaderWhenEmpty="true" Style="font-weight: 500;"
                                                        Width="100%">
                                                        <AlternatingRowStyle BackColor="White" />
                                                        <Columns>
                                                            <asp:TemplateField HeaderText="Sr." ItemStyle-ForeColor="#075398" ItemStyle-VerticalAlign="Middle" HeaderStyle-Width="1%"
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                                                </ItemTemplate>
                                                                <ItemStyle Width="5%"/>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Prescriptions" ItemStyle-Width="320px" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:HiddenField ID="hdnPresDesr" Value='<%# Bind("ID") %>' runat="server" />
                                                                    <asp:Label ID="lblPrescription" runat="server" CssClass="label1" Text='<%# Bind("Medicine_Name") %>'></asp:Label>
                                                                    <asp:HiddenField ID="hdnPrescription" Value='<%# Bind("Prescription") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnVisitDate" Value='<%# Bind("Visit_Date") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnPatientVisitNo" Value='<%# Bind("Patient_Visit_No") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnShiftId" Value='<%# Bind("Shift_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnClinicId" Value='<%# Bind("Clinic_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnDoctorId" Value='<%# Bind("Doctor_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnPatientId" Value='<%# Bind("Patient_ID") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnMedicineName" Value='<%# Bind("Medicine_Name") %>' runat="server" />
                                                                    <asp:HiddenField ID="hdnBrandName" Value='<%# Bind("Brand_Name") %>' runat="server" />
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="B" ItemStyle-Width="4%" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtPresMorning" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKeyPres(event);" MaxLength="4" Text='<%# Bind("Morning") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="L" ItemStyle-Width="4%" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtPresAfternoon" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKeyPres(event);" MaxLength="4" Text='<%# Bind("Afternoon") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="D" ItemStyle-Width="4%" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtPresNight" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKeyPres(event);" MaxLength="4" Text='<%# Bind("Night") %>' runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Days" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtPresNo_Of_Days" Style="width: 100%; border-color: White; border: none"
                                                                        onkeypress="return isNumberKeyPres(event);" MaxLength="3" Text='<%# Bind("No_Of_Days") %>'
                                                                        runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="280px" ItemStyle-VerticalAlign="Middle" 
                                                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1 PP-color">
                                                                <ItemTemplate>
                                                                    <asp:TextBox ID="txtPresInstruction" Style="width: 100%; border-color: White; border: none"
                                                                        Text='<%# Bind("Instruction") %>'  runat="server"></asp:TextBox>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                            <asp:TemplateField HeaderText="Action" ItemStyle-HorizontalAlign="Center" ItemStyle-Width="30px">
                                                                <ItemTemplate>
                                                                    <asp:LinkButton ID="lnkDeletePrescription" CommandName="delete" Style="width: 100%;
                                                                        color: Blue;" OnClick="lnkDeletePrescription_onclick" OnClientClick="return confirm('Are you sure you want to delete this prescription?');"
                                                                        runat="server">
                                                                    <i class="fa fa-trash-o glyphi" data-toggle="tooltip" title="Delete" aria-hidden="true"></i>
                                                                    </asp:LinkButton>
                                                                    <%--<asp:CheckBox ID="ChkDelete" runat="server" />--%>
                                                                </ItemTemplate>
                                                            </asp:TemplateField>
                                                        </Columns>
                                                        <EmptyDataTemplate>
                                                        
                                                            <center>
                                                                <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label>
                                                            </center>
                                                        </EmptyDataTemplate>
                                                        <AlternatingRowStyle BackColor="White" />
                                                        <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                        <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                        <PagerSettings Mode="NextPreviousFirstLast" />
                                                        <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                        <RowStyle BackColor="#EFF3FB" />
                                                        <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                    </asp:GridView>
                                                    </ContentTemplate>
                            </asp:UpdatePanel>
                                                </div>
                                            </div>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                               <%-- </ContentTemplate>
                            </asp:UpdatePanel>--%>
                            <br />
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                <div class="col-md-5">
                                    <asp:Label ID="Label1" CssClass="labelname" runat="server" Text="Billed Amount(Rs):"></asp:Label>
                                </div>
                                <div class="col-md-4 txtalignfee">
                                    <asp:TextBox ID="txtAmountTobeCollected" class="form-control" runat="server"  onkeypress="return isNumberAmount(event,this)"></asp:TextBox>
                                </div>
                                 <div class="col-md-3">
                                <asp:Label ID="Label23" Text="" class="error-box" runat="server"></asp:Label>
                                </div>
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                                    <div class="col-md-12">
                                    <asp:Label ID="lblpendingamount" CssClass="labelname error-box" runat="server" Text=""></asp:Label>
                                    </div>
                               <%-- <div class="col-md-4">
                                    <asp:Label ID="lblgetpendingamount" CssClass="labelname  RP_pendingamount" runat="server" Text=""></asp:Label>
                                </div>--%>
                                    <%--<div class="table-responsive">
                                        <asp:GridView ID="grdFeesConsolidate" runat="server" AutoGenerateColumns="False"
                                            ShowHeaderWhenEmpty="false" Style="font-weight: 500;" Width="100%">
                                            <AlternatingRowStyle BackColor="White" />
                                            <Columns>
                                                <asp:TemplateField HeaderText="Doctor" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblCompounder" CssClass="label1" runat="server" Text='<%# Bind("DOCTOR") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                                <asp:TemplateField HeaderText="Compounder" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblDoctor" CssClass="label1" runat="server" Text='<%# Bind("COMPOUNDER") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                                <asp:TemplateField HeaderText="Balance" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                    <ItemTemplate>
                                                        <asp:Label ID="lblbalance" CssClass="label1" runat="server" Text='<%# Bind("BALANCE") %>'></asp:Label>
                                                    </ItemTemplate>
                                                </asp:TemplateField>
                                            </Columns>
                                            <EmptyDataTemplate>
                                                <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                            </EmptyDataTemplate>
                                            <AlternatingRowStyle BackColor="White" />
                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                            <PagerSettings Mode="NextPreviousFirstLast" />
                                            <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                        </asp:GridView>
                                    </div>--%>
                                </div>
                            </div>
                            

                        </div>
                        <br>
                        <div class="row">
                           <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                            <div class="col-md-5">
                                <asp:Label ID="Label12" CssClass="labelname lbl_amt_paid" runat="server" Text="Collected Amount(Rs):"></asp:Label>
                            </div>
                            <div class="col-md-4 txt_amount_paid txtamountadj">
                                <asp:TextBox ID="txtAmountPaid" class="form-control" runat="server" MaxLength="6"
                                    onkeypress="return isNumberAmount(event,this)"></asp:TextBox>
                            </div>
                           <%-- <div class="col-md-3">
                                <asp:Label ID="lblAmountToBePaidErr" Text="" class="error-box" runat="server"></asp:Label>
                            </div>--%>
                            </div>
                            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                            <div class="col-md-5">
                                <asp:Label ID="lblamountpaid" CssClass="label" runat="server" Text="Reason:"></asp:Label>
                            </div>
                            <div class="col-md-4">
                                <asp:TextBox ID="txtcomment" class="form-control" runat="server" TextMode="MultiLine"></asp:TextBox>
                            </div>
                            <%--<div class="col-md-3">
                                <asp:Label ID="lblcommentErr" Text="" class="error-box" runat="server"></asp:Label>
                            </div>--%>
                            </div>
                           </div>
                            <div class="row">
                            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                             <div class="col-md-6">
                                <asp:Label ID="lblAmountToBePaidErr" Text="" class="error-box" runat="server"></asp:Label>
                            </div>
                            </div>
                            </div>
                           <div class="row">
                            <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                            <div class="col-md-5">
                                <asp:Label ID="Label13" CssClass="label lbl-remark" runat="server" Text="Instructions:"></asp:Label>
                             </div>
                              <div class="col-md-6">
                                <asp:Label ID="lblRemark" CssClass="lbl-black txtalignfee RP_lblinstrution" runat="server"></asp:Label>
                            </div>
                            </div>
                           
                            </div>
                           
                             
                             
                            <%--<div class="row">
                              <div class="col-md-3">
                                <asp:Label ID="lblamountpaid" CssClass="labelname lbl_amt_paid" runat="server" Text="Reason:"></asp:Label>
                            </div>
                            <div class="col-md-3 txt_amount_paid txtamountadj">
                                <asp:TextBox ID="txtcomment" class="form-control" runat="server" TextMode="MultiLine"></asp:TextBox>
                            </div>
                            <div class="col-md-3">
                                <asp:Label ID="lblcommentErr" Text="" class="error-box" runat="server"></asp:Label>
                            </div>
                            </div>--%>
                        </div>
                        <br />
                        
                        
                       
                        <br>
                        <br />
                        <br />
                        <div class="row">
                            <center>
                                 
                                <asp:Button ID="btnSubmit" CssClass="btn btn-primary" runat="server" Text="Submit"
                                    OnClientClick="return validate_feestobecollected();" OnClick="btnSubmit_Click" />
                                
                                    
                                <asp:Button ID="btnprevisitDetails" runat="server" CssClass="btn btn-primary" 
                                    Text="Previous Visit Details" onclick="btnprevisitDetails_Click"></asp:Button>
                           
                                <asp:Button ID="btnmedicinefesscollectionpopup" CssClass="btn btn-primary" runat="server"
                                    Text="View Fees Collection" OnClick="MedicineFeesCollection_Click"></asp:Button>
                                <asp:Button ID="btnPrintPrescription" CssClass="btn btn-primary" runat="server" Text="Print Prescription"
                                    OnClientClick="return PrintPanel()"/>
                                  <%--   <input type="button"  id="btnPrintPrescription" class="btn btn-primary" onclick="PrintPanel()" value="Print Prescription"
                                     />--%>
                                      <asp:Button ID="btnPrintInvestigation" CssClass="btn btn-primary" runat="server" Text="Print Investigation"
                                   OnClientClick="return PrintPanelinvestigation()" />
                                     <%--<input type="button" id="btnPrintInvestigation" class="btn btn-primary" onclick="PrintPanelinvestigation()" value="Print Investigation"
                                     />--%>
                                <asp:Button ID="btnCancel" CssClass="btn btn-primary" runat="server" Text="Cancel"
                                    OnClick="btnCancel_Click" />
                                     
                            </center>
                        </div>

                    <%--    </ContentTemplate>
                        </asp:UpdatePanel>--%>
                        <br />
                          <br />
                    <div class="row">
                      <%--  <div class="col-md-12">
                            <div class="sublabelFullPatient">
                                Current Medical Details:</div>
                        </div>
                        <br />
                        <br />--%>
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-6">
                                    <div class="row">
                                        <div class="col-xs-12 col-sm-12 col-md-2">
                                            <div class="form-group">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblChronicdisease" CssClass="label" runat="server" Text="Chronic Disease:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-hyp-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12 ">
                                                    <asp:Label ID="lblHypertension" CssClass="labelbold" runat="server" Text="Hypertension:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-hyp-chk">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkHypertension" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-Diab-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblDiabetes" CssClass="labelbold" runat="server" Text="Diabetes:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-Diab-chk">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkDiabetes" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-Cho-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblCholesterol" CssClass="labelbold" runat="server" Text="Cholesterol:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-Cho-chk">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkCholesterol" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-xs-12 col-sm-12 col-md-6">
                                    <div class="row">
                                        <div class="col-xs-6 col-sm-4 col-md-2 pIHD-adjst">
                                            <div class="">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblIhd" CssClass="labelbold" runat="server" Text="IHD:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 pIHD-chk-adjst">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkIHD" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 pAsthma-adjst">
                                            <div class="">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblAsthma" CssClass="labelbold" runat="server" Text="BR-Asthma:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 pAsthma-chk-adjst">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkAsthma" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 pth-adjst">
                                            <div class="">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblth" CssClass="labelbold" runat="server" Enabled="False" Text="TH:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 pth-chk-adjst">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkTH" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                            <div class="row">
                                <div class="col-xs-12 col-sm-12 col-md-6">
                                    <div class="row">
                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                            <div class="form-group">
                                                <div class="col-md-12">
                                                    <asp:Label ID="lblHabits1" CssClass="label" runat="server" Text="Habits:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-Smok-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12 ">
                                                    <asp:Label ID="lblSmoking1" CssClass="labelbold" runat="server" Text="Smoking:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-Smok-chk">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkSmoking" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-Toba-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12 ">
                                                    <asp:Label ID="lblTobaco" CssClass="labelbold" runat="server" Enabled="False" Text="Tobacco:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-Toba">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkTobaco" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-4 col-md-2 Pp-Alch-lbl-adjs">
                                            <div class="">
                                                <div class="col-md-12 ">
                                                    <asp:Label ID="lblAlchohol" CssClass="labelbold" runat="server" Text="Alchohol:"></asp:Label>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-xs-6 col-sm-2 col-md-1 Pp-Alch">
                                            <div class="form-group">
                                                <div class="col-md-12 ">
                                                    <asp:CheckBox ID="chkAlchohol" onclick="return false" Enabled="False" runat="server" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                        <br />
                  
                        
                   
                          
                    <div class="row">
                        <div class="col-md-3">
                            <div class="pull-left">
                            <%--  <asp:HiddenField ID="lblDate" runat="server" />--%>
                               <asp:Label ID="lblDate" CssClass="label" runat="server" Visible="false"></asp:Label>
                                <asp:Label ID="Label2" CssClass="label" runat="server" Text="Height:"></asp:Label>
                                <asp:Label ID="lblHeight" CssClass="lbl-black" runat="server"></asp:Label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="pull-left">
                                <asp:Label ID="Label3" CssClass="label" runat="server" Text="Weight:"></asp:Label>
                                <asp:Label ID="lblWeight" CssClass="lbl-black" runat="server"></asp:Label>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="pull-left">
                                <asp:Label ID="Label4" CssClass="label" runat="server" Text="Pulse:"></asp:Label>
                                <asp:Label ID="lblPulse" CssClass="lbl-black" runat="server"></asp:Label>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <div class="pull-left">
                                <asp:Label ID="Label29" CssClass="label" runat="server" Text="Sugar:"></asp:Label>
                                <asp:Label ID="lblsugar" CssClass="lbl-black" runat="server"></asp:Label>
                            </div>
                        </div>
                         <div class="col-md-2">
                            <div class="pull-left">
                                <asp:Label ID="Label32" CssClass="label" runat="server" Text="TH:"></asp:Label>
                                <asp:Label ID="lblthtext" CssClass="lbl-black" runat="server"></asp:Label>
                            </div>
                        </div>
                     
                    </div>
                     <br />
                    </div>
                </div>
            </div>
        </div>
        <br>
        <cc1:ModalPopupExtender ID="MedicineFeesCollection_popup" BehaviorID="mpe2" runat="server"
            PopupControlID="Panel2" TargetControlID="btn_Medicine" CancelControlID="btnImg_Close"
            BackgroundCssClass="Background">
        </cc1:ModalPopupExtender>
        <asp:Button ID="btn_Medicine" runat="server" Text="" Style="visibility: hidden" />
        <asp:Panel ID="Panel2" runat="server" CssClass="Popup PP_Medicine_Popup" align="center" Style="display: none">
            <div class="modal-dialog compounder-modal-dialog-adjs" Style="width:100%">
                <div class="modal-content">
                    <div class="modal-header">
                        <asp:ImageButton ID="btnImg_Close" runat="server" ImageUrl="../images/close_btn_blue.png"
                            CssClass="imgbtn" OnClick="btnImg_Close_Click" />
                    </div>
                    <div class="modal-body maxheight">
                        <%--  <div class="col-md-12">--%>
                        <div class="table-responsive">
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="panel panel-blue componder-popup-adjs">
                                        <div class="panel-heading">
                                        <b>   Fees Collection</b> </div>
                                        <br />
                                        <div class="col-md-12">
                                            <div class="sublabelFull2" style="text-align: center">
                                               <b> <asp:Label ID="lbl_Patientname" runat="server"></asp:Label></b></div>
                                            <asp:Label ID="lblErrorMsg" CssClass="error-box" runat="server"></asp:Label>
                                            <div class="table-responsive">
                                                <asp:GridView ID="grd_Patient_Visit" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                    Style="font-weight: 500;" Width="100%" ShowFooter="true" OnRowDataBound="grd_Patient_Visit_RowDataBound">
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <Columns>
                                                        <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="60%" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblPatientName" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lbl" CssClass="label1" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Visit Date" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblDates" CssClass="label1" runat="server" Text='<%# Bind("Visit_Date","{0:dd-MMM-yyyy}") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Visit Time" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblVisitTime" CssClass="label1" runat="server" Text='<%# Bind("Visit_Time") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Shift" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblShift" CssClass="label1" runat="server" Text='<%# Bind("ShiftDescription") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                         <asp:TemplateField HeaderText="Visit Status" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblstatus" CssClass="label1" runat="server" Text='<%# Bind("Status_Description") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                         <asp:TemplateField HeaderText="Adhoc (Y?)" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblisadhoc" CssClass="label1" runat="server" Text='<%# Bind("ISadhoc") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotal" CssClass="label1 cls_right_float" runat="server" Text="Total"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Billed" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="ViewMedicinePPBill" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblBill" CssClass="label1" runat="server" Text='<%# Bind("Bill") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalBill" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Collected" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblCollected" CssClass="label1" runat="server" Text='<%# Bind("Collected") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalCollected" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Balance" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblBalance" CssClass="label1 cls_right_float" runat="server" Text='<%# Bind("Balance") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalBalance" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                    </Columns>
                                                    <EmptyDataTemplate>
                                                        <center>
                                                            <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                    </EmptyDataTemplate>
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <FooterStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                    <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                    <PagerSettings Mode="NextPreviousFirstLast" />
                                                    <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                    <RowStyle BackColor="#EFF3FB" />
                                                    <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                </asp:GridView>
                                            </div>
                                        </div>
                                        <br />
                                        <div class="col-md-12">
                                            <div class="sublabelFull2" style="text-align: center">
                                              <b>  Family (Visit wise)</b>
                                            </div>
                                            <div class="table-responsive">
                                                <asp:GridView ID="grdFamily_patient_visit" runat="server" AutoGenerateColumns="False"
                                                    ShowHeaderWhenEmpty="true" ShowFooter="true" OnRowDataBound="grdFamily_patient_visit_RowDataBound"
                                                    Style="font-weight: 500;" Width="100%">
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <Columns>
                                                        <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="60%" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblPatientName" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Visit Date" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblDates" CssClass="label1" runat="server" Text='<%# Bind("Visit_Date","{0:dd-MMM-yyyy}") %>'></asp:Label>
                                                            </ItemTemplate>
                                                           
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Visit Time" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblVisitTime" CssClass="label1" runat="server" Text='<%# Bind("Visit_Time") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Shift" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblShift" CssClass="label1" runat="server" Text='<%# Bind("ShiftDescription") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                         <asp:TemplateField HeaderText="Visit Status" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblstatus" CssClass="label1" runat="server" Text='<%# Bind("Status_Description") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                         <asp:TemplateField HeaderText="Adhoc (Y?)" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblisadhoc" CssClass="label1" runat="server" Text='<%# Bind("ISadhoc") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotal" CssClass="label1 cls_right_float" runat="server" Text="Total"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>

                                                        <asp:TemplateField HeaderText="Billed" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="ViewMedicinePPBill" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblBill" CssClass="label1" runat="server" Text='<%# Bind("Bill") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalBill" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Collected" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblCollected" CssClass="label1" runat="server" Text='<%# Bind("Collected") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalCollected" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Balance" ItemStyle-Width="10px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblBalance" CssClass="label1" runat="server" Text='<%# Bind("Balance") %>'></asp:Label>
                                                            </ItemTemplate>
                                                            <FooterTemplate>
                                                                <asp:Label ID="lblTotalBalance" CssClass="label1 cls_right_float" runat="server"></asp:Label>
                                                            </FooterTemplate>
                                                        </asp:TemplateField>
                                                    </Columns>
                                                    <EmptyDataTemplate>
                                                        <center>
                                                            <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                    </EmptyDataTemplate>
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <FooterStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                    <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                    <PagerSettings Mode="NextPreviousFirstLast" />
                                                    <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                    <RowStyle BackColor="#EFF3FB" />
                                                    <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                </asp:GridView>
                                            </div>
                                        </div>
                                        <br />
                                        <div class="col-md-12">
                                            <div class="sublabelFull2" style="text-align: center">
                                              <b>  Family (FY wise)</b>
                                            </div>
                                            <div class="table-responsive">
                                                <asp:GridView ID="grd_Fee_Consolidate" runat="server" AutoGenerateColumns="False"
                                                    ShowHeaderWhenEmpty="true" Style="font-weight: 500;" Width="100%">
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <Columns>
                                                        <asp:TemplateField HeaderText="Financial Year" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblbalance" CssClass="label1" runat="server" Text='<%# Bind("Financial_Year") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Billed" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="ViewMedicinePPBill" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblCompounder" CssClass="label1" runat="server" Text='<%# Bind("DOCTOR") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Collected" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblDoctor" CssClass="label1" runat="server" Text='<%# Bind("COMPOUNDER") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                        <asp:TemplateField HeaderText="Balance" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                            <ItemTemplate>
                                                                <asp:Label ID="lblbalance" CssClass="label1" runat="server" Text='<%# Bind("BALANCE") %>'></asp:Label>
                                                            </ItemTemplate>
                                                        </asp:TemplateField>
                                                    </Columns>
                                                    <EmptyDataTemplate>
                                                        <center>
                                                            <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                    </EmptyDataTemplate>
                                                    <AlternatingRowStyle BackColor="White" />
                                                    <FooterStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                    <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Size="16px" Font-Names="" />
                                                    <PagerSettings Mode="NextPreviousFirstLast" />
                                                    <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />
                                                    <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                    <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                </asp:GridView>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                             <br />
                                                                        <div class="row">
                                                                            <div class="col-md-12">
                                                                             <asp:Button ID="btnCloseFeesCollection" OnClick="btnCloseFeesCollection_Click" CssClass="btn btn-primary" runat="server" Text="Close" />
                                                                            </div>
                                                                        </div>
                                                                        <br />
                        </div>
                        <%--  </div>--%>
                    </div>
                </div>
            </div>
            <asp:Button ID="Button1" runat="server" Text="Close" Style="visibility: hidden" />
        </asp:Panel>

        <asp:UpdatePanel ID="UpdatePanel2" runat="server">
                            <ContentTemplate>
                                <cc2:ModalPopupExtender ID="PreviousVisitDetailsPop_up" BehaviorID="mpe1" runat="server"
                                    PopupControlID="Panel3" TargetControlID="btn_previsit" CancelControlID="btnImg_PreviousVisit"
                                    BackgroundCssClass="Background">
                                </cc2:ModalPopupExtender>
                                <asp:Button ID="btn_previsit" runat="server" Text="" Style="visibility: hidden" />
                                <asp:Panel ID="Panel3" runat="server" CssClass="Popup" align="center" Style="display: none">
                                    <div class="modal-dialog modal-lg PVpopup">
                                        <div class="modal-content" id="modelPrevious">
                                            <div class="modal-header">
                                                <asp:UpdatePanel ID="UpdatePanel8" runat="server">
                                                    <ContentTemplate>
                                                        <asp:ImageButton ID="btnImg_PreviousVisit" runat="server" ImageUrl="../images/close_btn_blue.png"
                                                            CssClass="imgbtn" />
                                                    </ContentTemplate>
                                                </asp:UpdatePanel>
                                            </div>
                                            <div class="table-responsive">
                                                <div class="modal-body">
                                                    <div class="row">
                                                        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                            <div class="row">
                                                                <div class="col-xs-12 col-sm-12 col-md-2">
                                                                    <center>
                                                                        <asp:GridView ID="grdPreviousVisitDates" runat="server" AutoGenerateColumns="false"
                                                                            Width="100%" OnRowCommand="grdPreviousVisitDates_RowCommand" OnRowDataBound="grdPreviousVisitDates_RowDataBound">
                                                                            <Columns>
                                                                                <asp:TemplateField HeaderText="Visit  Date" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_right_aligned"
                                                                                    ControlStyle-CssClass="cls_right_float label1 previousvisitdatesfont" ItemStyle-Width="70%">
                                                                                    <ItemTemplate>
                                                                                        <asp:LinkButton ID="lnkVisitDate" Style="text-decoration: underline;" CssClass="label1" CommandName="export" runat="server"
                                                                                            Text='<%#Bind("Visit_DateTime") %>' CommandArgument='<%# Eval("Visit_Date","{0:dd-MMM-yyyy}") + "!" + Eval("Shift_id") %>'
                                                                                            OnClick="lnkVisitDate_Click"></asp:LinkButton>
                                                                                    </ItemTemplate>
                                                                                </asp:TemplateField>
                                                                               
                                                                                <asp:TemplateField HeaderText="Shift" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned"
                                                                                    ControlStyle-CssClass="cls_left_float label1 previousvisitdatesfont" ItemStyle-Width="30%">
                                                                                    <ItemTemplate>
                                                                                        <asp:Label ID="lblshiftdesc" runat="server" CssClass="label1" Text='<%# Eval("ShiftDesc") %>'></asp:Label>
                                                                                    </ItemTemplate>
                                                                                </asp:TemplateField>
                                                                            </Columns>
                                                                            <EmptyDataTemplate>
                                                                                <center>
                                                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                            </EmptyDataTemplate>
                                                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                            <AlternatingRowStyle BackColor="White" />
                                                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                        </asp:GridView>
                                                                    </center>
                                                                    <br />
                                                                </div>
                                                                <!----------------col 2 end--------------->
                                                                <div class=" col-xs-12 col-sm-12 col-md-9">
                                                                    <div class="row">
                                                                        <div class="col-md-12">
                                                                            <div class="sublabelFull2">
                                                                                <b>Previous Treatment Details Of:</b>
                                                                                <b><asp:Label ID="lbl_PatientName_PP" runat="server" CssClass="label labelname1"></asp:Label></b>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-md-3">
                                                                            <div class="pull-left PVPPdate">
                                                                                <asp:Label ID="lblprevdate" runat="server" CssClass="label" Text="Visit Date:"></asp:Label>
                                                                                <asp:Label ID="lblGetDate" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                         <div class="col-md-2">
                                                                                 <div class="pull-left PVPPdate">
                                                                                    <asp:Label ID="lbl_shiftPP" runat="server" CssClass="label" Text="Shift:"></asp:Label>
                                                                                    <asp:Label ID="lbl_getshiftPP" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                             <div class="col-md-2">
                                                                                 <div class="pull-left PVPPdate">
                                                                                    <asp:Label ID="lbl_AgePP" runat="server" CssClass="label" Text="Age:"></asp:Label>
                                                                                    <asp:Label ID="lbl_getAgePP" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        <div class="col-md-2">
                                                                                <asp:Label ID="lblInPerson" runat="server" CssClass="label" Text="In Person:"></asp:Label>
                                                                                 <asp:CheckBox ID="chk_InPerson" onclick="return false" runat="server" />
                                                                        </div>
                                                                       
                                                                        <div class="col-md-3">
                                                                            <div class="pull-right">
                                                                                <asp:Label ID="lbl_AppointmentStatus" runat="server" CssClass="label" Text="Appointment:"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lbl_GetAppointmentStatus" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div class="row">
                                                                    <div class="col-md-6">
                                                                             <div class="pull-left PVPPdate">
                                                                                <asp:Label ID="lbloffline" runat="server" CssClass="label" Text="Offline Entry:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblgetoffline" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <br />
                                                                    <div id="ShowDetails" runat="server">
                                                                        <div class="row">
                                                                           <%-- <div class="col-md-12">
                                                                                <div class="prevlabelFull lbl-meddet-adj PVPPLabel">
                                                                                    Medical Details:
                                                                                    </div>
                                                                            </div>--%>
                                                                           
                                                                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                                                <div class="row">
                                                                                    <div class="col-xs-12 col-sm-12 col-md-7">
                                                                                        <div class="row">
                                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label6" CssClass="label" runat="server" Text="Chronic Disease:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Pp-hyp-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:Label ID="Label7" CssClass="label1" runat="server" Text="Hypertension:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pPp-hyp-chk">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevHyp" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Pp-Diab-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label8" CssClass="label1" runat="server" Text="Diabetes:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 Pp-Diab-chk">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevDiab" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Pp-Cho-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label9" CssClass="label1" runat="server" Text="Cholesterol:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pPp-Cho-chk">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevChol" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-xs-12 col-sm-12 col-md-5">
                                                                                        <div class="row">
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 pIHD-adjst">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label10" CssClass="label1" runat="server" Text="IHD:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pIHD-chk-adjst">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevIHD" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-3 pAsthma-adjst">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label11" CssClass="label1" runat="server" Text="BR-Asthma:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pAsthma-chk-adjst">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="ChkPrevBRAsthma" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 pth-adjst">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label14" CssClass="label1" runat="server" Text="TH:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pth-chk-adjst">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevTh" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                                                                                <div class="row">
                                                                                    <div class="col-xs-12 col-sm-12 col-md-7">
                                                                                        <div class="row">
                                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12">
                                                                                                        <asp:Label ID="Label15" CssClass="label" runat="server" Text="Habits:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Ppp-Smok-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:Label ID="Label16" CssClass="label1" runat="server" Text="Smoking:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pPp-Smok-chk">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevSmok" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Pp-Toba-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:Label ID="Label17" CssClass="label1" runat="server" Text="Tobacco:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pPp-Toba">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevTobacco" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-4 col-md-2 Pp-Alch-lbl-adjs">
                                                                                                <div class="">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:Label ID="Label18" CssClass="label1" runat="server" Text="Alchohol:"></asp:Label>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pPp-Alch">
                                                                                                <div class="form-group">
                                                                                                    <div class="col-md-12 ">
                                                                                                        <asp:CheckBox ID="chkPrevAlch" onclick="return false" runat="server" />
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <br />
                                                                        <div class="row checkbox-adjs">
                                                                            <div class="col-xs-12 col-sm-12 col-md-6 ">
                                                                                <div class="row">
                                                                                    <div class="col-xs-12 col-sm-12 col-md-3">
                                                                                        <div class="form-group">
                                                                                            <div class="col-md-12">
                                                                                                <asp:Label ID="Label19" CssClass="label" runat="server" Text="Allergy Details:"></asp:Label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-md-8">
                                                                                        <div class="">
                                                                                            <div class="col-md-12">
                                                                                                <asp:TextBox ID="txtPrevAllergy" ReadOnly="true" onkeyup="CheckCharacterMedicine(this,250);"
                                                                                                    runat="server" CssClass="form-control multitextarea allergytext" TextMode="MultiLine"
                                                                                                    MaxLength="500"></asp:TextBox>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-6 ">
                                                                                <div class="row">
                                                                                    <div class="col-xs-12 col-sm-12 col-md-3">
                                                                                        <div class="form-group">
                                                                                            <div class="col-md-12">
                                                                                                <asp:Label ID="Label20" CssClass="label" runat="server" Text="Habits/Chronic"></asp:Label>
                                                                                                 <asp:Label ID="Label21" CssClass="label" runat="server" Text="Details:"></asp:Label>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div class="col-md-8">
                                                                                        <div class="">
                                                                                            <div class="col-md-12">
                                                                                                <asp:TextBox ID="txtPrevHabits" ReadOnly="true" onkeyup="CheckCharacterMedicine(this, 500);"
                                                                                                    runat="server" CssClass="form-control multitextarea" TextMode="MultiLine" MaxLength="500"></asp:TextBox>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <br />
                                                                        <%--<div class="col-md-12">
                                                                            <div class="plabelFull lbl-pervisdetail-adj PVPPLabel lbl-PV-adj">
                                                                                Personal Visit Details:
                                                                                </div>
                                                                        </div>--%>
                                                                    </div>
                                                                    
                                                                    <div class="row">
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lbl_Height" CssClass="label" runat="server" Text="Height:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetHeight" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lbl_Weight" CssClass="label" runat="server" Text="Weight:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetWeight" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lbl_Pulse" CssClass="label" runat="server" Text="Pulse:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetPulse" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lblBloodPressure" CssClass="label" runat="server" Text="BP:"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetBloodPressure" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lbl_Sugar" CssClass="label" runat="server" Text="Sugar:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetSugar" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-md-2">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lbl_TH" CssClass="label" runat="server" Text="TH:" Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetTHtext" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <br />
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="row">
                                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                                    <%--<div class="pull-left">
                                                                                        <asp:Label ID="lblShowSymptom" Visible="false" runat="server" CssClass="label" Text="Symptoms:"></asp:Label>
                                                                                    </div>--%>
                                                                                    <br />
                                                                                    <div class="table-responsive">
                                                                                        <asp:GridView ID="grdPreviousSymptoms" AutoGenerateColumns="false" runat="server"
                                                                                            Width="100%">
                                                                                            <Columns>
                                                                                                <asp:TemplateField HeaderText="Symptoms" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                                    <ItemTemplate>
                                                                                                        <asp:Label ID="lblSymptoms" CssClass="label1" runat="server" Text='<%# Eval("Complaint_Description")%>'></asp:Label>
                                                                                                    </ItemTemplate>
                                                                                                    <ItemStyle Width="300px"></ItemStyle>
                                                                                                </asp:TemplateField>
                                                                                            </Columns>
                                                                                            <EmptyDataTemplate>
                                                                                                <center>
                                                                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                            </EmptyDataTemplate>
                                                                                            <AlternatingRowStyle BackColor="White" />
                                                                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                        </asp:GridView>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div class="row">
                                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                                   <%-- <div class="pull-left">
                                                                                        <asp:Label ID="lblShowDisease" Visible="false" runat="server" CssClass="label" Text="Disease:"></asp:Label>
                                                                                    </div>--%>
                                                                                    <br />
                                                                                    <div class="table-responsive">
                                                                                        <asp:GridView ID="grdPreviousDisease" runat="server" AutoGenerateColumns="false"
                                                                                            Width="100%">
                                                                                            <Columns>
                                                                                                <asp:TemplateField HeaderText="Disease" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                                    <ItemTemplate>
                                                                                                        <asp:Label ID="lblDisease" CssClass="label1" runat="server" Text='<%# Eval("Desease_Description")%>'></asp:Label>
                                                                                                    </ItemTemplate>
                                                                                                    <ItemStyle Width="300px"></ItemStyle>
                                                                                                </asp:TemplateField>
                                                                                            </Columns>
                                                                                            <EmptyDataTemplate>
                                                                                                <center>
                                                                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                            </EmptyDataTemplate>
                                                                                            <AlternatingRowStyle BackColor="White" />
                                                                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                        </asp:GridView>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="row">
                                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                                   <%-- <div class="pull-left">
                                                                                        <asp:Label ID="lblShowDressing" Visible="false" runat="server" CssClass="label" Text="Dressing:"></asp:Label>
                                                                                    </div>--%>
                                                                                    <br />
                                                                                    <div class="table-responsive">
                                                                                        <asp:GridView ID="grdDreessing" runat="server" AutoGenerateColumns="false" Width="100%">
                                                                                            <Columns>
                                                                                                <asp:TemplateField HeaderText="Dressing" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                                    <ItemTemplate>
                                                                                                        <asp:Label ID="lblDressing" runat="server" CssClass="label1" Text='<%# Eval("LongDressing_Description")%>'></asp:Label>
                                                                                                    </ItemTemplate>
                                                                                                    <ItemStyle Width="300px"></ItemStyle>
                                                                                                </asp:TemplateField>
                                                                                            </Columns>
                                                                                            <EmptyDataTemplate>
                                                                                                <center>
                                                                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                            </EmptyDataTemplate>
                                                                                            <AlternatingRowStyle BackColor="White" />
                                                                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                        </asp:GridView>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="row">
                                                                                    <div class="col-xs-12 col-sm-12 col-md-12">
                                                                                    <br />
                                                                                    <div class="table-responsive">
                                                                                             <asp:GridView ID="grdInvestigationPV" runat="server" AutoGenerateColumns="false" Width="100%">
                                                                                                <Columns>
                                                                                                    <asp:TemplateField HeaderText="Lab Suggested" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                                        HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                                        <ItemTemplate>
                                                                                                            <asp:Label ID="lblInvestigation" runat="server" CssClass="label1" Text='<%# Eval("Lab_Test_Description")%>'></asp:Label>
                                                                                                        </ItemTemplate>
                                                                                                        <ItemStyle Width="300px"></ItemStyle>
                                                                                                    </asp:TemplateField>
                                                                                   
                                                                                                </Columns>
                                                                                                <EmptyDataTemplate>
                                                                                                    <center>
                                                                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                                </EmptyDataTemplate>
                                                                                                <AlternatingRowStyle BackColor="White" />
                                                                                                <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                                <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                                <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                                <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                            </asp:GridView>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                   
                                                                   
                                                                    <br />
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="table-responsive">
                                                                                <asp:GridView ID="grdInternalMedicine" OnRowDataBound="grdInternalMedicine_rowdatabound" runat="server" AutoGenerateColumns="false" Width="100%">
                                                                                    <Columns>
                                                                                        <asp:TemplateField HeaderText="Medicines" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">

                                                                                            <ItemTemplate>

                                                                                                <asp:Label ID="lblMedicines" runat="server" CssClass="label1" Text='<%# Eval("Medicine_Description")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="B" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblMorning" runat="server" CssClass="label1" Text='<%# Eval("Morning")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="L" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblAfternoon" runat="server" CssClass="label1" Text='<%# Eval("Afternoon")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="D" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblNight" runat="server" CssClass="label1" Text='<%# Eval("Night")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="Days" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblNoOfDays" runat="server" CssClass="label1" Text='<%# Eval("No_Of_Days")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblInstruction" runat="server" CssClass="label1" Text='<%# Eval("Instruction")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                    </Columns>
                                                                                    <EmptyDataTemplate>
                                                                                        <center>
                                                                                            <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                    </EmptyDataTemplate>
                                                                                    <AlternatingRowStyle BackColor="White" />
                                                                                    <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                    <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                    <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                    <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                </asp:GridView>
                                                                            </div>
                                                                            <br />
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="table-responsive">
                                                                                <asp:GridView ID="grdExternalMedicine" OnRowDataBound="grdExternalMedicine_rowdatabound" runat="server" AutoGenerateColumns="false" Width="100%">
                                                                                    <Columns>
                                                                                        <asp:TemplateField HeaderText="Prescriptions" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionMedicines" CssClass="label1" runat="server" Text='<%# Eval("Medicine_Name")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="B" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionMorning" CssClass="label1" runat="server" Text='<%# Eval("Morning")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="L" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionAfternoon" CssClass="label1" runat="server" Text='<%# Eval("Afternoon")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="D" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionNight" CssClass="label1" runat="server" Text='<%# Eval("Night")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="Days" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionNoOfDays" CssClass="label1" runat="server" Text='<%# Eval("No_Of_Days")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                        <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                            <ItemTemplate>
                                                                                                <asp:Label ID="lblPrescriptionInstruction" CssClass="label1" runat="server" Text='<%# Eval("Instruction")%>'></asp:Label>
                                                                                            </ItemTemplate>
                                                                                            <ItemStyle Width="300px"></ItemStyle>
                                                                                        </asp:TemplateField>
                                                                                    </Columns>
                                                                                    <EmptyDataTemplate>
                                                                                        <center>
                                                                                            <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                                                    </EmptyDataTemplate>
                                                                                    <AlternatingRowStyle BackColor="White" />
                                                                                    <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                                                    <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                                                    <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                    <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                                </asp:GridView>
                                                                            </div>
                                                                            <br />
                                                                        </div>
                                                                    </div>
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="pull-left">
                                                                               <asp:Label ID="lblobservation" runat="server" CssClass="label" Text="Observations:"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetObservation" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                       <%-- </div>--%>
                                                                        <%-- <br />
                                                                            <div class="row">--%>
                                                                        <div class="col-xs-12 col-sm-12 col-md-6">
                                                                            <div class="pull-left">
                                                                             <asp:Label ID="lblInstruction" runat="server" CssClass="label" Text="Instructions:"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblGetInstruction" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                        </div>
                                                                        <br />
                                                                         <div class="row">
                                                                             <div class="col-xs-12 col-sm-12 col-md-12">
                                                                                <div class="pull-left">
                                                                                    <asp:Label ID="lblsymptomcomment" runat="server" CssClass="label" Text="Symptom Comment:"
                                                                                        Visible="false"></asp:Label>
                                                                                    <asp:Label ID="lblGetSymptomComment" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                             </div>
                                                                        <br />
                                                                      <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-4">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="Label18AmountToCollect" runat="server" CssClass="label" Text="Billed Amount (Rs):"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblPrevAmountBilled" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                   <%-- </div>
                                                                    <br />
                                                                     <div class="row">--%>
                                                                        <div class="col-xs-12 col-sm-12 col-md-4">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="LabelAmountCollected17" runat="server" CssClass="label" Text="Collected Amount (Rs):"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblPrevAmountCollected" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                  <%--  </div>
                                                                    <br />
                                                                     <div class="row">--%>
                                                                        <div class="col-xs-12 col-sm-12 col-md-4">
                                                                            <div class="pull-left">
                                                                                <asp:Label ID="lblprevReason" runat="server" CssClass="label" Text="Reason:"
                                                                                    Visible="false"></asp:Label>
                                                                                <asp:Label ID="lblReason" runat="server" CssClass="lbl-black" Text=""></asp:Label>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <br />
                                                                    <div class="row">
                                                                        <div class="col-md-12">
                                                                        <asp:Button ID="btnshowlabresults" CssClass="btn btn-primary" runat="server" Text="Lab Results" OnClick="btnViewPreviousLabResults_Click"
                                                                                         Visible="false" />
                                                                         <asp:Button ID="btnClosePreviousVisit" OnClick="btnImg_ClosePreviousVisit_Click" CssClass="btn btn-primary" runat="server" Text="Close" />
                                                                          
                                                                        </div>
                                                                    </div>
                                                                    <br />
                                                                </div>
                                                                <!----------------col 10 end--------------->
                                                            </div>
                                                            <!----------------row end ---------------->
                                                        </div>
                                                        <!----------------col 12 end--------------->
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <asp:Button ID="btnClose2" runat="server" Text="Close" Style="visibility: hidden" />
                                </asp:Panel>
                            </ContentTemplate>
                        </asp:UpdatePanel>
        <br>
        <br>
   <%-- </div>--%>
        <asp:UpdatePanel ID="UpdatePanel15" runat="server">
                                <ContentTemplate>
                                    <cc6:ModalPopupExtender ID="ViewPreviousLabReports" BehaviorID="pvmp" runat="server"
                                        PopupControlID="Panel1" TargetControlID="Button3" CancelControlID="ImageButtonCancel"
                                        BackgroundCssClass="Background">
                                    </cc6:ModalPopupExtender>
                                    <asp:Button ID="Button3" runat="server" Text="" Style="visibility: hidden" />
                                    <asp:Panel ID="Panel1" runat="server" CssClass="Popup" align="center" Style="display: none;">
                                        <div class="modal-dialog viewlabpopup">
                                            <div class="modal-content compounder-modal-dialog-adjs">
                                                <div class="modal-header">
                                                    <asp:UpdatePanel ID="UpdatePanel16" runat="server">
                                                        <ContentTemplate>
                                                            <asp:ImageButton ID="ImageButtonCancel" runat="server" ImageUrl="../images/close_btn_blue.png"  OnClick="btnImg_CloseViewpreviouslabresults_Click"
                                                                CssClass="imgbtn"/>
                                                        </ContentTemplate>
                                                    </asp:UpdatePanel>
                                                </div>
                                                <div class="table-responsive">
                                                    <div class="modal-body maxheight">
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <div class="row">
                                                                    <div class="col-md-3">
                                                                        <asp:Label ID="Label35" runat="server" CssClass="labelbold pull-left" Text="Lab Doctor Name:"></asp:Label>
                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <asp:Label ID="lblgetdoctorPV" runat="server" CssClass="lbl-black pull-left"></asp:Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <br />
                                                            <div class="col-md-12">
                                                                <div class="row">
                                                                    <div class="col-md-3">
                                                                        <asp:Label ID="Label41" runat="server" CssClass="labelbold pull-left" Text="Lab Name:"></asp:Label>
                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <asp:Label ID="lblgetlabPV" runat="server" CssClass="lbl-black pull-left"></asp:Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <br />
                                                            <div class="col-md-12">
                                                                <div class="row">
                                                                    <div class="col-md-3">
                                                                        <asp:Label ID="Label44" runat="server" CssClass="labelbold pull-left" Text="Report Date:"></asp:Label>
                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <asp:Label ID="lblgetReportdatePV" runat="server" CssClass="lbl-black pull-left"></asp:Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <br />
                                                        </div>
                                                        <br />
                                                        <asp:GridView ID="grdPreviousVisitsLabResults" runat="server" AutoGenerateColumns="false" Width="100%"
                                                            Height="70px">
                                                            <Columns>
                                                                <asp:TemplateField HeaderText="Sr." HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                    <ItemTemplate>
                                                                        <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                                                    </ItemTemplate>
                                                                    <ItemStyle Width="3%" />
                                                                </asp:TemplateField>
                                                                <asp:TemplateField HeaderText="Lab Test Name" ItemStyle-Width="20%" ItemStyle-VerticalAlign="Middle"
                                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                    <ItemTemplate>
                                                                        <asp:Label ID="lblPrescriptionMedicinesPV" runat="server" CssClass="label1" Text='<%# Eval("Lab_Test_Description")%>'></asp:Label>
                                                                    </ItemTemplate>
                                                                </asp:TemplateField>
                                                                <asp:TemplateField HeaderText="Parameter Name" ItemStyle-Width="20%" ItemStyle-VerticalAlign="Middle"
                                                                    HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                    <ItemTemplate>
                                                                        <asp:Label ID="lblPrescriptionMorningPV" runat="server" CssClass="label1" Text='<%# Eval("Parameter_Name")%>'></asp:Label>
                                                                    </ItemTemplate>
                                                                </asp:TemplateField>
                                                                <asp:TemplateField HeaderText="Parameter Value" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle"
                                                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                    <ItemTemplate>
                                                                        <asp:Label ID="lblParameterValuePV" runat="server" CssClass="label1" Text='<%# Eval("Test_Parameter_Value")%>'></asp:Label>
                                                                    </ItemTemplate>
                                                                </asp:TemplateField>
                                                            </Columns>
                                                            <EmptyDataTemplate>
                                                                <center>
                                                                <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label></center>
                                                            </EmptyDataTemplate>
                                                            <AlternatingRowStyle BackColor="White" />
                                                            <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                            <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                                            <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                            <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                        </asp:GridView>
                                                        <br />
                                                        <br />
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <asp:Button ID="btnclosePreLabresults" CssClass="btn btn-primary" runat="server" Text="Close" OnClick="btnImg_CloseViewpreviouslabresults_Click"/>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <asp:Button ID="Button4" runat="server" Text="Close" Style="visibility: hidden" />
                                    </asp:Panel>
                                </ContentTemplate>
                            </asp:UpdatePanel>


 
        <div class="row" id="PrintPres" style="display:none">
            <div class="col-md-8 col-md-offset-2">
                <div class="row">
                    <div class="col-md-12">
                        <asp:Panel ID="pnlContents" runat="server">
                      
                           <div class="row pull-right">
                            
                                     <div class="col-md-6">
                                     <b> <asp:Label ID="Label5" CssClass="label" style="float:right; font-size:16px;" Text="Dr Kishor A. Palande" runat="server"></asp:Label></b> 
                                       <br />

                                          <asp:Label ID="Label22" CssClass="label" style="float:right; font-size:13px;" Text="M.B.B.S. F.C.G.P  D.N.B.(Family Medicine)" runat="server"></asp:Label>
                                            
                                       <br />

                                    
                                             <asp:Label ID="Label24" CssClass="label" style="float:right; font-size:13px;" Text="Reg No 34506" runat="server"></asp:Label>
                                      
                                       <br />
                                       <br />
                                       <asp:Label ID="Label25" CssClass="label" style="float:right; font-size:13px;" Text="279 Shukrawar Peth,Pune 411002." runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label26" CssClass="label" style="float:right; font-size:13px;" Text="Tel.:(020)24470139" runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label27" CssClass="label" style="float:right; font-size:13px;" Text="1405,Kasba Peth,Pune 411011" runat="server"></asp:Label>
                                      
                                       <br />
                                       <br />
                                     
                                    <asp:Label ID="lblDatePrintpres" CssClass="label" style="float:right; font-size:14px;" runat="server"></asp:Label>
                                     </div>
                            </div>
                         
                            <br />
                            <br />
                             <div class="row">
                            
                                <div class="col-md-10">
                                 <asp:Label ID="Label28" CssClass="label" Text="Patient Name:" runat="server"></asp:Label>
                                <b>   <asp:Label ID="LabelpatientNameprint" CssClass="label" runat="server"></asp:Label></b> 
                                </div>
                            </div>
                            <br />
                         
                            <br />
                            <asp:UpdatePanel ID="UpdatePanel3" runat="server">
                                <ContentTemplate>
                                    <div class="row">
                                        <div class="col-md-12">
                                         <u>  <asp:Label ID="Label30" CssClass="label" runat="server" Text="Prescription"></asp:Label></u> 
                                              <asp:Label ID="lblpreslegends" CssClass="label" runat="server" Text="(B - Breakfast, L - Lunch, D - Dinner)"></asp:Label>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="table-responsive">
                                                <div class="adjs-textbox">
                                                <asp:GridView ID="grd_PrescriptionPrint" OnRowDataBound="grd_PrescriptionPrint_rowdatabound" runat="server" BorderColor="Gray" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                Style="font-weight: 500; font-size:12px;" Width="90%" HeaderStyle-HorizontalAlign="Left" CellSpacing="10">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                
                                                    <asp:TemplateField HeaderText="Medicines"  ItemStyle-Width="45%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                               
                                                            <asp:Label ID="lblPrescription" runat="server" CssClass="label" style="font-size:13px;" Text='<%# Bind("Medicine_Name") %>'></asp:Label>
                                                            <asp:HiddenField ID="hdnVisitDate" Value='<%# Bind("Visit_Date") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnPatientVisitNo" Value='<%# Bind("Patient_Visit_No") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnShiftId" Value='<%# Bind("Shift_ID") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnClinicId" Value='<%# Bind("Clinic_ID") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnDoctorId" Value='<%# Bind("Doctor_ID") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnPatientId" Value='<%# Bind("Patient_ID") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnMedicineName" Value='<%# Bind("Medicine_Name") %>' runat="server" />
                                                            <asp:HiddenField ID="hdnBrandName" Value='<%# Bind("Brand_Name") %>' runat="server" />
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="B" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresMorning" runat="server" CssClass="label1" Text='<%# Bind("Morning") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="L" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresAfternoon" runat="server" CssClass="label1" Text='<%# Bind("Afternoon") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="D" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresNight" runat="server" CssClass="label1" Text='<%# Bind("Night") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Days" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresNo_Of_Days" runat="server" CssClass="label1" Text='<%# Bind("No_Of_Days") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="25%" ItemStyle-VerticalAlign="Middle">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresInstruction" runat="server" CssClass="label1" Text='<%# Bind("Instruction") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                </Columns>
                                                <EmptyDataTemplate>
                                                    <center>
                                                <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label>
                                            </center>
                                                </EmptyDataTemplate>

                                            
                                            </asp:GridView>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-10">
                                            <asp:Label ID="Label31" CssClass="label" runat="server" Text=""></asp:Label>
                                        </div>
                                    </div>
                                    <br />
                                    
                                </ContentTemplate>
                            </asp:UpdatePanel>
                            <br />
                                                          <br />
                                <br />
                          <%--  <div class="row">
                                <div class="col-md-1">
                                    <asp:Label ID="Label13" CssClass="label" runat="server" Text="Remark :"></asp:Label>
                                </div>
                                <div class="col-md-4 txtalignfee">
                                    <asp:Label ID="lblRemark" CssClass="label1" runat="server"></asp:Label>
                                </div>
                                <br />
                                <br />

                            </div>--%>
                         <%--   <div class="row">
                             <div class="col-md-10">
                                            <asp:Label ID="Label32" CssClass="label" runat="server" Text="System generated prescription. Not valid unless signed by Doctor"></asp:Label>
                                        </div>
                                        </div>--%>
                        </asp:Panel>
                        <br />
                        <div class="row">
                    
                            <center>
                           <%-- <asp:Button ID="btnPrintPreview" CssClass="btn btn-primary" runat="server" Text="Print Preview"
                                OnClick="btnPrintPreview_Click" OnClientClick="return PrintPanel();" />--%>
                            <asp:Button ID="btnClose" CssClass="btn btn-primary" runat="server" Text="Close"
                                OnClick="btnClose_Click" />
                        </center>
                        </div>
                        <br />
                        <br />
                    </div>
                </div>
            </div>
        </div>


        <div class="row" id="PrintInvest"  style="display:none">
            <div class="col-md-8 col-md-offset-2">
                <div class="row">
                    <div class="col-md-12">
                        <asp:Panel ID="pnlInvest" runat="server">
                      
                           <div class="row pull-right">
                            
                                     <div class="col-md-6">
                                      <b> <asp:Label ID="Label33" CssClass="label" style="float:right; font-size:16px;" Text="Dr Kishor A. Palande" runat="server"></asp:Label></b>
                                       <br />
                                          <asp:Label ID="Label34" CssClass="label" style="float:right; font-size:13px;" Text="M.B.B.S. F.C.G.P  D.N.B.(Family Medicine)" runat="server"></asp:Label>
                                       <br />

                                       
                                             <asp:Label ID="Label36" CssClass="label" style="float:right; font-size:13px;" Text="Reg No 34506" runat="server"></asp:Label>
                                      
                                       <br />
                                       <br />
                                       <asp:Label ID="Label37" CssClass="label" style="float:right; font-size:13px;" Text="279 Shukrawar Peth,Pune 411002." runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label38" CssClass="label" style="float:right; font-size:13px;" Text="Tel.:(020)24470139" runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label39" CssClass="label" style="float:right; font-size:13px;" Text="1405,Kasba Peth,Pune 411011" runat="server"></asp:Label>
                                      
                                       <br />
                                       <br />
                                        
                                   <asp:Label ID="lblDatePrintInvest" CssClass="label" style="float:right; font-size:14px;" runat="server"></asp:Label>
                                     </div>
                            </div>
                          <%-- <br />
                            <div class="row">
                            
                                <div class="col-md-10">
                                  <asp:Label ID="Label3" CssClass="label" Text="Doctor Name:" runat="server"></asp:Label>
                                    <asp:Label ID="lblDoctorName" CssClass="label" runat="server"></asp:Label>
                                </div>
                            </div>--%>
                            <br />
                           <br />
                             <div class="row">
                            
                                <div class="col-md-10">
                                 <asp:Label ID="Label40" CssClass="label" Text="Patient Name:" runat="server"></asp:Label>
                                  <b>  <asp:Label ID="LabelInvestPatientName" CssClass="label" runat="server"></asp:Label></b>
                                </div>
                            </div>
                            <br />
                          <%--  <div class="row">
                                <div class="col-md-6 col-xm-6">
                                    <asp:Label ID="Label7" CssClass="label" runat="server" Text="Date :"></asp:Label>
                                    <asp:Label ID="lblDate" CssClass="label" runat="server"></asp:Label>
                                      <asp:Label ID="Label10" CssClass="label" Visible="false" runat="server" Text="Time :"></asp:Label>
                                  
                                      <asp:Label ID="lblTime" Visible="false" CssClass="label" runat="server"></asp:Label>
                                </div>
                           
                            </div>--%>
                            
                         
                            <br />
                            <asp:UpdatePanel ID="UpdatePanel5" runat="server">
                                <ContentTemplate>
                                    <div class="row">
                                        <div class="col-md-10">
                                          <u>  <asp:Label ID="Label42" CssClass="label" runat="server" Text="Advised Investigation"></asp:Label></u>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-10">
                                            <div class="table-responsive">
                                                <div class="adjs-textbox">
                                                <asp:GridView ID="grd_Investigation" runat="server" BorderColor="Gray" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                Style="font-weight: 500; font-size:12px;" Width="55%">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                 <asp:TemplateField  ItemStyle-Width="2%" 
                                    ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                                    <asp:TemplateField  ItemStyle-Width="40%" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPrescription" runat="server" CssClass="label1"  Style="font-size:16px;" Text='<%# Bind("Lab_Test_Description") %>'></asp:Label>
                                                           
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                  
                                                </Columns>
                                                <EmptyDataTemplate>
                                                    <center>
                                                <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label>
                                            </center>
                                                </EmptyDataTemplate>
                                               <%-- <AlternatingRowStyle BackColor="White" />
                                                <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                <HeaderStyle BackColor="#2461BF" Font-Bold="True" ForeColor="Black" />
                                                <PagerSettings Mode="NextPreviousFirstLast" />
                                                <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                <RowStyle BackColor="#EFF3FB" />
                                                <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />--%>
                                            </asp:GridView>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-10">
                                            <asp:Label ID="Label43" CssClass="label" runat="server" Text=""></asp:Label>
                                        </div>
                                    </div>
                                    <br />
                                    
                                </ContentTemplate>
                            </asp:UpdatePanel>
                            <br />
                           <br />
                                <br />
                            <%--<div class="row">
                                <div class="col-md-1">
                                    <asp:Label ID="Label13" CssClass="label" runat="server" Text="Remark :"></asp:Label>
                                </div>
                                <div class="col-md-4 txtalignfee">
                                    <asp:Label ID="lblRemark" CssClass="label1" runat="server"></asp:Label>
                                </div>
                                <br />
                                <br />
                     
                            </div>--%>
                             <%--  <div class="row">
                             <div class="col-md-10">
                                            <asp:Label ID="Label44" CssClass="label" runat="server" Text="System generated investigation. Not valid unless signed by Doctor"></asp:Label>
                                        </div>
                                        </div>--%>
                        </asp:Panel>
                        <br />
                        <div class="row">
                    
                            <center>
                           <%-- <asp:Button ID="btnPrintPreview" CssClass="btn btn-primary" runat="server" Text="Print Preview"
                                OnClick="btnPrintPreview_Click" OnClientClick="return PrintPanel();" />--%>
                            <asp:Button ID="Button2" CssClass="btn btn-primary" runat="server" Text="Close"
                                OnClick="btnClose_Click" />
                        </center>
                        </div>
                        <br />
                        <br />
                    </div>
                </div>
            </div>
        </div>
        
   <%-- </div>--%>
</asp:Content>
