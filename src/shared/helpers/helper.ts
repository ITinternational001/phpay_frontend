import { DatePipe, DecimalPipe } from "@angular/common";
import { COFToRemittance, COFToWallet, ConfigFeeMethod, remittanceToCOF, Status, TopUpStatus, TransactionStatus, TransferMethod, WalletToCOF } from "../dataprovider/local/data/common";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { style } from '@angular/animations';
import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms";
import { SessionManager } from "./session-manager";
import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";


export const booleanify = (value: string): boolean => {
    const truthy: string[] = [
        'true',
        'True',
        '1'
    ]
    return truthy.includes(value)
}

export function convertToISO(date: Date): string {
    if (!date) return '';

    // Ensure the date is in UTC
    const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));

    // Format the date to ISO string and remove milliseconds
    return utcDate.toISOString().split('.')[0] + '.000Z';
}

export function getStatusName(id: number, data: any): string | undefined {
    const status = data.find((item: any) => item.Id === id);
    return status ? status.Type : undefined;
}

export function getAgentTypeName(id: number, data: any): string | undefined {
    const type = data.find((item: any) => item.Id === id);
    return type ? type.Type : undefined;
}

export function getAgentTypeId(name: string, data: any): number | undefined {
    const type = data.find((item: any) => item.Type === name);
    return type ? type.Id : undefined;
}

export function getStatusId(name: string, data: any): number | undefined {
    const status = data.find((item: any) => item.Type === name);
    return status ? status.Id : undefined;
}




export function getClientId(Id: string): number | undefined {
    var clientId: number;
    if (Id !== null) {
        clientId = parseInt(sessionStorage.getItem('clientId') as string);
        return clientId
    } else {
        return 0;
    }
}

export function getAgentId(Id: string): number | undefined {
    let agentId: number;
    if (Id !== null) {
        agentId = parseInt(sessionStorage.getItem('agentId') as string);
        return agentId
    } else {
        return 0;
    }
}

export function getRoleNameById(roleId: number, roles: any[]): string | undefined {
    const role = roles.find(role => role.RoleID === roleId);
    return role ? role.RoleName : undefined;
}

export function formatDateUtc(dateString: string, datePipe: DatePipe, isDateOnly?: boolean, isTimeOnly?: boolean): string {
    if (dateString) { // Check if dateString is defined
        const dateObj = new Date(dateString);

        // Add 8 hours to the date
        dateObj.setHours(dateObj.getHours() + 8);
        // Get UTC date and time string
        const utcDateString = dateObj.toUTCString();

        // Extract UTC time and date components
        const utcTime = utcDateString.slice(17, 25);
        const utcDate = utcDateString.slice(5, 16);

        // Format as "HH:mm:ss - dd/MM/yyyy"
        let formattedDate = `${utcTime} - ${utcDate}`;
        if (isDateOnly) {
            formattedDate = `${utcDate}`;
        }
        if (isTimeOnly) {
            formattedDate = `${utcTime}`;
        }
        return formattedDate; // Output in format: HH:mm:ss - dd/MM/yyyy
    } else {
        return ' - ';
    }
}

export function DecimalPipeConverter(value: number, decimalPipe: DecimalPipe) {
    return decimalPipe.transform(value, '1.2-2');
}

export function getWeekBeforeDateRange(days?: number): { startDate: Date, endDate: Date } {
    // Always 1 week before the current date
    let currentDate = new Date();

    // Set endDate as the current date and time
    let endDate = new Date(currentDate);
    // Set startDate as one week before the current date
    let startDate = new Date(currentDate);
    
    startDate.setDate(startDate.getDate() - (days != null ? days: 1));

    return { startDate, endDate };
}


export function convertToFormattedDate(date: Date, _datepipe: DatePipe): Date {
    const formattedDate = _datepipe.transform(date, 'yyyy-MM-dd');
    return new Date(formattedDate!);
}

export function convertFormattedAmount(amount: any): number {
    const strAmount = (amount ?? '').toString(); // safely convert to string
    const res = strAmount !== "" ? parseFloat(strAmount.replace(/,/g, '')) : 0;
    return res;
    // var res = amount != "" ? parseFloat(amount.replace(/,/g, '')) : 0;
    // return res;
}


export function  checkTransferType(transferType:number){
    if(transferType == COFToRemittance || 
        transferType == remittanceToCOF
    )
      {
          return ['Instapay'];
      }else{
          return ['Gcash', 'Maya', 'QRPH']
      }
  }


export function convertTimestamp(timestamp: string): string {
    if (timestamp != "") {
        // Parse the timestamp string
        const date = new Date(timestamp);

        // Extract date components
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const day = date.getDate().toString().padStart(2, '0');

        // Extract time components
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        // Format the date and time
        const formattedDateTime = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;

        return formattedDateTime;
    } else {
        return "N/A"
    }
}

export function getTransferMethod(id: number): string {
    const foundItem = TransferMethod.find(item => item.Id === id);
    if (foundItem) {
        const typeName = foundItem.Name;
        return typeName; // This will log the name of the found item
    } else {
        return 'Not Found';
    }
}

export function getTransferMethodId(name: string): number {
    const foundItem = TransferMethod.find(item => item.Name === name);
    if (foundItem) {
        const typeId = foundItem.Id;
        return typeId; // This will log the name of the found item
    } else {
        return 0;
    }
}

export function getCardTypeId(name: string): number {
    const foundItem = ConfigFeeMethod.find(item => item.Name === name);
    if (foundItem) {
        const typeId = foundItem.Id;
        return typeId; // This will log the name of the found item
    } else {
        return 0;
    }
}

export function accountNumberLengthValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value && (value.length < minLength || value.length > maxLength)) {
            return { 'accountNumberLength': true };
        }
        return null;
    };
}

export function transposeToNotApplicable(data: string): string {
    let result = '';
    switch (data) {
        case null:
            result = '-';
            break;
        case '00000000':
            result = 'n/a';
            break;
        default:
            result = data;
            break;
    }

    return result;
}

export function getCurrentUserClientId(): number {
    return parseInt(SessionManager.getFromToken('ClientId'));
}

export function getCurrentUsersAgentId(): number {
    let res = sessionStorage.getItem("agentId") ? parseInt(sessionStorage.getItem("agentId") as string) : 0;
    return res;
}

export function getCurrentUserId(): number {
    return parseInt(SessionManager.getFromToken('Id'));
}

export function checkIsAgent(): boolean {
    var result: boolean = false;
    switch (SessionManager.getFromToken('isAgent')) {
        case 'False':
        case '':
            result = false;
            break;
        case 'True':
            result = true;
            break;
    }
    return result;
}


export function getUserPermissionsAccess(activeRoute: string): boolean {
    
    const jsonString = sessionStorage.getItem("Permission");
    try {
        const permissions = JSON.parse(jsonString || "[]");
        if (!Array.isArray(permissions)) {
            throw new Error("Parsed permissions are not an array.");
        }

        // Find the permission for the active route
        const permissionForRoute = permissions.find((perm: any) => perm.PermissionName.toLowerCase() === activeRoute.toLowerCase());
     
        // Check if RoleAccess is 0 or 1 and return true or false
        return permissionForRoute && (permissionForRoute.RoleAccessEnum === 0 || permissionForRoute.RoleAccessEnum === 1);
    } catch (error) {
        console.error('Error decoding permissions:', error);
        return false;
    }
}

export function HttpLoaderFactory(http:HttpClient){
    return new TranslateHttpLoader(http);
  }
