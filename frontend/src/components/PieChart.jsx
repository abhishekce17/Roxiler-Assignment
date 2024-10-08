import React, { useRef, useEffect } from 'react';
import Chart from 'chart.js/auto';

export const PieChart = ({ pieChart }) => {
    const chartRef = useRef(null);

    const generateRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(() => {

        const backgroundColors = pieChart.map(() => generateRandomColor());
        const chart = new Chart(chartRef.current, {
            type: 'pie',
            data: {
                labels: pieChart.map(item => item.category),
                datasets: [
                    {
                        label: 'Category Distribution',
                        data: pieChart.map(item => item.count),
                        backgroundColor: backgroundColors,
                        hoverOffset: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });

        return () => chart.destroy();
    }, [pieChart]);

    return (
        <div className="bg-white max-w-[60%] rounded" >
            <canvas ref={chartRef}></canvas>
        </div>
    );
};
