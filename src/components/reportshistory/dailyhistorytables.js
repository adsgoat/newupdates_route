"use client";
import {  useState, } from 'react';
import moment from 'moment-timezone';
import { Col } from 'antd';
const DailyHistoryTables = ({ chartData, theme }) => {
    const [rpcTableType, setRpcTableType] = useState("top5");
    const [marginTableType, setMarginTableType] = useState("top5");
    return (
        <Col
            className="rpc-margin-container"
            style={{
                display: "flex",
                width: "100%",
                marginLeft: "5px",
                alignItems: "flex-start",
            }}
        >
            <div
                className="rpc-margin-card"
                style={{
                    marginLeft: "0",
                    padding: "12px",
                    borderRadius: "6px",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                    backgroundColor: theme === "dark"
                        ? "#1f1f1f"
                        : "#f5f5f5",
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                {/* Radio Buttons */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "10px",
                        flexWrap: "wrap",
                    }}
                >
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
                                rpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="rpcTable"
                            value="top5"
                            checked={rpcTableType === "top5"}
                            onChange={(e) => setRpcTableType(e.target.value)}
                            style={{
                                margin: 0,
                                width: "12px",
                                height: "12px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    rpcTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5 RPC
                    </label>

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
                                rpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="rpcTable"
                            value="last5"
                            checked={rpcTableType === "last5"}
                            onChange={(e) => setRpcTableType(e.target.value)}
                            style={{
                                margin: 0,
                                width: "12px",
                                height: "12px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    rpcTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5 RPC
                    </label>
                </div>

                {/* RPC Table */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        overflow: "hidden",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <colgroup>
                        <col style={{ width: "1%" }} />
                        <col style={{ width: "1%" }} />
                        <col style={{ width: "1%" }} />
                    </colgroup>

                    <thead>
                        <tr>
                            {["Date", "RPC", "WeekDay"].map((heading, columnIndex) => (
                                <th
                                    key={heading}
                                    style={{
                                        padding: "7px 14px",
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
                                            columnIndex < 2
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
                        {chartData.dates
                            .map((date, index) => ({
                                date: date.split(" ")[0],
                                rpc: chartData.rpc[index],
                            }))
                            .sort((a, b) =>
                                rpcTableType === "top5"
                                    ? b.rpc - a.rpc
                                    : a.rpc - b.rpc
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    {/* Date */}
                                    <td
                                        style={{
                                            padding: "6px 14px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark" ? "#eee" : "#333",

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
                                        {item.date}
                                    </td>

                                    {/* RPC */}
                                    <td
                                        style={{
                                            padding: "6px 14px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark" ? "#fff" : "#333",

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
                                        {item.rpc}
                                    </td>

                                    {/* WeekDay */}
                                    <td
                                        style={{
                                            padding: "6px 14px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark" ? "#eee" : "#333",

                                            // No right border for last column
                                            borderRight: "none",

                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {moment(item.date).format("dddd")}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            <div
                className="rpc-margin-card"
                style={{
                    marginLeft: "0",
                    padding: "12px",
                    borderRadius: "6px",
                    border: theme === "dark"
                        ? "1px solid #3a3a3a"
                        : "1px solid #ddd",
                    backgroundColor: theme === "dark"
                        ? "#1f1f1f"
                        : "#f5f5f5",
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                {/* Radio Buttons */}
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
                                rpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="marginTable"
                            value="top5"
                            checked={marginTableType === "top5"}
                            onChange={(e) => setMarginTableType(e.target.value)}
                            style={{
                                margin: 0,
                                width: "12px",
                                height: "12px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    marginTableType === "top5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Top 5 Margin
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
                                rpcTableType === "top5"
                                    ? theme === "dark"
                                        ? "#333"
                                        : "#f0f0f0"
                                    : "transparent",
                        }}
                    >
                        <input
                            type="radio"
                            name="marginTable"
                            value="last5"
                            checked={marginTableType === "last5"}
                            onChange={(e) => setMarginTableType(e.target.value)}
                            style={{
                                margin: 0,
                                width: "12px",
                                height: "12px",
                                cursor: "pointer",
                                appearance: "none",
                                WebkitAppearance: "none",
                                border: "1px solid #91c25f",
                                borderRadius: "50%",
                                backgroundColor: "transparent",
                                boxSizing: "border-box",
                                backgroundImage:
                                    marginTableType === "last5"
                                        ? "radial-gradient(circle, #91c25f 0%, #91c25f 45%, transparent 50%)"
                                        : "none",
                            }}
                        />
                        Last 5 Margin
                    </label>
                </div>

                {/* Margin Table */}
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate",
                        borderSpacing: 0,
                        fontSize: "11px",
                        overflow: "hidden",
                        borderRadius: "4px",
                        border: theme === "dark"
                            ? "1px solid #444"
                            : "1px solid #d9d9d9",
                    }}
                >
                    <thead>
                        <tr>
                            {["Date", "Margin", "WeekDay"].map((heading, index) => (
                                <th
                                    key={heading}
                                    style={{
                                        padding: "7px 10px",
                                        textAlign: "left",
                                        fontWeight: 600,
                                        whiteSpace: "nowrap",
                                        color: theme === "dark" ? "#fff" : "#333",
                                        backgroundColor:
                                            theme === "dark" ? "#2a2a2a" : "#f5f5f5",

                                        borderBottom:
                                            theme === "dark"
                                                ? "1px solid #444"
                                                : "1px solid #d9d9d9",

                                        borderRight:
                                            index < 2
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
                        {chartData.dates
                            .map((date, index) => ({
                                date: date.split(" ")[0],
                                margin: chartData.margin[index],
                            }))
                            .sort((a, b) =>
                                marginTableType === "top5"
                                    ? b.margin - a.margin
                                    : a.margin - b.margin
                            )
                            .slice(0, 5)
                            .map((item, index) => (
                                <tr key={index}>
                                    {/* Date */}
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark" ? "#eee" : "#333",

                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",

                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                        }}
                                    >
                                        {item.date}
                                    </td>

                                    {/* Margin */}
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            fontWeight: 500,
                                            color: theme === "dark" ? "#fff" : "#333",

                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",

                                            borderRight:
                                                theme === "dark"
                                                    ? "1px solid #444"
                                                    : "1px solid #d9d9d9",
                                        }}
                                    >
                                        {item.margin}
                                    </td>

                                    {/* WeekDay */}
                                    <td
                                        style={{
                                            padding: "6px 10px",
                                            whiteSpace: "nowrap",
                                            color: theme === "dark" ? "#eee" : "#333",

                                            borderBottom:
                                                index !== 4
                                                    ? theme === "dark"
                                                        ? "1px solid #444"
                                                        : "1px solid #d9d9d9"
                                                    : "none",
                                        }}
                                    >
                                        {moment(item.date).format("dddd")}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </Col>
    )
}
export default DailyHistoryTables;