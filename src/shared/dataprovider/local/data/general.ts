
export const GraphColors={
    getPieChartColors:['#18A0FB','#F5BC29','#F52929','#008000'],
     getLineChartColors:['#18A0FB','#F5BC29','#F52929','#008000']
}

export const Filters ={
    getFilter:{

         ReportAdmin:{
            label:"report",
            options:['Summary Per Merchant','Withdrawals Per Client','Total Income Report'],
            icon:"fa-solid fa-filter",
            placeholder:"Select Report",
        },
        ReportClient:{
            label:"report",
            options:['Summary Per Transactions','Remittance Report','Total Income Report'],
            icon:"fa-solid fa-filter",
            placeholder:"Select Report",
        },
        Date:{
            label: "Date",
            options: ['Today', '24Hrs'],
            icon: "fa fa-calendar",
            placeholder:"Today",
        }, 
        Table:{
          label: "Filter",
          options: ['By Date', 'By Name'],
          icon: "fa fa-funnel",  
          placeholder: "Filter",
        },
        Type:{
          label: "Type",
          options: ['ALL', 'CASH IN', 'CASH OUT','WITHDRAWALS'],
          icon: "fa-solid fa-filter",
          placeholder: "Select Type",
        },
        Merchants:{
            label: "Merchants",
            options: ['ALL', 'PEPAY', 'CERAMIQ', 'BPAY', 'MANGOPAY'],
            icon: "fa-solid fa-filter",
            placeholder: "Select Merchants",
        },
        Methods:{
            label: "Methods",
            options: ['ALL', 'GCASH', 'MAYA', 'GRABPAY', 'INSTAPAY'],
            icon: "fa-solid fa-filter",
            placeholder: "Select Method...",
        },
        Vendors:{
            label: "Vendors",
            options: ['ALL','PEPAY','CERAMIQ','BPAY','MANGOPAY' ],
            icon: "fa-solid fa-filter",
            placeholder: "Select Merchant...",
        },
        Clients:{
            label:"Client",
            options:['ALL','CRAZYWIN','APEX','TMT','PRIMO'],
            icon: "fa-solid fa-filter",
            placeholder: "Select client...",
        }, 
         Wallet:{
            label:"",
            options:['CRAZYWIN PAY1','CRAZYWIN PAY2'],
            icon:"",
            placeholder:"Select Wallet...",   
        },
        Remittance:{
             label:"",
            options:['BANK TRANSFER','USDT- BINANCE','CASH PICK-UP'],
            icon:"",
            placeholder:"Remittance Method...", 
        },
        Bank:{
             label:"",
            options:['BANK- BPI # 2','BANK -SB # 1','USDT -USDT # 1','USDT -USDT # 2'],
            icon:"",
            placeholder:"Select Bank...", 
        },
        Role:{
            label:"",
            options:['ADMINISTRATOR','CUSTOMER SUPPORT/SERVICE','FINANCIAL ACCOUNTANT','VIEW-ONLY EDITOR'],
            icon:"",
            placeholder:"Select Role...",  
        },
        Users:{
            label:"",
            options:['User01','User01','User01','User01'],
            icon:"",
            placeholder:"Assign to User", 
        },
        Providers:{
            label:"",
            options:['TC Gaming','MPS'],
            icon:"",
            placeholder:"Select Provider...", 
        },
        Controllers:{
            label: "Controllers:",
            options: ['PEPAY Controllers','CERAMIQ Controllers','BPAY Controllers','MANGOPAY Controllers' ],
            icon: "fa-solid fa-filter",
            placeholder: "Select Controller:",
        },
        Status:{
            label: "Status",
            options: ['Active','In-Active'],
            icon: "fa-solid fa-filter",
            placeholder: "Select Status",
        },
        Source:{
            label: "",
            options: ['Administrator','Customer Support/Service','Financial Controller/Accountant','View-Only Auditor'],
            icon: "fa-solid fa-filter",
            placeholder: "Select Soure",
        }
    }
}

export const buttonLabels={
        pdf:{
        label:"Download PDF",
        icon:"fa-solid fa-file-arrow-down",
        },
         Role:{
            label:"Add New Role",
            icon:"fa fa-plus",
        },
        Permission:{
           label:"Add New Permission",
           icon:"fa fa-plus",
        },
        Merchant:{
            label:"Add Merchant",
            icon:"fa fa-plus",
        },
        Platform:{
            label:"Add Plantform",
            icon:"fa fa-plus",
        },
        whitelist:{
            label:"Add Whitelist",
            icon:"fa fa-plus",
        }
}

export const itemsPerPageOptions = [10, 20, 50, 100, 200, 300, 400, 500];
    






