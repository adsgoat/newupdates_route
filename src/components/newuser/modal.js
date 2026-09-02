"use client";

import { Modal } from "antd";

const ReusableModal = ({
    open,
    title = "Edit",
    onCancel,
    onOk,
    children,
    okText = "Save",
    cancelText = "Cancel",
    width = 500,
    loading = false,
    footer = undefined,
    centered = true,
    theme = "light",
}) => {
    const isDark = theme === "dark";

    return (
        <Modal
            open={open}
            title={title}
            onCancel={onCancel}
            onOk={onOk}
            okText={okText}
            cancelText={cancelText}
            width={width}
            confirmLoading={loading}
            centered={centered}
            destroyOnHidden
            footer={footer}
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
            styles={{
                body: {
                    padding: 10,
                    backgroundColor: theme === 'dark' ? '#333' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                },
            }}
            style={{ borderRadius: '12px' }}
        >
            {children}
        </Modal>
    );
};

export default ReusableModal;
