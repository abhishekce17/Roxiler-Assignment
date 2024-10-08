import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';
import { months } from '../utils/months';

export const BarChart = ({ month, barChart }) => {
    const chartRef = useRef(null);

    useEffect(() => {
        const chart = new Chart(chartRef.current, {
            type: 'bar',
            data: {
                labels: barChart.map(row => row._id),
                datasets: [
                    {
                        label: 'Bar Chart Stats - ' + months[month - 1],
                        data: barChart.map(row => row.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [barChart]);

    return (
        <div className="bg-white min-w-[60%] rounded" >
            <canvas ref={chartRef}></canvas>
        </div>
    );
};
