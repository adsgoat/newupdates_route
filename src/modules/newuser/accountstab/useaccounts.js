"use client";

import { useEffect, useMemo, useState } from "react";

const ACCOUNT_STATUS = [
    "All",
    "Active",
    "InActive",
];

export default function useAccounts() {
    const [AccountsData, setAccountsData] =
        useState([]);

    const [loading2, setLoading2] =
        useState(true);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [newSearchInput, setNewSearchInput] =
        useState("");

    const [isSearchingAccount, setIsSearchingAccount] =
        useState(false);

    const [revenuePartner, setRevenuePartner] =
        useState("All");

    const [accountStatus, setAccountStatus] =
        useState(ACCOUNT_STATUS);

    const [status, setStatus] =
        useState("All");
    const [editAccount, setEditAccount] = useState(null);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [addAccountDrawerOpen, setAddAccountDrawerOpen] =
        useState(false);

    const shownnewaccountdrawar = () => {
        setAddAccountDrawerOpen(true);
    };

    const closeAddAccountDrawer = () => {
        setAddAccountDrawerOpen(false);
    };

    const fetchAccounts = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshLoading(true);
            } else {
                setLoading2(true);
            }

            const response = await fetch(
                "/api/newuser/accountsdata",
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch accounts"
                );
            }

            const data = await response.json();

            setAccountsData(
                Array.isArray(data) ? data : []
            );
        } catch (error) {
            console.error(
                "Failed to fetch accounts:",
                error
            );

            setAccountsData([]);
        } finally {
            if (isRefresh) {
                setRefreshLoading(false);
            } else {
                setLoading2(false);
            }
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleaccountSearchChange = (
        event
    ) => {
        const value =
            event.target.value.toLowerCase();

        setNewSearchInput(value);
    };

    const handleBlur1 = () => {
        if (!newSearchInput.trim()) {
            setIsSearchingAccount(false);
        }
    };

    const onChangeNetwork = (value) => {
        setRevenuePartner(value);
    };
    const onChangeStatus = (value) => {
        setStatus(value);
    };

    const availableNetworks = useMemo(() => {
        const networks =
            AccountsData
                .map(
                    (item) =>
                        item.revenuePartner
                )
                .filter(Boolean);

        return [
            "All",
            ...new Set(networks),
        ];
    }, [AccountsData]);
    const accFilteredData = useMemo(() => {
        let data = [...AccountsData];
        if (status !== "All") {
            data = data.filter(
                (item) =>
                    item.status === status
            );
        }
        if (
            revenuePartner !== "All"
        ) {
            data = data.filter(
                (item) =>
                    item.revenuePartner ===
                    revenuePartner
            );
        }

        /*
         * Search
         */
        if (newSearchInput.trim()) {
            data = data.filter((item) =>
                Object.values(item).some(
                    (field) =>
                        typeof field ===
                        "string" &&
                        field
                            .toLowerCase()
                            .includes(
                                newSearchInput
                            )
                )
            );
        }

        return data;
    }, [
        AccountsData,
        status,
        revenuePartner,
        newSearchInput,
    ]);
    const refreshAccounts = async () => {
        setLoading2(true);
        try {
            await fetchAccounts();
        } finally {
            setLoading2(false);
        }
    };
    const handleStatusChange = async (
        accountNumber,
        checked
    ) => {
        const newStatus = checked
            ? "Active"
            : "InActive";

        try {
            // Optimistic UI
            setAccountsData((previous) =>
                previous.map((item) =>
                    item.accountNumber === accountNumber
                        ? {
                            ...item,
                            status: newStatus,
                        }
                        : item
                )
            );

            const url =
                `/api/newuser/accountstatus` +
                `?accountNumber=${encodeURIComponent(
                    accountNumber
                )}` +
                `&status=${encodeURIComponent(
                    newStatus
                )}`;

            console.log("PATCH URL:", url);
            console.log("Account Number:", accountNumber);
            console.log("New Status:", newStatus);

            const response = await fetch(url, {
                method: "PATCH",
            });

            console.log(
                "PATCH status:",
                response.status
            );

            const responseText =
                await response.text();

            console.log(
                "PATCH response:",
                responseText
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to update account status: ${response.status}`
                );
            }
        } catch (error) {
            console.error(
                "Account status update error:",
                error
            );

            // Reload server data if update fails
            await fetchAccounts();
        }
    };

    const handleSearchClick1 = () => {
        setIsSearchingAccount(true);
    };

    const handleEditAccount = (record) => {
        setEditAccount(record);
        setEditDrawerOpen(true);
    };

    const handleCloseEditAccount = () => {
        setEditDrawerOpen(false);
        setEditAccount(null);
    };

    return {
        AccountsData,
        accFilteredData,
        loading2,
        newSearchInput,
        isSearchingAccount,
        revenuePartner,
        availableNetworks,
        accountStatus,
        status,
        handleaccountSearchChange,
        handleBlur1,
        handleSearchClick1,
        onChangeNetwork,
        onChangeStatus,
        refreshAccounts,
        handleStatusChange,
        editAccount,
        editDrawerOpen,
        handleEditAccount,
        handleCloseEditAccount,
        shownnewaccountdrawar,
        closeAddAccountDrawer,
        addAccountDrawerOpen,
        refreshLoading


    };
}