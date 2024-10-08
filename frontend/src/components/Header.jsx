import React from 'react'
import { Link, useLocation } from 'react-router-dom';

export const Header = () => {
    const location = useLocation();

    return (
        <header className="flex justify-evenly text-xl shadow  gap bg-white">
            <Link className={` py-3 grow text-center ${location.pathname === "/" ? "text-white bg-gray-700" : ""}`} to="/" >Transactions</Link>
            <Link className={`py-3 grow text-center  ${location.pathname === "/analytics" ? "text-white bg-gray-700" : ""}`} to="/analytics" >Analytics</Link>
        </header>
    )
}
