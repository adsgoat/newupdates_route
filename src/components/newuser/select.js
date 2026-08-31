"use client";

import { Select } from "antd";
import "../../styles/newuser.css"

export default function ReusableSelect({
    value,
    defaultValue,
    onChange,
    onSearch,
    onBlur,
    onFocus,

    options = [],

    placeholder,
    width = 170,
    size = "middle",
    theme = "light",
    height = "",
    allowClear = false,
    showSearch = false,
    disabled = false,
    loading = false,
    mode,
    filterOption = true,

    ...rest
}) {
    // Convert simple values into Ant Design options
    const formattedOptions = options.map((item) => {
        if (
            typeof item === "object" &&
            item !== null
        ) {
            return item;
        }

        return {
            value: item,
            label: item,
        };
    });

    return (
        <Select
            value={value}
            defaultValue={defaultValue}
            onChange={onChange}
            onSearch={onSearch}
            onBlur={onBlur}
            onFocus={onFocus}
            options={formattedOptions}
            placeholder={placeholder}
            size={size}
            allowClear={allowClear}
            showSearch={showSearch}
            disabled={disabled}
            loading={loading}
            mode={mode}
            filterOption={filterOption}
            style={{
                width,
                height,
                background: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
                ...rest.style,
            }}
            className={`${theme === "dark" ? "dark-theme" : "light-theme"} green-border-select margin-bottom-items`}
            {...rest}
            classNames={{
                popup: {
                    root: theme === "dark" ? "custom-dropdown" : "",
                },
            }}
        />
    );
}