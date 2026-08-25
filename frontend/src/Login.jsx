import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {NavLink} from 'react-router-dom';

function Login(){
    const [userEmail,setUserEmail]=useState("")
    const [userPassword,setUserPassword]=useState("")
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
    const [isLoggedIn,setIsLoggedIn]=useState(false)
    const navigate=useNavigate();

    const [loading,setLoading]=useState(false);
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
                if (typeof result.detail=="string"){
                    alert(result.detail)
                    setLoading(false);
                    return;
                }
                alert(result.detail[0].msg);
                setLoading(false);
                return;
            }
            
            //if successfully logged in 
            setIsLoggedIn(true)
            navigate("/")
        }
        catch (error){
            alert("Unable to connect to server. Please try again.")
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
            <br></br>

            <button className="click-button"
            onClick={handleLogin}>Login</button>

            {loading && (
                <p>LJust a moment...</p>
            )}

            {isLoggedIn && (
                <p>Logged in successfully.</p>
            )}
        </div>
        
    )
}

export default Login