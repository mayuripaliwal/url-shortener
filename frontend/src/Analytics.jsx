import { useState } from 'react';
import { NavLink } from "react-router-dom";
import AUTH_STATUS from './authStatus';
import {useEffect} from 'react';

function Analytics({setAuthStatus}){
    
    const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;
    
    const [loading,setLoading]=useState(false);

    const [errorMessage,setErrorMessage]=useState("");

    const [allStats,setAllStats]=useState([]);

    async function handleGetStats(){
        setLoading(true);
        //handle network errors
        try{
            
            const response=await fetch(`${BACKEND_URL}/stats`,{
                "method":"GET",
                "credentials":"include"
            });
            
            const result=await response.json();

            if (response.ok){
                setAllStats(result.stats);
            }
            else if (response.status===401){
                setAuthStatus(AUTH_STATUS.LOGGED_OUT);
                setErrorMessage("Please log in to continue.")
                setShowLoginButton(true);
            }
            else if (response.status===404){
                setErrorMessage("No short URLs found.");
            }
            else{
                setErrorMessage("Something went wrong. Please try again.")
            }
            
        }
        catch (e){
            setErrorMessage("Unable to connect to the server. Please try again.");
        }
        setLoading(false);
    }

    //this function converts the timestamp into a user -friendly format
    function formatDateTime(timestamp){
        const options={
            day:"numeric",
            month:"short",
            year:"numeric",
            hour:"numeric",
            minute:"2-digit",
            hour12:true
        }
        const date=new Date(timestamp);
        return new Intl.DateTimeFormat(undefined,options).format(date);
    }

    useEffect(()=>{
        handleGetStats();
    },[])

    return (
        <div>

            <nav className="navbar">
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}to="/">Home</NavLink>
                
                <NavLink className={({isActive})=> isActive ? "active-link":"nav-link"}  to="/analytics">Analytics</NavLink>
                
                <NavLink className={({isActive})=>isActive ? "active-link":"nav-link"} to ="/logout">Logout</NavLink>
            </nav>
            <br></br>

            
             {errorMessage && (
                <div>
                <br></br>
                <p className="error-message">{errorMessage}</p>
                <br></br>
                </div>
            )}

            {loading &&<p>Loading stats...</p>}           

        
        { allStats.length>0 && (
            <div>
                <h2>Track the performance of your shortened links.</h2>
                <br></br>

                {/*all stats*/}
                <div>
                    <div className="analytics-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Short URL</th>
                                    <th>Original URL</th>
                                    <th>Created</th>
                                    <th>Last Clicked</th>
                                    <th>Click Count</th>
                                </tr>
                            </thead>

                            <tbody>
                                {allStats.map(function(stat){
                                const [code,originalUrl,createdAt,clickCount,lastClickedAt]=stat;

                                const statShortUrl=`${BACKEND_URL}/${code}`;

                                return (
                                    <tr key={code}>
                                        <td>
                                            <a 
                                            href={statShortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer">{statShortUrl}</a>
                                        </td>
                                        <td>
                                            <a
                                            href={originalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer">{originalUrl}</a>
                                        </td>
                                        <td>
                                            {formatDateTime(createdAt)}
                                        </td>
                                        <td>
                                            {lastClickedAt?formatDateTime(lastClickedAt):"None"}
                                        </td>
                                        <td>
                                            {clickCount}
                                        </td>
                                        
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
        


        </div>

        
    );
}

export default Analytics