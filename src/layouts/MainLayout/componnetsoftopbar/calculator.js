"use client";

import React, { useState } from "react";
import {
    Typography,
    Card,
    Space,
    Row,
    Col,
} from "antd";
import "../../../styles/topbar.css";
import ReusableButton from "@/components/topbar/reusablebutton";
import ReusableSelect from "@/components/topbar/select";
import ReusableModal from "@/components/topbar/modal";

const { Text } = Typography;

export default function Calculator({
    open,
    onClose,
    theme,
}) {
    const [expression, setExpression] = useState("");
    const [display, setDisplay] = useState("0");
    const [history, setHistory] = useState([]);
    const [selectedHistoryIndex, setSelectedHistoryIndex] =
        useState(null);

    const darkMode = theme === "dark";

    const handleNumber = (num) => {
        setExpression((prev) => prev + num);

        setDisplay((prev) =>
            prev === "0"
                ? num
                : prev + num
        );
    };

    const handleOperator = (op) => {
        const symbol =
            op === "*"
                ? "×"
                : op === "/"
                    ? "÷"
                    : op;

        setExpression(
            (prev) => prev + ` ${op} `
        );

        setDisplay(
            (prev) => prev + symbol
        );
    };

    const handleBracket = (bracket) => {
        setExpression(
            (prev) => prev + bracket
        );

        setDisplay(
            (prev) => prev + bracket
        );
    };

    const calculate = () => {
        try {
            const result = eval(expression);

            const historyEntry =
                `${expression} = ${result}`;

            setHistory((prev) => [
                historyEntry,
                ...prev,
            ]);

            setSelectedHistoryIndex(0);
            setDisplay(String(result));
            setExpression(String(result));
        } catch (error) {
            setDisplay("Error");
        }
    };

    const handleClear = () => {
        setDisplay("0");
        setExpression("");
    };

    const handleBackspace = () => {
        setExpression((prev) =>
            prev.slice(0, -1)
        );

        setDisplay((prev) =>
            prev.length > 1
                ? prev.slice(0, -1)
                : "0"
        );
    };

    const handlePercent = () => {
        const value =
            parseFloat(display) / 100;

        setDisplay(String(value));
        setExpression(String(value));
    };

    const handleToggleSign = () => {
        if (expression) {
            const value =
                parseFloat(display) * -1;

            setDisplay(String(value));
            setExpression(String(value));
        }
    };

    const handleDecimal = () => {
        if (!display.includes(".")) {
            setDisplay(
                display + "."
            );

            setExpression(
                expression + "."
            );
        }
    };

    const clearHistory = () => {
        setHistory([]);
        setSelectedHistoryIndex(null);
    };

    const renderButton = (
        label,
        onClick,
        type = "default"
    ) => (
        <ReusableButton
            onClick={onClick}
            className="calculator-button"
            darkMode={darkMode}
            style={{
                width: 70,
                height: 50,
                // background: darkMode
                //     ? "#555"
                //     : "#f0f0f0",
                // color: darkMode
                //     ? "#fff"
                //     : "#000",
            }}
            type={type}
        >
            {label}
        </ReusableButton>
    );

    return (
        <ReusableModal
            open={open}
            onCancel={onClose}
            footer={null}
            width="min(340px, calc(100vw - 20px))"
            centered
            className="calculator-modal"
            styles={{
                container: {
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                },
                content: {
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                },
                header: {
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                },
                body: {
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                },
                footer: {
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                },
                close: {
                    color: theme === 'dark' ? '#fff' : '#000',
                },
            }}

        >
            <Card
                title={
                    <Row
                        justify="space-between"
                        align="middle"
                    >
                        <Col
                            style={{
                                color: darkMode
                                    ? "#fff"
                                    : "#000",
                            }}
                        >
                            🧮 Enhanced Calculator
                        </Col>

                        <Col>
                            {history.length > 0 && (
                                <ReusableSelect
                                    placeholder="History"
                                    // size="small"
                                    value={
                                        selectedHistoryIndex
                                    }
                                    onChange={(value) =>
                                        setSelectedHistoryIndex(
                                            value
                                        )
                                    }
                                    width={200}
                                    theme={theme}
                                    options={history.map(
                                        (
                                            item,
                                            index
                                        ) => ({
                                            label: item,
                                            value: index,
                                        })
                                    )}
                                />
                            )}
                        </Col>
                    </Row>
                }
                style={{
                    width: "100%",
                    maxWidth: 350,
                    margin: "auto",
                    background: darkMode ? "#333" : "#fff",
                }}
                extra={
                    <ReusableButton
                        size="small"
                        darkMode={darkMode}
                        onClick={clearHistory}
                        // style={{
                        //     backgroundColor:
                        //         "transparent",
                        //     border:
                        //         "1px solid green",
                        //     color: darkMode
                        //         ? "#fff"
                        //         : "#000",
                        // }}
                    >
                        Clear
                    </ReusableButton>
                }
            >
                {/* DISPLAY */}

                <div
                    className="calculator-display"
                    style={{
                        background: darkMode ? "#555" : "#f0f0f0",
                        padding: "12px",
                        textAlign: "right",
                        fontSize: 24,
                        borderRadius: 4,
                        marginBottom: 12,
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            fontSize: 16,
                            color: darkMode
                                ? "#fff"
                                : "#000",
                        }}
                    >
                        {expression}
                    </div>

                    <div
                        style={{
                            fontSize: 24,
                        }}
                    >
                        <Text
                            style={{
                                color: darkMode
                                    ? "#fff"
                                    : "#333",
                            }}
                        >
                            {display}
                        </Text>
                    </div>
                </div>

                {/* BUTTONS */}

                <Space direction="vertical" className="calculator-row">
                    <Space className="calculator-row">
                        {renderButton(
                            "(",
                            () =>
                                handleBracket("(")
                        )}

                        {renderButton(
                            ")",
                            () =>
                                handleBracket(")")
                        )}

                        {renderButton(
                            "%",
                            handlePercent
                        )}

                        {renderButton(
                            "⌫",
                            handleBackspace
                        )}
                    </Space>

                    <Space className="calculator-row">
                        {renderButton(
                            "7",
                            () =>
                                handleNumber("7")
                        )}

                        {renderButton(
                            "8",
                            () =>
                                handleNumber("8")
                        )}

                        {renderButton(
                            "9",
                            () =>
                                handleNumber("9")
                        )}

                        {renderButton(
                            "÷",
                            () =>
                                handleOperator("/")
                        )}
                    </Space>

                    <Space className="calculator-row">
                        {renderButton(
                            "4",
                            () =>
                                handleNumber("4")
                        )}

                        {renderButton(
                            "5",
                            () =>
                                handleNumber("5")
                        )}

                        {renderButton(
                            "6",
                            () =>
                                handleNumber("6")
                        )}

                        {renderButton(
                            "×",
                            () =>
                                handleOperator("*")
                        )}
                    </Space>

                    <Space className="calculator-row">
                        {renderButton(
                            "1",
                            () =>
                                handleNumber("1")
                        )}

                        {renderButton(
                            "2",
                            () =>
                                handleNumber("2")
                        )}

                        {renderButton(
                            "3",
                            () =>
                                handleNumber("3")
                        )}

                        {renderButton(
                            "−",
                            () =>
                                handleOperator("-")
                        )}
                    </Space>

                    <Space className="calculator-row">
                        {renderButton(
                            "±",
                            handleToggleSign
                        )}

                        {renderButton(
                            "0",
                            () =>
                                handleNumber("0")
                        )}

                        {renderButton(
                            ".",
                            handleDecimal
                        )}

                        {renderButton(
                            "+",
                            () =>
                                handleOperator("+")
                        )}
                    </Space>

                    <Space
                        className="calculator-row"
                        style={{
                            justifyContent:
                                "flex-end",
                        }}
                    >
                        {renderButton(
                            "CE",
                            handleClear
                        )}

                        {renderButton(
                            "C",
                            handleClear
                        )}

                        <ReusableButton
                            size="small"
                            type="primary"
                            darkMode={darkMode}
                            className="calculator-equal-button"
                            style={{
                                width: 150,
                                backgroundColor:
                                    "#91C25F",
                                border:
                                    "1px solid #91C25F",
                            }}
                            onClick={calculate}
                        >
                            =
                        </ReusableButton>
                    </Space>
                </Space>
            </Card>
        </ReusableModal>
    );
}