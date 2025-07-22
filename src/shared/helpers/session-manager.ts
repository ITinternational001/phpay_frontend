import { JwtHelperService } from "@auth0/angular-jwt";

export class SessionManager{
    static isValid(): boolean{
        const helper = new JwtHelperService();
        if(sessionStorage.getItem('token') !== undefined){
            if(!helper.isTokenExpired(sessionStorage.getItem('token'))){
                return true;
            }
        }
        return false;
    }

    static getFromToken(key:string){
        const helper = new JwtHelperService();
        const token = sessionStorage.getItem('token');
        if(token !== null && sessionStorage.getItem('token') !== undefined){
            if(!helper.isTokenExpired(token)){
                const decodedToken = helper.decodeToken(token);
                return decodedToken[key];
            }
        }
        return false;
    }

    static put(key:string, value:string){
        sessionStorage.setItem(key, value);
    }

    static delete(key:string){
        sessionStorage.removeItem(key);
    }

    static clearSession(){
        sessionStorage.clear();
    }
}
