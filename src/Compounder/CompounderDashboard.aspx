<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage/CMS.Master" AutoEventWireup="true"
    CodeBehind="CompounderDashboard.aspx.cs" Inherits="ClinicManagementSystem.Compounder.CompounderDashboard" %>

<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc1" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc4" %>
<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="asp" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <style>
        
          .autocomplete_completionListElement
        {
            margin: 0px !important;
            background-color: inherit;
            color: windowtext;
            border: buttonshadow;
            border-width: 1px;
            border-style: solid;
            cursor: 'default';
            overflow: auto;
            height: 200px;
            font-family: Tahoma;
            font-size: small;
            text-align: left;
            list-style-type: none;
        }
        /* AutoComplete highlighted item */
        .autocomplete_highlightedListItem
        {
            background-color: #ffff99;
            color: black;
            padding: 1px;
        }
        
        /* AutoComplete item */
        .autocomplete_listItem
        {
            background-color: window;
            color: windowtext;
            padding: 1px;
        }
        .Background
        {
            background-color: Black;
            filter: alpha(opacity=90);
            opacity: 0.8;
        }
        .Popup
        {
            width: 700px;
            height: 700px;
        }
        .imgbtn
        {
            height: 25px;
            width: 70px;
            float: right;
            border-width: 0px;
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
            height: 700px;
        }
        .autocomplete_completionListElement
        {
            margin: 0px !important;
            background-color: inherit;
            color: windowtext;
            border: buttonshadow;
            border-width: 1px;
            border-style: solid;
            cursor: 'default';
            overflow: auto;
            height: 200px;
            font-family: Tahoma;
            font-size: small;
            text-align: left;
            list-style-type: none;
        }
        /* AutoComplete highlighted item */
        .autocomplete_highlightedListItem
        {
            background-color: #ffff99;
            color: black;
            padding: 1px;
        }
        
        /* AutoComplete item */
        .autocomplete_listItem
        {
            background-color: window;
            color: windowtext;
            padding: 1px;
        }
        
        table>tbody>tr>td>a
        {
                padding: 5px;
        }
        @media (min-width: 768px)
        {
        .compounder-modal-dialog-adjs {
            width: 850px !important;
            margin: 30px -126px;
        }
        .lbl_habit_allergy
            {
                float: left;
            }
        }
        
        
        @media only screen and (min-width: 768px) and (max-width: 768px) 
        {
            .compounder-modal-dialog-adjs
            {
                 width: 733px !important;
            }
        }
        @media only screen and (min-width: 800px) and (max-width: 800px) 
        {
            .compounder-modal-dialog-adjs
            {
                 width: 733px !important;
            }
        }
        /***27 sep***/
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
                top: 128px;
            }
            table td span
            {
                font-size: 11px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
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
                top: 44px;
            }
            table td span
            {
                font-size: 12px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
                margin-left: 90px;
            }
            .lbl_habit_allergy
            {
                float: none;
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
                top: 35px;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
            }
            .lbl_habit_allergy
            {
                float: none;
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
                top: 128px;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
            }
            .lbl_habit_allergy
            {
                float: none;
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
                top: 128px;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
                margin-left: 160px;
            }
            .lbl_habit_allergy
            {
                float: none;
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
                top: 44px;
            }
            table td span
            {
                font-size: 13px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
                margin-left: 215px;
            }
            .lbl_habit_allergy
            {
                float: none;
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
                top: 73px;
            }
            table td span
            {
                font-size: 14px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
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
                top: 128px;
            }
            table td span
            {
                font-size: 14px;
            }
            table td
            {
                width: 25%;
            }
            .lbl_patient_folder
            {
                float: initial;
            }
            .btn-pop-up
            {
                margin-left: 0%;
            }
            .lbl-lab-test
            {
            }
            .lbl_habit_allergy
            {
                float: none;
            }
        
        
        }
        @media only screen and (max-width: 1440px) and (min-width: 1366px)
        {
            .modal-lg popup
            {
                width: 1256px;
                margin-left: -280px !important;
                overflow-y: scroll;
                max-height: 85%;
            }
            .popupadj
            {
                 margin-left: -280px !important;
            }
        }
        
        
    </style>
    <script type="text/javascript">
        function ClientItemSelected(sender, e) {
            $get("<%=txtsearchpatient.ClientID %>").value = e.get_value();
        }
        $(window).load(function () {

            $(document).keyup(function (e) {
                if (e.keyCode == 27) {

                    $find("ghh").hide();
                    $find("mpe4").hide(); 
                }
            });
        });
        </script>

</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="title-breadcrumb-option-demo" class="page-title-breadcrumb">
    <div class="row">
        <div class="page-header Page_Title_Align">
            <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3"> 
                   <div class="page-heading">
                 Patient Appointments
                </div>
                </div>
                  <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                     <span class="errorBox">
                            <asp:Label ID="lblErrorMsg"  runat="server"></asp:Label>
                    </span>
                </div>
              <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
            <ol class="breadcrumb page-breadcrumb pull-right">
                <li><i class="fa fa-home"></i>&nbsp;<asp:HyperLink ID="HyperLinkPR" NavigateUrl="~/Compounder/CompounderDashboard.aspx"
                    runat="server">Home</asp:HyperLink>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;
                   </li>
                <li class="hidden">
                    <asp:HyperLink ID="HyperLink1" NavigateUrl="#" runat="server">Patient Appointments</asp:HyperLink>&nbsp;&nbsp;<i
                        class="fa fa-angle-right"></i>&nbsp;&nbsp;
                   </li>
                
            </ol>
            </div>
        </div>
      
        </div>
    </div>
    <br />
    <%--<div class="container">--%>

        <div class="page-content">
     <div class="col-md-12">
            <div class="row">
                <div class="col-md-9 text-box-adjs">
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
                <div class="col-md-2 adjustddl">
                    <asp:Button ID="btnSearch" runat="server" Text="Search" OnClick="btnSearch_Click"  class="btn btn-primary"  />
                </div>
                </div>
                </div>
            <div class="col-md-12">
                <div class="panel-body">
                 
                 <div class="table-responsive">
                 <asp:Timer ID="GridTimer" runat="server" OnTick="GridTimer_Tick">
                 </asp:Timer>
                    <asp:GridView ID="grd_CompounderVisitData" runat="server" AutoGenerateColumns="False"
                        ShowHeaderWhenEmpty="true" OnRowCommand="grd_CompounderVisitData_RowCommand"
                        Width="100%" Height="50px" CellPadding="4" ForeColor="#333333" AllowPaging="True"
                        PageSize="20" OnPageIndexChanging="grdAccessModule_PageIndexChanging" 
                         OnRowDataBound="grd_CompounderVisitData_rowdatabound" CssClass="grid">
                        <AlternatingRowStyle BackColor="White" />
                        <Columns>
                            <asp:TemplateField HeaderText="Sr." ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                <ItemTemplate>
                                    <asp:Label ID="lblSrNo" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                    <asp:HiddenField ID="hdnStatusId" Value='<%# Bind("Status_ID") %>' runat="server" />
                                     <asp:HiddenField ID="hdnCurrentVisitNo" Value='<%# Bind("Patient_Visit_No") %>' runat="server" />
                                     <asp:HiddenField ID="hdnPatientId" Value='<%# Bind("Patient_ID") %>' runat="server">
                                    </asp:HiddenField>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="230px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                <ItemTemplate>
                                    <%--<asp:LinkButton ID="lnkName" CssClass="label1" style="text-decoration: underline" CommandName="view" CommandArgument='<%# Eval("Patient_ID") %>'
                                        Text='<%# Bind("Name") %>' runat="server"></asp:LinkButton>--%>
                                        <%--<asp:Label ID="lnkName" CssClass="label1" runat="server" Text='<%# Bind("Name") %>'></asp:Label>--%>
                                        <asp:LinkButton ID="lnkName" CssClass="label1" style="text-decoration: underline" CommandName="export" Text='<%# Bind("Name") %>' runat="server" OnClick="lnkName_Click"></asp:LinkButton>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField HeaderText="Folder Number" ItemStyle-Width="220px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                <ItemTemplate>
                                    <!--<asp:Label ID="lblFolderNo" CssClass="label1" runat="server" Text='<%# Bind("Folder_No") %>'></asp:Label>-->
                                    <asp:LinkButton ID="lnkFolder" CssClass="label1" Style="text-decoration: underline"
                                        CommandName="export" Text='<%# Bind("Folder_No") %>' runat="server" OnClick="lnkPatientFolder_Click"></asp:LinkButton>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField HeaderText="Mobile Number" ItemStyle-Width="100px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                <ItemTemplate>
                                    <asp:Label ID="lblMobileNumber" CssClass="label1" runat="server" Text='<%# Bind("Mobile_1") %>'></asp:Label>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField HeaderText="Visit Time" ItemStyle-Width="60px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                <ItemTemplate>
                                    <asp:Label ID="lblVisitTime" CssClass="label1" runat="server" Text='<%# Bind("Visit_Time") %>'></asp:Label>
                                </ItemTemplate>
                            </asp:TemplateField>
                            <asp:TemplateField HeaderText="Status" ItemStyle-Width="150px" ItemStyle-VerticalAlign="Middle"
                                HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                <ItemTemplate>
                                    <asp:Label ID="lblRegistrationNo" CssClass="label1" runat="server" Text='<%# Bind("Status_Description") %>'></asp:Label>
                                </ItemTemplate>
                            </asp:TemplateField>
                             <asp:TemplateField HeaderText="Action" ItemStyle-Width="8%">
                                <ItemTemplate>
                                    <asp:LinkButton ID="lnkAction" CssClass="label1" Style="width: 100%" runat="server" CommandName="view" CommandArgument='<%# Eval("Patient_ID") %>'> 
                                    <i class="fa fa-forward"></i></asp:LinkButton>
                                    
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
                        <PagerSettings Mode="Numeric" />
                        <pagerstyle BackColor="#3a6f9f" ForeColor="White" HorizontalAlign="Center"></pagerstyle>
                        <%--<PagerSettings Mode="NextPreviousFirstLast" />
                        <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" CssClass="cssPager" />--%>
                        <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" CssClass="cssPager" />
                        <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                    </asp:GridView>
                 </div>
                </div>
            </div>
        </div>


        <asp:UpdatePanel ID="UpdatePanel3" runat="server">
            <ContentTemplate>
                <cc1:ModalPopupExtender ID="FamilyFolder_Pop_up" BehaviorID="ghh" runat="server" PopupControlID="Panel1"
                    TargetControlID="btn_ptpr" CancelControlID="btnImg_CloseFamilyFolder" BackgroundCssClass="Background">
                </cc1:ModalPopupExtender>
                <asp:Button ID="btn_ptpr" runat="server" Text="" Style="visibility: hidden" />
                <asp:Panel ID="Panel1" runat="server" CssClass="Popup" align="center" Style="display: none">
                    <div class="modal-dialog compounder-modal-dialog-adjs">
                        <div class="modal-content" id="modelPrevious">
                            <div class="modal-header">
                                <asp:UpdatePanel ID="UpdatePanel7" runat="server">
                                    <ContentTemplate>
                                        <asp:ImageButton ID="btnImg_CloseFamilyFolder" runat="server" ImageUrl="../images/close_btn_blue.png"
                                            CssClass="imgbtn" />
                                    </ContentTemplate>
                                </asp:UpdatePanel>
                            </div>
                            <div class="table-responsive">
                                <div class="modal-body maxheight">
                                  <div class="table-responsive">
                                                    <div class="row">
                                                        <div class="col-md-12">
                                                         <div class="sublabelFull2" style="text-align: center">
                                                             <b>   <asp:Label ID="Label2" CssClass="label1" style="font-weight: bold; font-size: 16px;" runat="server" Text="Folder Number :"></asp:Label></b>
                                              <asp:Label ID="lblfolder" CssClass="lbl-black" runat="server"></asp:Label>
                                              </div>
                                  
                               <br />
                                    <asp:GridView ID="grdFamilyFolder" runat="server" AutoGenerateColumns="false" Width="100%"
                                        Height="70px">
                                        <Columns>
                                            <asp:TemplateField HeaderText="Sr." ItemStyle-ForeColor="#075398" ItemStyle-VerticalAlign="Middle"
                                                HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="5%" />
                                            </asp:TemplateField>
                                            <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="40%"  HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblPatientName" runat="server" CssClass="label1" Text='<%# Eval("Name")%>'></asp:Label>
                                                </ItemTemplate>
                                              
                                            </asp:TemplateField>
                                            <asp:TemplateField HeaderText="Mobile Number" ItemStyle-Width="10px" HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblMobileNumber" runat="server" CssClass="label1" Text='<%# Eval("Mobile_1")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="220px"></ItemStyle>
                                            </asp:TemplateField>
                                           <%-- <asp:TemplateField HeaderText="Date of Birth" ItemStyle-Width="50px"  HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblDateofBirth" runat="server" CssClass="label1" Text='<%# Eval("Date_Of_Birth","{0:dd-MMM-yyyy}")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="300px"></ItemStyle>
                                            </asp:TemplateField>--%>
                                             <asp:TemplateField HeaderText="Age" ItemStyle-Width="50px"  HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblAge" runat="server" CssClass="label1" Text='<%# Eval("AgeYearsIntRound")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="100px"></ItemStyle>
                                            </asp:TemplateField>
                                            <asp:TemplateField HeaderText="Gender" ItemStyle-Width="20px"  HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblGender" runat="server" CssClass="label1" Text='<%# Eval("Gender_Description")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="100px"></ItemStyle>
                                            </asp:TemplateField>
                                            <asp:TemplateField HeaderText="Area" ItemStyle-Width="30px"  HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblArea" runat="server" CssClass="label1" Text='<%# Eval("Area_Name")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="450px"></ItemStyle>
                                            </asp:TemplateField>
                                            <%--<asp:TemplateField HeaderText="Folder Number" ItemStyle-Width="300px">
                                                <ItemTemplate>
                                                    <asp:Label ID="lblfolderNumber" runat="server" CssClass="label1" Text='<%# Eval("Folder_No")%>'></asp:Label>
                                                </ItemTemplate>
                                                <ItemStyle Width="300px"></ItemStyle>
                                            </asp:TemplateField>--%>
                                        </Columns>
                                        <EmptyDataTemplate>
                                            <center>
                                                <asp:Label ID="lblNoRecordFound" CssClass="label1" runat="server">---</asp:Label></center>
                                        </EmptyDataTemplate>
                                        <AlternatingRowStyle BackColor="White" />
                                        <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                        <HeaderStyle BackColor="#507CD1" ForeColor="White" Font-Names="" />
                                        <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                        <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                    </asp:GridView>
                                    <br />
                                    </div>
                                    </div>
                                        <br />
                                                                        <div class="row">
                                                                            <div class="col-md-12">
                                                                             <asp:Button ID="btnClose" OnClick="btnImg_CloseFamilyFolder_Click" CssClass="btn btn-primary" runat="server" Text="Close" />
                                                                            </div>
                                                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <asp:Button ID="Button1" runat="server" Text="Close" Style="visibility: hidden" />
                </asp:Panel>
            </ContentTemplate>
        </asp:UpdatePanel>
        
        <asp:UpdatePanel ID="UpdatePanel4" runat="server">
            <Triggers>
                <asp:PostBackTrigger ControlID="grdFilesUpload" />
            </Triggers>
            <ContentTemplate>
                <cc4:ModalPopupExtender ID="View_Registration_Pop_UP" BehaviorID="mpe4" runat="server"
                    PopupControlID="Panel5" TargetControlID="btnView_Registration" CancelControlID="btnImg_ViewRegistration"
                    BackgroundCssClass="Background">
                </cc4:ModalPopupExtender>
                <asp:Button ID="btnView_Registration" runat="server" Text="" Style="visibility: hidden" />
                <asp:Panel ID="Panel5" runat="server" CssClass="Popup" align="center" Style="display: none">
                    <div class="modal-dialog modal-lg-popup popupadj modal-popup-FR-compounder">
                        <div class="modal-content">
                            <div class="modal-header">
                                <asp:UpdatePanel ID="UpdatePanel10" runat="server">
                                    <ContentTemplate>
                                        <asp:ImageButton ID="btnImg_ViewRegistration" runat="server" ImageUrl="../images/close_btn_blue.png"
                                            CssClass="imgbtn" />
                                    </ContentTemplate>
                                </asp:UpdatePanel>
                            </div>
                            <div class="table-responsive">
                                <div class="modal-body">
                                    <div class="page-content1">
                                        <div class="col-md-12">
                                            <div class="plabelFull">
                                                <span data-toggle="collapse" data-target="#collapseExample1" aria-expanded="true"
                                                    aria-controls="collapseExample1">Personal Details <i class="fa fa-caret-down collapsearr">
                                                    </i></span>
                                            </div>
                                            <br />
                                            <br />
                                            <div id="collapseExample1" class="collapse in">
                                                <div class="row">
                                                    <div class="col-md-12 col-md-offset-0">
                                                       
                                                                        <div class="row">
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblpatientid" class="form-control cls_right_aligned lbl-patient-id-adj FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-4">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblfolderid" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <div class="input-icon right">
                                                                                            <i class="fa fa-calendar"></i>
                                                                                            <asp:Label ID="lblRegistrationDate" class="form-control FR-PP-fa-calender-label FR_PP_Folder"
                                                                                                runat="server" Text=""></asp:Label>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-1">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbl_reg_year" class="form-control cls_right_aligned FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <div class="input-icon right">
                                                                                            <i class="fa fa-calendar"></i>
                                                                                            <asp:Label ID="lblDateOfBirth" class="form-control FR-PP-fa-calender-label FR_PP_Folder"
                                                                                                runat="server" Text=""></asp:Label>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-1">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblAge" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row">
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbllname" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblfname" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblmname" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblGender" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblResiNumber" class="form-control cls_right_aligned FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblmobileno" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row">
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbladdress1" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbladdress2" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <div class="input-icon right">
                                                                                            <i class="fa fa-search"></i>
                                                                                            <asp:Label ID="lblArea" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                                Text=""></asp:Label>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblcity" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <div class="input-icon right">
                                                                                            <asp:HiddenField ID="hdnStateId" runat="server" />
                                                                                            <asp:Label ID="lblState" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                                Text=""></asp:Label>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblPinCode" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row">
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblBloodgroup" class="form-control cls_left_aligned FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblHeight1" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblWeight1" class="form-control cls_right_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblemail" class="form-control cls_left_aligned FR_PP_Folder" runat="server"
                                                                                            Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblEmergencyContactName" class="form-control cls_left_aligned FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblEmergencyContactNo" class="form-control cls_right_aligned FR_PP_Folder"
                                                                                            runat="server" Text=""></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                        <div class="row">
                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                <div class="form-group">
                                                                   
                                                                    <div class="col-md-12">
                                                                        <asp:Label ID="lblError1" class="error-box" runat="server" Text=""></asp:Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-xs-12 col-sm-12 col-md-2">
                                                                <div class="form-group">
                                                                   
                                                                    <div class="col-md-12">
                                                                        <asp:Label ID="Label14" CssClass="label lbl-adjst" runat="server" Style="" Text="Attach Documents:"></asp:Label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="col-xs-12 col-sm-12 col-md-8">
                                                                <div class="form-group">
                                                                   
                                                                    <div class="col-md-12">
                                                                        <div class="table-responsive">
                                                                            <asp:GridView ID="grdFilesUpload" runat="server" AutoGenerateColumns="false" ShowHeaderWhenEmpty="true"
                                                                                Width="100%" Height="60px" CellPadding="4" ForeColor="#333333" AllowPaging="true"
                                                                                PageSize="20">
                                                                                <AlternatingRowStyle BackColor="White" />
                                                                                <Columns>
                                                                                    <asp:TemplateField HeaderText="Sr" ItemStyle-Width="20px" ItemStyle-VerticalAlign="Middle"
                                                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                                                        <ItemTemplate>
                                                                                            <asp:Label ID="lblSrNo" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                                                                        </ItemTemplate>
                                                                                    </asp:TemplateField>
                                                                                    <asp:TemplateField HeaderText="Document Name" ItemStyle-Width="300px" ItemStyle-VerticalAlign="Middle"
                                                                                        HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                                                        <ItemTemplate>
                                                                                            <asp:HiddenField ID="hdnDocumentID" Value='<%# Bind("Patient_DocumentID") %>' runat="server" />
                                                                                            <asp:LinkButton ID="lnkDocumentname" CssClass="label1" OnClick="lnkDocumentName_Click"
                                                                                                Style="text-decoration: underline" CommandName="export" runat="server" Text='<%#Bind("Document") %>'></asp:LinkButton>
                                                                                            <asp:Label ID="lblDocumentname" CssClass="label1" runat="server"></asp:Label>
                                                                                        </ItemTemplate>
                                                                                        <ItemStyle Width="300px"></ItemStyle>
                                                                                    </asp:TemplateField>
                                                                                </Columns>
                                                                                <EmptyDataTemplate>
                                                                                    <center>
                                                                                        <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">---</asp:Label>
                                                                                    </center>
                                                                                </EmptyDataTemplate>
                                                                                <AlternatingRowStyle BackColor="White" />
                                                                                <FooterStyle BackColor="#3a6f9f" Font-Bold="True" ForeColor="White" />
                                                                                <HeaderStyle BackColor="#3a6f9f" ForeColor="White" Font-Names="" />
                                                                                <PagerStyle BackColor="#284775" ForeColor="White" HorizontalAlign="Center"></PagerStyle>
                                                                              
                                                                                <RowStyle BackColor="#EFF3FB" Font-Names="" HorizontalAlign="Center" />
                                                                                <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                                                            </asp:GridView>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="plabelFull">
                                                <span data-toggle="collapse" data-target="#collapseExample3" aria-expanded="true"
                                                    aria-controls="collapseExample3">Medical Details <i class="fa fa-caret-down collapsearr">
                                                    </i></span>
                                            </div>
                                            <br />
                                            <br />
                                            <div id="collapseExample3" class="collapse">
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <div class="viewpsublabelFull">
                                                          
                                                            Personal Medical Details</div>
                                                    </div>
                                                </div>
                                                <div class="row">
                                                  
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <br />
                                                            <br />
                                                            <div class="row">
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblChrDisease" CssClass="label plbl-adjst" runat="server" Text="Chronic Disease: "></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row palignrowchk">
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 hyp-lbl-adjst hyp-adjst">
                                                                                <div class="">
                                                                                    <div class="col-sm-12">
                                                                                        <asp:Label ID="lblhyper" CssClass="labelbold" runat="server" Text="Hypertension:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 phyp">
                                                                                <div class="form-group">
                                                                                    <div class="col-sm-12">
                                                                                        <asp:CheckBox ID="chkPerHypertension" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2">
                                                                                <div class="">
                                                                                    <div class="col-sm-12">
                                                                                        <asp:Label ID="lblDiab" CssClass="labelbold" runat="server" Text="Diabetes:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-1 col-md-1 pDiabetes_chk ">
                                                                                <div class="form-group">
                                                                                    <div class="col-sm-12">
                                                                                        <asp:CheckBox ID="chkPerDiabetes" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 viewcho-lbl-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblCholestrrol" CssClass="labelbold" runat="server" Text=" Cholesterol:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pChol">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerCholesterol" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row palignrowchk">
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 ihd-lbl-adjst ihd-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblIH" CssClass="labelbold" runat="server" Text="IHD:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pIHD_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerIhd" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2">
                                                                                <div class="">
                                                                                    <div class="">
                                                                                        <asp:Label ID="lblBAsthma" CssClass="labelbold lable-adjs" runat="server" Text="BR-Asthma:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pAsthma_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerBrAsthma" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 viewth-lbl-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblPerTh" CssClass="labelbold" runat="server" Text="TH:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pTH_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerTh" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblhabits" CssClass="label plbl-adjst lbl_habit_allergy" runat="server"
                                                                                        Text="Habits:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row palignrowchk">
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 smoke-lbl-adjst smoke-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblSmoking" CssClass="labelbold" runat="server" Text="Smoking:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pSmoking_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerSmoking" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbltobacco" CssClass="labelbold" runat="server" Text="Tobacco:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pTobacco_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerTobacco" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 viewalch-lbl-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblalcohol" CssClass="labelbold" runat="server" Text="Alcohol:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pAlcohol_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkPerAlcohol" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblallergies" CssClass="label plbl-adjst lbl_habit_allergy" runat="server"
                                                                                        Text="Allergies:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtAllergyArea" MaxLength="250" runat="server" ReadOnly="true" TextMode="MultiLine"
                                                                                        class="form-control multitextarea"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblCurrentDisease1" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Current Disease:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst2">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtCurrentDisease" MaxLength="250" ReadOnly="true" runat="server"
                                                                                        class="form-control multitextarea" TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <br />
                                                            <br />
                                                            <div class="row">
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblAdditionalComments" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Disease Comments:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtChronicArea" MaxLength="500" runat="server" ReadOnly="true" TextMode="MultiLine"
                                                                                        class="form-control multitextarea"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblAddictionComment" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Habit Comments:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtHabits" MaxLength="500" runat="server" ReadOnly="true" class="form-control multitextarea"
                                                                                        TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblPreviousSergery" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Previous Surgeries:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtPreviousSergery" MaxLength="250" ReadOnly="true" runat="server"
                                                                                        class="form-control multitextarea" TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblMedicines" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Current Medicines:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst2">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtMedicines" MaxLength="250" runat="server" ReadOnly="true" class="form-control multitextarea"
                                                                                        TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <!------row end ----->
                                                        </div>
                                                        <!------col-6 end ----->
                                                    </div>
                                                    <br />
                                                    <br />
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="viewpsublabelFull">
                                                            
                                                                Family Medical Details</div>
                                                        </div>
                                                    </div>
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <br />
                                                            <br />
                                                            <div class="row">
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblfamilychronicdisease" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Chronic Disease:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row palignrowchk">
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 hyp-lbl-adjst vhyp-adjst2">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblfhypertension" CssClass="labelbold" runat="server" Text="Hypertension:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pFamily_hyp">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyHypertension" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lbl" CssClass="labelbold" runat="server" Text="Diabetes:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pFamily_Diabetes_chk ">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyDiabetes" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 viewFamilycho-lbl-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblFamilyCholesterol" CssClass="labelbold" runat="server" Text="Cholesterol:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pChol">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyCholesterol" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3 hidden-xs hidden-sm">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="row palignrowchk">
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 ihd-lbl-adjst vihd-adjst2">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblFamilyIHD" CssClass="labelbold" runat="server" Text="IHD:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pFamily_IHD_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyIHD" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2">
                                                                                <div class="">
                                                                                    <div class="">
                                                                                        <asp:Label ID="lblFamilyAsthma" CssClass="labelbold lable-adjs lable-adjs-br" runat="server" Text="BR-Asthma:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pFamily_Asthma_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyAsthma" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-4 col-md-2 viewFamilyth-lbl-adjst">
                                                                                <div class="">
                                                                                    <div class="col-md-12">
                                                                                        <asp:Label ID="lblFamilyTH" CssClass="labelbold" runat="server" Text="TH:"></asp:Label>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div class="col-xs-6 col-sm-2 col-md-1 pFamily_TH_chk">
                                                                                <div class="form-group">
                                                                                    <div class="col-md-12">
                                                                                        <asp:CheckBox ID="chkFamilyTH" runat="server" Enabled="false" />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblFamilyHistory" CssClass="label plbl-adjst" runat="server" Style=""
                                                                                        Text="Medical/Family" />
                                                                                    <asp:Label ID="lblFamilyHistory1" CssClass="label plbl-adjst" runat="server" Style=""
                                                                                        Text="History:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst2">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtFamilyHistory" MaxLength="150" runat="server" ReadOnly="true"
                                                                                        class="form-control multitextarea" TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <br />
                                                            <br />
                                                            <div class="row">
                                                                <div class="col-xs-12 col-sm-12 col-md-12">
                                                                    <div class="row">
                                                                        <div class="col-xs-12 col-sm-12 col-md-3">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:Label ID="lblAdditionalCommentFamily" CssClass="label plbl-adjst" Style="" runat="server"
                                                                                        Text="Additional Comments:"></asp:Label>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div class="col-xs-12 col-sm-12 col-md-8 ptxt-box-adjst">
                                                                            <div class="form-group">
                                                                                <div class="col-md-12">
                                                                                    <asp:TextBox ID="txtFamilyChronicDisease" MaxLength="500" runat="server" class="form-control multitextarea"
                                                                                        ReadOnly="true" TextMode="MultiLine"></asp:TextBox>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <!------ collapseend---------->
                                                <!------ row end ----->
                                            </div>
                                            <!------ col-6 end ----->
                                             <br />
                                                                        <div class="row">
                                                                            <div class="col-md-12">
                                                                             <asp:Button ID="btnCloseViewRegistration" OnClick="btnImg_CloseViewRegistration_Click" CssClass="btn btn-primary" runat="server" Text="Close" />
                                                                            </div>
                                                                        </div>
                                        </div>
                                        <!------ collapse mian row end ----->
                                    </div>
                                    <!------ collapse  end ----->
                                </div>
                            </div>
                        </div>
                    </div>
                    <asp:Button ID="btnClose4" runat="server" Text="Close" Style="visibility: hidden" />
                </asp:Panel>
            </ContentTemplate>
        </asp:UpdatePanel>

    <%--</div>--%>
</asp:Content>
