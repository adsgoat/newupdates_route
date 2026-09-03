"use client";

import React from "react";
import { Select } from "antd";

const ReusableSelect = ({
    value,
    onChange,
    options = [],
    placeholder = "Select",
    size = "small",
    width = 150,
    loading = false,
    disabled = false,
    style = {},
    theme,
    className = "",
    ...props
}) => {
    return (
        <Select
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            size={size}
            loading={loading}
            disabled={disabled}
            {...props}
            className={`reusable-select ${theme === "dark" ? "reusable-select-dark" : ""
                } ${className}`}
            style={{
                ...style,
                "--select-width":
                    typeof width === "number"
                        ? `${width}px`
                        : width,
                background: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
            }}
            dropdownClassName={
                theme === "dark" ? "custom-dropdown" : undefined
            }
        />
    );
};

export default ReusableSelect;