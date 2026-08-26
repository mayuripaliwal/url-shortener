import {useState} from 'react';
import {NavLink} from 'react-router-dom';

function Register(){
    const [userEmail,setUserEmail]=useState("")
    const [userPassword,setUserPassword]=useState("")
    const [userName,setUserName]=useState("")
    const [isRegistered, setIsRegistered]=useState(false)
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL

    const [loading,setLoading]=useState(false);

    const [errorMessage, setErrorMessage]= useState("");
    async function handleSignUp(){
        setIsRegistered(false);
        setLoading(true);
        //handle network errors
        try {
            //handle password and username validation
            if (userPassword.length <8){
                setErrorMessage("Password must contain at least 8 characters.");
                setLoading(false);
                return;
            }
            if (userName.length <1){
                setErrorMessage("Username cannot be empty.");
                setLoading(false);
                return;
            }

            const  response=await fetch(`${BACKEND_URL}/register`,{
                "method":"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email:userEmail,
                    user_name:userName,
                    password:userPassword
                })
            })

            const result=await response.json()
            
            //handle error messages
            if (!response.ok) {
                if (response.status===422){
                    setErrorMessage("Please enter a valid email address.");
                }
                else if (response.status===409) {
                    setErrorMessage("Account already exists.");
                }
                setLoading(false);
                return;
            }
            
            //if registered successfully 
            setIsRegistered(true);

        }
        catch(error){
            setErrorMessage("Unable to connect to the server. Please try again.")
            setLoading(false);
            return;
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
        <h1>Sign Up</h1>
        <input
        className="input"
        type="text"
        placeholder="Enter your username"
        value={userName}
        onChange={(e)=>setUserName(e.target.value)}
        required/>
        <br></br>
        <br></br>
        <input
        className="input"
        type="email"
        placeholder="Enter your email"
        value={userEmail}
        onChange={(e)=>setUserEmail(e.target.value)}
        required/>
        <br></br>
        <br></br>
        <input
        className="input"
        type="password"
        placeholder="Enter your password"
        value={userPassword}
        onChange={(e)=>setUserPassword(e.target.value)}
        required/>
        <br></br>

        {errorMessage && (
            <p className="error-message">{errorMessage}</p>
        )}

        <br></br>


        <button
        className="click-button" 
        onClick={handleSignUp}
        >Sign Up</button>

        {loading &&(
            <p>Just a moment...</p>
        )}

        {isRegistered && (
            <p>Registered Successfully</p>
        )}
        </div>

        
    )
}

export default Register