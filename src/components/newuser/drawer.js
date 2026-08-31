"use client";

import { Drawer } from "antd";

const ReusableDrawer = ({
    open,
    title = "",
    onClose,
    children,

    width = 520,
    placement = "right",

    closable = true,
    mask = true,
    destroyOnHidden = true,

    footer = null,
    extra = null,

    styles = {},
    className = "",
    size,
    theme = "light",
}) => {
    const isDark = theme === "dark";

    return (
        <Drawer
            open={open}
            title={title}
            onClose={onClose}
            size={width}
            placement={placement}
            footer={footer}
            destroyOnHidden={destroyOnHidden}
            // width={width}
            closable={closable}
            mask={mask}
            extra={extra}
            className={`${isDark ? "reusable-drawer-dark" : "reusable-drawer-light"} ${className}`}
            styles={styles}
        >
            {children}
        </Drawer>
    );
};

export default ReusableDrawer;