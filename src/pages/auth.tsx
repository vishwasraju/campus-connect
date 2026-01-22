import {jwtDecode} from "jwt-decode";

type jwtPayload = {
    exp: number
}

export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    if(!token) return false;

    try{

    const decoded = jwtDecode<jwtPayload>(token);

    if(!decoded.exp){
        console.log("No decoded.exp");
        return false;
    }

    return decoded.exp * 1000 > Date.now()
    } catch(err: any){
        return false;
    }

}