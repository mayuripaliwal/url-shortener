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
        setErrorMessage("");
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
                if (response.status===401||response.status===422){
                    setErrorMessage("Invalid email or password.");
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
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="relative isolate bg-white">

            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl"
            >

            <div
                className="relative left-1/2 aspect-1155/678 w-[72rem] -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
                style={{
                    clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
            />

        </div>
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900" >
            Sign in to your account
            </h2>
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="mt-2">
            <input
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            type="email"
            placeholder="Enter your email"
            value={userEmail}
            onChange={(e)=>setUserEmail(e.target.value)}/>
            </div>

            <br></br>

            <input
            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            type="password"
            placeholder="Enter your password"
            value={userPassword}
            onChange={(e)=>setUserPassword(e.target.value)}/>
            
            <br></br>

            {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
            )}

            <br></br>

            <div>
            <button 
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={handleLogin}>Sign In</button>
            </div>

            {loading && (
                <p className="mt-4 text-center text-sm text-gray-600">Just a moment...</p>
            )}



            {isLoggedIn && (
                <p className="mt-4 text-center text-sm text-gray-600">Logged in successfully.</p>
            )}
            </div>
        </div>
        </div>
        
    )
}

export default Login