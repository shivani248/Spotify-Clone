import { ACCESS_TOKEN , TOKEN_TYPE ,EXPIRES_IN } from "../common";

const clientId =import.meta.env.VITE_clientId;
const scopes = "user-top-read user-follow-read playlist-read-private user-library-read";
const Redirect_URL =import.meta.env.VITE_Redirect_URL;
// const accessToken_key = "accessToken";
const App_Url=import.meta.env.VITE_App_Url;

const authorize_user = ()=>{
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${Redirect_URL}&scope=${scopes}&show_dialog=True`;
    window.open(url , "login" , "width=800,height=600");   
}

document.addEventListener("DOMContentLoaded", ()=>{
    const loginButton  = document.getElementById("login_to_Spotify");
    loginButton.addEventListener("click" , authorize_user);
})

window.setItemsInLocalStorage = ({accessToken , tokenType , expires_In})=>{
    localStorage.setItem(ACCESS_TOKEN , accessToken);
    localStorage.setItem(TOKEN_TYPE,tokenType);
    localStorage.setItem(EXPIRES_IN , (Date.now() + (expires_In * 1000)));
    window.location.href = App_Url;
}


window.addEventListener("load", () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    console.log(accessToken);
    if(accessToken){
        window.location.href = `${App_Url}dashboard/dashboard.html`;
    }

    if(window.opener!== null  && !window.opener.closed){
        // alert("you are inside openenr")
        window.focus();

        if (window.location.href.includes("error"))
        {
           window.close();
        }
        const {hash} = window.location;
        const searchParams = new URLSearchParams(hash);
        const accessToken = searchParams.get("#access_token");

        // #access_token=BQBozZuPZj3nkkBukckv_VKTT7xHFL6o2F8Hzjrig7E9nNS5BjKfc48Fq3O8HjOh_PTgxEEMjPyNXaWeysfQ9t2poH8avZ-hzNMa3RnJp0DxtOidVOkaUy0gCA6g0tXMOlrX3LkO4UR5ePXrjgAPToIUtfr7j9tVHlXYlRHo0aevVJ1UeIa4Sohd3VQxBp5TPrFZSqg6b9zR740ByBPNzKkAq43KPQSsqNbmmw&token_type=Bearer&expires_in=3600

        const tokenType = searchParams.get("token_type");
        const expires_In =searchParams.get("expires_in");
        if(accessToken){
            window.close();
            window.opener.setItemsInLocalStorage({accessToken , tokenType , expires_In })
            
        }
        else{
            window.close();
        }

    }
}) 
