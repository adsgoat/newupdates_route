"use client";
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
Chart.register(...registerables);
const datasetColorMap = {
    Spend: 'rgba(75, 192, 192, 1)', Revenue: 'rgba(54, 162, 235, 1)', RPC: 'rgba(255, 99, 132, 1)',
    CPL: 'rgba(255, 159, 64, 1)', Profit: 'rgba(255, 206, 86, 1)', Margin: 'rgba(153, 102, 255, 1)',
};

const ChartForHistory = ({ theme, chartData }) => {
    const [hiddenKeys, setHiddenKeys] = useState([
        'Spend', 'Revenue', 'RPC', 'CPL', 'Margin', // ❌ Only "Profit" shown by default
    ]);
    const datasets = [
        {
            label: 'Spend',
            data: chartData?.spend?.map(Number) || [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 1)',
            hidden: hiddenKeys.includes('Spend'),
            tension: 0.3,
        },
        {
            label: 'Revenue',
            data: chartData?.revenue?.map(Number) || [],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 1)',
            hidden: hiddenKeys.includes('Revenue'),
            tension: 0.3,
        },
        {
            label: 'RPC',
            data: chartData?.rpc?.map(Number) || [],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 1)',
            hidden: hiddenKeys.includes('RPC'),
            tension: 0.3,
        },
        {
            label: 'CPL',
            data: chartData?.cpl?.map(Number) || [],
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 1)',
            hidden: hiddenKeys.includes('CPL'),
            tension: 0.3,
        },
        {
            label: 'Profit',
            data: chartData?.profit?.map(Number) || [],
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 1)',
            hidden: hiddenKeys.includes('Profit'),
            tension: 0.3,
        },
        {
            label: 'Margin',
            data: chartData?.margin?.map(Number) || [],
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 1)',
            hidden: hiddenKeys.includes('Margin'),
            tension: 0.3,
        },
    ];
    const toggleLegend = (label) => {
        setHiddenKeys(prev =>
            prev.includes(label) ? prev.filter(k => k !== label) : [...prev, label]
        );
    };
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    const colorMap = {};
    const getColorForValue = (value) => {
        if (!colorMap[value]) {
            colorMap[value] = getRandomColor(); // Generate and assign a color
        }
        return colorMap[value]; // Return the assigned color
    };
    return (
        <div
            style={{
                width: '100%',
                borderRadius: 12,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                padding: 15,
                height: 'auto',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.6)' : '0 1px 6px rgba(0,0,0,0.08)',
            }}
        >

            {/* Legend */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '10px',
                }}
            >
                {Object.keys(datasetColorMap).map(label => {
                    const isVisible = !hiddenKeys.includes(label);

                    return (
                        <div
                            key={label}
                            onClick={() => toggleLegend(label)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                gap: '6px',
                                fontSize: '13px',
                                color: theme === 'dark' ? '#fff' : '#000',
                            }}
                        >
                            <div
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    backgroundColor: datasetColorMap[label],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '11px',
                                }}
                            >
                                {isVisible && '✓'}
                            </div>

                            <span>{label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Chart */}
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '350px',
                }}
            >
                <Line
                    data={{
                        labels: chartData?.dates || [],
                        datasets,
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,

                        plugins: {
                            legend: {
                                display: false,
                            },

                            tooltip: {
                                mode: 'index',
                                intersect: false,
                            },
                        },

                        scales: {
                            x: {
                                ticks: {
                                    color: (context) => {
                                        const index = context.index;
                                        const label = chartData?.dates?.[index];
                                        return getColorForValue(label);
                                    },
                                },
                                grid: {
                                    color: theme === 'dark' ? '#444' : '#e0e0e0',
                                },
                            },

                            y: {
                                beginAtZero: true,
                                ticks: {
                                    color: theme === 'dark' ? '#fff' : '#000',
                                    callback: value => Number(value).toFixed(2),
                                },
                                grid: {
                                    color: theme === 'dark' ? '#444' : '#e0e0e0',
                                },
                            },
                        },
                    }}
                />
            </div>

        </div>
    )
}
export default ChartForHistory;