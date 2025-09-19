<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="MedicineFeesCollection.aspx.cs"
    Inherits="ClinicManagementSystem.Compounder.MedicineFeesCollection" %>

<%@ Register Assembly="AjaxControlToolkit" Namespace="AjaxControlToolkit" TagPrefix="cc1" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html style="background-color: transparent;">
<head id="Head1" runat="server">
    <title></title>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link type="text/css" rel="stylesheet" href="../styles/bootstrap.min.css">
    <link type="text/css" rel="stylesheet" href="../styles/animate.css">
    <link type="text/css" rel="stylesheet" href="../styles/all.css">
    <link type="text/css" rel="stylesheet" href="../styles/main.css">
    <link type="text/css" rel="stylesheet" href="../styles/style-responsive.css">
    <!--SITE CSS -->
    <link type="text/css" rel="stylesheet" href="../styles/style.css">
    <!--JAVA SCRIPT PART -->
    <script type="text/javascript" src="../script/jquery-1.10.2.min.js"></script>
     <script type="text/javascript">


//     //    $(window).load(function () {

//             $(document).keydown(function (e) {
//                 // ESCAPE key pressed
//                 if (e.keyCode == 27) {
//                     alert("hi");
//                     window.close();
//                 }
//             });

//        // });
        </script>
    <style type="text/css">
        /**30 March'16 Added**/
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
</head>
<body style="background-color: transparent;">
    <form id="form1" runat="server">
    <asp:ScriptManager ID="ScriptManager1" runat="server">
    </asp:ScriptManager>
    <br />
    <br />
    <div class="modal-dialog compounder-modal-dialog-adjs">
        <div class="modal-content">
            <div class="modal-header">
                <asp:UpdatePanel ID="UpdatePanel1" runat="server">
                    <ContentTemplate>
                        <asp:ImageButton ID="btnImg_Close" runat="server" ImageUrl="../images/close_btn_blue.png"
                            CssClass="imgbtn" OnClick="btnImg_Close_Click" />
                    </ContentTemplate>
                </asp:UpdatePanel>
            </div>
            <div class="modal-body">
                <div class="col-md-6">
                    <div class="row">
                        <div class="col-md-12">
                            <div class="panel panel-blue componder-popup-adjs">
                                <div class="panel-heading">
                                    Medicines/Fees Collection</div>
                                <br />
                                <div class="col-md-12">
                                    
                                        <div class="sublabelFull2" style="text-align: center">
                                            <asp:Label ID="lblPatientname" runat="server"></asp:Label></div>
                                        <asp:Label ID="lblErrorMsg" CssClass="error-box" runat="server"></asp:Label>
                                        <div class="table-responsive">
                                            <asp:GridView ID="grd_Patient_Visit" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                                                Style="font-weight: 500;" Width="100%" ShowFooter="true" OnRowDataBound="grd_Patient_Visit_RowDataBound">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                    <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblVisitNo" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
                                                        </ItemTemplate>
                                                        <FooterTemplate>
                                                          <asp:Label ID="lbl" CssClass="label1" runat="server"></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Dates" ItemStyle-Width="50px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblDates" CssClass="label1" runat="server" Text='<%# Bind("Visit_Date","{0:dd-MMM-yyyy}") %>'></asp:Label>
                                                        </ItemTemplate>
                                                        <FooterTemplate>
                                                            <asp:Label ID="lblTotal" CssClass="label1 cls_right_float" runat="server" Text="Total"></asp:Label>
                                                     
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Bill" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblBill" CssClass="label1" runat="server" Text='<%# Bind("Bill") %>'></asp:Label>
                                                        </ItemTemplate>
                                                        <FooterTemplate>
                                                          <asp:Label ID="lblTotalBill" CssClass="label1 cls_right_float" runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Collected" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblCollected" CssClass="label1" runat="server" Text='<%# Bind("Collected") %>'></asp:Label>
                                                        </ItemTemplate>
                                                          <FooterTemplate>
                                                          <asp:Label ID="lblTotalCollected" CssClass="label1 cls_right_float" runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Balance" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblBalance" CssClass="label1 cls_right_float" runat="server" Text='<%# Bind("Balance") %>'></asp:Label>
                                                        </ItemTemplate>
                                                         <FooterTemplate>
                                                          <asp:Label ID="lblTotalBalance" CssClass="label1 cls_right_float"  runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                </Columns>
                                                <EmptyDataTemplate>
                                                    <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">No records found</asp:Label></center>
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
                                            Family(Visit wise)
                                        </div>
                                        <div class="table-responsive">
                                            <asp:GridView ID="grdFamily_patient_visit" runat="server" AutoGenerateColumns="False"
                                                ShowHeaderWhenEmpty="true" ShowFooter="true" OnRowDataBound="grdFamily_patient_visit_RowDataBound" Style="font-weight: 500;" Width="100%">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                    <asp:TemplateField HeaderText="Patient Name" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblVisitNo" CssClass="label1" runat="server" Text='<%# Bind("Full_Name") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Dates" ItemStyle-Width="50px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblDates" CssClass="label1" runat="server" Text='<%# Bind("Visit_Date","{0:dd-MMM-yyyy}") %>'></asp:Label>
                                                        </ItemTemplate>
                                                          <FooterTemplate>
                                                            <asp:Label ID="lblTotal" CssClass="label1 cls_right_float" runat="server" Text="Total"></asp:Label>
                                                     
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Bill" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblBill" CssClass="label1" runat="server" Text='<%# Bind("Bill") %>'></asp:Label>
                                                        </ItemTemplate>
                                                         <FooterTemplate>
                                                          <asp:Label ID="lblTotalBill" CssClass="label1 cls_right_float" runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Collected" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblCollected" CssClass="label1" runat="server" Text='<%# Bind("Collected") %>'></asp:Label>
                                                        </ItemTemplate>
                                                         <FooterTemplate>
                                                          <asp:Label ID="lblTotalCollected" CssClass="label1 cls_right_float" runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Balance" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblBalance" CssClass="label1" runat="server" Text='<%# Bind("Balance") %>'></asp:Label>
                                                        </ItemTemplate>
                                                         <FooterTemplate>
                                                          <asp:Label ID="lblTotalBalance" CssClass="label1 cls_right_float"  runat="server" ></asp:Label>
                                                        </FooterTemplate>
                                                    </asp:TemplateField>
                                                </Columns>
                                                <EmptyDataTemplate>
                                                    <center>
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">No records found</asp:Label></center>
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
                                <div class="col-md-6">
                                    
                                        <div class="sublabelFull2" style="text-align: center">
                                            Family(FY wise)
                                        </div>
                                        <div class="table-responsive">
                                            <asp:GridView ID="grdFeesConsolidate" runat="server" AutoGenerateColumns="False"
                                                ShowHeaderWhenEmpty="true" Style="font-weight: 500;"  Width="100%">
                                                <AlternatingRowStyle BackColor="White" />
                                                <Columns>
                                                  <asp:TemplateField HeaderText="Financial Year" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                                        <ItemTemplate>
                                                            <asp:Label ID="lblbalance" CssClass="label1" runat="server" Text='<%# Bind("Financial_Year") %>'></asp:Label>
                                                        </ItemTemplate>
                                                    </asp:TemplateField>
                                                    <asp:TemplateField HeaderText="Bill" ItemStyle-Width="30px" ItemStyle-VerticalAlign="Middle"
                                                        HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
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
                                                    <asp:Label ID="lblNoRecordFound" CssClass="label1 cls_left_float" runat="server">No records found</asp:Label></center>
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
                </div>
            </div>
        </div>
    </div>
    </form>
</body>
</html>
