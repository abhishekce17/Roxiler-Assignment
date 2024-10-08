import React, { useEffect, useState } from 'react'
import { backendUri } from '../utils/backendUri';
import { triangle } from '../utils/triangle';
import { SelectMonth } from './SelectMonth';


export const Transactions = () => {

    const [selectedMonth, setSelectedMonth] = useState(3);
    const [page, setPages] = useState({ page: 1, totalPage: 1 });
    const [transactions, setTransaction] = useState([]);

    const handleMonthChange = async ({ month }) => {
        setSelectedMonth(month)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const searchText = e.target.searchText.value;
        const response = await fetch(backendUri(`api/transactions?searchText=${searchText}&month=${selectedMonth}`));
        const { transactions, total } = await response.json();
        setTransaction(transactions);
        setPages(prev => { return { ...prev, totalPage: total > 10 ? Math.ceil(total / 10) : 1 } });
    }

    useEffect(() => {
        const fetchTransaction = async () => {
            const response = await fetch(backendUri(`api/transactions?month=${selectedMonth}&page=${page.page}`));
            const { transactions, total } = await response.json();
            setTransaction(transactions);
            setPages(prev => { return { ...prev, totalPage: total > 10 ? Math.ceil(total / 10) : 1 } });
        }
        fetchTransaction();
    }, [selectedMonth, page.page])

    return (
        <div className="p-3 py-4  h-full flex flex-col justify-between" >
            <div>
                <div className="flex  justify-evenly h-10 rounded" >

                    <form onSubmit={handleSubmit} className="h-full p-0 m-0 rounded-md overflow-hidden flex" >
                        <input className="grow max-w-96 h-full   px-1 text-lg font-medium border-none outline-none shadow-none " id="search" name="searchText" />
                        <button type="submit" className="bg-white px-2 h-full border-l" >search</button>
                    </form>
                    <SelectMonth handleMonthChange={handleMonthChange} />
                </div>
                <div className="px-10" >
                    <table className="min-w-full bg-white  shadow-md  rounded-lg overflow-hidden my-3">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="py-3 px-4 border ">ID</th>
                                <th className="py-3 px-4 border">Title</th>
                                <th className="py-3 px-4 border">Description</th>
                                <th className="py-3 px-4 border">Price</th>
                                <th className="py-3 px-4 border">Category</th>
                                <th className="py-3 px-4 border">Sold</th>
                                <th className="py-3 px-4 border">Image</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {transactions.map((txn, index) => (
                                <tr key={txn._id} >
                                    <td className="py-3 border px-4 ">{txn.id}</td>
                                    <td className="py-3 border px-4 ">{txn.title}</td>
                                    <td className="py-3 border px-4 ">{txn.description}</td>
                                    <td className="py-3 border px-4 ">{txn.price}</td>
                                    <td className="py-3 border px-4 ">{txn.category}</td>
                                    <td className="py-3 border px-4 ">{txn.sold ? "true" : "false"}</td>
                                    <td className="py-3 border px-4 w-28"> <img src={txn.image} alt='txn.title' /> </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='flex justify-evenly'>
                <button onClick={() => page.page > 1 && setPages(prev => ({ ...prev, page: prev.page - 1 }))} className="bg-white px-2 rounded flex items-center gap-2" > {triangle(-90)} prev</button>
                <div className="bg-white rounded px-2 w-max pt-1" >{page.page}/{page.totalPage}</div>
                <button onClick={() => page.page < page.totalPage && setPages(prev => ({ ...prev, page: prev.page + 1 }))} className="bg-white px-2 py-1 rounded flex items-center gap-2" >next {triangle(90)}</button>
            </div>
        </div >
    )
}
