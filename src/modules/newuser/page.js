"use client";

import { Tabs } from "antd";

import AccountsTab from "./accountstab/accounttab";
import NetworksTab from "./networkstab/networkstab";
import UrlBuilderTab from "./urlbuilder/urlbuildertab";
import UpdatesTab from "./updatetab/updatetab";
import useNetworks from "./networkstab/usernetworks";
import useAccounts from "./accountstab/useaccounts";
import useUrlBuilder from "./urlbuilder/urlbuilder";
import "../../styles/newuser.css";
import { useRef } from "react";


export default function NewuserPage({
    email,
    userData,
    userPermissions,
    auth,
    userdetails,
    theme,
    paginationSize,

}) {

    const uploadRef = useRef();
    const {
        AccountsData,
        accFilteredData,
        loading2,
        refreshLoading,
        newSearchInput,
        isSearchingAccount,
        revenuePartner,
        availableNetworks,
        accountStatus,
        status,
        handleaccountSearchChange,
        handleBlur1,
        onChangeNetwork,
        onChangeStatus,
        refreshAccounts,
        handleStatusChange,
        editAccount,
        editDrawerOpen,
        handleEditAccount,
        handleCloseEditAccount,
        shownnewaccountdrawar,
        addAccountDrawerOpen,
        closeAddAccountDrawer

    } = useAccounts();
    const {
        networksData,
        networkFilteredData,
        loading3,
        fetchNetworksData,
        netSearchInput,
        isSearchingNetwork,
        handleNetworkSearchChange,
        handleBlur2,

        // Network-specific names
        networkRevenuePartner,
        networkAvailableNetworks,
        networkStatus,
        networkFilterStatus,

        onChangeNetwork: onChangeNetworkFilter,
        onChangeStatus: onChangeNetworkStatus,

        refreshNetworks,
        handleNetworkStatusChange,

        handleEditNetwork,
        networkAccessDrawerOpen,
        networkAccessData,
        closeNetworkDrawer,
    } = useNetworks();
    const {
        urlBuilderData,
        filteredUrlBuilderData,
        loading4,

        urlBuilderSearchInput,
        isSearchingUrlBuilder,

        revenuePartner: urlBuilderRevenuePartner,
        availableNetworks: urlBuilderAvailableNetworks,

        handleSearchChange: handleUrlBuilderSearchChange,
        handleBlur: handleUrlBuilderBlur,

        onChangeNetwork: onChangeUrlBuilderNetwork,

        refreshUrlBuilder,

        isModalVisibleForURLBuilder,
        network,
        selectedIndex,
        selectedUrlBuilder,

        handleOpenURLBuilder,
        onClickOpenUrlBuilder,
        handleEditUrlBuilder,
        handleCancelForURLBuilder,
        isEditUrlBuilderVisible,
        editedUrlBuilder,
        handleCloseEditUrlBuilder,

    } = useUrlBuilder();

    const tabItems = [
        {
            key: "1",

            label: "Accounts",

            children: (
                <AccountsTab
                    theme={theme}
                    newSearchInput={newSearchInput}
                    isSearchingAccount={isSearchingAccount}
                    shownnewaccountdrawar={shownnewaccountdrawar}
                    closeAddAccountDrawer={closeAddAccountDrawer}
                    addAccountDrawerOpen={addAccountDrawerOpen}
                    handleaccountSearchChange={handleaccountSearchChange}
                    handleBlur1={handleBlur1}
                    revenuePartner={revenuePartner}
                    availableNetworks={availableNetworks}
                    onChangeNetwork={onChangeNetwork}
                    onChangeStatus={onChangeStatus}
                    accountStatus={accountStatus}
                    status={status}
                    accFilteredData={accFilteredData}
                    AccountsData={AccountsData}
                    loading2={loading2}
                    paginationSize={paginationSize}
                    refreshAccounts={refreshAccounts}
                    handleStatusChange={handleStatusChange}
                    editAccount={editAccount}
                    editDrawerOpen={editDrawerOpen}
                    handleEditAccount={handleEditAccount}
                    handleCloseEditAccount={handleCloseEditAccount}
                    refreshLoading={refreshLoading}
                />
            ),
        },

        {
            key: "2",
            label: "Networks",
            children: (
                <NetworksTab
                    theme={theme}
                    netSearchInput={netSearchInput}
                    isSearchingNetwork={isSearchingNetwork}
                    handleNetworkSearchChange={handleNetworkSearchChange}
                    handleBlur2={handleBlur2}
                    revenuePartner={networkRevenuePartner}
                    availableNetworks={availableNetworks}
                    onChangeNetwork={onChangeNetworkFilter}
                    onChangeStatus={onChangeNetworkStatus}
                    networkStatus={networkStatus}
                    status={networkFilterStatus}
                    fetchNetworksData={fetchNetworksData}
                    networkFilteredData={networkFilteredData}
                    networksData={networksData}
                    loading3={loading3}
                    paginationSize={paginationSize}
                    refreshNetworks={refreshNetworks}
                    handleNetworkStatusChange={handleNetworkStatusChange}
                    handleEditNetwork={handleEditNetwork}
                    networkAccessDrawerOpen={networkAccessDrawerOpen}
                    networkAccessData={networkAccessData}
                    closeNetworkDrawer={closeNetworkDrawer}
                />
            ),
        },

        {
            key: "3",
            label: "URL Builder",
            children: (
                <UrlBuilderTab
                    theme={theme}
                    newSearchInput={urlBuilderSearchInput}
                    isSearchingAccount={isSearchingUrlBuilder}
                    handleSearchChange={handleUrlBuilderSearchChange}
                    handleBlur={handleUrlBuilderBlur}
                    isEditUrlBuilderVisible={isEditUrlBuilderVisible}
                    editedUrlBuilder={editedUrlBuilder}
                    handleCloseEditUrlBuilder={handleCloseEditUrlBuilder}
                    revenuePartner={urlBuilderRevenuePartner}
                    handleOpenURLBuilder={handleOpenURLBuilder}
                    onClickOpenUrlBuilder={onClickOpenUrlBuilder}
                    handleEditUrlBuilder={handleEditUrlBuilder}
                    handleCancelForURLBuilder={handleCancelForURLBuilder}
                    availableNetworks={availableNetworks}
                    onChangeNetwork={onChangeUrlBuilderNetwork}
                    urlBuilderData={urlBuilderData}
                    filteredUrlBuilderData={filteredUrlBuilderData}
                    loading4={loading4}
                    paginationSize={paginationSize}
                    refreshUrlBuilder={refreshUrlBuilder}
                    isModalVisibleForURLBuilder={isModalVisibleForURLBuilder}
                    network={network}
                    selectedIndex={selectedIndex}
                    selectedUrlBuilder={selectedUrlBuilder}
                />
            ),
        },

        {
            key: "4",
            label: "Updates",
            children: <UpdatesTab
                theme={theme}
                uploadRef={uploadRef}
                email={email}
            />,
        },
    ];

    return (
        <div
            style={{
                width: "100%",
                backgroundColor:
                    theme === "dark"
                        ? "#232323"
                        : " ",
                color:
                    theme === "dark"
                        ? "#ffffff"
                        : "#333333",
                minHeight: "100vh",


            }}
        >
            <Tabs
                defaultActiveKey="1"
                items={tabItems}
                className={`newuser-tabs ${theme === "dark"
                    ? "dark-theme-1"
                    : "light-theme-1"
                    }`}
            />
        </div>
    );
}