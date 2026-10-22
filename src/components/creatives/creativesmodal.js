"use client";

import { Modal } from "antd";

export default function CreativeModal({
    open = false,
    title = "",
    onCancel,

    children,

    footer = null,
    width = 600,
    centered = true,
    theme,
    closable = true,
    maskClosable = true,

    confirmLoading = false,

    destroyOnHidden = false,
}) {
    return (
        <Modal
            open={open}
            title={title}
            onCancel={onCancel}
            footer={footer}
            width={width}
            centered={centered}
            closable={closable}
            mask={{
                closable: maskClosable,
            }}
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
            confirmLoading={confirmLoading}
            destroyOnHidden={destroyOnHidden}
        >
            {children}
        </Modal>
    );
}