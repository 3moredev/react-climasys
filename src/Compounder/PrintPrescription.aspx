<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage/CMS.Master" AutoEventWireup="true"
    CodeBehind="PrintPrescription.aspx.cs" Inherits="ClinicManagementSystem.Compounder.PrintPrescription" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            PrintPanel();
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
    </script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="title-breadcrumb-option-demo" class="page-title-breadcrumb">
        <div class="page-header Page_Title_Align">
            <div class="page-title">
                Print Prescription</div>
            <ol class="breadcrumb page-breadcrumb pull-right">
                <li><i class="fa fa-home"></i>&nbsp;<asp:HyperLink ID="HyperLinkPR" NavigateUrl="CompounderDashBoard.aspx"
                    runat="server">Home</asp:HyperLink>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;
                    <%--   <i class="fa fa-home"></i>&nbsp;<a href="OperatorDashboard.aspx">Home</a>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;--%>
                </li>
                <li class="hidden">
                    <asp:HyperLink ID="HyperLink1" NavigateUrl="#" runat="server">  Print Prescription</asp:HyperLink>&nbsp;&nbsp;<i
                        class="fa fa-angle-right"></i>&nbsp;&nbsp;
                    <%--    <a href="#">Today's Visit</a>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;--%>
                </li>
                <li class="active"></li>
            </ol>
        </div>
        <div class="clearfix">
            <div class="error-box">
                <asp:Label ID="lblErrorMessage" class="error-box" runat="server" Text=""></asp:Label>
            </div>
        </div>
    </div>
    <br />
    <div class="page-content">
        <br />
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <div class="row">
                    <div class="col-md-12">
                        <asp:Panel ID="pnlContents" runat="server">
                        <div class="row">
                            
                                <div class="col-md-10">
                                <asp:Label ID="lblClinicName" Visible="false" CssClass="label" runat="server"></asp:Label>
                                </div>
                            </div>
                            <br />
                           <div class="row pull-right">
                            
                                     <div class="col-md-6">
                                     <b>  <asp:Label ID="Label6" CssClass="label" style="float:right; font-size:16px;" Text="Dr Kishor A. Palande" runat="server"></asp:Label></b>
                                       <br />
                                          <asp:Label ID="Label8" CssClass="label" style="float:right;" Text="M.B.B.S.  F.C.G.P" runat="server"></asp:Label>
                                       <br />

                                        <asp:Label ID="Label9" CssClass="label" style="float:right;" Text="D.N.B.(Family Medicine)" runat="server"></asp:Label>
                                             <asp:Label ID="Label11" CssClass="label" style="float:right;" Text="Reg No 34506" runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label12" CssClass="label" style="float:right;" Text="279 Shukrawar Peth,Pune 411002." runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label14" CssClass="label" style="float:right;" Text="Tel.:(020)24470139" runat="server"></asp:Label>
                                      
                                       <br />
                                       <asp:Label ID="Label15" CssClass="label" style="float:right;" Text="1405,Kasba Peth,Pune 411011" runat="server"></asp:Label>
                                      
                                       <br />
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
                             <div class="row">
                            
                                <div class="col-md-10">
                                 <asp:Label ID="Label4" CssClass="label" Text="Patient Name:" runat="server"></asp:Label>
                                    <asp:Label ID="lblPatientName" CssClass="label" runat="server"></asp:Label>
                                </div>
                            </div>
                            <br />
                         <%--   <div class="row">
                                <div class="col-md-6 col-xm-6">
                                    <asp:Label ID="Label7" CssClass="label" runat="server" Text="Date :"></asp:Label>
                                    <asp:Label ID="lblDate" CssClass="label" runat="server"></asp:Label>
                                      <asp:Label ID="Label10" CssClass="label" Visible="false" runat="server" Text="Time :"></asp:Label>
                                  
                                      <asp:Label ID="lblTime" Visible="false" CssClass="label" runat="server"></asp:Label>
                                </div>
                           
                            </div>
                            
                         --%>
                            <br />
                            <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                                <ContentTemplate>
                                    <div class="row">
                                        <div class="col-md-10">
                                            <asp:Label ID="Label1" CssClass="label" runat="server" Text="Prescription"></asp:Label>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-10">
                                            <div class="table-responsive">
                                                <div class="adjs-textbox">
                                                <asp:GridView ID="grd_Prescription" OnRowDataBound="grd_Prescription_rowdatabound" runat="server" BorderColor="Gray" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                Style="font-weight: 500; font-size:12px;" Width="55%">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                    <asp:TemplateField HeaderText="Medicines" ItemStyle-Width="40%" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPrescription" runat="server" CssClass="label1" Text='<%# Bind("Medicine_Name") %>'></asp:Label>
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
                                                    <asp:TemplateField HeaderText="B" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_center_float" ControlStyle-CssClass="cls_center_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresMorning" runat="server" CssClass="label1" Text='<%# Bind("Morning") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="L" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle"  HeaderStyle-CssClass="cls_center_float" ControlStyle-CssClass="cls_center_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresAfternoon" runat="server" CssClass="label1" Text='<%# Bind("Afternoon") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="D" ItemStyle-Width="7%" ItemStyle-VerticalAlign="Middle"  HeaderStyle-CssClass="cls_center_float" ControlStyle-CssClass="cls_center_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresNight" runat="server" CssClass="label1" Text='<%# Bind("Night") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Days" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_center_float" ControlStyle-CssClass="cls_center_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblPresNo_Of_Days" runat="server" CssClass="label1" Text='<%# Bind("No_Of_Days") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Instruction" ItemStyle-Width="40%" ItemStyle-VerticalAlign="Middle"  HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
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
                                                <AlternatingRowStyle BackColor="White" />
                                                <FooterStyle BackColor="#507CD1" Font-Bold="True" ForeColor="White" />
                                                <HeaderStyle BackColor="#507CD1" Font-Bold="True" ForeColor="Black" />
                                                <PagerSettings Mode="NextPreviousFirstLast" />
                                                <PagerStyle BackColor="#2461BF" ForeColor="White" HorizontalAlign="Center" />
                                                <RowStyle BackColor="#EFF3FB" />
                                                <SelectedRowStyle BackColor="#D1DDF1" Font-Bold="True" ForeColor="#333333" />
                                            </asp:GridView>
                                                    
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br />
                                    <div class="row">
                                        <div class="col-md-10">
                                            <asp:Label ID="Label2" CssClass="label" runat="server" Text=""></asp:Label>
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
                            <div class="row">
                             <div class="col-md-10">
                                            <asp:Label ID="Label5" CssClass="label" runat="server" Text="System generated prescription. Not valid unless signed by Doctor"></asp:Label>
                                        </div>
                                        </div>
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
    </div>
</asp:Content>
