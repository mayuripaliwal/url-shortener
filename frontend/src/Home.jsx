import { useState } from 'react';
import {NavLink} from "react-router-dom";
import './App.css'
import {useNavigate} from "react-router-dom";

function App() {
  const [url,setUrl]=useState("")
  const [shortUrl,setShortUrl]=useState("")
  const BACKEND_URL=import.meta.env.VITE_BACKEND_URL
  const [loading,setLoading]=useState(false)

  const [showLoginButton,setShowLoginButton]=useState(false)

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
  async function  handleShortenUrl(){
    setLoading(true);
    setShortUrl("");
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
      
      else if (typeof result.detail=="string"){
        //handle error when user not logged in
        
        alert(result.detail);
        setShowLoginButton(true);
      }
      else alert(result.detail[0].msg);
    }
    catch (error) {
      alert("Unable to connect to the server. Please try again.");
    }
    setLoading(false);
    
  }

  function handleLogin(){
    navigate("/login");
  }
  return (
    <div>
      <nav className="navbar">
        <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"}  to="/">Home</NavLink> 
        {" | "}
        <NavLink  className={({isActive})=>isActive ? "active-link":"nav-link"} to="/analytics">Analytics</NavLink>
        {" | "}
        <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"} to ="/logout">Logout</NavLink>
      </nav>
      <br></br>
      <h1>From ridiculously long URLs to beautifully simple links, in seconds.</h1>
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
    {shortUrl && !loading && (
      <p className="display-info">Shortened URL : <a 
      href={shortUrl}
      target="_blank"
      rel="noopener noreferrer"> {shortUrl}
      </a>
      </p>
      )
    }
    <br></br>
    <br></br>

    {showLoginButton && (
        <button
        className="click-button"
        onClick={handleLogin}>Login</button>
    )}
    
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
