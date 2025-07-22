export interface INavbarData {
    routeLink: string;
    icon?: string; 
    label: string;
    expanded?: boolean;
    isToggle?: boolean;
    isMaintenance?: boolean;
    message?: string;
    items?: INavbarData[];
    roles?: string[];
    name?: string;
    page?: string;
  }
  