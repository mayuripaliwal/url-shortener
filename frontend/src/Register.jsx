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
        setErrorMessage("");
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
            Create an account
        </h2>
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="mt-2">
        <input
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        type="text"
        placeholder="Enter your username"
        value={userName}
        onChange={(e)=>setUserName(e.target.value)}
        required/>
        </div>
        <br></br>
        <div>
        <input
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        type="email"
        placeholder="Enter your email"
        value={userEmail}
        onChange={(e)=>setUserEmail(e.target.value)}
        required/>
        </div>
        <br></br>
        <div>
        <input
        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
        type="password"
        placeholder="Enter your password"
        value={userPassword}
        onChange={(e)=>setUserPassword(e.target.value)}
        required/>
        </div>
        <br></br>


        <div>
        {errorMessage && (
            <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
        )}
        </div>

        {loading &&(
            <p className="mt-4 text-center text-sm text-gray-600">Just a moment...</p>
        )}

        <br></br>

        <div>
        <button
        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={handleSignUp}
        >Sign Up</button>
        </div>

        

        {isRegistered && (
            <p className="mt-4 text-center text-sm text-gray-600">Registered Successfully</p>
        )}
        </div>
        </div>

        </div>
    )
}

export default Register