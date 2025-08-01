import { INavbarData } from "../interface/sidenavHelper";
import { Navigation } from "./common";

export const sidenavData: INavbarData[] = [
    {
        routeLink: 'dashboard',
        page: '/admin/dashboard',
        icon: 'fal fa-chart-line',
        label: 'dashboard',
        name: Navigation.Dashboard,
        isMaintenance: false,
    },
    {
        routeLink: 'users',
        icon: 'fal fa-solid fa-users',
        label: 'manageUsers',
        items: [
            {
                routeLink: 'manage/users',
                label: 'usersList',
                page: '/admin/manage/users',
                name:  Navigation.UserManagement,
                isMaintenance: false, 
                message: 'The User Management page is currently unavailable.',
            },
            {
                routeLink: 'manage/whitelisting',
                label: 'ipWhitelisting',
                page: '/admin/manage/whitelisting',
                isMaintenance: false, 
                name: Navigation.IPWhitelisting
            },
            {
                routeLink: 'manage/roles',
                label: 'roleManagement',
                page: '/admin/manage/roles',
                isMaintenance: false, 
                name: Navigation.RoleManagement
            },
            {
                routeLink: 'manage/activitylogs',
                label: 'activityLogs',
                page: '/admin/manage/activitylogs',
                isMaintenance: false, 
                name: Navigation.ActivityLogs
            },
        ]
    },
    {
        routeLink: 'manage/merchants',
        icon: 'fal fa-solid fa-store',
        label: 'merchants',
        page: '/admin/manage/merchants',
        name: Navigation.Merchants,
        isMaintenance: false,
       
    },
    {
        routeLink: 'vendors/list',
        icon: 'fal fa-solid fa-store',
        label: 'vendors',
        page: '/admin/vendors/list',
        name: Navigation.Vendors,
        isMaintenance: false,
    },
    {
        routeLink: 'phpayclients',
        icon: 'fal fa-solid fa-users',
        label: 'clients',
        items: [
            {
                routeLink: 'phpayclients/list',
                label: 'clientsList',
                name: Navigation.ClientList,
                page: '/admin/phpayclients/list',
                isMaintenance: false,
            },
            {
                routeLink: 'phpayclients/cashoutfunds',
                label: 'availableBalance',
                page: '/admin/phpayclients/cashoutfunds',
                name: Navigation.COFunds,
                isMaintenance: false,
            },

            {
                routeLink:'phpayclients/transfers',
                label: 'transferBalance',
                page: '/admin/phpayclients/transfers',
                name: Navigation.BalanceTransfer,
                isMaintenance: false,
            },
            {
                routeLink:'phpayclients/remittances',
                label: 'remitanceclient',
                page: '/admin/phpayclients/remittances',
                name: Navigation.Remittances,
                isMaintenance: false,
            },
            
        ]
    },
    {
        routeLink: 'agents',
        icon: 'fal fa-solid fa-users',
        label: 'agent',
        items: [
            {
                routeLink: 'agent/dashboard',
                label: 'dashboard',
                page: '/admin/agent/dashboard',
                name: Navigation.AgentDashboard,
                isMaintenance: false,
                 
            },
            {
                routeLink: 'agent/management',
                label: 'agentManagement',
                page: '/admin/agent/management',
                name: Navigation.AgentManagement,
                isMaintenance: false,
                 
            },
            {
                routeLink: 'agent/remittance',
                label: 'agentRemittance',
                page: '/admin/agent/remittance',
                name: Navigation.AgentRemittance,
                isMaintenance: false,
            },
            {
                routeLink: 'agent/remittance/form',
                label: 'agentRemittanceForm',
                page: '/admin/agent/remittanceform',
                name: Navigation.AgentRemittanceForm,
                isMaintenance: false,
            },
            {
                routeLink: 'agent/balance/transfer',
                label: 'agentBalanceTransfer',
                page: '/admin/agent/balance/transfer',
                name: Navigation.AgentBalanceTransfer,
                isMaintenance: false,

            },
            {
                routeLink: 'agent/agent/allocation',
                label: 'agentAllocation',
                page: '/admin/agent/agent/allocation',
                name: Navigation.AgentAllocation,
                isMaintenance: false,

            },
            {
                routeLink: 'agent/account/flow/records',
                label: 'agentAccountFlowRecords',
                page: '/admin/agent/accountflowrecords',
                name: Navigation.AgentFlowRecords,
                isMaintenance: false,
            },
            {
                routeLink: 'agent/agent/cards/list',
                label: 'agentCards',
                page: '/admin/agent/agent/cards',
                name: Navigation.AgentCards,
                isMaintenance: false,

            }
        ]
    },
    {
        routeLink: 'cards/list',
        icon: 'fal fa-solid fa-credit-card',
        label: 'cardsList',
        page: '/admin/cards/list',
        name: Navigation.CardList,
        isMaintenance: false,

    },
    {
        routeLink: 'admin/reports',
        icon: 'fal fa-solid fa-file-contract',
        label: 'reports',
        page: '/admin/admin/reports',
        name: Navigation.Reports,
        isMaintenance: false,

    },
    {
        routeLink: 'admin/transactions',
        icon: 'fal fa-solid fa-list',
        label: 'transactions',
        page: '/admin/admin/transactions',
        name: Navigation.Transactions,
        isMaintenance: false,

    },
    {
        routeLink:'integration',
         icon: 'fal fa-microchip',
         label: 'integration',
         page: '/admin/integration',
         name: Navigation.Integration,
         isMaintenance: false,

    },
   
];



export const AgentSidenavData : INavbarData[] = [
    {
        routeLink:'dashboard',
        icon: 'fal fa-chart-line',
        label: 'dashboard',
        page: '/agent/dashboard',
        name: Navigation.AgentDashboard,
        isMaintenance: false,
    },
    {
        routeLink:'management',
        icon: 'fal fa-user-alt',
        label: 'agentManagement',
        page: '/agent/management',
        name: Navigation.AgentManagement,
        isMaintenance: false,
    }, 
    {
        routeLink:'reports',
        icon: 'fal fa-solid fa-file-contract',
        label: 'reports',
        items: [
            {
                routeLink: 'reports/transaction/logs',
                label: 'agentTransactionLogs',
                page: '/agent/reports/transaction/logs',
                name: Navigation.AgentTransactionLogs,
                isMaintenance: false,     

            },
            {
                routeLink: 'reports/account/flow/records',
                label: 'agentAccountFlowRecords',
                page: '/agent/reports/account/flow/records',
                name: Navigation.AgentFlowRecords,
                isMaintenance: false,
            },
        ],
    },
    {
        routeLink:'remittance',
        icon: 'fal fa-solid fa-clipboard-list',
        label: 'agentFunds',
        page: '/agent/remittance',
        name: Navigation.AgentRemittance,
        isMaintenance: false,

    },
    {
        routeLink:'card/list',
        icon: 'fal fa-solid fa-credit-card',
        label: 'cardsList',
        page: '/agent/card/list',
        name: Navigation.AgentCards,
        isMaintenance: false,
    },
   
]


export const ClientsidenavData : INavbarData[] = [
    {
        routeLink:'dashboard',
        icon: 'fal fa-chart-line',
        label: 'dashboard',
        page: '/client/dashboard',
        name: Navigation.Dashboard,
        isMaintenance: false,
    },
    {
        routeLink:'users',
        icon: 'fal fa-solid fa-users',
        label: 'manageUsers',
        items:[
            {
                routeLink:'manage/users',
                label: 'usersList',
                page: '/client/manage/users',
                name: Navigation.UserManagement,
                isMaintenance: false,
            },
            
            {
                routeLink:'manage/activity/logs',
                label: 'activityLogs',
                page: '/client/manage/activity/logs',
                name: Navigation.ActivityLogs,
                isMaintenance: false,
                
            },
        ],
    },

     {
         routeLink:'merchants',
         icon: 'fal fa-solid fa-store',
         label: 'merchants',
         page: '/client/merchants',
         name: Navigation.Merchants,
         isMaintenance: false,

    },
    {
        routeLink:'cards',
        icon: 'fal fa-solid fa-credit-card',
        label: 'cardsList',
        page: '/client/cards',
        name: Navigation.CardList,
        isMaintenance: false,

    },
    {
        routeLink:'reports',
        icon: 'fal fa-solid fa-file-contract',
        label: 'reports',
        page: '/client/reports',
        name: Navigation.Reports,
        isMaintenance: false,

    },
    
    {
        routeLink:'transactions',
        icon: 'fal fa-solid fa-list',
        label: 'transactions',
        page: '/client/transactions',
        name: Navigation.Transactions,
        isMaintenance: false,

    },

    {
        routeLink:'remittance',
        icon:'fal fa-solid fa-clipboard-list',
        label:'remittance',
        page: '/client/remittance',
        name: Navigation.Remittances,
        isMaintenance: false,
    },
    {
        routeLink:'balance/transfer',
        icon:'fal fa-solid fa-clipboard-list',
        label:'transferBalance',
        page: '/client/balance/transfer',
        name: Navigation.BalanceTransfer,
        isMaintenance: false,
    },
    {
        routeLink:'coFundTransfer',
        icon:'fal fa-solid fa-exchange',
        label:'cofundtransfer',
        page: '/client/coFundTransfer',
        name: Navigation.COFunds,
        isMaintenance: false,
    }

]

export const fixSidenavData : INavbarData[] = [
    {
        routeLink:'help',
        icon: 'fal fa-question',
        label: 'helpCenter',
        name: Navigation.Help

    },
    
    {
        routeLink:'logout',
        icon: 'fal fa-sign-out',
        label: 'logout',
        name: Navigation.Logout
    }
]