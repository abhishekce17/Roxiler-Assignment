import React, { useEffect, useState } from 'react'
import { SelectMonth } from './SelectMonth'
import { backendUri } from '../utils/backendUri';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';

export const Analytics = () => {
    const [selectedMonth, setSelectedMonth] = useState(3);
    const [statistics, setStatistics] = useState({
        totalSaleAmount: "",
        totalSoldItems: "",
        totalNotSoldItems: "",
    })
    const [barChart, setBarChart] = useState([]);
    const [pieChart, setPieChart] = useState([]);
    const handleMonthChange = async ({ month }) => {
        setSelectedMonth(month)
    }

    useEffect(() => {
        const fetchAnalytics = async () => {
            const response = await fetch(backendUri(`api/analytics?month=${selectedMonth}`));
            const analyticsData = await response.json();
            setStatistics(analyticsData.statistics);
            setBarChart(analyticsData.barChart.priceRangeData)
            setPieChart(analyticsData.pieChart)
            console.log(analyticsData)
        }
        fetchAnalytics();
    }, [selectedMonth])

    return (
        <div className="bg-gray-300 h-full p-2" >
            <div className="flex h-10 justify-center" >
                <SelectMonth handleMonthChange={handleMonthChange} />
            </div>
            <div className="flex w-full justify-center py-4" >
                <div className="bg-white leading-8 text-xl font-medium min-w-72  py-3 px-4 rounded" >
                    <div className="flex justify-between gap-5" > <span>Total Sales : </span><span> {statistics.totalSaleAmount}</span></div>
                    <div className="flex justify-between gap-5" > <span> Total Sold items :</span> <span> {statistics.totalSoldItems}</span></div>
                    <div className="flex justify-between gap-5" > <span> Total not sold items :</span>  <span> {statistics.totalNotSoldItems}</span></div>
                </div>
            </div>
            <div className="flex gap-10 justify-between py-10" >
                <div className="flex justify-center w-full" >
                    <BarChart barChart={barChart} month={selectedMonth} />
                </div>
                <div className="flex justify-center w-full" >
                    <PieChart pieChart={pieChart} month={selectedMonth} />
                </div>
            </div>
        </div>
    )
}
