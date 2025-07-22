import { Injectable } from '@angular/core';
import {
  sidenavData,
  ClientsidenavData,
  AgentSidenavData,
} from 'src/shared/dataprovider/local/data/sidenavData';
import { INavbarData } from 'src/shared/dataprovider/local/interface/sidenavHelper';

@Injectable({
  providedIn: 'root',
})
export class MaintenanceService {
  constructor() {}

  /**
   * This function checks if the given page is under maintenance.
   * @param page The page to check.
   * @returns An object containing maintenance status and message.
   */
  isPageUnderMaintenance(page: string): { isMaintenance: boolean; message: string | null } {
    // Normalize the page identifier
    const normalizedPage = page.trim().toLowerCase();

    // Combine all sidenavData, ClientsidenavData, and AgentSidenavData
    const allSidenavData: INavbarData[] = [
      ...sidenavData,
      ...ClientsidenavData,
      ...AgentSidenavData,
    ];

    // Search for the page in the sidenav data
    const matchedItem = this.findPageInSidenavData(allSidenavData, normalizedPage);

    if (matchedItem) {
      return {
        isMaintenance: matchedItem.isMaintenance || false,
        message: matchedItem.isMaintenance ? matchedItem.message || null : null,
      };
    }

    return { isMaintenance: false, message: null };
  }

  /**
   * Recursive function to search for a page in sidenav data, including sub-items.
   * @param sidenavItems Array of sidenav items.
   * @param page Page identifier to find.
   * @returns The matching sidenav item or null.
   */
  private findPageInSidenavData(
    sidenavItems: INavbarData[],
    page: string
  ): INavbarData | null {
    for (const item of sidenavItems) {
      if (item.page?.toLowerCase() === page) {
        return item;
      }

      if (item.items?.length) {
        const found = this.findPageInSidenavData(item.items, page);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
