import { useState } from 'react';
import {NavLink} from "react-router-dom";
import './App.css'
import {useNavigate} from "react-router-dom";
import {TypeAnimation} from "react-type-animation";
import AUTH_STATUS from './authStatus';

function App({setAuthStatus}) {
  const [url,setUrl]=useState("")
  const [shortUrl,setShortUrl]=useState("")
  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const [loading,setLoading]=useState(false)

  const navigate=useNavigate();
  const features = [
  {
    title: "Fast & Reliable",
    description: "Generate short URLs quickly with a simple and reliable experience."
  },
  {
    title: "Secure Authentication",
    description: "Your links are protected with authenticated access and secure sessions."
  },
  {
    title: "Link Analytics",
    description: "Track clicks and understand how your shortened links perform."
  },
  {
    title: "Easy Link Management",
    description: "Create and manage your shortened URLs from one place."
  },
  {
    title: "Simple Interface",
    description: "A clean interface that makes shortening URLs quick and effortless."
  }
];

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
      <nav className="navbar">
        <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"}  to="/">Home</NavLink> 
        
        <NavLink  className={({isActive})=>isActive ? "active-link":"nav-link"} to="/analytics">Analytics</NavLink>
        
        <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"} to ="/logout">Logout</NavLink>
      </nav>
      <br></br>
      <h1>
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
      <div className="url-form">
    <input
    className="input"
    type="text"
    placeholder="Enter the link here"
    value={url}
    onChange={(e)=>setUrl(e.target.value)}
    />

    <button 
    className="click-button"
    onClick={handleShortenUrl}>Shorten URL</button>

    </div>
    {loading && (
      <p>Generating short URL...</p>
    )}

    <br></br>

    {shortUrl && !loading && (
      <div className="shortened-url-display">
      <p>Shortened URL : <a 
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"> {shortUrl}
      </a>
      </p>
      <button 
      className="click-button"
      onClick={handleCopy}>{copied?"Copied":"Copy"}</button>
      </div>
      )
    }
    <br></br>

    {errorMessage && (
      <p className="error-message">{errorMessage}</p>
    )}
    <br></br>
    
    
    <section className="features-section">
      <h2>Features</h2>

      <div className="features-grid">
        {features.map(function(feature,index){
          return (
            <div className="feature-card" key={index}>
              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>

    </div>

    
  )
}

export default App
