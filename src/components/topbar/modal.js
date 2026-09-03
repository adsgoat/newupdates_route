"use client";

import React from "react";
import { Modal } from "antd";

const ReusableModal = ({
    open,
    onCancel,
    children,
    title,
    width = 500,
    centered = true,
    footer = null,
    theme = "light",
    className = "",
    style = {},
    ...props
}) => {
    const darkMode = theme === "dark";

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={title}
            width={width}
            centered={centered}
            footer={footer}
            className={className}
            styles={{
                container: {
                    backgroundColor: darkMode ? "#333" : "#fff",
                },
                content: {
                    backgroundColor: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                    ...style,
                },
                header: {
                    backgroundColor: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                },
                body: {
                    backgroundColor: darkMode ? "#333" : "#fff",
                    color: darkMode ? "#fff" : "#000",
                },
                footer: {
                    backgroundColor: darkMode ? "#333" : "#fff",
                },
                close: {
                    color: darkMode ? "#fff" : "#000",
                },
            }}
            {...props}
        >
            {children}
        </Modal>
    );
};

export default ReusableModal;