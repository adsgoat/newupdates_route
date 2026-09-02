"use client";
import { useState, } from 'react';
import moment from 'moment-timezone';
import { Col } from 'antd';
const LiveHistoryTables = ({ chartData, theme }) => {
    const [todayRpcTableType, setTodayRpcTableType] = useState("top5");
    const [todayMarginTableType, setTodayMarginTableType] = useState("top5");
    const [repeatedRpcTableType, setRepeatedRpcTableType] = useState("top5");
    const [repeatedMarginTableType, setRepeatedMarginTableType] = useState("top5");
    return (
        <Col
            className="today-tables-container"
            style={{
                display: "flex",
                width: "100%",
                marginLeft: "0%",
                alignItems: "flex-start",
            }}
        >
            {/* ========================================================= */}
            {/*                    TODAY RPC TABLE                       */}
            {/* ========================================================= */}

            <div
                className="today-table-card"
                style={{
                    backgroundColor: theme === "dark" ? "#1f1f1f" : "#f5f5f5",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                }}
            >
                <span style={{ fontSize: 12 }}>Today RPC</span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Top 5 RPC */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                todayRpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="todayRpcTable"
                            value="top5"
                            checked={todayRpcTableType === "top5"}
                            onChange={(e) =>
                                setTodayRpcTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    todayRpcTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5
                    </label>

                    {/* Last 5 RPC */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                todayRpcTableType === "last5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="todayRpcTable"
                            value="last5"
                            checked={todayRpcTableType === "last5"}
                            onChange={(e) =>
                                setTodayRpcTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    todayRpcTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5
                    </label>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <thead>
                        <tr>
                            {["Hour", "RPC"].map((heading, columnIndex) => (
                                <th
                                    key={heading}
                                    style={{
                                        padding: "7px 10px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        color: theme === "dark" ? "#fff" : "#333",
                                        backgroundColor:
                                            theme === "dark"
                                                ? "#2a2a2a"
                                                : "#f5f5f5",
                                        borderBottom:
                                            theme === "dark"
                                                ? "1px solid #444"
                                                : "1px solid #d9d9d9",
                                        borderRight:
                                            columnIndex === 0
                                                ? theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9"
                                                : "none",
                                    }}
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {(chartData.rpcDate || [])
                            .filter(
                                (item) =>
                                    item.date ===
                                    moment.tz("UTC").format("YYYY-MM-DD")
                            )
                            .sort((a, b) =>
                                todayRpcTableType === "top5"
                                    ? b.rpc - a.rpc
                                    : a.rpc - b.rpc
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.hour}
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.rpc}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>


            {/* ========================================================= */}
            {/*                   TODAY MARGIN TABLE                      */}
            {/* ========================================================= */}

            <div
                className="today-table-card"
                style={{
                    backgroundColor: theme === "dark" ? "#1f1f1f" : "#f5f5f5",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                }}
            >
                <span style={{ fontSize: 12 }}>Today Margin</span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Top 5 Margin */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                todayMarginTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="todayMarginTable"
                            value="top5"
                            checked={todayMarginTableType === "top5"}
                            onChange={(e) =>
                                setTodayMarginTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    todayMarginTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5
                    </label>

                    {/* Last 5 Margin */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                todayMarginTableType === "last5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="todayMarginTable"
                            value="last5"
                            checked={todayMarginTableType === "last5"}
                            onChange={(e) =>
                                setTodayMarginTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    todayMarginTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5
                    </label>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <thead>
                        <tr>
                            {["Hour", "Margin"].map((heading, columnIndex) => (
                                <th
                                    key={heading}
                                    style={{
                                        padding: "7px 10px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        color: theme === "dark" ? "#fff" : "#333",
                                        backgroundColor:
                                            theme === "dark"
                                                ? "#2a2a2a"
                                                : "#f5f5f5",
                                        borderBottom:
                                            theme === "dark"
                                                ? "1px solid #444"
                                                : "1px solid #d9d9d9",
                                        borderRight:
                                            columnIndex === 0
                                                ? theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9"
                                                : "none",
                                    }}
                                >
                                    {heading}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {(chartData.hoursDate || [])
                            .filter(
                                (item) =>
                                    item.date ===
                                    moment.tz("UTC").format("YYYY-MM-DD")
                            )
                            .sort((a, b) =>
                                todayMarginTableType === "top5"
                                    ? b.margin - a.margin
                                    : a.margin - b.margin
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.hour}
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.margin}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>


            {/* ========================================================= */}
            {/*                  REPEATED RPC TABLE                      */}
            {/* ========================================================= */}

            <div
                className="today-table-card"
                style={{
                    backgroundColor: theme === "dark" ? "#1f1f1f" : "#f5f5f5",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                }}
            >
                <span style={{ fontSize: 12 }}>Repeated hours with Rpc (Last 10 days)</span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Top 5 */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                repeatedRpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="repeatedRpcTable"
                            value="top5"
                            checked={repeatedRpcTableType === "top5"}
                            onChange={(e) =>
                                setRepeatedRpcTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    repeatedRpcTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5
                    </label>

                    {/* Last 5 */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                repeatedRpcTableType === "last5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="repeatedRpcTable"
                            value="last5"
                            checked={repeatedRpcTableType === "last5"}
                            onChange={(e) =>
                                setRepeatedRpcTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    repeatedRpcTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5
                    </label>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <thead>
                        <tr>
                            {["Hour", "RPC", "Times Repeated"].map(
                                (heading, columnIndex) => (
                                    <th
                                        key={heading}
                                        style={{
                                            padding: "7px 10px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            backgroundColor:
                                                theme === "dark"
                                                    ? "#2a2a2a"
                                                    : "#f5f5f5",
                                            borderBottom:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderRight:
                                                columnIndex < 2
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {chartData.sortedData
                            .sort((a, b) =>
                                repeatedRpcTableType === "top5"
                                    ? b.averageRpc - a.averageRpc
                                    : a.averageRpc - b.averageRpc
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.hour}:00
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.averageRpc.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.count}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>


            {/* ========================================================= */}
            {/*                 REPEATED MARGIN TABLE                    */}
            {/* ========================================================= */}

            <div
                className="today-table-card"
                style={{
                    backgroundColor: theme === "dark" ? "#1f1f1f" : "#f5f5f5",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                }}
            >
                <span style={{ fontSize: 12 }}>Repeated hours with Margin (Last 10 days)</span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {/* Top 5 */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                repeatedMarginTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="repeatedMarginTable"
                            value="top5"
                            checked={repeatedMarginTableType === "top5"}
                            onChange={(e) =>
                                setRepeatedMarginTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    repeatedMarginTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5
                    </label>

                    {/* Last 5 */}
                    <label
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                            color: theme === "dark" ? "#fff" : "#333",
                            backgroundColor:
                                repeatedMarginTableType === "last5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="repeatedMarginTable"
                            value="last5"
                            checked={repeatedMarginTableType === "last5"}
                            onChange={(e) =>
                                setRepeatedMarginTableType(e.target.value)
                            }
                            style={{
                                margin: 0,
                                width: "14px",
                                height: "14px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    repeatedMarginTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5
                    </label>
                </div>

                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <thead>
                        <tr>
                            {["Hour", "Avg Margin", "Times Repeated"].map(
                                (heading, columnIndex) => (
                                    <th
                                        key={heading}
                                        style={{
                                            padding: "7px 10px",
                                            textAlign: "left",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            backgroundColor:
                                                theme === "dark"
                                                    ? "#2a2a2a"
                                                    : "#f5f5f5",
                                            borderBottom:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderRight:
                                                columnIndex < 2
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {chartData.sortedMarginData
                            .sort((a, b) =>
                                repeatedMarginTableType === "top5"
                                    ? b.averageMargin - a.averageMargin
                                    : a.averageMargin - b.averageMargin
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.hour}:00
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark"
                                                ? "#fff"
                                                : "#333",
                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.averageMargin.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark"
                                                ? "#eee"
                                                : "#333",
                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {item.count}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </Col>
    )
}
export default LiveHistoryTables;