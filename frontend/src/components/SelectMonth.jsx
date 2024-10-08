import React from 'react'

export const SelectMonth = ({ handleMonthChange, disabled }) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


    return (
        <select disabled={disabled} defaultValue={3} className="text-lg w-max border-none outline-none px-1 rounded-md" onChange={(e) => handleMonthChange({ month: e.target.value })} >
            {
                months.map((month, index) => <option key={month} value={index + 1}  > {month} </option>)
            }
        </select>
    )
}
