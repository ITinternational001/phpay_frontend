import { Component, OnInit, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscription } from 'rxjs';
import { RolePermissionService } from 'src/shared/dataprovider/api/api/rolePermission.service';
import { DefaultRolePermission } from 'src/shared/dataprovider/api/model/defaultRolePermission';
import { Navigation } from 'src/shared/dataprovider/local/data/common';
import { AgentSidenavData, sidenavData, ClientsidenavData, fixSidenavData } from 'src/shared/dataprovider/local/data/sidenavData';
import { INavbarData } from 'src/shared/dataprovider/local/interface/sidenavHelper';
import { checkIsAgent, getCurrentUserClientId } from 'src/shared/helpers/helper';
import { SessionManager } from 'src/shared/helpers/session-manager';

interface SideNavToggle {
  screenWidth: number;
  collapsed: boolean;
}

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  @Output() onToggleSideNav: EventEmitter<SideNavToggle> = new EventEmitter();
  fixSidenavData: INavbarData[] = [];
  collapsed = false;
  screenWidth = 0;
  sidenavData: INavbarData[] = [];
  multiple = false;
  isEnglish = true;
  private observable!: Observable<any>;
  private subscription!: Subscription;
  allowedPermissions: string[] = [];
  language : string = "";

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 768) {
      this.collapsed = true;
      this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
      localStorage.setItem('collapsed', JSON.stringify(this.collapsed));
    }
  }

  constructor(
    private translateService: TranslateService,
    private permission: RolePermissionService,
  ) {
    this.language = localStorage.getItem('language') || 'en';
    this.translateService.setDefaultLang(this.language);
  }

  ngOnInit(): void {
    this.sidenavData = sidenavData;
    this.screenWidth = window.innerWidth;
    this.initializeSidenavData();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
    this.onToggleSideNav.emit({ collapsed: this.collapsed, screenWidth: this.screenWidth });
    localStorage.setItem('collapsed', JSON.stringify(this.collapsed));
  }

  initializeSidenavData() {
    const savedCollapsed = localStorage.getItem('collapsed');
    if (savedCollapsed !== null) {
      this.collapsed = JSON.parse(savedCollapsed);
    } else {
      this.collapsed = this.screenWidth <= 768;
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.translateService.setDefaultLang(savedLanguage as 'en' | 'zh');
    } else {
      this.translateService.setDefaultLang('en');
    }

    this.isEnglish = this.translateService.getDefaultLang() === 'en';
    this.getPermissions();
  }

  filterNavigation(allowedItems: string[], navData: INavbarData[]): INavbarData[] {
    const alwaysVisibleItems = fixSidenavData.map((item) => item.name);
    return navData
      .map((navItem) => {
        const filteredSubItems =
          navItem.items?.filter(
            (subItem) =>
              allowedItems.includes(subItem.name!) ||
              alwaysVisibleItems.includes(subItem.name!)
          ) || [];

        if (
          allowedItems.includes(navItem.name!) ||
          alwaysVisibleItems.includes(navItem.name!) ||
          filteredSubItems.length > 0
        ) {
          return {
            ...navItem,
            items: filteredSubItems.length > 0 ? filteredSubItems : navItem.items,
          };
        }
        return null;
      })
      .filter(Boolean) as INavbarData[];
  }

  getPermissions() {
    if (this.observable) {
      this.subscription.unsubscribe();
    }
    this.observable = this.permission.apiRolePermissionUserUserIDGet(
      SessionManager.getFromToken('Id')
    );

    this.subscription = this.observable.subscribe({
      next: (response ) => {
        this.allowedPermissions = response
          .filter((element : any) => element.Enabled)
          .map((element : any) => element.PermissionName!);
        let baseSidenavData: INavbarData[] = [];
        if ((getCurrentUserClientId() <= 2 && !checkIsAgent()) ||
         (getCurrentUserClientId() <= 2 && checkIsAgent() && SessionManager.getFromToken('RoleName') == 'Admin')) {
          baseSidenavData = sidenavData;
        } else if (getCurrentUserClientId() > 2 && !checkIsAgent()) {
          baseSidenavData = ClientsidenavData;
        } 
         else if (checkIsAgent()) {
          baseSidenavData = AgentSidenavData;
        }

  
        this.sidenavData = this.filterNavigation(this.allowedPermissions, baseSidenavData);

      
        this.fixSidenavData = fixSidenavData;
      },
      error: (err) => {
        console.error('Error fetching permissions:', err);
      },
    });
}

  toggleLanguage() {
    this.isEnglish = !this.isEnglish;
    const newLanguage = this.isEnglish ? 'en' : 'zh';
    console.log(newLanguage);
    localStorage.setItem('language', newLanguage);
    window.location.reload();
  }

  handleClick(item: INavbarData): void {
    if (!this.multiple) {
      for (let modelItem of this.sidenavData) {
        if (item !== modelItem && modelItem.expanded) {
          modelItem.expanded = false;
        }
      }
    }
    item.expanded = !item.expanded;
  }
}