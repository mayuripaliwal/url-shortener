import { useState } from 'react';
import { NavLink } from "react-router-dom";
import {useNavigate} from "react-router-dom";

function Analytics(){
    const [clickCount,setClickCount]=useState("");
    const [longUrl,setLongUrl]=useState("");
    const [shortUrl,setShortUrl]=useState("");
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;
    const URL_PREFIX=`${BACKEND_URL}/`;
    const [loading,setLoading]=useState(false);
    const [createdAt,setCreatedAt]=useState("");
    const [lastClickedAt,setLastClickedAt]=useState("");
    
    const [showLoginButton,setShowLoginButton]=useState(false);

    const navigate=useNavigate();

    const [errorMessage,setErrorMessage]=useState("");

    async function handleGetStats(){
        setLoading(true);
        setClickCount("");
        setLongUrl("");
        setCreatedAt("");
        setLastClickedAt("");
        //handle network errors
        try{
            //first check if it is a valid short url
            //then, extract the code from the url
            
            if (!shortUrl.startsWith(URL_PREFIX)){
                setErrorMessage("Please enter a valid short URL.");
                setLoading(false);
                return;
            }
            
            const shortCode=shortUrl.substring(URL_PREFIX.length);
            
            const response=await fetch(`${BACKEND_URL}/stats/${shortCode}`,{
                "method":"GET",
                "credentials":"include",
                headers:{
                    "Content-Type":"application/json"
                }
            });
            
            const result=await response.json();

            if (response.ok){
                setClickCount(result.click_count);
                setCreatedAt(result.created_at);
                setLastClickedAt(result.last_clicked_at);
                setLongUrl(result.long_url);
            }
            else if (response.status===401){
                setErrorMessage("Please log in to continue.")
                setShowLoginButton(true);
            }
            else if (response.status===404){
                setErrorMessage("Short URL not found.");
            }
            else{
                setErrorMessage("Something went wrong. Please try again.")
            }
            
        }
        catch (e){
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
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}to="/">Home</NavLink>
                
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}  to="/analytics">Analytics</NavLink>
                
                <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"} to ="/logout">Logout</NavLink>
            </nav>
            <br></br>
            <h1>Paste your link. See the insights.</h1>

            <div className="url-form">
            <input
            className="input"
            type="text" 
            placeholder="Enter short URL" 
            value={shortUrl}
            onChange={(e)=>{
                setShortUrl(e.target.value);
                setClickCount("");  
                setCreatedAt("");
                setLastClickedAt("");
                setLongUrl("");
            }
            }/>
            
            <button className="click-button"
             onClick={handleGetStats}>Get Analytics</button>
             </div>

            <br></br>
             {errorMessage && (
                <p className="error-message">{errorMessage}</p>
            )}

            {loading &&<p>Loading stats...</p>}
            
            {clickCount!==""&&(
                <section className="analytics-details">

            <p className="analytics-click-count">Total clicks: {clickCount}</p>
            <br></br>

            <h2>Link Details</h2>
            
             <p>Short URL: <a 
            href={shortUrl} 
            target="_blank"
            rel="noopener noreferrer">{shortUrl}</a></p>

            
            

            <p>Created At: {createdAt}</p>

            {lastClickedAt&& <p>Last Clicked At: {lastClickedAt}</p>}
            
            <p>Original URL: <a 
            href={longUrl}
            target="_blank"
            rel="noopener noreferrer">{longUrl}</a></p>

            </section>
            )}
            

            <br></br>

            {showLoginButton && (
                <button
                className="click-button"
                onClick={handleLogin}>Login</button>
            )}
        </div>
    );
}

export default Analytics