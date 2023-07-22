import { ACCESS_TOKEN,EXPIRES_IN,TOKEN_TYPE, logout_profile } from "./common";

// in order to fetch infor for dashboard.js we need some api 
const Base_Api_Url = import.meta.env.VITE_API_BASE_URL;


//check whether the access token is not expired
const getAccessToken = ()=>  {
    const acces_token = localStorage.getItem(ACCESS_TOKEN);
    const expires_in = localStorage.getItem(EXPIRES_IN);
    const token_type = localStorage.getItem(TOKEN_TYPE);

    if (Date.now() < expires_in){
        return {acces_token , token_type}
    }else{
        //logout
        logout_profile();
    }
}


const createApiConfig =({acces_token , token_type}, method="GET")=>{
    return {
        headers :{
            Authorization:`${token_type}  ${acces_token}`
        },
        method
    }
}

//we want to call a particular API
// create helper function which will help to call diffrent API
export const fetch_Request = async (endpoint)=>{
    const url = `${Base_Api_Url}/${endpoint}`;
    const result = await fetch(url , createApiConfig(getAccessToken())); //create config to access the api we have to pass access token 
    return result.json();
}