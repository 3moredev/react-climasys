import React, { useEffect, useMemo, useState } from "react";
import { buildReceiptPrintHTML, getHeaderImageUrl } from "../utils/printTemplates";
import { receiptService, SaveReceiptPayload } from "../services/receiptService";

export interface PrintReceiptFormValues {
    receiptNo: string;
    receiptDate: string;
    receiptAmount: string;
    paymentBy: string;
    paymentRemark: string;
    details: string;
}

interface PrintReceiptPopupProps {
    open: boolean;
    onClose: () => void;
    onSubmit?: (values: PrintReceiptFormValues) => void;
    patientName?: string;
    patientAge?: number;
    patientGender?: string;
    billingData: {
        receiptNo?: string;
        feesCollected?: string;
        billed?: string;
        paymentRemark?: string;
    };
    paymentByLabel?: string;
    detailsText?: string;
    buildReceiptPayload?: (details: string) => SaveReceiptPayload | null;
}

const fieldLabelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 600,
    fontSize: 12,
    marginBottom: 4,
    color: "#1c1c1c",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    border: "1px solid #8dd5d8",
    padding: "8px 10px",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    fontFamily: "'Roboto', sans-serif",
};

const disabledInputStyle: React.CSSProperties = {
    ...inputStyle,
    backgroundColor: "#f5f5f5",
    color: "#8d8d8d",
    cursor: "not-allowed",
};

const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
];

const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const helper = (n: number): string => {
        if (n < 20) return ones[n];
        if (n < 100) return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + helper(n % 10) : ""}`;
        if (n < 1000) return `${helper(Math.floor(n / 100))} Hundred${n % 100 ? " " + helper(n % 100) : ""}`;
        if (n < 100000) return `${helper(Math.floor(n / 1000))} Thousand${n % 1000 ? " " + helper(n % 1000) : ""}`;
        if (n < 10000000) return `${helper(Math.floor(n / 100000))} Lakh${n % 100000 ? " " + helper(n % 100000) : ""}`;
        return `${helper(Math.floor(n / 10000000))} Crore${n % 10000000 ? " " + helper(n % 10000000) : ""}`;
    };

    return helper(num);
};

const convertAmountToWords = (amount: number): string => {
    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);
    const rupeeWords = rupees ? `${numberToWords(rupees)} Rupees` : "";
    const paiseWords = paise ? `${numberToWords(paise)} Paise` : "";

    if (rupees && paise) {
        return `${rupeeWords} And ${paiseWords} Only`;
    }
    if (rupees) {
        return `${rupeeWords} Only`;
    }
    if (paise) {
        return `${paiseWords} Only`;
    }
    return "Zero Rupees Only";
};

// Helper function to format date as dd-mmm-yy
const formatDateDdMmmYy = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = String(date.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
};

const PrintReceiptPopup: React.FC<PrintReceiptPopupProps> = ({
    open,
    onClose,
    onSubmit,
    patientName,
    patientAge,
    patientGender,
    billingData,
    paymentByLabel,
    detailsText,
    buildReceiptPayload,
}) => {
    const initialValues = useMemo<PrintReceiptFormValues>(() => {
        const today = new Date();
        return {
            receiptNo: billingData?.receiptNo || "",
            receiptDate: today.toISOString().slice(0, 10),
            receiptAmount: billingData?.feesCollected || billingData?.billed || "",
            paymentBy: paymentByLabel || "",
            paymentRemark: billingData?.paymentRemark || "",
            details: detailsText || "",
        };
    }, [billingData?.billed, billingData?.feesCollected, billingData?.paymentRemark, billingData?.receiptNo, detailsText, patientGender, paymentByLabel]);

    const [formValues, setFormValues] = useState<PrintReceiptFormValues>(initialValues);
    const [isSavingReceipt, setIsSavingReceipt] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [statusType, setStatusType] = useState<"success" | "error" | null>(null);

    useEffect(() => {
        if (open) {
            setFormValues(initialValues);
            setStatusMessage(null);
            setStatusType(null);
            setIsSavingReceipt(false);
        }
    }, [open, initialValues]);

    if (!open) return null;

    const handleChange = (field: keyof PrintReceiptFormValues, value: string) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        const hasExistingReceipt = !!formValues.receiptNo?.trim();
        if (hasExistingReceipt || !buildReceiptPayload) {
            if (hasExistingReceipt) {
                setStatusType("success");
                setStatusMessage("Using existing receipt.");
            }
            onSubmit?.(formValues);
            triggerPrint(formValues);
            return;
        }

        const payload = buildReceiptPayload(formValues.details);
        if (!payload) {
            setStatusType("error");
            setStatusMessage("Receipt details are incomplete.");
            return;
        }

        setIsSavingReceipt(true);
        setStatusMessage(null);
        setStatusType(null);

        try {
            const receiptResponse = await receiptService.saveReceipt(payload);
            const updatedValues: PrintReceiptFormValues = {
                ...formValues,
                receiptNo: receiptResponse.receiptNumber || formValues.receiptNo,
                receiptDate: receiptResponse.receiptDate
                    ? new Date(receiptResponse.receiptDate).toISOString().slice(0, 10)
                    : formValues.receiptDate,
            };
            setFormValues(updatedValues);
            setStatusType("success");
            setStatusMessage("Receipt generated successfully.");
            onSubmit?.(updatedValues);
            triggerPrint(updatedValues);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to generate receipt.";
            setStatusType("error");
            setStatusMessage(message);
        } finally {
            setIsSavingReceipt(false);
        }
    };

    const triggerPrint = (values: PrintReceiptFormValues) => {
        if (typeof window === "undefined") return;
        const headerImageUrl = getHeaderImageUrl();
        const formattedDate = values.receiptDate
            ? new Date(values.receiptDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "-";
        const amountNumeric = parseFloat(values.receiptAmount) || 0;
        const amountInWords = convertAmountToWords(amountNumeric);
        const durationText = formattedDate ? `${formattedDate} to ${formattedDate}` : "-";

        const receiptHtml = buildReceiptPrintHTML({
            headerImageUrl,
            receiptNo: values.receiptNo || "-",
            receiptDate: formattedDate,
            patientName: patientName || "",
            patientGender: patientGender || "",
            patientAge: patientAge ? `${patientAge} Y` : "",
            paymentBy: values.paymentBy || "-",
            amount: amountNumeric.toFixed(2),
            amountInWords,
            durationText,
            details: values.details || "-",
        });

        const iframe = document.createElement("iframe");
        iframe.style.position = "fixed";
        iframe.style.right = "0";
        iframe.style.bottom = "0";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        iframe.srcdoc = receiptHtml;
        document.body.appendChild(iframe);

        iframe.onload = () => {
            try {
                const win = iframe.contentWindow;
                if (win) {
                    win.focus();
                    win.print();
                }
            } finally {
                setTimeout(() => {
                    if (iframe.parentNode) {
                        iframe.parentNode.removeChild(iframe);
                    }
                }, 1000);
            }
        };
    };

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100000,
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            <div
                style={{
                    width: "520px",
                    maxWidth: "95%",
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    maxHeight: "90vh",
                }}
            >
                <div
                    style={{
                        background: "#fff",
                        padding: "15px 20px",
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12,
                        borderBottom: "1px solid #eee",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <h3
                            style={{
                                margin: 0,
                                color: "#000",
                                fontSize: 18,
                                fontWeight: 700,
                            }}
                        >
                            Reciept Details
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                backgroundColor: "#1976d2",
                                border: "none",
                                borderRadius: 8,
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1565c0";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#1976d2";
                            }}
                            aria-label="Close receipt details"
                        >
                            ×
                        </button>
                    </div>
                </div>
                <div style={{ padding: "22px 26px", overflowY: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                        <label style={fieldLabelStyle}>Receipt No</label>
                        <input
                            type="text"
                            value={formValues.receiptNo}
                            disabled
                            style={disabledInputStyle}
                        />
                    </div>
                    <div>
                        <label style={fieldLabelStyle}>Receipt Date</label>
                        <input
                            type="text"
                            value={formatDateDdMmmYy(formValues.receiptDate)}
                            disabled
                            style={disabledInputStyle}
                        />
                    </div>
                    <div>
                        <label style={fieldLabelStyle}>Receipt Amount (Rs)</label>
                        <input
                            type="text"
                            value={formValues.receiptAmount}
                            disabled
                            style={disabledInputStyle}
                        />
                    </div>
                    <div>
                        <label style={fieldLabelStyle}>Payment By</label>
                        <input
                            type="text"
                            value={formValues.paymentBy}
                            disabled
                            style={disabledInputStyle}
                        />
                    </div>
                    <div>
                        <label style={fieldLabelStyle}>Payment Remark</label>
                        <input
                            type="text"
                            value={formValues.paymentRemark}
                            disabled
                            style={disabledInputStyle}
                        />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                        <label style={fieldLabelStyle}>Details</label>
                        <textarea
                            value={formValues.details}
                            onChange={(e) => handleChange("details", e.target.value)}
                            style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                        />
                    </div>
                </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 26,
                        }}
                    >
                        <div style={{ flex: 1, fontSize: 12, color: statusType === "error" ? "#d32f2f" : "#2e7d32" }}>
                            {statusMessage}
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={isSavingReceipt}
                            style={{
                                minWidth: 120,
                                padding: "10px 22px",
                                borderRadius: 4,
                                border: "none",
                                cursor: isSavingReceipt ? "not-allowed" : "pointer",
                                fontWeight: 600,
                                fontSize: 13,
                                backgroundColor: isSavingReceipt ? "#9e9e9e" : "#1976d2",
                                color: "#fff",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                transition: "background-color 0.2s",
                            }}
                        >
                            {isSavingReceipt ? "Generating..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintReceiptPopup;

