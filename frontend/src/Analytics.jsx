import { useState } from 'react';
import { NavLink } from "react-router-dom";
import AUTH_STATUS from './authStatus';
import {useEffect} from 'react';
import Navbar from './Navbar';

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

    //compute total clicks from all the short url click counts for this user
    const totalClickCount=allStats.reduce(function(
        total,
        stat
    ){
        return total+stat[3];
    },0);

    return (
        <div>

            <Navbar currPage={'Analytics'}/>
            <br></br>

            
             {errorMessage && (
                <div>
                <p className="mt-4 text-center text-sm text-red-600">{errorMessage}</p>
                </div>
            )}

            {loading &&<p className="mt-4 text-center text-sm text-gray-600">Loading stats...</p>}           

        
        { allStats.length>0 && (
            <div>
                <h2 className="mt-4 text-center text-xl text-gray-600">Track the performance of your shortened links.</h2>
                <br></br>
                {/*Total click count*/}
                <div className="px-20">
                    <div className="w-3/12 rounded-xl border border-gray-200 bg-white p-4 px-8 shadow-sm">
                        <p className="text-left text-lg text-gray-600">
                            Total Clicks
                        </p>

                        <p className="text-left mt-2 text-5xl font-semibold tracking-tight text-gray-950">
                            {totalClickCount}
                        </p>
                    </div>
                </div>
                <br></br>

                {/*all stats*/}
                <div>
                    <div className="overflow-x-auto">
                        <table className="mx-auto w-11/12 text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        Short URL
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        Original URL
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        Created
                                    </th>
                                    <th className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        Last Clicked
                                    </th>
                                    <th 
                                    className="px-4 py-3 text-sm font-semibold text-gray-700">
                                        Click Count
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {allStats.map(function(stat){
                                const [code,originalUrl,createdAt,clickCount,lastClickedAt]=stat;

                                const statShortUrl=`${BACKEND_URL}/${code}`;

                                return (
                                    <tr 
                                    key={code}
                                    
                                    >
                                        <td
                                        className="px-4 py-3 text-sm font-semibold text-gray-600 hover:underline"
                                        >
                                            <a 
                                            href={statShortUrl}
                                            target="_blank"
                                            rel="noopener noreferrer">{statShortUrl}</a>
                                        </td>
                                        <td
                                        className="px-4 py-3 text-sm font-semibold text-gray-600 hover:underline"
                                        >
                                            <a
                                            href={originalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer">{originalUrl}</a>
                                        </td>
                                        <td
                                        className="px-4 py-3 text-sm font-semibold text-gray-600"
                                        >
                                            {formatDateTime(createdAt)}
                                        </td>
                                        <td
                                        className="px-4 py-3 text-sm font-semibold text-gray-600"
                                        >
                                            {lastClickedAt?formatDateTime(lastClickedAt):"None"}
                                        </td>
                                        <td
                                        className="px-4 py-3 text-sm font-semibold text-gray-600"
                                        >
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