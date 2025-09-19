<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage/CMS.Master" AutoEventWireup="true"
    CodeBehind="DashBoard.aspx.cs" Inherits="ClinicManagementSystem.Compounder.DashBoard" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div id="title-breadcrumb-option-demo" class="page-title-breadcrumb">
        <div class="row">
            <div class="page-header Page_Title_Align">
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <div class="page-heading">
                        Daily Collection
                    </div>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
                    <span class="errorBox">
                        <asp:Label ID="lblErrorMsg" runat="server"></asp:Label>
                    </span>
                </div>
                <div class="col-xs-12 col-sm-12 col-md-3 col-lg-3">
                    <ol class="breadcrumb page-breadcrumb pull-right">
                        <li><i class="fa fa-home"></i>&nbsp;<asp:HyperLink ID="HyperLinkPR" NavigateUrl="~/Doctor/TodaysVisit.aspx"
                            runat="server">Home</asp:HyperLink>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;
                            <%--   <i class="fa fa-home"></i>&nbsp;<a href="OperatorDashboard.aspx">Home</a>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;--%>
                        </li>
                        <li class="hidden">
                            <asp:HyperLink ID="HyperLink1" NavigateUrl="#" runat="server">Daily Collection</asp:HyperLink>&nbsp;&nbsp;<i
                                class="fa fa-angle-right"></i>&nbsp;&nbsp;
                            <%--    <a href="#">Today's Visit</a>&nbsp;&nbsp;<i class="fa fa-angle-right"></i>&nbsp;&nbsp;--%>
                        </li>
                        <li class="active">Daily Collection</li>
                    </ol>
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid">
    <div class="page-content">
        <div class="Dashboardpage-content dashboard_adj">

            <div class="col-md-12">
                <div class="panel-body">
                <div class="row">
                    <div class="col-md-1">
                    <div class="pull-right">
                     <asp:Label ID="lblDiffrence" CssClass="labelbold labelfooter adjustddldashboard" runat="server" Text="Filter:"></asp:Label>
                     </div>
                    </div>
                    <div class="col-md-2">
                    <asp:DropDownList ID="ddlDiffrence" runat="server" class="form-control"
                        Style="line-height: 28px;"
                        onselectedindexchanged="ddlDiffrence_SelectedIndexChanged"  AutoPostBack="true">
                    </asp:DropDownList>
                    </div>
                    <div class="col-md-2">
                    <div class="pull-right">
                     <asp:Label ID="lbldues" CssClass="labelbold labelfooter adjustddldashboard" runat="server" Text="Amount:"></asp:Label>
                     </div>
                    </div>
                    <div class="col-md-2">
                    <asp:DropDownList ID="ddlDues" runat="server" class="form-control"
                        Style="line-height: 28px;"
                        AutoPostBack="true" onselectedindexchanged="ddlDues_SelectedIndexChanged">
                    </asp:DropDownList>
                    </div>
                    </div>
                    <br />
                    <div class="table-responsive">
                        
                     <div class="row">
                     <div class="col-md-12"> 
                        <asp:GridView ID="grdTodaysVisit" runat="server" AutoGenerateColumns="False" ShowHeaderWhenEmpty="true"
                            Style="font-weight: 500;" Width="100%" ShowFooter="true" OnRowDataBound="grdTodaysVisit_RowDataBound" AllowSorting="true" OnSorting="grdTodaysVisit_Sorting">
                            <AlternatingRowStyle BackColor="White" />
                            <Columns>
                                <asp:TemplateField HeaderText="Sr." ItemStyle-Width="5%" ItemStyle-ForeColor="#075398"
                                    ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblsrno" CssClass="label1" runat="server" Text='<%# Container.DataItemIndex + 1 %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="<u>Folder No.</u>" ItemStyle-Width="20%" SortExpression="Folder_No"
                                            ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                            <ItemTemplate>
                                                <asp:Label ID="lblFolderNo" CssClass="label1" runat="server" Text='<%# Bind("Folder_No") %>'></asp:Label>
                                            </ItemTemplate>
                                        </asp:TemplateField>
                                <asp:BoundField HeaderText="" DataField="Patient_ID" Visible="false" />
                                 <asp:TemplateField HeaderText="<u>Visit Time</u>" ItemStyle-Width="10%" SortExpression="Visit_Time"
                                    ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblVisitTime" CssClass="label1" runat="server" Text='<%# Bind("Visit_Time") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                                <asp:TemplateField HeaderText="<u>Patient Name</u>"  ItemStyle-Width="20%" SortExpression="Name"
                                    ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblPatientName" CssClass="label1" runat="server" Text='<%# Bind("Name") %>'></asp:Label>
                                    </ItemTemplate>
                                </asp:TemplateField>
                               
                                <asp:TemplateField HeaderText="Status"  ItemStyle-Width="15%"
                                    ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblStatus" CssClass="label1" runat="server" Text='<%# Bind("Status_Description") %>'></asp:Label>
                                    </ItemTemplate>
                                    <FooterTemplate>
                                        <asp:Label ID="lblTotal" CssClass="labelfooter cls_right_float" runat="server" Text="Total"></asp:Label>
                                    </FooterTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Original Billed Amount" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle"
                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                            <ItemTemplate>
                                                <asp:Label ID="lblOriginalBilledAmount" CssClass="label1" runat="server" Text='<%# Bind("Original_Billed_Amount") %>'></asp:Label>
                                            </ItemTemplate>
                                            <FooterTemplate>
                                                <asp:Label ID="lblTotalOriginalBilledAmount" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                            </FooterTemplate>
                                        </asp:TemplateField>


                                <asp:TemplateField HeaderText="Billed Amount" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle"
                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblAmountTobeCollected" CssClass="label1" runat="server" Text='<%# Bind("Fees_To_Collect") %>'></asp:Label>
                                    </ItemTemplate>
                                    <FooterTemplate>
                                        <asp:Label ID="lblTotalFeesToCollect" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                    </FooterTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Difference (Original – Billed)" ItemStyle-Width="10%"
                                            ItemStyle-VerticalAlign="Middle" HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                            <ItemTemplate>
                                                <asp:Label ID="lbldifference" CssClass="label1" runat="server" Text='<%# Bind("Diffrence") %>'></asp:Label>
                                            </ItemTemplate>
                                            <FooterTemplate>
                                                <asp:Label ID="lblTotalDifferene" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                            </FooterTemplate>
                                </asp:TemplateField>


                                <asp:TemplateField HeaderText="Collected Amount" ItemStyle-Width="15%" ItemStyle-VerticalAlign="Middle"
                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblAmountCollected" CssClass="label1" runat="server" Text='<%# Bind("Fees_Collected") %>'></asp:Label>
                                    </ItemTemplate>
                                    <FooterTemplate>
                                        <asp:Label ID="lblTotalFeesCollected" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                    </FooterTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Dues (Billed – Collected)" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle"
                                            HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                            <ItemTemplate>
                                                <asp:Label ID="lbldues" CssClass="label1" runat="server" Text='<%# Bind("DUES") %>'></asp:Label>
                                            </ItemTemplate>
                                            <FooterTemplate>
                                                <asp:Label ID="lblTotalDues" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                            </FooterTemplate>
                                </asp:TemplateField>


                                <asp:TemplateField HeaderText="Adhoc Payment" ItemStyle-Width="20%" ItemStyle-VerticalAlign="Middle"
                                    HeaderStyle-CssClass="cls_right_aligned" ControlStyle-CssClass="cls_right_float label1">
                                    <ItemTemplate>
                                        <asp:Label ID="lblAdhocPayment" CssClass="label1" runat="server" Text='<%# Bind("Adhoc_Fees") %>'></asp:Label>
                                    </ItemTemplate>
                                    <FooterTemplate>
                                        <asp:Label ID="lblTotalAdhocCollected" CssClass="labelfooter cls_right_float" runat="server"></asp:Label>
                                    </FooterTemplate>
                                </asp:TemplateField>

                                <asp:TemplateField HeaderText="Reason" ItemStyle-Width="10%" ItemStyle-VerticalAlign="Middle"
                                            HeaderStyle-CssClass="cls_left_aligned" ControlStyle-CssClass="cls_left_float label1">
                                            <ItemTemplate>
                                                <asp:Label ID="lblreason" CssClass="label1" runat="server" Text='<%# Bind("Comment") %>'></asp:Label>
                                            </ItemTemplate>
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
                     <div class="row pull-right">
                     <div class="col-md-12">  
                      <asp:Label ID="Label1" CssClass="labelfooter" Text="Total Collection" runat="server"></asp:Label>
                      <b><asp:Label ID="Label2" CssClass="label" Text="(Collected + Adhoc)Rs:" runat="server"></asp:Label></b>
                        <asp:Label ID="lblGrandTotal" CssClass="labelfooter" runat="server"></asp:Label>
                     </div>
                     </div>
                        <%-- </div>--%>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </div>
</asp:Content>
