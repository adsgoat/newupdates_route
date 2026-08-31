"use client";

import React from "react";
import { Switch } from "antd";

export default function ReusableSwitch({
    checked = false,
    onChange,
    size = "small",
    activeColor = "#91C25F",
}) {
    return (
        <Switch
            checked={checked}
            size={size}
            style={{
                backgroundColor: checked
                    ? activeColor
                    : undefined,
            }}
            onChange={onChange}
        />
    );
}