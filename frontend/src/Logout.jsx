import {useEffect} from "react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Logout(){
    const [isLoggedOut,setIsLoggedOut]=useState(false)
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
    const navigate=useNavigate()
    async function handleLogin(){
        navigate("/login");
    }
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
                <div>
                <p style={{fontSize:"1.2rem"}}>You are now logged out.</p>
                <br></br>

                <button 
                className="click-button"
                onClick={handleLogin}>Log Back In</button>
                </div>
            )}
        </div>
    )
}

export default Logout