import {jwtDecode} from "jwt-decode";

type jwtPayload = {
    exp: number
    userId: string
    role: string
}

export const isAuthenticated = (role: string) => {
    const token = localStorage.getItem("token");
    if(!token) return false;

    try{

    const decoded = jwtDecode<jwtPayload>(token);

    if(!decoded.exp){
        console.log("No decoded.exp");
        return false;
    }

    if(decoded.role !== role){
        return false;
    }

    console.log("Decoded: ", decoded);

    return decoded.exp * 1000 > Date.now()
    } catch(err: any){
        return false;
    }

}