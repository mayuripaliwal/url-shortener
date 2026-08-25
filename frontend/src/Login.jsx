import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {NavLink} from 'react-router-dom';
import AUTH_STATUS from './authStatus';


function Login({setAuthStatus}){
    const [userEmail,setUserEmail]=useState("")
    const [userPassword,setUserPassword]=useState("")
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn,setIsLoggedIn]=useState(false)
    const navigate=useNavigate();

    const [loading,setLoading]=useState(false);
    const [errorMessage,setErrorMessage]=useState("");
    async function handleLogin(){
        setIsLoggedIn(false);
        setLoading(true);
        try{
            const response = await fetch(`${BACKEND_URL}/login`,{
                method:"POST",
                credentials:"include",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:userEmail,
                    password:userPassword
                })
            })

            const result=await response.json()

            if (!response.ok){
                if (response.status===401){
                    setErrorMessage("Invalid email or password.");
                    setLoading(false);
                    return;
                }
                else if (response.status===422){
                    setErrorMessage("Please enter a valid email address.");
                    setLoading(false);
                    return;
                }
                else{
                    setLoading(false);
                    return;
                }
                
            }
            
            //if successfully logged in 
            setIsLoggedIn(true)
            setAuthStatus(AUTH_STATUS.LOGGED_IN);
            navigate("/")
        }
        catch (error){
            setErrorMessage("Unable to connect to server. Please try again.")
        }
        setLoading(false);
        
    }
    return (
        <div>
            <nav className="navbar">
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}to="/login">Login</NavLink>
                {" | "}
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}  to="/signup">Register</NavLink>
            </nav>
            <h1>Login</h1>

            <input
            className="input"
            type="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={(e)=>setUserEmail(e.target.value)}/>
            <br></br>
            <br></br>

            <input
            className="input"
            type="password"
            placeholder="Enter your password"
            value={userPassword}
            onChange={(e)=>setUserPassword(e.target.value)}/>

            <br></br>

            {errorMessage && (
            <p className="error-message">{errorMessage}</p>
            )}

            <br></br>


            <button className="click-button"
            onClick={handleLogin}>Login</button>

            {loading && (
                <p>Just a moment...</p>
            )}



            {isLoggedIn && (
                <p>Logged in successfully.</p>
            )}
        </div>
        
    )
}

export default Login