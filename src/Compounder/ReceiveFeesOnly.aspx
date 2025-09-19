<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage/CMS.Master" AutoEventWireup="true"
    CodeBehind="ReceiveFeesOnly.aspx.cs" Inherits="ClinicManagementSystem.Compounder.ReceiveFeesOnly" %>

<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="asp" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc1" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style type="text/css">
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
        .modal-lg
        {
            width: 800px;
            margin-left: -215px;
            overflow-y: scroll;
            max-height: 85%;
        }
        @media (min-width: 768px)
        {
            .modal-dialog
            {
                width: 600px;
                /*margin: 85px auto;*/
            }
            .compounder-modal-dialog-adjs
            {
                max-height:90% !important;
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
            .modal-dialog
            {
                width: 240px;
                margin: 10px auto;
            }
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
            .modal-dialog
            {
                width: 300px;
                margin: 10px auto;
            }
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
            .modal-dialog
            {
                width: 350px;
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
                width: 360px;
                margin-left: -215px;
                overflow-y: scroll;
                max-height: 85%;
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
        }
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
        .imgbtn
        {
            height: 25px;
            width: 70px;
            float: right;
            border-width: 0px;
        }
        .modal-lg
        {
            width: 800px;
            margin-left: -215px;
            overflow-y: scroll;
            max-height: 85%;
        }
    </style>
    <script type="text/javascript">


        function ResetErrorMessage() {
            $("#ContentPlaceHolder1_lblErrorMsg").empty();

        };



        function validateForm() {

            ResetErrorMessage();
            $('#ContentPlaceHolder1_lbl_success_msg').empty();

            var str_PatientID = $('#ContentPlaceHolder1_txtsearchpatient').val();
            var str_Amount = $('#ContentPlaceHolder1_txtAmountTobeCollected').val();



            var val = 1;
            if (str_PatientID == "") {

                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(RFO_CHECKSELECT_PATIENT);
                val = 0;
            }
            else if (str_Amount == "") {
                $("#ContentPlaceHolder1_lblErrorMsg").empty();
                $("#ContentPlaceHolder1_lblErrorMsg").append(RFO_BLANKAMOUNT);
                val = 0;
            }

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

        function ClientItemSelected(sender, e) {
            $get("<%=txtsearchpatient.ClientID %>").value = e.get_value();
        }

        $(window).load(function () {

            $(document).keydown(function (e) {
                // ESCAPE key pressed
                if (e.keyCode == 27) {
                    //alert("hi");
                    $find("mpe4").hide();
                    window.close();
                }
            });

        });





        function isNumberAmount(event, e) {

            var numbersAndWhiteSpace = /^-?\d*\.?\d*$/;
            var key = String.fromCharCode(event.which || event.keyCode);
            var charCode = (event.keyCode ? event.keyCode : event.which);
            var txt_amount = $("#ContentPlaceHolder1_txtAmountTobeCollected").val();
            

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
            var str_amount_expression = /^(-?\d{0,4})((\.(\d{0,2})?)?)$/;
            var str = /^\d{0,4}\.?\d{1,2}$/;


            var dec_amount_topaid = $("#ContentPlaceHolder1_txtAmountTobeCollected").val();


            if (str_amount_expression.test(dec_amount_topaid) == false) {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").append(RP_INVALID_AMOUNT);
                return false;
            }
            else {
                $("#ContentPlaceHolder1_lblAmountToBePaidErr").empty();

                return true;
            }
        }
    </script>
    
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="title-breadcrumb-option-demo" class="page-title-breadcrumb">
        <div class="row">
            <div class="page-header Page_Title_Align">
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <div class="page-heading">
                        Adhoc Payment</div>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <span class="errorBox">
                        <asp:Label ID="lblErrorMsg" runat="server"></asp:Label>
                    </span>
                    <asp:Label ID="lbl_success_msg" runat="server" CssClass="success-message-box"></asp:Label>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <ol class="breadcrumb page-breadcrumb pull-right">
                        <li><i class="fa fa-home"></i>&nbsp;<asp:HyperLink ID="HyperLinkPR" NavigateUrl="CompounderDashBoard.aspx"
                            runat="server">Home</asp:HyperLink>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;
                        </li>
                        <li class="hidden">
                            <asp:HyperLink ID="HyperLink1" NavigateUrl="#" runat="server">Adhoc Payment</asp:HyperLink>&nbsp;&nbsp;<i
                                class="fa fa-angle-right"></i>&nbsp;&nbsp; </li>
                        <li class="active"></li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <br />
    <div class="container-fluid">

        <div class="row">
          <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
          <div class="row">
            <div class="col-md-10 col-md-offset-1">
            
                <div class="row">
                   <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                       <div class="row">
                    <div class="col-md-6 col-lg-7">
                        <div class="input-icon right">
                            <i class="fa fa-search"></i>
                            <asp:TextBox ID="txtsearchpatient" runat="server" autocomplete="on" placeholder="Search with Patient ID / Patient Name / Mobile Number / Folder Number"
                                class="form-control"></asp:TextBox>
                            <asp:AutoCompleteExtender ID="txtsearchpatient_AutocompleteExtender" runat="server"
                                Enabled="true" TargetControlID="txtsearchpatient" ServiceMethod="SearchPatientDetails"
                                ServicePath="~/Services/CMSServices.asmx" OnClientItemSelected="ClientItemSelected"
                                MinimumPrefixLength="1">
                            </asp:AutoCompleteExtender>
                        </div>
                    </div>
                    <div class="col-md-2 col-lg-2">
                        <asp:Button ID="btnBookPatient" runat="server" OnClick="btnBookPatient_Click"
                            Text="Select Patient" class="btn btn-primary" />
                        <%--<button type="submit" class="btn btn-primary">Book Appointment</button>--%>
                    </div>
                     <div class="col-md-2 col-lg-2">
                    <%--<div class="input-icon right">--%>
                        <asp:TextBox ID="txtAppointmentDate" runat="server" ReadOnly placeholder="DD-MMM-YYYY"
                            class="form-control"></asp:TextBox>
                   <%-- </div>--%>
                   </div>
                </div>
                </div>
                </div>
                <br />
                <%--<div class="row">
                    <div class="col-md-4">
                        <div class="pull-left">
                            <asp:Label ID="Label6" runat="server" CssClass="label" Text="Date :"></asp:Label>
                            <asp:Label ID="lblDate" CssClass="label" runat="server"></asp:Label>
                        </div>
                    </div>
                </div>--%>
                <br />
                <div class="row">
                    <br />
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="row">
                            <%--<div class="col-xs-12 col-sm-12 col-md-6">
                                <div class="row">
                                    <div class="col-xs-12 col-sm-6 col-md-6">
                                        <asp:Label ID="lblpatient" CssClass="label" runat="server" Text="Patient ID :"></asp:Label>
                                        <asp:Label ID="lblpatientID" CssClass="label1" runat="server" Text=""></asp:Label>
                                    </div>
                                    <div class="col-xs-12 col-sm-6 col-md-6">
                                        <asp:Label ID="lblFolder" CssClass="label" runat="server" Text="Folder Number :"></asp:Label>
                                        <asp:Label ID="lblFolderno" CssClass="label1" runat="server" Text=""></asp:Label>
                                    </div>
                                </div>
                            </div>--%>
                            <div class="col-xs-12 col-sm-12 col-md-12">
                                <div class="row">
                                    <div class="col-xs-12 col-sm-6 col-md-6">
                                        <asp:Label ID="lblPatient_Name" CssClass="labelbold" runat="server" Text="Patient Name: "></asp:Label>
                                        <b>
                                            <asp:Label ID="lblpatientname" CssClass="lbl-black" runat="server" Text=""></asp:Label></b>
                                        <asp:Label ID="lblVisitNo" Visible="false" CssClass="label" runat="server"></asp:Label>
                                    </div>
                                    <div class="col-xs-12 col-sm-6 col-md-6">
                                        <asp:Label ID="lblPatientAge" CssClass="labelbold" runat="server" Text="Patient Age/DOB:"></asp:Label>
                                        <asp:Label ID="lblPatient_Age" CssClass="lbl-black" runat="server" Text=""></asp:Label><b>/</b>
                                        <asp:Label ID="lblPatient_Birthdate" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                     <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="row">
                        <br />
                            <div class="col-xs-12 col-sm-12 col-md-6">
                                <div class="row">
                                    <div class="col-xs-12 col-sm-6 col-md-12">
                                        <asp:Label ID="lblfolderbalance" CssClass="labelbold" runat="server" Text="Folder Balance:"></asp:Label>
                                        <asp:Label ID="lblbalance" CssClass="lbl-black" runat="server" Text=""></asp:Label>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
                        <div class="row">
                        <br />
                            <div class="col-xs-12 col-sm-12 col-md-12">
                                <div class="row">
                                    <div class="col-xs-12 col-sm-6 col-md-6">
                                        <asp:Label ID="updatedfolderbal" CssClass="labelbold" Visible="false" runat="server" Text="Updated Folder Balance:"></asp:Label>
                                        <asp:Label ID="lbl_getupdatedbalance" CssClass="lbl-black" runat="server" Visible="false" Text=""></asp:Label>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <br />
                <br />
                <br />
                <br />
                <div class="row">
                    <div class="col-md-2">
                        <div class="pull-left">
                            <asp:Label ID="Label1" CssClass="labelbold" runat="server" Text="Collected Amount(Rs):"></asp:Label>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <asp:TextBox ID="txtAmountTobeCollected" onkeypress="return isNumberAmount(event);"
                            class="form-control" runat="server" MaxLength="7"></asp:TextBox>
                    </div>
                     <div class="col-md-1">
                        <asp:Label ID="lblcomment" CssClass="labelbold" runat="server" Text="Comment:"></asp:Label>
                    </div>
                    <div class="col-md-4">
                         <asp:TextBox ID="txtcomment"
                            class="form-control multitextarea" MaxLength="500" runat="server" TextMode="MultiLine"></asp:TextBox>
                    </div>
                    <div class="col-md-2">
                        <asp:Label ID="lblAmountToBePaidErr" Text="" class="error-box" runat="server"></asp:Label>
                    </div>
                </div>
                <br />
                <br />
                <div class="row">
                    <div class="col-md-12">
                        <center>
                                <asp:Button ID="btnmedicinefesscollectionpopup" CssClass="btn btn-primary" 
                                    runat="server" Text="View Fees Collection" 
                                    onclick="btnmedicinefesscollectionpopup_Click"></asp:Button>
                                
                                <asp:Button ID="btnSubmit" CssClass="btn btn-primary" OnClientClick="return !!(validateForm() & validate_feestobecollected());" OnClick="btnSubmit_Click" runat="server" Text="Submit"
                                    />
                                
                               
                                <asp:Button ID="btnCancel" CssClass="btn btn-primary" OnClick="btnCancel_Click" runat="server" Text="Cancel"
                                    />
                            </center>
                    </div>
                </div>
                <br />
                <br />
            </div>
            </div>
        </div>
    </div>
    <cc1:ModalPopupExtender ID="MedicineFeesCollection_popup" BehaviorID="mpe4" runat="server"
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
                                        Fees Collection</div>
                                    <br />
                                    <div class="col-md-12">
                                        <div class="sublabelFull2" style="text-align: center">
                                           <b><asp:Label ID="lbl_Patientname" runat="server"></asp:Label></b> </div>
                                        <asp:Label ID="lbl_errormsg" CssClass="error-box" runat="server"></asp:Label>
                                        <div class="table-responsive">
                                            <asp:GridView ID="grd_Patient_Visit" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                Style="font-weight: 500;" Width="100%" ShowFooter="true" OnRowDataBound="grd_Patient_Visit_RowDataBound">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                    <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="60%" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lbl_PatientName" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
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
                                           <b>Family (Visit wise)</b> 
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
                                                            <asp:Label ID="lbl_PatientName" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
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
                                         <b> Family (FY wise)</b> 
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
</asp:Content>
