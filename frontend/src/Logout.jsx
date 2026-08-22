import {useEffect} from "react";
import {useState} from "react";

function Logout(){
    const [isLoggedOut,setIsLoggedOut]=useState(false)
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
    async function handleLogout(){
        try{
            const response=await fetch(`${BACKEND_URL}/logout`,{
                method:"POST",
                credentials:"include"
            })
            const result=await response.json()

            if (response.status!==200){
                
                alert(result.detail);
                return;
            }

            if (response.ok){
                setIsLoggedOut(true);
            }
        }
        catch(error) {
            alert("Unable to connect to server. Please try again.")
        }
    }
    useEffect(()=>{
        handleLogout();
    },[]);

    return (
        <div>
            <h1>Logout</h1>

            {isLoggedOut && (
                <p>Logged out successfuly.</p>
            )}
        </div>
    )
}

export default Logout