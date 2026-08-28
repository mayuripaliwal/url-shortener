import { useState } from 'react';
import {NavLink} from "react-router-dom";
import './App.css'
import {useNavigate} from "react-router-dom";
import {TypeAnimation} from "react-type-animation";
import AUTH_STATUS from './authStatus';
import Navbar from './Navbar';

function App({setAuthStatus}) {
  const [url,setUrl]=useState("")
  const [shortUrl,setShortUrl]=useState("")
  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const [loading,setLoading]=useState(false)

  const navigate=useNavigate();

  const [errorMessage,setErrorMessage]=useState("");

  const [copied, setCopied]=useState(false);
  async function  handleShortenUrl(){
    setLoading(true);
    setShortUrl("");
    setErrorMessage("");
    setCopied(false);
    //handle network errors
    try {
      const response=await fetch(`${BACKEND_URL}/shorten`,{
        "method":"POST",
        "credentials":"include",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({url})}
      );

      const result=await response.json();
      if (response.ok) setShortUrl(result.short_url);
      
      else if (response.status===401){
        //handle error when user not logged in
        //also, update auth status
        setAuthStatus(AUTH_STATUS.LOGGED_OUT);
        setErrorMessage("Please log in to continue.");
      }
      else if (response.status===429) {
        setErrorMessage("Too many requests. Please try again shortly.");
        
      }
      else if (response.status===422) {
        setErrorMessage("Please enter a valid URL.");
        
      }
      else{
        setErrorMessage("Something went wrong. Please try again.");
      }
    }
    catch (error) {
      setErrorMessage("Unable to connect to the server. Please try again.");
    }
    setLoading(false);
    
  }

  //this function copies the short url to clipboard
  async function handleCopy(){
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(function(){
      setCopied(false);
    },2000);
  }
  return (
    <div>
      <Navbar currPage={'Home'}/>
      <h1
      className="mt-10 text-center text-2xl/9 tracking-tight text-gray-900"
      >
        <TypeAnimation
          sequence={[
            "Turn your long URLs into beautifully simple links.",
            1000,
            "Turn your long URLs into effortlessly shareable links.",
            1000,
            "Turn your long URLs into easily trackable links.",
            1000
            ]}
            wrapper="span"
            speed={50}
            style={{fontSize:'0.9em',display:"inline-block"}}
        />
        
        </h1>
      <br></br>
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <input
    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
    type="text"
    placeholder="Enter the link here"
    value={url}
    onChange={(e)=>setUrl(e.target.value)}
    />
    
    {errorMessage && (
      <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
    )}
    {loading && (
      <p className="mt-4 text-center text-sm text-gray-600">Generating short URL...</p>
    )}
    <br></br>
    <div>
    <button 
    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    onClick={handleShortenUrl}>Shorten URL</button>
    </div>
    
    
    </div>
    <br></br>
    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm"> 

    {shortUrl && !loading && (
      <div>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
      <p className="text-sm font-medium text-gray-500">
        Your shortened URL
      </p>
      <a 
      className="mt-2 block break-all text-sm font-semibold text-indigo-600 hover:text-indigo-500"
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"> {shortUrl}
      </a>
      </div>
      
      </div>
      <div>
        <button 
      className="mt-3 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      onClick={handleCopy}>{copied?"Copied":"Copy"}</button>
      </div>
      </div>
      )
    }
    <br></br>

    
    </div>
    </div>

    
  )
}

export default App
