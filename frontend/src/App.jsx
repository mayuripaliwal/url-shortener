import { Routes, Route } from "react-router-dom"
import Home from "./Home"
import Analytics from "./Analytics"
import Register from "./Register"
import Login from "./Login"
import Logout from "./Logout"
import {useState} from 'react';
import {useEffect} from 'react';
import {Navigate} from "react-router-dom";
import AUTH_STATUS from './authStatus';

function App(){
  

  //set auth_status to checking when app loads
  const [authStatus, setAuthStatus]=useState(AUTH_STATUS.CHECKING);

  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;

  async function isUserLoggedIn(){
      try{
        const authResponse=await fetch(`${BACKEND_URL}/auth`,{
          credentials:"include",
        });

        //user is not logged in
        if (authResponse.status===401){
          setAuthStatus(AUTH_STATUS.LOGGED_OUT);
        }
        //user is logged in
        else if (authResponse.status===200){
          setAuthStatus(AUTH_STATUS.LOGGED_IN);
        }
      }
      catch(error){
        setAuthStatus(AUTH_STATUS.LOGGED_OUT);
      }
    }

  //this effect runs every time the page loads
  //check if user is logged in or not
  //if logged in, show home page
  //else, show login page
  useEffect(()=>{
    //Check if user is logged in
    isUserLoggedIn()
  },[])

  if (authStatus===AUTH_STATUS.CHECKING){
    return (
      <div className="auth-check">
        <br></br>
        <h2>Just a moment...</h2>
        <p>We’re checking your session and getting things ready. This may take up to a minute.</p>
      </div>
    
    )
  }
  //if user not logged in, show them login,sign up page
  //if they go to any other route,redirect them to login,sign up page
  if (authStatus===AUTH_STATUS.LOGGED_OUT){
    return (
    <Routes>
      <Route path="/signup" element={<Register/>}/>
      <Route path="/login" element={<Login setAuthStatus={setAuthStatus}/>}/>

      {/*redirect*/}
      <Route path="*" element={<Navigate to="/login" replace/>}/>
    </Routes>
    )
  }
  //if user logged in, then show home, analytics, logout,
  //if they go to login or signup, redirect them to home page
  else if (authStatus===AUTH_STATUS.LOGGED_IN) {
    return (
      <Routes>
        <Route path="/" element={<Home setAuthStatus={setAuthStatus}/>} />
        <Route path="/analytics" element={<Analytics setAuthStatus={setAuthStatus}/>}/>
        <Route path="/logout" element={<Logout setAuthStatus={setAuthStatus}/>}/>

        {/*redirect*/}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    )
  }
  else {
    return (
      <p>Something went wrong.</p>
    )
  }
}
export default App;