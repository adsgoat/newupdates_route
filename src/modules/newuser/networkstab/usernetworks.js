"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

const NETWORK_STATUS = ["All", "Active", "InActive"];

export default function useNetworks() {
    const [networksData, setNetworksData] = useState([]);
    const [networkFilteredData, setNetworkFilteredData] = useState([]);

    const [loading3, setLoading3] = useState(true);

    const [netSearchInput, setNetSearchInput] = useState("");
    const [isSearchingNetwork, setIsSearchingNetwork] = useState(false);

    const [availableNetworks, setAvailableNetworks] = useState(["All"]);

    const [revenuePartner, setRevenuePartner] = useState("All");
    const [networkStatus, setNetworkStatus] = useState(
        NETWORK_STATUS
    );
    const [status, setStatus] = useState("All");
    const [networkAccessDrawerOpen, setNetworkAccessDrawerOpen] =
        useState(false);

    const [networkAccessData, setNetworkAccessData] =
        useState(null);

    const fetchNetworksData = useCallback(async () => {
        try {
            const response = await axios.get("/api/newuser/network");

            const data = Array.isArray(response.data)
                ? response.data
                : response.data.data || [];

            setNetworksData(data);
            const partners = [
                "All",
                ...new Set(
                    data
                        .map((item) => item.revenuePartner)
                        .filter(Boolean)
                ),
            ];

            setAvailableNetworks(partners);

            return data;
        } catch (error) {
            console.error("Error fetching networks:", error);
            throw error;
        }
    }, []);

    useEffect(() => {
        const loadNetworks = async () => {
            setLoading3(true);

            try {
                await fetchNetworksData();
            } finally {
                setLoading3(false);
            }
        };

        loadNetworks();
    }, [fetchNetworksData]);


    const refreshNetworks = async () => {
        setLoading3(true);

        try {
            await fetchNetworksData();
        } catch (error) {
            console.error(
                "Error refreshing network data:",
                error
            );
        } finally {
            setLoading3(false);
        }
    };

    const handleNetworkSearchChange = (e) => {
        const searchValue =
            e.target.value.toLowerCase();

        setNetSearchInput(searchValue);
        setIsSearchingNetwork(true);
    };

    const handleSearchNetwork = () => {
        setIsSearchingNetwork(true);
    };

    const handleBlur2 = () => {
        if (!netSearchInput.trim()) {
            setIsSearchingNetwork(false);
        }
    };

    const filteredByDropdown = useMemo(() => {
        let data = [...networksData];

        // Revenue Partner
        if (revenuePartner !== "All") {
            data = data.filter(
                (item) =>
                    item.revenuePartner ===
                    revenuePartner
            );
        }

        // Status
        if (status !== "All") {
            data = data.filter(
                (item) =>
                    (item.status ?? item.Status) ===
                    status
            );
        }

        // Search
        if (netSearchInput.trim()) {
            const searchValue =
                netSearchInput.toLowerCase();

            data = data.filter((item) =>
                Object.values(item).some(
                    (field) =>
                        typeof field === "string" &&
                        field
                            .toLowerCase()
                            .includes(searchValue)
                )
            );
        }

        return data;
    }, [
        networksData,
        revenuePartner,
        status,
        netSearchInput,
    ]);

    useEffect(() => {
        setNetworkFilteredData(
            filteredByDropdown
        );
    }, [filteredByDropdown]);

    const onChangeNetwork = (value) => {
        setRevenuePartner(value);
    };
    const onChangeStatus = (value) => {
        setStatus(value);
    };
    const handleNetworkStatusChange = async (
        revenuePartnerValue,
        checked
    ) => {
        const newStatus = checked
            ? "Active"
            : "InActive";

        try {
            const response = await axios.patch(
                "/api/newuser/networkstatus",
                null,
                {
                    params: {
                        revenuePartner: revenuePartnerValue,
                        Status: newStatus,
                    },
                }
            );

            if (response.status === 200) {
                // Update UI immediately
                setNetworksData((prevData) =>
                    prevData.map((item) => {
                        if (
                            item.revenuePartner ===
                            revenuePartnerValue
                        ) {
                            return {
                                ...item,
                                Status: newStatus,
                                status: newStatus,
                            };
                        }

                        return item;
                    })
                );
                fetchNetworksData();
            }
        } catch (error) {
            console.error(
                "Error updating network status:",
                error
            );
        }
    };

  

    const handleEditNetwork = (values) => {
        setNetworkAccessData(values);
        setNetworkAccessDrawerOpen(true);
    };

    const closeNetworkDrawer = () => {
        setNetworkAccessDrawerOpen(false);
        setNetworkAccessData(null);
    };

    const showNetworkDrawer = () => {
        setNetworkAccessDrawerOpen(true);
    };


    return {
        // Data
        networksData,
        networkFilteredData,

        // Loading
        loading3,

        // Search
        netSearchInput,
        isSearchingNetwork,
        handleNetworkSearchChange,
        handleSearchNetwork,
        handleBlur2,

        // Filters
        revenuePartner,
        availableNetworks,
        networkStatus,
        status,
        onChangeNetwork,
        onChangeStatus,

        // API
        fetchNetworksData,
        refreshNetworks,
        handleNetworkStatusChange,

        // Edit
        handleEditNetwork,
        networkAccessDrawerOpen,
        networkAccessData,
        closeNetworkDrawer,
        showNetworkDrawer,
        
    };
}