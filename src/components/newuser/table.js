"use client";

import React from "react";
import { Table } from "antd";
import "../../styles/newuser.css"

const ReusableTable = ({
    dataSource = [],
    columns = [],
    rowClassName,
    paginationSize = 10,
    scroll = {
        x: "max-content",
        y: "calc(87vh - 200px)",
    },
    loading = false,
    pagination = true,
    theme
}) => {
    const formattedData = (dataSource || []).map((item, index) => ({
        ...item,
        key:
            item._id ||
            item.accountNumber ||
            item.id ||
            index,
    }));

    return (
        <Table
            dataSource={formattedData}
            columns={columns}
            loading={loading}
            scroll={scroll}
            rowClassName={rowClassName}
            className={
                theme === "dark"
                    ? "reusable-table-dark dark-mode-pagination"
                    : "reusable-table-light"
            }
            
            pagination={
                pagination
                    ? {
                        defaultPageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        size: "small",
                    }
                    : false
            }
            
        />
    );
};

export default ReusableTable;