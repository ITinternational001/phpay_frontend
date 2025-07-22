
export interface DropDownData{
    Id: number | undefined;
    Name: string | undefined;
}

export interface SelectOptions{
  id: number;
  name: string;
  balance?:number;
}


export interface CardTransaction {
    dateReq: string;
    transaction: string;
    client: string;
    type: string;
    destination: string;
    ref: string;
    source: string;
    dateRem: string;
    amount: string;
    status: string;
  }

  export interface Topdata{
    label?:string,
    value?:number,
    icon?:string
  }