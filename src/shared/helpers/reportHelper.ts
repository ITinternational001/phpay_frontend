import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateUtc, getStatusName } from "./helper";
import { DatePipe } from "@angular/common";
import { TransactionStatus } from "../dataprovider/local/data/common";

export function generateReport(reportType: string, startDate: any, endDate: any, data: any, header: any, formData?: any) {
    let _datePipe: DatePipe;
    let _dateNow = new Date;
    let reportHeader; let topContentLeft; let topContentRight; let topContentCenter;
    const doc = new jsPDF('l', 'mm', [297, 210]);
    doc.addImage("assets/dpay_logo_landscape.png", "PNG", 10, 10, 100, 30);

    function transformData(inputData: any[]): any[] {
        let data: any;
        return inputData.map(entry => {
            if (reportType == 'TransactionTab') {
                data = [
                    formatDateUtc(entry?.Timestamp?.toString()!, _datePipe),
                    entry.TransactionNo,
                    entry.ClientName,
                    entry.ReferenceUserId,
                    entry.Type,
                    entry.PMethod,
                    entry.MerchantName?.replace("DPayDynastyPay", ""),
                    entry.GrossAmount,
                    entry.FixFee,
                    entry.NetAmount,
                    entry.Status
                ];
            } else if (reportType == 'reportSummary') {
                data = [
                    formatDateUtc(entry?.Timestamp?.toString()!, _datePipe),
                    entry.InternalTransactionNumber,
                    entry.UserID,
                    entry.ClientID,
                    entry.Type,
                    entry.MerchantName.replace("DPayDynastyPay", ""),
                    entry.PMethod,
                    entry.GrossAmount,
                    entry.FeeAC + entry.FeeOT,
                    entry.FixFee,
                    entry.NetAmount,
                    getStatusName(entry.Status, TransactionStatus)
                ]
            } else if (reportType == 'reportRemittance') {
                data = [
                    entry.TransactionNo,
                    entry.ClientName,
                    entry.Type,
                    entry.WalletSource,
                    entry.Method,
                    entry.DateRequested,
                    entry.DateReleased,
                    entry.Requestee,
                    entry.ReferenceNumber,
                    entry.GrossAmount,
                    entry.FeeACFixed + entry.FeeOTFixed,
                    entry.FeeACPercent + entry.FeeOTPercent,
                    entry.NetAmount,
                    entry.Status,
                ]
            } else if (reportType == 'reportIncome') {
                data = [
                   formatDateUtc(entry.Date, _datePipe, true),
                    entry.DayOfWeek,
                    entry.CICount,
                    entry.CIGross,
                    entry.CIFeeAtCost + entry.CIFeeOnTop,
                    entry.CINet,
                    entry.COCount,
                    entry.COGross,
                    entry.COFeeAtCost + entry.COFeeOnTop,
                    entry.CONet,
                    entry.TotalGross,
                    entry.TotalFee_AC + entry.TotalFee_OT,
                    entry.TotalNet,
                ]
            }
            return data;
        });
    }

    if (reportType == 'TransactionTab') {
        
        reportHeader = 'Transaction Report';
        topContentRight = "Cash In : " + data.Total.TotalCashin
            + '\nCash Out : ' + data.Total.TotalCashout
            + '\nWithdrawal : ' + data.Total.TotalWithdrawal;

        topContentCenter = "This Week Income : " + data.TotalIncome.IncomeThisWeek
            + '\nNet Income (Week) : ' + data.TotalIncome.NetIncomeThisWeek
            + '\nThis Month : ' + data.TotalIncome.IncomeThisMonth
            + '\nThis Month : ' + data.TotalIncome.NetIncomeThisMonth;

        topContentLeft = "Today Income : " + data.TotalIncome.IncomeToday
            + '\nNet Income (Today) : ' + data.TotalIncome.NetIncomeToday
            + '\nYesterday Income : ' + data.TotalIncome.IncomeYesterday
            + '\nNet Income (Yesterday) : ' + data.TotalIncome.NetIncomeYesterday;
    } else if (reportType == 'reportSummary') {
        reportHeader = 'Summary Per Merchant Report';

        topContentRight = "Total Gross Amount : " + data.TotalGrossAmount
            + '\nTotal Transaction Fee : ' + data.TotalOnTopFee
            + '\nTotal Net Amount : ' + data.TotalNetAmount;

        topContentCenter = "G-Cash : " + data.TotalGcash
            + '\nMaya : ' + data.TotalMaya
            + '\nInsta Pay : ' + data.TotalInstaPay;

        topContentLeft = "Transaction : Cash In"
            + '\nMerchant : Merchant 1'
            + '\nMethod : Method 1';

    } else if (reportType == 'reportRemittance') {
        reportHeader = 'Withdrawal Per Client Report';

        topContentRight = "Total Gross Amount : " + data.TotalGrossAmount
            + '\nTotal Transaction Fee : ' + data.TotalOnTopFee
            + '\nTotal Net Amount : ' + data.TotalNetAmount;

        topContentCenter = "Bank Transfer : " + data.TotalBank
            + '\nUSD-T : ' + data.TotalUsdt
            + '\nCash Pick-Up : ' + data.CashPickup;

        topContentLeft = "Transaction : Cash In"
            + '\nMerchant : Merchant 1'
            + '\nMethod : Method 1';
    }
    else if (reportType == 'reportIncome') {
        reportHeader = 'Total Income Report';

        topContentRight = "Total Gross Amount : " + data.TotalGrossAmount
            + '\nTotal Transaction Fee : ' + data.TotalOnTopFee
            + '\nTotal Net Amount : ' + data.TotalNetAmount;

        topContentCenter = "Cash-In Income : " + data.TotalCIIncome
            + '\nCash-Out Income : ' + data.TotalCOIncome
            + '\nWithdrawal Income : ' + data.TotalWithdrawalIncome;

        topContentLeft = "Transaction : Cash In"
            + '\nMerchant : Merchant 1'
            + '\nMethod : Method 1';
    }
    autoTable(doc, {
        body: [
            [
                {
                    content: reportHeader,
                    styles: {
                        halign: 'right',
                        fontSize: 15,
                    }
                }
            ],
        ],
        theme: 'plain',
    });

    autoTable(doc, {
        body: [
            [
                {
                    content:
                        "Date: " + startDate + " - " + endDate
                        + '\nReport Number: ' + _dateNow.getFullYear()+_dateNow.getDate()+_dateNow.getMonth() + Math.floor(Math.random() * (10000000 - 1000000 + 1)) + 2,
                    styles: {
                        halign: 'right',
                    }
                }
            ],
        ],
        theme: 'plain'
    });

    // autoTable(doc, {
    //     body: [
    //         [
    //             {
    //                 content: 'Transaction Report Summary',
    //                 styles: {
    //                     halign: 'left',
    //                     fontSize: 14,
    //                 }
    //             }
    //         ],
    //     ],
    //     theme: 'plain',
    // });

    //top content data

    autoTable(doc, {
        body: [
            [

                {
                    content: topContentLeft,
                    styles: {
                        halign: 'left',
                    }
                },
                {
                    content: topContentCenter,
                    styles: {
                        halign: 'left',
                    }
                },
                {
                    content: topContentRight,
                    styles: {
                        halign: 'right',
                    }
                }
            ],
        ],
        theme: 'plain'
    });

    autoTable(doc, {
        head: [header],
        body:
            transformData(data.Data)
        ,
        theme: 'striped',
        headStyles: {
            fillColor: 'black',
            textColor: '#fff'
        }
    })


    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(10);
    // For each page, print the page number and the total pages
    for (var i = 1; i <= pageCount; i++) {
        // Go to page i
        doc.setPage(i);
        //Print Page 1 of 4 for example
        doc.text('Page ' + String(i) + ' of ' + String(pageCount), 265, 200);
        doc.text('Date Generated: '+ _dateNow.getDate()+'/'+_dateNow.getMonth()+'/'+_dateNow.getFullYear(), 15, 200);
    }
    return doc.output("dataurlnewwindow");
}