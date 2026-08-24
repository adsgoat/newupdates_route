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
            confirmLoading={confirmLoading}
            destroyOnHidden={destroyOnHidden}
        >
            {children}
        </Modal>
    );
}