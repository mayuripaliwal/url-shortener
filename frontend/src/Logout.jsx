import {useEffect} from "react";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import AUTH_STATUS from './authStatus';
import Navbar from './Navbar';

function Logout({setAuthStatus}){
    const [isLoggedOut,setIsLoggedOut]=useState(false)
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
    const navigate=useNavigate()
    const [loading,setLoading]=useState(false);

    const [errorMessage, setErrorMessage]= useState("");

    async function handleLogin(){
        navigate("/login");
    }
    async function handleLogout(){
        setLoading(true);
        try{
            const response=await fetch(`${BACKEND_URL}/logout`,{
                method:"POST",
                credentials:"include"
            })
            const result=await response.json()

            if (response.status!==200){
                
                setErrorMessage("Something went wrong. Please try again.");
                setLoading(false);
                return;
            }

            if (response.ok){
                setAuthStatus(AUTH_STATUS.LOGGED_OUT)
                setIsLoggedOut(true);
            }
        }
        catch(error) {
            setErrorMessage("Unable to connect to server. Please try again.")
        }
        setLoading(false);
    }
    useEffect(()=>{
        handleLogout();
    },[]);

    return (
        <div>
            <Navbar currPage={'Logout'}/>
            <div>

            <br></br>
            {errorMessage && (
                <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
            )}

            {loading && (
                <p className="mt-4 text-center text-sm text-gray-600">Just a moment...</p>
            )}

            {isLoggedOut && (
                <div>
                <p className="mt-4 text-center text-sm text-red-600">You are now logged out.</p>
                <br></br>
                
                <div>
                    <button 
                    className="click-button"
                    onClick={handleLogin}>Log Back In</button>
                </div>
                </div>
            )}
            </div>
        </div>
    )
}

export default Logout