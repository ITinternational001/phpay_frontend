import { MessageStatusEnum } from "../../api/model/messageStatusEnum";
import { buttonLabels } from "./general";


  export const TotalNumberOfDataPerTable=500;
  export const Pending = 1;
  export const Approved = 2;
  export const Decline = 3;

  export const RemittancePending = 1;
  export const RemittanceProcessing = 2;
  export const RemittanceRelease = 3;
  export const RemittanceDecline = 4;
  export const RemittanceAll = 0;

  export const CashIn  = 1;
  export const CashOut = 2;

  export const Bank = 1;
  export const Binance = 2;
  export const CashPickUp = 3;

  export const ElitAgent = 1
  export const CoreAgent = 2;
  export const PrimeAgent = 3;

  export const TopUp = 4;
  export const WalletToCOF = 5;
  export const WalletToRemittance = 6;
  export const COFToWallet = 7;
  export const COFToRemittance = 8;
  export const remittanceToCOF=9;
  export const RemittanceToWallet=10;
  export const WalletToWallet=11;

  export const BTransferTypes = "6,7,8,9,10,11";
  export const RejectedAndCompleted = "3,4";
  export const  PendingAndProcessing = "1,2";

  export const ALL = 0;
  export const PENDING = 1;
  export const PROCESSING = 2;
  export const COMPLETED = 3;
  export const REJECTED = 4;



  export const NotificationStatus = {
    Unread : 1 as MessageStatusEnum,
    Read : 2 as MessageStatusEnum,
    Deleted : 3 as MessageStatusEnum
  }

  export const BalanceTransferType = [
    // { id: 5, name: "Wallet → COF" },
    // { id: 6, name: "Wallet → Settlement Wallet" },
    // { id: 7, name: "COF Wallet →  Wallet" },
    { id: 8, name: "COF Wallet →  Settlement Wallet" },
    { id: 9, name: "Settlement Wallet → COF Wallet" },
    // { id: 10, name: "Settlement Wallet → Wallet" },
    // { id: 11, name: "Wallet → Wallet" },
  ]


  export const Navigation = {
    Dashboard: "Dashboard",
    UserManagement : "User Management",
    IPWhitelisting : "IP Whitelisting",
    RoleManagement : "Role Management",
    ActivityLogs : "Activity Logs",
    Merchants : "Merchants",
    Vendors : "Vendors",
    ClientList : "Client List",
    COFunds : "CashOut Funds",
    BalanceTransfer : "Balance Transfer",
    Remittances : "Remittances",   
    CardList : "Card List",
    Reports : "Reports",
    Transactions : "Transactions",
    Integration : "Integration",
    AgentDashboard : "Agent Dashboard",
    AgentManagement : "Agent Management",
    AgentRemittance : "Agent Remittance",
    AgentRemittanceForm : "Agent Remittance Form",
    AgentBalanceTransfer : "Agent Balance Transfer",
    AgentAllocation : "Agent Allocation",
    AgentTransactionLogs : "Agent Transaction Logs",
    AgentFlowRecords : "Agent Account Flow Records",
    AgentCards : "Agent Cards Lists",
    Translation : "Translation",
    Help : "Help",
    Logout : "Logout"
  }

  export const allowedChannel = [
    "Gcash", "Maya", "QRPH"
  ]

  export const CoStatus = [
    {Id: 1, Type: "Pending"},
    {Id: 2, Type: "Approved"},
    {Id: 3, Type: "Disapproved"},
  ]

  export const Status = [
    {Id: 1, Type: "Active"},
    {Id: 2, Type: "Inactive"},
    {Id: 3, Type: "Disabled"},
  ]

  export const AgentType = [
    {Id: 1, Type: "Elite"},
    {Id: 2, Type: "Core"},
    {Id: 3, Type: "Prime"},
    {Id: 4, Type: "Agent 4"},
  ]

  export const TransactionType = [
    {Id:0, Type: "All"},
    {Id: 1, Type: "Cash-In"},
    {Id: 2, Type: "Cash-Out"},
  ]

  export const Type = [
    {id: 0, name: "All"},
    {id: 1, name: "Cash-In"},
    {id: 2, name: "Cash-Out"},
  ]

  export const StatusDropdown = [
    { id: 1, name: "Active" },
    { id: 2, name: "Inactive" },
    { id: 3, name: "Disabled" },
  ]

  export const TableOption = {
    PageSize : 100,
    PageSizeOption : [100,200,300],
    PageLimit : 100
  }

  export const TopUpStatus = [
    {Id: 1, Type: "Pending"},
    {Id: 2, Type: "Approve"},
    {Id: 3, Type: "Disapprove"},
    {Id: 4, Type: "Completed"},
  ]

  export const AgentTransferBalanceStatus = [
    {Id: 1, Type: "Pending"},
    {Id: 2, Type: "Disapprove"},
    {Id: 3, Type: "Completed"},
  ]

  export const TransactionTopData = {
    data: [{
      label: "totalCashIn",
      value: 0,
      icon: "fa fa-peso-sign"
    },
    {
      label: "totalCashOut",
      value: 0,
      icon: "fa fa-peso-sign"
    },
    {
      label: "totalWithdrawals",
      value: 0,
      icon: "fa fa-peso-sign"
    }],
    count :[
      {
        label: "successful",
        value:0,
        icon: "fa fa-check-circle"
      }, {
        label: "failed",
        value: 0,
        icon: "fa fa-ban"
      }, {
        label: "closed",
        value: 0,
        icon: "fa fa-times-circle-o"
      },
      {
        label: "cancelled",
        value: 0,
        icon: "fa fa-times-circle-o"
      }
    ]
  }

  export const TransactionStatus = [
    {Id: 0, Type: "All"},
    {Id: 1, Type: "Pending"},
    {Id: 2, Type: "Processing"},
    {Id: 3, Type: "Completed"},
    {Id: 4, Type: "Rejected"},
    {Id: 5, Type: "Closed"}
  ]

  export const SelectedTopUpStatus = [
    {id: 0, name: "All"},
    {id: 1, name: "Pending"},
    {id: 2, name: "Approved"},
    {id: 3, name: "Rejected"},
    {id: 4, name: "Completed"}
  ]

  export const SelectedTypes = [
    {id: 0, name: "Elite"},
    {id: 1, name: "Core"},
    {id: 2, name: "Prime"}
  ]

  export const SelectedRemittanceStatus = [
    {id: 0, name: "All"},
    {id: 1, name: "Pending"},
    {id: 2, name: "Processing"},
    {id: 3, name: "Completed"},
    {id: 4, name: "Rejected"}
  ]

  export const CashInOutStatusEnum =[
    {Id: 1, Status: "Pending"},
    {Id: 2, Status: "Cancelled"},
    {Id: 3, Status: "Completed"},
    {Id: 4, Status: "Rejected"},
    {Id: 5, Status: "Closed"},
  ]

  export const RoleAcessEnum=[
    {Id: 0, Status: "All"},
    {Id: 1, Status: "Actions"},
    {Id: 2, Status: "Read-Only"}
  ]


  //Admin no cash pick up
  export const TransferMethod = [
    {Id: 0, Name: "All"},
    {Id: 1, Name: "BANK"},
    {Id: 2, Name: "USDT-BINANCE"},
    {Id: 3, Name: "CASH PICK-UP"},
  ]

  export const ConfigFeeMethod = [
    {Id: 1, Name: "BANK"},
    {Id: 2, Name: "USDT-BINANCE"}, 
    {Id: 3, Name: "CASH PICK-UP"},
  ]

  export const ConfigFeeMethodRemittance = [
    {id: 1, name: "Bank"},
    {id: 2, name: "USDT-BINANCE"},
    {id: 3, name: "CASH PICK-UP"},
  ]

  export const CardIdList = [
    {Id: 1, Name: "bank"},
    {Id: 2, Name: "usdtBinance"}, 
    {Id: 3, Name: "cashPickUp"}
  ]

  export const CardPhilId = [
    {Id: 1, Name:"All"},
    {Id: 2, Name:"Passport"},
    {Id: 3, Name:"Driver's License"},
    {Id: 4, Name:"SSS UMID Card"},
    {Id: 5, Name:"PRC ID"},
    {Id: 6, Name:"Voter's ID"},
    {Id: 7, Name:"Philhealth ID"},
    {Id: 8, Name:"Tin ID"},
    {Id: 9, Name:"GSIS E-Card"},

  ]

  export const CardPhilIdRemittance = [
    {id: 1, name:"All"},
    {id: 2, name:"Passport"},
    {id: 3, name:"Driver's License"},
    {id: 4, name:"SSS UMID Card"},
    {id: 5, name:"PRC ID"},
    {id: 6, name:"Voter's ID"},
    {id: 7, name:"Philhealth ID"},
    {id: 8, name:"Tin ID"},
    {id: 9, name:"GSIS E-Card"},

  ]

  export const CardTypes = [
    {Id: 1, Name: "BANK"},
    {Id: 2, Name: "USDT"},
    {Id: 3, Name: "CASH PICK-UP"}
  ]

  //static methods
  export const MerchantCardData = {
    merchantCard:[
      {
        label: "Gcash",
        value:"",
        icon: "assets/icons/Gcash-New.png",
        clientId: "",
        channelId: "",
      
       
      },
      {
        label: "Maya",
        value:"",
        icon: "assets/icons/Maya-New.png",
        clientId: "",
        channelId: "",
      
      },
      {
        label: "QRPH",
        value:"",
        icon: "assets/icons/QRPH-New.png",
        clientId: "",
        channelId: "",
        
      
      },
      {
        label: "GrabPay",
        value:"0",
        icon: "assets/icons/GrabPay-New.png",
        clientId: "",
        channelId: "",

      },
    ],
    
  }


  export const TopCardData = {
    TotalWalletBalance:[{
      label: "walletBalance",
      value: "",
      icon: "fa fa-wallet"

    },
  ],

    dashboard:[
      {
        label: "availableBalance",
        value: "",
        icon: "fa fa-wallet"
      },
      {
        label: "totalDeposit",
        value: "",
        icon: "fa fa-coins"
      },
      {
        label: "totalWithdrawal",
        value: "",
        icon: "fa fa-coins"
      },
      {
        label: "totalRemittance",
        value: "",
        icon: "fa fa-coins"
      },
    ],


    clientDashboard:[
      {
        label:"remainingBalance",
        value:"",
        icon:"fa fa-coins"
      },
      {
        label:"totalCashIn",
        value:"",
        icon:"fa fa-coins"
      },
      {
        label:"totalCashOut",
        value:"",
        icon:"fa fa-coins"
      }
    ],
    clients:[
      {
        label: "totalClients",
        value: 0,
        icon: "fa fa-user"
      },
      {
        label: "totalDeposit",
        value: "",
        icon: "fa fa-money-bill"
      },
      {
        label: "totalWithdrawal",
        value: "",
        icon: "fa fa-wallet"
      },
      {
        label: "totalRemittance",
        value: "",
        icon: "fa fa-arrow-circle-down"
      },
    ],

    EOD:[
      {
        label: "totalProfit",
        value: 0,
        icon: "fa-solid fa-coins"
      },
      {
        label: "totalDepositProfit",
        value: 0,
        icon: "fa-solid fa-coins"
      },
      {
        label: "totalWithdrawalProfit",
        value: 0,
        icon: "fa-solid fa-coins"
      },
    ],
    users:[
      {
        label: "totalUsers",
        value: 0,
        icon: "fa-solid fa-users fal",
        buttonlabel: "Add New User"
      }
    ],
    
    cardList:[
      {
        label: "Wallet balance",
        value: "143,300.00",
        icon: "fa fa-wallet"
      },
      {
        label: "Total Released",
        value: "143,300.00",
        icon: "fa fa-coins"
      },
     
    ],
    todayIncome:[
      {
        label: "Today Income",
        value: "2,412,349.23",
        value1: "Net Income: 2,000,000",
      },
     
    ],
    yesterdayIncome:[
      {
        label: "Yesterday Income",
        value: "2,412,349.23",
        value1: "Net Income: 2,000,000",
      },
    ],
    thisweekIncome:[
      {
        label: "This Week Income",
        value: "2,412,349.23",
        value1: "Net Income: 2,000,000",
      },
    ]
    ,
    thismonthIncome:[
      {
        label: "This Month Income",
        value: "2,412,349.23",
        value1: "Net Income: 2,000,000",
      },
    ],
    totalCashin:[
      {
        label: "Total Cash-In",
        value: "2,412,349.23",
        icon: "fa-solid fa-coins"
      },
    ],
    totalCashout:[
      {
        label: "Total Cash-out",
        value: "2,412,349.23",
        icon: "fa-solid fa-coins"
      },
    ],
    totalWithdrawals:[
      {
        label: "Total Withdrawals",
        value: "2,412,349.23",
        icon: "fa-solid fa-coins"
      },
    ],
     totalGrossAmount:[
      {
        label: "Total Gross Amount",
        value: "2,412,349.23",
      },
    ],
    totalAtCost:[
      {
        label: "Total At Cost Fee",
        value: "2,412,349.23",
      },
    ],
    totalOnTopFee:[
      {
        label: "Total On Top Fee(Income)",
        value: "2,412,349.23",
      },
    ],
    totalNetAmount:[
      {
        label: "Total Net Amount",
        value: "2,412,349.23",
      },
    ],
    totalGcash:[
      {
        value: "14,002,202",
        imageSrc:"assets/payment_method/GCash-Logo 2.png",
      },
    ],
    totalInstapay:[
      {
        value: "14,002,202",
        imageSrc:"assets/payment_method/instapay.png",
      },
    ],
    totalGrabpay:[
      {
        value: "14,002,202",
        imageSrc:"assets/payment_method/grabpay.png",
      },
    ],
    totalMaya:[
      {
        value: "14,002,202",
        imageSrc:"assets/payment_method/maya.png",
      },
    ],
    banktransfer:[
      {
        label: "Bank Transfer",
        value: "2,236,546.68",
        
      },
    ],
    usdt:[
      {
        label: "USDT",
        value: "2,236,546.68",
        
      },
    ],
    cashpickup:[
      {
        label: "Cash Pick-Up",
        value: "2,236,546.68",
       
      },
    ],
    CiIncome:[
      {
        label: "CI Income",
        value: "2,236,546.68",
        
      },
    ],
    CoIncome:[
      {
        label: "CO Income",
        value: "2,236,546.68",
        
      },
    ],
    WIncome:[
      {
        label: "W. Income",
        value: "2,236,546.68",
       
      },
    ],
    summaryReport:[
      {
        label: "",
        value: "",
        icon: "",
      }
    ] ,
    remittanceCard:[
      {
        label:"Wallet Balance",
        value: 0,
        icon:"fa fa-wallet",
      },
       {
        label:"Total Cash In  ",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
       {
        label:"Total Cash Out",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
    ],
        topclients:[
      {
        label:"Wallet Balance",
        value:"141,002,203",
        icon:"fa fa-wallet",
      },
       {
        label:"Total Cash In  ",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
       {
        label:"Total Cash Out",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
       {
        label:"Total Withdrawals",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
    ],
    clientMerchant:[
      {
        label:"Total Wallet",
        value:"2,412,349.23",
        icon:"fa-solid fa-coins"
      }
    ],
    clientWalletBalance:[
      {
        label:"walletBalance",
        value:0,
        icon:"fa fa-wallet"
      }
    ],
    transactionsTotal:[
     {
        label:"Total Cash In  ",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      },
       {
        label:"Total Cash Out",
        value:"141,002,203",
        icon:"fa-solid fa-coins",
      }
    ],
    transactionsReport:[
      {
        label:"Succefull Transactions",
        value:"4,392",
        icon:"fa-solid fa-clipboard-check",
      },
       {
        label:"Cancel Transactions",
        value:"124",
        icon:"fa-solid fa-clipboard-check",
      },
       {
        label:"Closed Transactions",
        value:"102",
        icon:"fa-solid fa-clipboard-check",
      },
    ],
    clientUsers:[
      {
        label:"Total No. of Users",
        value:"1,001",
        icon:"fa-solid fa-users"
      }
    ],
    ipWhitelisting:[
      {
        label:"totalWhiteListingUser",
        value:0,
        icon:"fa-solid fa-users fal"
      }
    ],
    clientDetails:[
      {
        label:"Client Name",
        value:"CrazyWin",
        icon:"fa-solid fa-users"
      },
       {
        label:"Email Address",
        value:"crazywin@email.com",
        icon:"fa-solid fa-paper-plane"
      },
       {
        label:"Public IP Address",
        value:"192.239.349",
        icon:"fa-solid fa-ethernet"
      }
    ]
    
    
  };

  export const clientSummaryData: any =
  {
    header:[ {"label": "Client Id", "column": "clientId"},
            {"label": "Name", "column": "name"},
            {"label": "Status", "column": "status"},
            {"label": "Wallet Balance", "column": "wallet"}],
    data:[
      {
        clientId: "Alfreds Futterkiste",
        name: "Maria Anders",
        status: "Inactive",
        wallet: "20,333,333"
    },
    {
        clientId: "Berglunds snabbköp",
        name: "Christina Berglund",
        status:"Active",
        wallet: "30,333,333"
    },
    {
        clientId: "Centro comercial Moctezuma",
        name: "Francisco Chang",
        status:"Active",
        wallet: "40,333,333"
    },
    {
      clientId: "Centro comercial Moctezuma",
      name: "Francisco Chang",
      status:"Active",
      wallet: "40,333,333"
  },
    {
      clientId: "Centro comercial Moctezuma",
      name: "Francisco Chang",
      status:"Active",
      wallet: "40,333,333"
    },
    {
        clientId: "Ernst Handel",
        name: "Roland Mendel",
        status:"Active",
        wallet: "50,333,333"
    },
    ],
    
  };

  

export const totalIncomeData = {
  header:[
    {"label": "Summary", "column": "summary"},
    {"label": "Value", "column": "value"},
  ],
  data:[
    {
      summary: 'Success Orders',
      value: '1,000,000'
    },
    {
      summary: 'Total Gross Income',
      value: '2,000,000'
    },{
      summary: 'Total Fee',
      value: '3,000,000'
    },{
      summary: 'Total Net Income',
      value: '4,000,000'
    }
  ]
};


export const usersData = {
  header:[
    {"label": "Name", "column": "name"},
    {"label": "Username", "column": "username"},
    {"label": "Role", "column": "role"},
    {"label": "Last Login IP", "column": "ip"},
    {"label": "Last Active Date", "column": "activedate"},
    {"label": "Verification", "column": "verification"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      name: "John Doe",
      username: "JDoe",
      role: "Client Admin",
      ip : "192.168.2.2",
      activedate: "09-08-2023 10:00:00",
      verification: "Binded",
      status: "Active"
    },
    {
        name: "Jane Doe",
        username: "JDoe2",
        role: "Client Admin",
        ip : "192.168.2.3",
        activedate: "09-09-2023 10:00:00",
        verification: "Binded",
        status: "Active"
    },
  ]
};


export const reportsDataSummary ={
  header:[
    {"label": "Timestamp", "column": "timestamp"},
    {"label": "Transaction No.", "column": "transaction"},
    {"label": "User ID", "column": "userid"},
    {"label": "Client", "column": "client"},
    {"label": "Type", "column": "type"},
    {"label": "Merchant", "column": "merchant"},
    {"label": "P. Method", "column": "method"},
    {"label": "Gross", "column": "gross"},
    {"label": "CI Fee% (OT)", "column": "ci"},
    {"label": "CI Fix Fee% (OT)", "column": "fix"},
    {"label": "CI Fee% (AC)", "column": "ac"},
    {"label": "CI Fix Fee (AC)", "column": "fixac"},
    {"label": "Net Amount", "column": "net"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      timestamp: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      userid:'User001',
      client: 'Client1',
      type: 'Cash-In',
      merchant:'ceramiq',
      method:'Gcash',
      gross:20200,
      ci: 117.0,
      fix: -177.40,
      ac: -177.40,
      fixac: -177.40,
      net: 20200,
      status: "Successful",

    },
    
   
  ]
}

export const reportsDataWithdrawals ={
  header:[
    {"label": "Date Requested", "column": "date"},
    {"label": "Transaction No.", "column": "transaction"},
    {"label": "Requestee", "column": "requestee"},
    {"label": "Client", "column": "client"},
    {"label": "Type", "column": "type"},
    {"label": "Wallet Source", "column": "wallet"},
    {"label": "Method", "column": "method"},
    {"label": "Date Released", "column": "dreleased"},
    {"label": "Reference No.", "column": "ref"},
    {"label": "Gross Amount", "column": "gross"},
    {"label": "W. Fee % (OT)", "column": "fee"},
    {"label": "W. Fix Fee (OT)", "column": "fix"},
    {"label": "W. Fee % (AC)", "column": "feeac"},
    {"label": "W. Fix Fee (AC)", "column": "fixfee"},
    {"label": "Net Amount", "column": "net"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      date: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      requestee: 'User001',
      client: 'Client1',
      type: 'Cash-In',
      wallet: 'Ceramiq',
      method: 'Bank',
      dreleased: '12:22:54 - 07/12/23',
      ref: 'CI00000012346',
      gross: '2,300.00',
      fee: '-177.40',
      fix: '-117.40',
      feeac: '-117.40',
      fixfee: '-117.40',
      net: '2,182.60',
      status: 'SUCCESSFUL'

    },
    {
      date: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      requestee: 'User001',
      client: 'Client1',
      type: 'Cash-In',
      wallet: 'Ceramiq',
      method: 'Bank',
      dreleased: '12:22:54 - 07/12/23',
      ref: 'CI00000012346',
      gross: '2,300.00',
      fee: '-177.40',
      fix: '-117.40',
      feeac: '-117.40',
      fixfee: '-117.40',
      net: '2,182.60',
      status: 'SUCCESSFUL'
    },
    {
      date: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      requestee: 'User001',
      client: 'Client1',
      type: 'Cash-In',
      wallet: 'Ceramiq',
      method: 'Bank',
      dreleased: '12:22:54 - 07/12/23',
      ref: 'CI00000012346',
      gross: '2,300.00',
      fee: '-177.40',
      fix: '-117.40',
      feeac: '-117.40',
      fixfee: '-117.40',
      net: '2,182.60',
      status: 'SUCCESSFUL'
    },
  ]
}

export const reportsDataTotalIncomes ={
  header:[
    {"label": "Date", "column": "date"},
    {"label": "Day", "column": "day"},
    {"label": "CI Count", "column": "count"},
    {"label": "CI Gross", "column": "gross"},
    {"label": "CI Fee (OT)", "column": "ciOT"},
    {"label": "CI Fee (AC)", "column": "ciAC"},
    {"label": "CI Net", "column": "ciNet"},
    {"label": "CO Count", "column": "coCount"},
    {"label": "CO Gross", "column": "coGross"},
    {"label": "CO Fee (OT)", "column": "coFeeOT"},
    {"label": "CO Fee (AC)", "column": "coFeeAC"},
    {"label": "CO Net", "column": "coNet"},
    {"label": "W. Count", "column": "wCount"},
    {"label": "W. Gross", "column": "wGross"},
    {"label": "W. Fee (OT)", "column": "wFeeOT"},
    {"label": "W. Fee (AC)", "column": "wFeeAC"},
    {"label": "W. Net", "column": "wNet"},
    {"label": "Total Gross", "column": "tGross"},
    {"label": "Total Fee (OT)", "column": "totalFeeOT"},
    {"label": "Total Fee (AC)", "column": "totalFeeAC"},
    {"label": "Total Net", "column": "Tnet"},
    {"label": "TOTAL INCOME", "column": "total"},

  ],
  data:[
    {
      date:"07/23//23",
      day:"Thursday",
      count:"4123",
      gross:"2,300.00",
      ciOT:"-117.40",
      ciAC:"2,300.00",
      ciNet:"2,300.00",
      coCount:"4123",
      coGross:"2,184.60",
      coFeeOT:"-117.40",
      coFeeAC:"-117.40",
      coNet:"-117.40",
      wCount:"-117.40",
      wGross:"-117.40",
      wFeeOT:"-117.40",
      wFeeAC:"-117.40",
      wNet:"2,184.60",
      tGross:"2,184.60",
      totalFeeOT:"2,184.60",
      totalFeeAC:"2,184.60",
      Tnet:"2,184.60",
      total:"2,184.60"

    },
    {
      date:"07/23//23",
      day:"Thursday",
      count:"4123",
      gross:"2,300.00",
      ciOT:"-117.40",
      ciAC:"2,300.00",
      ciNet:"2,300.00",
      coCount:"4123",
      coGross:"2,184.60",
      coFeeOT:"-117.40",
      coFeeAC:"-117.40",
      coNet:"-117.40",
      wCount:"-117.40",
      wGross:"-117.40",
      wFeeOT:"-117.40",
      wFeeAC:"-117.40",
      wNet:"2,184.60",
      tGross:"2,184.60",
      totalFeeOT:"2,184.60",
      totalFeeAC:"2,184.60",
      Tnet:"2,184.60",
      total:"2,184.60"
    },
  ]
}


export const clientsData = {
  header:[
    {"label": "Client ID", "column": "clientId"},
    {"label": "Name", "column": "name"},
    {"label": "Transactions", "column": "transactions"},
    {"label": "Balance", "column": "balance"},
    {"label": "Cash-In", "column": "cashin"},
    {"label": "Cash-Out", "column": "cashout"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      clientId: "1001-2023",
      name: "John Doe",
      transactions: "43,444",
      balance : "192,168,22",
      cashin: "1,000,000",
      cashout: "2,000,000",
      status: "Active"
  },
  {
      clientId: "1002-2023",
      name: "Jane Doe",
      transactions: "43,444",
      balance : "192,168,22",
      cashin: "1,000,000",
      cashout: "2,000,000",
      status: "Active"
  },
  ]
};


export const whiteListingData = {
  header:[
    {"label": "Username", "column": "username"},
    {"label": "Clientname", "column": "client"},
    {"label": "Role", "column": "role"},
    {"label": "Last Login IP", "column": "ip"},
    {"label": "Last Login", "column": "lastdate"},
    {"label": "Verification", "column": "verification"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      username: "JDoe",
      client:"Merchant1",
      role: "Client Admin",
      ip : "192.168.2.2",
      lastdate: "09-08-2023 10:00:00",
      verification: "Binded",
      status: "Active"
    },
    {
        
        username: "JDoe2",
        client:"Merchant2",
        role: "Client Admin",
        ip : "192.168.2.3",
        lastdate: "09-09-2023 10:00:00",
        verification: "Binded",
        status: "Active"
    },
  ]
};

export const RolesData = {
  header:[
    {"label":"Role Id", "column":"roleid"},
    {"label":"Role", "column":"role"},
    {"label":"Description", "column":"description"},
    {"label":"Status", "column":"status"},
    {"label":"Created By", "column":"createdby"},
    {"label":"Created At", "column":"createdat"},
  ],
  data:[{
    roleid: 1,
    role: "Super Admin",
    description: "Super Admin",
    status: 1,
    createdby: "SYS",
    createdat: "2023-08-08 10:00:00",
    permissions:[1,2]
  },
  {
    roleid: 2,
    role: "Client Admin",
    description: "Client Admin",
    status: "active",
    createdby: "SYS",
    createdat: "2023-08-08 10:00:00",
    permissions:[1]
  }]
}

export const PermissionData = {
  header:[
    {"label":"Permission Id", "column":"pid"},
    {"label":"Permission", "column":"permission"},
    {"label":"Status", "column":"status"},
    {"label":"Created By", "column":"createdby"},
    {"label":"Created At", "column":"createdat"},
  ],
  data:[{
    pid: 1,
    permission: "Transaction Log Menu",
    status: "active",
    createdby: "SYS",
    createdat: "2023-08-08 10:00:00",
  },
  {
    pid: 2,
    permission: "Callback Log Menu",
    status: "active",
    createdby: "SYS",
    createdat: "2023-08-08 10:00:00",
  },
  {
    pid: 3,
    permission: "View Callback Logs",
    status: "active",
    createdby: "SYS",
    createdat: "2023-08-08 10:00:00",
  }]
}
export const cardListData={
  header:[
    {"label":"ID","column": "id"},
    {"label":"Card Name","column":"cardname"},
    {"label":"Account Name","column":"accountname"},
    {"label":"Account Number","column":"accountnumber"},
    {"label":"Card Type","column":"cardtype"}
  ],
  data:[{
    id:"0147845312",
    cardname:"Ipsom Test",
    accountname:"Ipsom T.",
    accountnumber:"05125125151",
    cardtype:"BPI"
}]
}
export const cardsData = {
  header:[
    {"label": "Date Requested", "column": "dateReq"},
    {"label": "Transaction No.", "column": "transaction"},
    {"label": "Client", "column": "client"},
    {"label": "Type", "column": "type"},
    {"label": "Destination", "column": "destination"},
    {"label": "Reference No.", "column": "ref"},
    {"label": "Source", "column": "source"},
    {"label": "Date Remitted", "column": "dateRem"},
    {"label": "Amount", "column": "amount"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      dateReq: "12:22:54-07/12/23",
      transaction: "01450114321",
      client: "Crazywin",
      type : "BANK",
      destination: "BPI#2",
      ref: "48826669538",
      source: "BPI#2",
      dateRem:"12:22:54-07/12/23",
      amount:"101,452.22",
      status:"Successful"
  },
  
  {
    dateReq: "12:22:54-07/12/23",
    transaction: "01450114322",
    client: "Crazywin",
    type : "BANK",
    destination: "BPI#2",
    ref: "48826669532",
    source: "BPI#2",
    dateRem:"12:22:54-07/12/23",
    amount:"101,452.22",
    status:"Successful"
  },
  {
    dateReq: "12:22:54-07/12/23",
    transaction: "01450114323",
    client: "Crazywin",
    type : "BANK",
    destination: "BPI#2",
    ref: "48826669532",
    source: "BPI#2",
    dateRem:"12:22:54-07/12/23",
    amount:"101,452.22",
    status:"Successful"
  },
  {
    dateReq: "12:22:54-07/12/23",
    transaction: "01450114322",
    client: "Crazywin",
    type : "BANK",
    destination: "BPI#2",
    ref: "48826669532",
    source: "BPI#2",
    dateRem:"12:22:54-07/12/23",
    amount:"101,452.22",
    status:"Successful"
  },
  {
    dateReq: "12:22:54-07/12/23",
    transaction: "01450114322",
    client: "Crazywin",
    type : "BANK",
    destination: "BPI#2",
    ref: "48826669532",
    source: "BPI#2",
    dateRem:"12:22:54-07/12/23",
    amount:"101,452.22",
    status:"Successful"
  },
  
  
  ]
};
export const transactionsData  = {
  header:[
    {"label": "Timestamp", "column": "timestamp"},
    {"label": "Transaction No.", "column": "transaction"},
    {"label": "Client", "column": "client"},
    {"label": "Type", "column": "type"},
    {"label": "Method", "column": "method"},
    {"label": "Merchant", "column": "merchant"},
    {"label": "Gross Amount", "column": "grossamount"},
    {"label": "Tran. Fee", "column": "transfee"},
    {"label": "Net Amount", "column": "netamount"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      timestamp: "12:22:54-07/12/23",
      transaction: "01450114321",
      client: "Crazywin",
      type : "CASH IN",
      method: "GCASH",
      merchant: "Mangopay",
      grossamount: "2,300.00",
      transfee:"-117.40",
      netamount:"2182.60",
      status:"SUCCESSFUL"
  },
  {
    timestamp: "12:22:54-07/12/23",
    transaction: "01450114321",
    client: "Crazywin",
    type : "CASH IN",
    method: "GCASH",
    merchant: "Mangopay",
    grossamount: "2,300.00",
    transfee:"-117.40",
    netamount:"2182.60",
    status:"SUCCESSFUL"
},
{
  timestamp: "12:22:54-07/12/23",
  transaction: "01450114321",
  client: "Crazywin",
  type : "CASH IN",
  method: "GCASH",
  merchant: "Mangopay",
  grossamount: "2,300.00",
  transfee:"-117.40",
  netamount:"2182.60",
  status:"SUCCESSFUL"
},
{
  timestamp: "12:22:54-07/12/23",
  transaction: "01450114321",
  client: "Crazywin",
  type : "CASH IN",
  method: "GCASH",
  merchant: "Mangopay",
  grossamount: "2,300.00",
  transfee:"-117.40",
  netamount:"2182.60",
  status:"SUCCESSFUL"
},
{
  timestamp: "12:22:54-07/12/23",
  transaction: "01450114321",
  client: "Crazywin",
  type : "CASH IN",
  method: "GCASH",
  merchant: "Mangopay",
  grossamount: "2,300.00",
  transfee:"-117.40",
  netamount:"2182.60",
  status:"SUCCESSFUL"
},
{
  timestamp: "12:22:54-07/12/23",
  transaction: "01450114321",
  client: "Crazywin",
  type : "CASH IN",
  method: "GCASH",
  merchant: "Mangopay",
  grossamount: "2,300.00",
  transfee:"-117.40",
  netamount:"2182.60",
  status:"SUCCESSFUL"
},
  
  
  ]
};
export const pendingRequestData = {
  header:[
    {"label": "Timestamp", "column": "timestamp"},
    {"label": "User ID", "column": "user"},
    {"label": "Transaction No.", "column": "trans"},
    {"label": "Client Name", "column": "client"},
    {"label": "Wallet", "column": "wallet"},
    {"label": "Type", "column": "type"},
    {"label": "Amount", "column": "amount"},
    {"label": "W Fee.", "column": "wfee"},
    {"label": "W. On Top", "column": "wtop"},
  ],
  data:[
    {
      timestamp: "12:22:54-07/12/23",
      user: "user00001",
      trans: "12309961238123",
      client : "Crazywin",
      wallet: "Ceramiq",
      type: "BANK",
      amount: "2,300.00",
      wfee:"-117.40",
      wtop:"-10.00",
  
  },
  {
    timestamp: "12:22:54-07/12/23",
    user: "user00001",
    trans: "12309961238123",
    client : "Crazywin",
    wallet: "Ceramiq",
    type: "BANK",
    amount: "2,300.00",
    wfee:"-117.40",
    wtop:"-10.00",

},
{
  timestamp: "12:22:54-07/12/23",
  user: "user00001",
  trans: "12309961238123",
  client : "Crazywin",
  wallet: "Ceramiq",
  type: "BANK",
  amount: "2,300.00",
  wfee:"-117.40",
  wtop:"-10.00",

},
{
  timestamp: "12:22:54-07/12/23",
  user: "user00001",
  trans: "12309961238123",
  client : "Crazywin",
  wallet: "Ceramiq",
  type: "BANK",
  amount: "2,300.00",
  wfee:"-117.40",
  wtop:"-10.00",

},
{
  timestamp: "12:22:54-07/12/23",
  user: "user00001",
  trans: "12309961238123",
  client : "Crazywin",
  wallet: "Ceramiq",
  type: "BANK",
  amount: "2,300.00",
  wfee:"-117.40",
  wtop:"-10.00",

},

  
  ]
};
export const historywithData = {
  header:[
    {"label": "Date Requested", "column": "datereq"},
    {"label": "Date Released", "column": "daterel"},
    {"label": "Client Name", "column": "client"},
    {"label": "Amount", "column": "amount"},
    {"label": "W. Fee Total", "column": "wtotal"},
    {"label": "Net Amount", "column": "netamount"},
    {"label": "Reference No.", "column": "ref"},
    {"label": "Released", "column": "released"},
    {"label": "Receipt", "column": "receipt"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      datereq: "12:22:54-07/12/23",
      daterel: "12:22:54-07/12/23",
      client: "Crazywin",
      amount: "2300.00",
      wtotal: "+500",
      netamount: "2800.00",
      ref: "59194558555",
      released:"admin913",
      receipt:"",
      status:"Sucessful",
  
  },
  {
    datereq: "12:22:54-07/12/23",
    daterel: "12:22:54-07/12/23",
    client: "Crazywin",
    amount: "2300.00",
    wtotal: "+500",
    netamount: "2800.00",
    ref: "59194558555",
    released:"admin913",
    receipt:"",
    status:"Sucessful",

},
{
  datereq: "12:22:54-07/12/23",
  daterel: "12:22:54-07/12/23",
  client: "Crazywin",
  amount: "2300.00",
  wtotal: "+500",
  netamount: "2800.00",
  ref: "59194558555",
  released:"admin913",
  receipt:"",
  status:"Sucessful",

}

  ]
};

export const integrationData = {
  provider:[

     {
        clientlabel: "TC Gaming",
        
      },
      {
        clientlabel: "MPS",
       
      }
  ],
  header:[
    {"label":"Client", "column":"client"
  },
  ],
  data:[{
    client: "Client1",
   
  },
  {
    client: "Client2",

  },
  {
    client: "Client3",
  }]
}

export const platformData = {
  header:[
    {"label":"Platform", "column":"platform"},
    {"label":"Active Brands", "column":"brands"},
    {"label":"Server IP", "column":"serverip"},
    {"label":"Whitelisted IP", "column":"ip"},
    {"label":"Callback URL", "column":"callback"},
    {"label":"Redirect URL", "column":"redirect"},

  ],
  data:[{
    platform:"TC Gaming",
    brands:"1",
    serverip:"198.168.254.254",
    ip:"198.168.254.254",
    callback:"https://google.com",
    redirect:"https://google.com",
   
  },
  {
    platform:"MPS Gaming",
    brands:"1",
    serverip:"198.168.254.254",
    ip:"198.168.254.254",
    callback:"https://google.com",
    redirect:"https://google.com",

  }]
}



export const activityLogsData = {
  header:[
    {"label":"Timestamp", "column":"Timestamp"},
    {"label":"Username", "column":"Username"},
    {"label":"Client Name", "column":"ClientName"},
    {"label":"Role", "column":"Role"},
    {"label":"Action Type", "column":"ActionType"},
    {"label":"Description", "column":"Description"},
  ],
  data:[{
    Timestamp:"12:22:54 - 07/02/23",
    Username:"User_Name1",
    ClientName:"Merchant1",
    Role:"Client Admin",
    ActionType:"LOGIN",
    Description:"Login with IP Address 192.168.254.254",
  },
]
}

export const integrationMangoPayData = {
  dashboard:[
      {
        label: "MangoPay",
      }
    ],
  header:[
    {"label": "Merchant", "column": "merchant"},
    {"label": "Active", "column": "active"},
    {"label": "Last Update", "column": "lastup"},
    {"label": "Redirect Success", "column": "redirsucc"},
    {"label": "Redirect Success", "column": "redirsucc1"},
    {"label": "Redirect Success", "column": "redirsucc2"},
  ],
  data:[
    {
      merchant: "MangoPay Gcash",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "MangoPay Maya",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "MangoPay Grabpay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "MangoPay Instapay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  ]
};
export const integrationCeramiqData = {
  dashboard:[
      {
        label: "Ceramiq",
      }
    ],
  header:[
    {"label": "Merchant", "column": "merchant"},
    {"label": "Active", "column": "active"},
    {"label": "Last Update", "column": "lastup"},
    {"label": "Redirect Success", "column": "redirsucc"},
    {"label": "Redirect Success", "column": "redirsucc1"},
    {"label": "Redirect Success", "column": "redirsucc2"},
  ],
  data:[
    {
      merchant: "Ceramiq Gcash",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "Ceramiq Maya",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "Ceramiq Grabpay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "Ceramiq Instapay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  ]
};
export const integrationBpayData = {
  dashboard:[
      {
        label: "Bpay",
      }
    ],
  header:[
    {"label": "Merchant", "column": "merchant"},
    {"label": "Active", "column": "active"},
    {"label": "Last Update", "column": "lastup"},
    {"label": "Redirect Success", "column": "redirsucc"},
    {"label": "Redirect Success", "column": "redirsucc1"},
    {"label": "Redirect Success", "column": "redirsucc2"},
  ],
  data:[
    {
      merchant: "BPay Gcash",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "BPay Maya",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "BPay Grabpay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  {
      merchant: "BPay Instapay",
      active: "1",
      lastup: "12:22:54-07/12/23",
      redirsucc: "https://www.google.com/",
      redirsucc1: "https://www.google.com/",
      redirsucc2: "https://www.google.com/",
  },
  ]
};
export const merchantlistData = {
  header:[
    {"label": "Merchant", "column": "merchant"},
    {"label": "Provider", "column": "provider"},
    {"label": "Controller", "column": "controller"},
    {"label": "Active", "column": "active"},
    {"label": "Reference Name", "column": "refname"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      merchant: "Gcash",
      provider: "Mangopay",
      controller: "Mangopay",
      active: "10",
      refname: "MangoPay-Gcash",
      status: "Active",
  },
   ]
};

 export const remittanceTransData = {
  header:[
    {"label": "Timestamp", "column": "time"},
    {"label": "Remittance ID", "column": "id"},
    {"label": "Total Amount", "column": "amount"},
    {"label": "Wallet", "column": "wallet"},
    {"label": "Date Remitted", "column": "remitdate"},
    {"label": "Reference No.", "column": "ref"},
    {"label": "Requestee", "column": "req"},
    {"label": "Status", "column": "status"},
    
  ],
  data:[
    {
      time:"12:22:54-07/12/23",
      id:"DEP6545546464",
      amount:1200,
      wallet:"CrazyWinPay1",
      remitdate:"Pending",
      ref:"-",
      req:"Admin88",
      status:"Pending",
    },
     {
      time:"12:22:54-07/12/23",
      id:"DEP6545546464",
      amount:1200,
      wallet:"CrazyWinPay1",
      remitdate:"Pending",
      ref:"-",
      req:"Admin88",
      status:"Pending",
    },
  ]
};
export const walletCardData = [
  {
    displayTitle: "CRAZYWIN PAY1",
    totalamount:"461,655,645",
    header: [
       {"label": "", "column": "img"},
      {"label": "", "column": "label"},
      {"label": "", "column": "value"},
    ],
    data: [
         {
        // img:"assets/payment_method/GCash-Logo 2.png",
        label: "Gcash",
        value: "516,616,62",
      },
      {
        // img:"assets/payment_method/maya.png",
        label: "Maya",
        value: "565,651,56",
      },
      {
      //  img:"assets/payment_method/grabpay.png", 
        label: "Grab Pay",
        value: "516,616,62",
      },
      {
        // img:"assets/payment_method/instapay.png",
        label: "Instapay",
        value: "565,651,56",
      },
      {
        // img:"",
        label: "Total Amount",
        value: "565,651,56",
      },
    ],
  },
  {
    displayTitle: "CRAZYWIN PAY2",
    displaytotalamount:"461,655,645",
    header: [
      {"label": "", "column": "label"},
      {"label": "", "column": "value"},
    ],
    data: [
       {

        label: "Gcash",
        value: "516,616,62",
      },
      {
        label: "Maya",
        value: "565,651,56",
      },
      {
        
        label: "Grab Pay",
        value: "516,616,62",
      },
      {
        label: "Total Amount",
        value: "565,651,56",
      },
    ],
  },
];



 export const clientListData = {
  header:[
   {"label": "Client Name", "column": "name"},
      {"label": "Gcash", "column": "gcashIn"},
      {"label": "Maya", "column": "mayaIn"},
      {"label": "GrabPay", "column": "grabIn"},
      {"label": "InstaPay", "column": "instaIn"},
      {"label": "Gcash", "column": "gcashOut"},
      {"label": "Maya", "column": "mayaOut"},
      {"label": "GrabPay", "column": "grabOut"},
      {"label": "InstaPay", "column": "instaOut"},
    
  ],
  data:[
    {
        name:"Crazywin",
        gcashIn:"Ceramiq",
        mayaIn:"Ceramiq",
        grabIn:"MangoPay",
        instaIn:"Ceramiq",
        gcashOut:"Ceramiq",
        mayaOut:"Ceramiq",
        grabOut:"MangoPay",
        instaOut:"Ceramiq",
    },
     {
        name:"APEX",
        gcashIn:"Ceramiq",
        mayaIn:"Ceramiq",
        grabIn:"MangoPay",
        instaIn:"Ceramiq",
        gcashOut:"Ceramiq",
        mayaOut:"Ceramiq",
        grabOut:"MangoPay",
        instaOut:"Ceramiq",
    },
  ]
};

export const merchantFeesData={
    header:[ 
            //  {"label": "toggle", "column": "toggle"},
            {"label": "Transaction Fee Name", "column": "feename"},
            {"label": "% Fee (AC)", "column": "ac"},
            {"label": "Fix Fee (AC)", "column": "fixac"},
            {"label": "% Fee (OT)", "column": "textbox1"},
            {"label": "Fix Fee (OT)", "column": "textbox2"}
        ],
    data:[
      {
        feename:"Cash In Fee",
        ac:"3.2%",
        fixac:"10.0",
        
    },
     {
        feename:"Cash Out Fee",
        ac:"3.2%",
        fixac:"10.0",
       
    },
]
}
export const vendorData = {
  displayTitle:[
   {
     vendor:"BPAY"
   },
   {
     vendor:"PePAY"
   }
  ],
    header: [ 
       {"label": "Status", "column": "toggle"},
      {"label": "Merchant", "column": "merchantbe"},
      {"label": "CI. FEE %", "column": "ciat"},
      {"label": "CI FEE FIXED", "column": "cifixedat"},
     {"label": "CI. FEE %", "column": "textbox1"},
      {"label": "CI FEE FIXED", "column": "textbox1"}
    ],

    data: [
         {
        merchantbe:"GCASH",
        ciat:"1.5%",
        cifixedat:"5.0",
      },
      {
        merchantbe:"MAYA",
        ciat:"1.5%",
        cifixedat:"5.0",
      },
      {
        merchantbe:"Grabpay",
        ciat:"1.5%",
        cifixedat:"5.0",
      },
      {
        merchantbe:"Instapay",
        ciat:"1.5%",
        cifixedat:"5.0",
      },
    ]
  
  }
export const merchantTransFees={
    header:[ 
            {"label": "Payment Channel", "column": "pay"},
            {"label": "Client", "column": "client"},
            {"label": "CI Fee %", "column": "ci"},
            {"label": "CI Fee Fixed", "column": "cifixed"},
            {"label": "CO Fee %", "column": "CO"},
            {"label": "CO Fee Fixed", "column": "cofixed"},
        ],
    data:[
      {
        pay:"Gcash",
        client:"Manila Play01",
        ci:"3.2%",
        cifixed:"10.0",
        co:"3.2%",
        cofixed:"10.0",
    },
     {
        pay:"Maya",
        client:"Manila Play02",
        ci:"3.2%",
        cifixed:"10.0",
        co:"3.2%",
        cofixed:"10.0",
    },{
       pay:"Grabpay",
        client:"Manila Play03",
        ci:"3.2%",
        cifixed:"10.0",
        co:"3.2%",
        cofixed:"10.0",
    },{
      pay:"Instapay",
        client:"Manila Play04",
        ci:"3.2%",
        cifixed:"10.0",
        co:"3.2%",
        cofixed:"10.0",
    }
    
]
}
export const vendorWithdrawalFees={
    header:[ 
            {"label": "Vendor", "column": "vendor"},
            {"label": "W. %Fee", "column": "fee"},
            
        ],
    data:[
      {
        vendor:"Manila Play01",
        fee:"3.2%",
    },
     {
        vendor:"Manila Play02",
        fee:"3.2%",
    },
    {
        vendor:"Manila Play03",
        fee:"3.2%",
    },
     {
        vendor:"Manila Play04",
        fee:"3.2%",
    }
    
]
}
export const clientTransaction ={
  header:[
    {"label": "Timestamp", "column": "timestamp"},
    {"label": "Transaction No.", "column": "transaction"},
    {"label": "User ID", "column": "userid"},
    {"label": "Client", "column": "client"},
    {"label": "Type", "column": "type"},
    {"label": "Merchant Name", "column": "merchant"},
    {"label": "P. Method", "column": "method"},
    {"label": "Gross Amount", "column": "gross"},
    {"label": "Fee %", "column": "ci"},
    {"label": "Fix Fee % ", "column": "fix"},
    {"label": "Net Amount", "column": "net"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      timestamp: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      userid:'User001',
      client: 'Client1',
      type: 'Cash-In',
      merchant:'ceramiq',
      method:'Gcash',
      gross:'20,200',
      ci: '117.0',
      fix: "-177.40",
      ac: "-177.40",
      fixac: "-177.40",
      net: "20,200",
      status: "Successful",

    },
    {
      timestamp: '2023-08-08 10:00:00',
      transaction: 'CI0001',
      userid:'User001',
      client: 'Client1',
      type: 'Cash-In',
      merchant:'ceramiq',
      method:'Gcash',
      gross:'20,200',
      ci: '117.0',
      fix: "-177.40",
      ac: "-177.40",
      fixac: "-177.40",
      net: "20,200",
      status: "Successful",
    },
  ]
}



export const agentremittancetable = { 
  header:[
    {"label": "AgentID", "column": "agentid"},
    {"label": "Name", "column": "name"},
    {"label": "Client", "column": "client"},
    {"label": "Remittance", "column": "remittance"},
    {"label": "Wallet Balance", "column": "walletbalance"},
    {"label": "Status", "column": "status"},
  ],
  data:[
    {
      agentid: "A12345",
      name: "John Doe",
      client: "Crazywin",
      remittance: "2300.00",
      walletbalance: "2800.00",
      status: "Successful",
    },
    {
      agentid: "A12346",
      name: "Jane Smith",
      client: "Fastwin",
      remittance: "5000.00",
      walletbalance: "6000.00",
      status: "Pending",
    },
    {
      agentid: "A12347",
      name: "Mike Johnson",
      client: "Superwin",
      remittance: "1200.00",
      walletbalance: "1700.00",
      status: "Failed",
    }
  ]
};







export const agentremittancetabletransactions = { 
  header:[
    {"label": "Status", "column": "status"},
    {"label": "Timestamp", "column": "timestamp"},
    {"label": "Remittance ID", "column": "remittanceId"},
    {"label": "Agent", "column": "agent"},
    {"label": "Total Amount", "column": "totalamount"},
    {"label": "With Count", "column": "withCount"},
    {"label": "Date Remitted", "column": "dateremitted"},
    {"label": "Bank Deposited", "column": "bankdeposited"},
    {"label": "Receipt", "column": "receipt"},
    {"label": "Reference No.", "column": "referenceno"},
    {"label": "Requestee", "column": "requestee"},
    {"label": "Approved By", "column": "approvedby"}
  ],
  data:[
    {
      status: "A12345",
      timestamp: "12:22:54 - 07/12/23",
      remittanceId: "209405802930",
      agent: "John Doe",
      totalamount: "2800.00",
      withCount: "200",
      dateremitted: "07/12/23 - 07/12/23",
      bankdeposited: "200",
      receipt: "2800.00",
      referenceno: "205039423",
      requestee: "Admin 88",
      approvedby: "Bruce wayne",
    },
    {
       status: "A12345",
      timestamp: "12:22:54 - 07/12/23",
      remittanceId: "209405802930",
      agent: "John Doe",
      totalamount: "2800.00",
      withCount: "200",
      dateremitted: "07/12/23 - 07/12/23",
      bankdeposited: "200",
      receipt: "2800.00",
      referenceno: "205039423",
      requestee: "Admin 88",
      approvedby: "Bruce wayne",
    },
    {
       status: "A12345",
      timestamp: "12:22:54 - 07/12/23",
      remittanceId: "209405802930",
      agent: "John Doe",
      totalamount: "2800.00",
      withCount: "200",
      dateremitted: "07/12/23 - 07/12/23",
      bankdeposited: "200",
      receipt: "2800.00",
      referenceno: "205039423",
      requestee: "Admin 88",
      approvedby: "Bruce wayne",
    }
  ]
};

export const Banks = [
  {
    name: "Alipay / Lazada Wallet",
    description: "PH_API",
    code: "PH_API",
    status: true
  },
  {
    name: "AllBank (A Thrift Bank), Inc.",
    description: "PH_ALLBI",
    code: "PH_ALLBI",
    status: true
  },
  {
    name: "Asia United Bank Corporation",
    description: "PH_AUB",
    code: "PH_AUB",
    status: true
  },
  {
    name: "Bananapay Fintech Services",
    description: "BFSRPHM2XXX",
    code: "BFSRPHM2XXX",
    status: true
  },
  {
    name: "Banco De Oro Unibank, Inc",
    description: "PH_BDOU",
    code: "PH_BDOU",
    status: true
  },
  {
    name: "Banco Laguna Inc / SeaBank",
    description: "LAUIPHM2XXX",
    code: "LAUIPHM2XXX",
    status: true
  },
  {
    name: "Bangko Mabuhay (A Rural Bank), Inc.",
    description: "PH_MABUHAY",
    code: "PH_MABUHAY",
    status: true
  },
  {
    name: "Bank of China",
    description: "BKCHPHMMXXX",
    code: "BKCHPHMMXXX",
    status: true
  },
  {
    name: "Bank of Commerce, Inc.",
    description: "PH_BOC",
    code: "PH_BOC",
    status: true
  },
  {
    name: "Bank of the Philippine Islands / BPI Family",
    description: "PH_BPI",
    code: "PH_BPI",
    status: true
  },
  {
    name: "BanKo, A Subsidiary of BPI",
    description: "BPDIPHM1XXX",
    code: "BPDIPHM1XXX",
    status: true
  },
  {
    name: "Bayanihan Bank",
    description: "RUATPHM1XXX",
    code: "RUATPHM1XXX",
    status: true
  },
  {
    name: "BDO Network Bank, Inc.",
    description: "PH_BDONB",
    code: "PH_BDONB",
    status: true
  },
  {
    name: "BDO Unibank, Inc.",
    description: "PH_BDO",
    code: "PH_BDO",
    status: true
  },
  {
    name: "Binangonan Rural Bank / BRBDigital",
    description: "PH_BRBI",
    code: "PH_BRBI",
    status: true
  },
  {
    name: "BN - Test Tool",
    description: "BANCNET2XXX",
    code: "BANCNET2XXX",
    status: true
  },
  {
    name: "BN Test Tool 2",
    description: "BANCNET3XXX",
    code: "BANCNET3XXX",
    status: true
  },
  {
    name: "BPI / BPI Family Bank",
    description: "PH_BPI",
    code: "PH_BPI",
    status: true
  },
  {
    name: "BPI Direct Banko, Inc., A Savings Bank",
    description: "PH_BDBI",
    code: "PH_BDBI",
    status: true
  },
  {
    name: "Camalig Bank",
    description: "PH_CMLB",
    code: "PH_CMLB",
    status: true
  },
  {
    name: "Cantilan Bank Inc",
    description: "CNRLPHM1XXX",
    code: "CNRLPHM1XXX",
    status: true
  },
  {
    name: "Card Bank, Inc.",
    description: "PH_CDBI",
    code: "PH_CDBI",
    status: true
  },
  {
    name: "CARD MRI RIZAL BANK INC",
    description: "CAMZPHM2XXX",
    code: "CAMZPHM2XXX",
    status: true
  },
  {
    name: "CARD SME Bank Inc.",
    description: "PH_CSMEBI",
    code: "PH_CSMEBI",
    status: true
  },
  {
    name: "Cebuana Lhuillier Bank / Cebuana Xpress",
    description: "PH_CLRB",
    code: "PH_CLRB",
    status: true
  },
  {
    name: "China Bank Savings, Inc.",
    description: "PH_CBS",
    code: "PH_CBS",
    status: true
  },
  {
    name: "China Banking Corporation",
    description: "PH_CBCN",
    code: "PH_CBCN",
    status: true
  },
  {
    name: "CIMB Bank Philippines Inc.",
    description: "PH_CIMBBP",
    code: "PH_CIMBBP",
    status: true
  },
  {
    name: "CIS Bayad Center / Bayad",
    description: "PH_CBCI",
    code: "PH_CBCI",
    status: true
  },
  {
    name: "City Savings Bank",
    description: "CIVAPHM1XXX",
    code: "CIVAPHM1XXX",
    status: true
  },
  {
    name: "Community Rural Bank of Romblon, Inc.",
    description: "PH_CRBR",
    code: "PH_CRBR",
    status: true
  },
  {
    name: "CTBC Bank (Philippines) Corporation",
    description: "PH_CTBCPH",
    code: "PH_CTBCPH",
    status: true
  },
  {
    name: "DCPay / COINS.PH",
    description: "PH_DCPP",
    code: "PH_DCPP",
    status: true
  },
  {
    name: "Development Bank of the Philippines",
    description: "PH_DBOTP",
    code: "PH_DBOTP",
    status: true
  },
  {
    name: "Dumaguete City Development Bank",
    description: "PH_DCDB",
    code: "PH_DCDB",
    status: true
  },
  {
    name: "Dungganon Bank (A Microfinance Rural Bank), Inc.",
    description: "PH_DUNGGANUN",
    code: "PH_DUNGGANUN",
    status: true
  },
  {
    name: "East West Banking Corporation",
    description: "PH_EWB",
    code: "PH_EWB",
    status: true
  },
  {
    name: "East West Rural Bank / Komo",
    description: "EAWRPHM2XXX",
    code: "EAWRPHM2XXX",
    status: true
  },
  {
    name: "East West Rural Bank, Inc.",
    description: "PH_EWBRB",
    code: "PH_EWBRB",
    status: true
  },
  {
    name: "Easy Pay Global EMI Corp",
    description: "EAGMPHM2XXX",
    code: "EAGMPHM2XXX",
    status: true
  },
  {
    name: "Ecashpay Asia",
    description: "7014",
    code: "7015",
    status: true
  },
  {
    name: "Entrepreneur Bank Inc. (A Rural Bank)",
    description: "450",
    code: "451",
    status: true
  },
  {
    name: "Equicom Savings Bank, Inc.",
    description: "PH_EQB",
    code: "PH_EQB",
    status: true
  },
  {
    name: "G-Xchange / GCash",
    description: "PH_GXI",
    code: "PH_GXI",
    status: true
  },
  {
    name: "GrabPay",
    description: "PH_GBY",
    code: "PH_GBY",
    status: true
  },
  {
    name: "HSBC",
    description: "HSBCPHMMXXX",
    code: "HSBCPHMMXXX",
    status: true
  },
  {
    name: "Infoserve / Nationlink",
    description: "IFIPPHM2XXX",
    code: "IFIPPHM2XXX",
    status: true
  },
  {
    name: "ING Bank N.V.",
    description: "PH_ING",
    code: "PH_ING",
    status: true
  },
  {
    name: "I-Remit Inc",
    description: "7027",
    code: "7028",
    status: true
  },
  {
    name: "ISLA Bank (A Thrift Bank), Inc.",
    description: "PH_ISLA",
    code: "PH_ISLA",
    status: true
  },
  {
    name: "ISO Dummy Bank",
    description: "BANKPHPH002",
    code: "BANKPHPH003",
    status: true
  },
  {
    name: "LANDBANK / OFBank",
    description: "PH_LBP",
    code: "PH_LBP",
    status: true
  },
  {
    name: "LEGAZPI SAVINGS BANK",
    description: "PH_LSBI",
    code: "PH_LSBI",
    status: true
  },
  {
    name: "Lulu Financial Services Phil Inc.",
    description: "PH_LFSP",
    code: "PH_LFSP",
    status: true
  },
  {
    name: "Luzon Development Bank",
    description: "330",
    code: "331",
    status: true
  },
  {
    name: "Malayan Bank Savings and Mortgage Bank, Inc.",
    description: "PH_MBSMB",
    code: "PH_MBSMB",
    status: true
  },
  {
    name: "MarCoPay Inc",
    description: "MAYCPHM2XXX",
    code: "MAYCPHM2XXX",
    status: true
  },
  {
    name: "Maya / Paymaya Philippines, Inc.",
    description: "PH_PMP",
    code: "PH_PMP",
    status: true
  },
  {
    name: "Maybank Philippines, Inc.",
    description: "PH_MAYBANK",
    code: "PH_MAYBANK",
    status: true
  },
  {
    name: "Metropolitan Bank and Trust Company",
    description: "PH_METRO",
    code: "PH_METRO",
    status: true
  },
  {
    name: "MINDANAO CONSOLIDATED COOPERATIVE",
    description: "PH_MCC",
    code: "PH_MCC",
    status: true
  },
  {
    name: "Netbank",
    description: "CUOBPHM2XXX",
    code: "CUOBPHM2XXX",
    status: true
  },
  {
    name: "Omnipay, Inc.",
    description: "868",
    code: "869",
    status: true
  },
  {
    name: "Overseas Filipino Bank, Inc.",
    description: "2",
    code: "3",
    status: true
  },
  {
    name: "Own Bank The Rural  Bank of Cavite City Inc.",
    description: "7036",
    code: "7037",
    status: true
  },
  {
    name: "Pacific Ace Savings Bank",
    description: "67",
    code: "68",
    status: true
  },
  {
    name: "Palawan Pay",
    description: "PH_PALP",
    code: "PH_PALP",
    status: true
  },
  {
    name: "Partner Rural Bank (Cotabato), Inc.",
    description: "PH_PRBC",
    code: "PH_PRBC",
    status: true
  },
  {
    name: "PayMongo Payments Inc",
    description: "PAEYPHM2XXX",
    code: "PAEYPHM2XXX",
    status: true
  },
  {
    name: "Paynamics Technology Inc",
    description: "7013",
    code: "7014",
    status: true
  },
  {
    name: "Philippine Bank of Communications",
    description: "PH_PBCOM",
    code: "PH_PBCOM",
    status: true
  },
  {
    name: "Philippine Business Bank, Inc., A Savings Bank",
    description: "PH_PBB",
    code: "PH_PBB",
    status: true
  },
  {
    name: "Philippine Digital Asset Exchange, Inc., / PDAX",
    description: "PDAXPHM2XXX",
    code: "PDAXPHM2XXX",
    status: true
  },
  {
    name: "Philippine National Bank",
    description: "PH_PNB",
    code: "PH_PNB",
    status: true
  },
  {
    name: "Philippine Savings Bank",
    description: "PH_PSB",
    code: "PH_PSB",
    status: true
  },
  {
    name: "Philippine Trust Company",
    description: "PH_PHILTRUST",
    code: "PH_PHILTRUST",
    status: true
  },
  {
    name: "Philippine Veterans Bank",
    description: "PH_PVB",
    code: "PH_PVB",
    status: true
  },
  {
    name: "PhilTrust Bank",
    description: "PHTBPHMMXXX",
    code: "PHTBPHMMXXX",
    status: true
  },
  {
    name: "Producers Bank",
    description: "PH_PROSB",
    code: "PH_PROSB",
    status: true
  },
  {
    name: "Queen City Development Bank",
    description: "PH_QCDB",
    code: "PH_QCDB",
    status: true
  },
  {
    name: "QUEENBANK",
    description: "PH_QCDB",
    code: "PH_QCDB",
    status: true
  },
  {
    name: "Quezon Capital Rural Bank, Inc.",
    description: "PH_QCRB",
    code: "PH_QCRB",
    status: true
  },
  {
    name: "Rang-ay Bank Inc.",
    description: "RARLPHM1XXX",
    code: "RARLPHM1XXX",
    status: true
  },
  {
    name: "RCBC/DiskarTech",
    description: "PH_RCBC",
    code: "PH_RCBC",
    status: true
  },
  {
    name: "Rizal Commercial Banking Corporation",
    description: "PH_RCBC",
    code: "PH_RCBC",
    status: true
  },
  {
    name: "Robinsons Bank",
    description: "PH_RSB",
    code: "PH_RSB",
    status: true
  },
  {
    name: "Rural Bank of Guinobatan / Asenso",
    description: "PH_RBOG",
    code: "PH_RBOG",
    status: true
  },
  {
    name: "SEABANK PHILIPPINES, INC. (A RURAL BANK)",
    description: "PH_SBPI",
    code: "PH_SBPI",
    status: true
  },
  {
    name: "Security Bank Corporation",
    description: "PH_SB",
    code: "PH_SB",
    status: true
  },
  {
    name: "ShopeePay Philippines Inc.",
    description: "PH_SPPI",
    code: "PH_SPPI",
    status: true
  },
  {
    name: "SpeedyPay Inc.",
    description: "SPEYPHM2XXX",
    code: "SPEYPHM2XXX",
    status: true
  },
  {
    name: "Standard Chartered Bank",
    description: "PH_TSCB",
    code: "PH_TSCB",
    status: true
  },
  {
    name: "Starpay Corporation",
    description: "PH_SPCP",
    code: "PH_SPCP",
    status: true
  },
  {
    name: "Sterling Bank of Asia, Inc., A Savings Bank",
    description: "PH_STERLING",
    code: "PH_STERLING",
    status: true
  },
  {
    name: "Sun Savings Bank, Inc.",
    description: "PH_SUNSB",
    code: "PH_SUNSB",
    status: true
  },
  {
    name: "Tayocash Inc.",
    description: "PH_TYI",
    code: "PH_TYI",
    status: true
  },
  {
    name: "Toktokwallet Inc.",
    description: "TOKTPHM2XXX",
    code: "TOKTPHM2XXX",
    status: true
  },
  {
    name: "Tonik Bank",
    description: "TDBIPHM2XXX",
    code: "TDBIPHM2XXX",
    status: true
  },
  {
    name: "TopJuan Tech Corporation",
    description: "TOPJPHM2XXX",
    code: "TOPJPHM2XXX",
    status: true
  },
  {
    name: "Traxion Pay Inc.",
    description: "TRXPPHM2XXX",
    code: "TRXPPHM2XXX",
    status: true
  },
  {
    name: "UCPB Savings Bank, Inc.",
    description: "PH_UCPBSB",
    code: "PH_UCPBSB",
    status: true
  },
  {
    name: "Union Bank of the Philippines",
    description: "PH_UB",
    code: "PH_UB",
    status: true
  },
  {
    name: "Uniondigital",
    description: "UNODPHM2XXX",
    code: "UNODPHM2XXX",
    status: true
  },
  {
    name: "United Coconut Planters Bank",
    description: "PH_UCPB",
    code: "PH_UCPB",
    status: true
  },
  {
    name: "UNOBANK INC",
    description: "7034",
    code: "7035",
    status: true
  },
  {
    name: "USSC Money Services Inc",
    description: "PH_UMS",
    code: "PH_UMS",
    status: true
  },
  {
    name: "Vigan Banco Rural Incorporada",
    description: "VBRIPHM2XXX",
    code: "VBRIPHM2XXX",
    status: true
  },
  {
    name: "Wealth Development Bank Corporation",
    description: "PH_WDB",
    code: "PH_WDB",
    status: true
  },
  {
    name: "Wise Pilipinas Inc",
    description: "TRWIPHM2XXX",
    code: "TRWIPHM2XXX",
    status: true
  },
  {
    name: "Zybi Tech Inc. / JuanCash",
    description: "PH_ZYBI",
    code: "PH_ZYBI",
    status: true
  }
]



