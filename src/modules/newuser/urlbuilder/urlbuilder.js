"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";

export default function useUrlBuilder() {

    const [urlBuilderData, setUrlBuilderData] = useState([]);
    const [loading4, setLoading4] = useState(true);
    const [urlBuilderSearchInput, setUrlBuilderSearchInput] =
        useState("");

    const [isSearchingUrlBuilder, setIsSearchingUrlBuilder] =
        useState(false);
    const [isEditUrlBuilderVisible, setIsEditUrlBuilderVisible] =
        useState(false);

    const [editedUrlBuilder, setEditedUrlBuilder] =
        useState(null);

    const [revenuePartner, setRevenuePartner] =
        useState("All");

    const [availableNetworks, setAvailableNetworks] =
        useState(["All"]);



    const [
        isModalVisibleForURLBuilder,
        setIsModalVisibleForURLBuilder,
    ] = useState(false);

    const [network, setNetwork] = useState("");

    const [selectedIndex, setSelectedIndex] =
        useState(null);

    // Complete selected row
    const [selectedUrlBuilder, setSelectedUrlBuilder] =
        useState(null);

    const fetchUrlBuilderData = useCallback(async () => {
        try {
            setLoading4(true);

            const response = await axios.get(
                "/api/newuser/geturlbuilderdata"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.data || [];

            setUrlBuilderData(data);

            const partners = [
                "All",
                ...new Set(
                    data
                        .map(
                            (item) =>
                                item.revenuePartner ||
                                item.Network ||
                                item.network
                        )
                        .filter(Boolean)
                ),
            ];


            setAvailableNetworks(partners);

            return data;
        } catch (error) {
            console.error(
                "Error fetching URL Builder:",
                error
            );

            setUrlBuilderData([]);
            setAvailableNetworks(["All"]);

            throw error;
        } finally {
            setLoading4(false);
        }
    }, []);



    useEffect(() => {
        fetchUrlBuilderData();
    }, [fetchUrlBuilderData]);



    const refreshUrlBuilder = async () => {
        try {
            await fetchUrlBuilderData();
        } catch (error) {
            console.error(
                "Error refreshing URL Builder:",
                error
            );
        }
    };

    const handleSearchChange = (e) => {
        const value =
            e.target.value?.toLowerCase() || "";

        setUrlBuilderSearchInput(value);
        setIsSearchingUrlBuilder(true);
    };

    const handleBlur = () => {
        if (!urlBuilderSearchInput.trim()) {
            setIsSearchingUrlBuilder(false);
        }
    };

    const onChangeNetwork = (value) => {
        setRevenuePartner(value);
    };

    const handleOpenURLBuilder = (
        networkValue,
        index = null,
        rowData = null
    ) => {
        setNetwork(networkValue || "");
        setSelectedIndex(index);
        setSelectedUrlBuilder(rowData);

        setIsModalVisibleForURLBuilder(true);
    };


    const onClickOpenUrlBuilder = (
        record,
        index = null
    ) => {
        if (!record) return;

        const networkValue =
            record?.revenuePartner ||
            record?.Network ||
            record?.network ||
            "";

        handleOpenURLBuilder(
            networkValue,
            index,
            record
        );
    };

    const handleEditUrlBuilder = (record) => {
        if (!record) {
            console.warn("No URL Builder record selected");
            return;
        }

        setEditedUrlBuilder(record);
        setIsEditUrlBuilderVisible(true);
    };

    const handleCloseEditUrlBuilder = (updatedData) => {
        setIsEditUrlBuilderVisible(false);
        setEditedUrlBuilder(null);

        if (updatedData) {
            refreshUrlBuilder();
        }
    };



    const handleCancelForURLBuilder = () => {
        setIsModalVisibleForURLBuilder(false);

        setNetwork("");
        setSelectedIndex(null);
        setSelectedUrlBuilder(null);
    };



    const filteredUrlBuilderData = useMemo(() => {
        let data = [...urlBuilderData];
        if (revenuePartner !== "All") {
            data = data.filter((item) => {
                const itemNetwork =
                    item.revenuePartner ||
                    item.Network ||
                    item.network;

                return itemNetwork === revenuePartner;
            });
        }

        // SEARCH
        const searchValue =
            urlBuilderSearchInput
                .trim()
                .toLowerCase();

        if (searchValue) {
            data = data.filter((item) =>
                Object.values(item).some(
                    (value) =>
                        value !== null &&
                        value !== undefined &&
                        String(value)
                            .toLowerCase()
                            .includes(searchValue)
                )
            );
        }

        return data;
    }, [
        urlBuilderData,
        revenuePartner,
        urlBuilderSearchInput,
    ]);



    return {
        // DATA
        urlBuilderData,
        filteredUrlBuilderData,

        // LOADING
        loading4,

        // SEARCH
        urlBuilderSearchInput,
        isSearchingUrlBuilder,
        handleSearchChange,
        handleBlur,

        // NETWORK FILTER
        revenuePartner,
        availableNetworks,
        onChangeNetwork,

        // API
        fetchUrlBuilderData,
        refreshUrlBuilder,

        // URL BUILDER
        isModalVisibleForURLBuilder,
        network,
        selectedIndex,
        selectedUrlBuilder,

        handleOpenURLBuilder,
        onClickOpenUrlBuilder,
        handleCancelForURLBuilder,

        // EDIT URL BUILDER
        isEditUrlBuilderVisible,
        editedUrlBuilder,
        handleEditUrlBuilder,
        handleCloseEditUrlBuilder,
    };
}