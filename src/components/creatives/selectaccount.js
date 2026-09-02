"use client";

import { Select } from "antd";
import {
    CheckCircleFilled,
    CloseCircleFilled,
} from "@ant-design/icons";

export default function SelectAccountSingle({
    accounts = [],
    value,
    onChange,
    disabled = false,
    theme,
}) {
    const options = accounts.map((account) => ({
        value: account.accountNumber,
        accountname: account.accountName,
        label: (
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "5px 0",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "75%",
                    }}
                >
                    <span
                        className="account-number"
                        style={{
                            fontWeight: 600,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {account.accountNumber}
                    </span>

                    <span
                        className="account-name"
                        style={{
                            fontSize: 12,
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {account.accountName}
                    </span>
                </div>

                {account.status === "Active" ? (
                    <CheckCircleFilled
                        style={{
                            color: "#91C25F",
                            fontSize: 15,
                        }}
                    />
                ) : (
                    <CloseCircleFilled
                        style={{
                            color: "#EC7117",
                            fontSize: 15,
                        }}
                    />
                )}
            </div>
        ),
    }));

    return (
        <Select
            showSearch
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder="Select Account"
            optionLabelProp="value"
            style={{
                width: "100%",
                height: "75%",
            }}
            options={options}

            className={
                theme === "dark"
                    ? "account-select-dark"
                    : "account-select-light"
            }

            popupClassName={
                theme === "dark"
                    ? "account-dropdown-dark"
                    : "account-dropdown-light"
            }

            filterOption={(input, option) => {
                const accountNumber =
                    option?.value?.toString().toLowerCase() || "";

                const accountName =
                    option?.accountname?.toString().toLowerCase() || "";

                return (
                    accountNumber.includes(input.toLowerCase()) ||
                    accountName.includes(input.toLowerCase())
                );
            }}

            notFoundContent="No Accounts"
        />
    );
}