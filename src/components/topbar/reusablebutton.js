"use client";

import React from "react";
import { Button } from "antd";

const ReusableButton = ({
    children,
    onClick,
    size = "small",
    darkMode = false,
    type = "default",
    disabled = false,
    loading = false,
    style = {},
    icon,
    ...props
}) => {
    return (
        <Button
            size={size}
            type={type}
            icon={icon}
            onClick={onClick}
            disabled={disabled}
            loading={loading}
            style={{
                backgroundColor: "transparent",
                border: "1px solid green",
                color: darkMode ? "#fff" : "#000",
                ...style,
            }}
            {...props}
        >
            {children}
        </Button>
    );
};

export default ReusableButton;