"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import { Grid, Row, Col, Space, Button, Tooltip, Skeleton, Empty, Typography, Input, Dropdown, Pagination, Modal, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import RouteDescription from "../../components/common/routedescription";
import SelectProjects from "../../components/common/selectprojects";
import SelectAccounts from "../../components/common/selectaccount";
import SubmitButton from "../../components/common/submitbutton";
import SelectTimezone from "../../components/common/selecttimezone";
import SelectDateDashboard from "../../components/common/selectdatedashboard";
import SelectDateSingleCalendarDashboard from "../../components/common/selectdatesinglecalendar"
import ReloadButton from "../../components/common/reloadbuttion";
import axios from 'axios';
import moment from 'moment-timezone';
import { NetworkDefaultTimezones, newtworkCollections, revenuePartnerNames, timezones, rangePresets } from "../commonfunctionsforroutes"
import { PlusOutlined, SyncOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import CreateCampaignDrawer from "./create_campaign/page"
import CampaignCard from "@/components/campaigns/campaigncard";
const { Text } = Typography;
const { useBreakpoint } = Grid;
export default function CampaignsModule({ email, userData, userPermissions, auth, networksWithStatus, userdetails }) {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 500;
    const transformData = (data) => {
        return Object.fromEntries(
            Object.entries(data || []).map(([key, value]) => {
                if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
                    return [key, value.map(obj => ({ accountNumber: obj.accountNumber, accountName: obj.accountName, status: obj.status, }))];
                }
                return [key, value];
            })
        );
    };
    const transformedData = transformData(userData);
    const defaultCategory = Object.keys(transformedData)[0];
    const networks = Object.keys(userData);
    const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
    const defaultDates = [dayjs(yesterday), dayjs(yesterday)];
    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };
    const [startDate, setStartDate] = useState(yesterday);
    const [updatedStartDate, setUpdtedStartDate] = useState(yesterday);
    const [endDate, setEndDate] = useState(yesterday);
    const [updatedEndDate, setUpdatedEndDate] = useState(yesterday);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    // const [networksWithStatus, setNetworksWithStatus] = useState([]);
    const [selectedDates, setSelectedDates] = useState(defaultDates);
    const [revenuePartner, setRevenuePartner] = useState(networks[0]);
    const [updatedRevenuePartner, setUpdatedReevenuePartner] = useState(networks[0]);
    const accountsForAccess = userData[revenuePartner];
    const [accountsValue, setAccountsValue] = useState();
    const [updatedAccountsValue, setUpdatedAccountsValue] = useState();
    const [accountBalance, setAccountBalance] = useState("");
    const [accountRemaining, setAccountRemaining] = useState("");
    const [cdrawerVisible, setDrawerVisible] = useState(false);
    const [typeFilter, setTypeFilter] = useState('All');
    const [campaignStatusFilter, setCampaignStatusFilter] = useState("all");
    const [multipleAdsetCampaignData, setMultipleAdsetCampaignData] = useState([]);
    const [selectedCampaigns, setSelectedCampaigns] = useState([]);
    // const [searchInput, setSearchInput] = useState("");
    // const [currentPage, setCurrentPage] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(isMobile ? 5 : 100);
    const [loading, setLoading] = useState(false);

    const [commentModalOpen, setCommentModalOpen] = useState(false);
    // const [commentInputValue, setCommentInputValue] = useState("");
    const commentInputValue = useRef("");
    const [modalLoading, setModalLoading] = useState(false);
    const searchInput = useRef(null);

    // const [checkedRowIds, setCheckedRowIds] = useState([]);
    // const [checkedRowRecords, setCheckedRowRecords] = useState([]);

    // const rowSelection = {
    //     selectedRowKeys: checkedRowIds,
    //     onChange: (selectedRowKeys, selectedRows) => {
    //         setCheckedRowIds(selectedRowKeys);
    //         setCheckedRowRecords(selectedRows);
    //     },
    // };
    const [refreshTabs, setRefreshTabs] = useState(0);
    const handleFirstSelectChange = (newCategories) => {
        setRevenuePartner(newCategories);
        setAccountsValue([transformedData[newCategories][0]?.accountNumber]);
    };
    const filteredAccounts = useMemo(() => { return transformedData[revenuePartner] }, [revenuePartner]);
    const onChangeTime = (value) => { setTime(value) };
    const changeRRefrst = () => {
        setRefreshTabs(prev => prev + 1);
    };
    const OnClickSubmit = async () => {
        setUpdatedReevenuePartner(revenuePartner);
        setUpdatedAccountsValue(accountsValue);
        setUpdtedStartDate(startDate);
        setUpdatedEndDate(endDate);
        setRefreshTabs(prev => prev + 1);
    }
    const handleChangeDates = (dates) => {
        if (dates) {
            const [start, end] = dates;
            setStartDate(start.format("YYYY-MM-DD"));
            setEndDate(end.format("YYYY-MM-DD"));
        }

        setSelectedDates(dates || []);
    };
    const handleOpenChange = (open) => {
        if (!open && !isPickerOpen) {
            setIsPickerOpen(false);
        } else if (open) {
            setIsPickerOpen(true); // Ensure it remains open if interacting with it
        }
    };
    const onClickCloseButton = () => {
        setIsPickerOpen(false)
        setSelectedDates([dayjs(startDate), dayjs(endDate)])
    }

    // useEffect(() => {
    //     // const dataApi = axios.get(`/api/campaigns/list?account=${updatedAccountsValue}&network${updatedRevenuePartner}=&startDate=${updatedStartDate}&endDate=${updatedEndDate}&search=""`)
    //     console.log(updatedAccountsValue);
    // }, [])
    // console.log(multipleAdsetCampaignData, "data");
    const onCloseDrawer = () => {
        setDrawerVisible(false);
    };

    const deleteTheCampaign = (record) => {
        setMultipleAdsetCampaignData(prev => {
            return prev.filter(item => item.identifier !== record.identifier)
        })
    }

    const rejectTheCampaign = (record) => {
        setMultipleAdsetCampaignData(prev =>
            prev.map(item =>
                item.identifier === record.identifier
                    ? {
                        ...item,
                        adsetsWithAds: item.adsetsWithAds.map(adset => ({
                            ...adset,
                            ads: adset.ads.map(ad => ({ ...ad, status: "Rejected" }))
                        }))
                    }
                    : item
            )
        );
    };

    const approveTheCampaign = (record) => {
        setMultipleAdsetCampaignData(prev =>
            prev.map(item =>
                item.identifier === record.identifier
                    ? {
                        ...item,
                        adsetsWithAds: item.adsetsWithAds.map(adset => ({
                            ...adset,
                            ads: adset.ads.map(ad => ad.status === "Rejected" ? ad : { ...ad, status: "Approved" })
                        }))
                    }
                    : item
            )
        );
    }

    const handleBulkComment = async (campaigns) => {
        setModalLoading(true);
        const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
        const campaignsToAddComment = campaigns.map(c => ({
            Account: c.Account_Number,
            campaignid: c.identifier,
            campaignname: c.campaign_name,
            comment: commentInputValue.current,
            editedTime: editedTime,
            username: userdetails.username
        }))

        try {
            const response = await axios.post("/api/campaigns/comments/bulk", {
                items: campaignsToAddComment,
                level: "Launcher"
            })
            if (response.status === 200 || response.status === 201) {
                const campaignIds = new Set(campaignsToAddComment.map(c => c.campaignid));
                setMultipleAdsetCampaignData(prev =>
                    prev.map(camp =>
                        campaignIds.has(camp.identifier)
                            ? {
                                ...camp,
                                comments: {
                                    campaignid: camp.identifier,
                                    level: "Launcher",
                                    Account: camp.Account_Number,
                                    campaignname: camp.campaign_name,
                                    comment: commentInputValue.current,
                                    createdBy: userdetails.username,
                                    editedTime: editedTime
                                }
                            }
                            : camp
                    )
                );
                setCommentModalOpen(false)
            }
        }
        catch (err) {
            console.error("Bulk comment error", err);
        }
        finally {
            setModalLoading(false)
        }
    }

    const getTheCampaignsList = async () => {
        setLoading(true)
        const listOfCampaigns = await axios.get(`/api/campaigns/list?account=${updatedAccountsValue.join(",")}&startDate=${updatedStartDate}&endDate=${updatedEndDate}&network=${updatedRevenuePartner}&search=${searchInput.current}`)
        // console.log(listOfCampaigns?.data?.data);
        setMultipleAdsetCampaignData(listOfCampaigns?.data?.data);
        setLoading(false);
    }

    useEffect(() => {
        if (updatedAccountsValue && updatedStartDate && updatedEndDate && updatedRevenuePartner) {
            getTheCampaignsList();
        }
    }, [refreshTabs])

    const filteredMultipleAdsetCampaigns = useMemo(() => {
        return multipleAdsetCampaignData
            .filter(campaign => {
                if (campaignStatusFilter === "active") {
                    return campaign.Status === "ACTIVE" && campaign.Approval === "Approved";
                }

                if (campaignStatusFilter === "pause") {
                    return campaign.Status === "PAUSED" && campaign.Approval === "Approved";
                }

                if (campaignStatusFilter === "pending") {
                    return campaign.Approval === "PENDING_APPROVAL";
                }

                if (campaignStatusFilter === "reject") {
                    return campaign.Approval === "Rejected";
                }

                // if (campaignStatusFilter === "error") {
                //     return (
                //         (campaign.errors?.campaign || 0) > 0 ||
                //         (campaign.errors?.adset || 0) > 0 ||
                //         campaign.errors?.ad
                //     );
                // }

                if (campaignStatusFilter === "error") {
                    return [
                        campaign.errors?.campaign,
                        campaign.errors?.adset,
                        campaign.errors?.ad
                    ].some(error =>
                        typeof error === "object"
                            ? error !== null
                            : Number(error) > 0
                    );
                }

                if (
                    typeFilter === "Daily" &&
                    campaign.Budget_type?.toLowerCase() !== "daily"
                ) {
                    return false;
                }

                if (
                    typeFilter === "Lifetime" &&
                    campaign.Budget_type?.toLowerCase() !== "lifetime"
                ) {
                    return false;
                }

                return true;
            })
            .sort(
                (a, b) =>
                    new Date(b.createdDate).getTime() -
                    new Date(a.createdDate).getTime()
            );
    }, [
        multipleAdsetCampaignData,
        campaignStatusFilter,
        typeFilter,
    ]);
    const paginatedCampaigns = filteredMultipleAdsetCampaigns.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );
    const totalDailySpend = (() => {
        return (
            filteredMultipleAdsetCampaigns.reduce((sum, record) => sum + (record.Daily_amount || 0), 0) / 100).toFixed(2)
            || "0.00";
    })();

    const changeInputValue = (e) => {
        const value = e.target.value
        searchInput.current = value;
        if (value === '') {
            setRefreshTabs(prev => prev + 1);
            searchInput.current = null;
        }
    }
    return (
        <div style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            padding: "6px",
            overflow: "hidden",
            boxSizing: "border-box",
            backgroundColor: theme === "dark" ? "#333" : 'transparent'
        }}>
            <CreateCampaignDrawer
                visible={cdrawerVisible}
                accountis={updatedAccountsValue}
                onClose={onCloseDrawer}
                changeRRefrst={changeRRefrst}
                network={revenuePartner}
                draftsData={[]}
                theme="light"
                userData={userData}
                auth={auth}
                username={userdetails.username}
            />
            <Row style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Col flex="auto">
                    <div className="route-description">
                        <RouteDescription
                            Title="Campaign Management"
                            Description="Create, manage, and optimize your advertising campaigns"
                            theme={theme}
                        />
                    </div>
                </Col>
                <div style={{ display: 'flex', gap: "5px" }}>
                    <Tooltip
                        title="Click the icon to view the latest spent and remaining amount"
                        // overlayInnerStyle={{
                        //     backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                        //     color: theme === "dark" ? "#ffffff" : "#000000",
                        // }}
                        styles={{
                            container: {
                                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                color: theme === "dark" ? "#ffffff" : "#000000",
                            }
                        }}
                    >
                        <SyncOutlined style={{ fontSize: "14px", cursor: "pointer", marginRight: "3px", color: theme === "dark" ? "white" : "transparent" }}
                        // onClick={handleAccountBalance} 
                        />
                    </Tooltip>

                    <Button
                        style={{
                            backgroundColor: "transparent",
                            padding: "5px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            color: theme === "dark" ? "#fff" : "#000",
                            border: "1px solid #4caf50",
                            fontSize: 12,
                            height: "24px",
                        }}
                        className="campaigns-element-hide"
                    >
                        Spent: ${accountBalance}
                    </Button>
                    <Button
                        style={{
                            backgroundColor: "transparent",
                            padding: "5px 8px",
                            borderRadius: "8px",
                            fontSize: "14px",
                            color: theme === "dark" ? "#fff" : "#000",
                            border: '1px solid #91d5ff',
                            fontSize: 12,
                            height: "24px",
                        }}
                        className="campaigns-element-hide"
                    >
                        Remaining amount: ${accountRemaining}
                    </Button>
                    <Col>
                        <Button
                            style={{
                                backgroundColor: "#91C25F",
                                color: "#000",
                                border: "none",
                                border: "#4caf50",
                                height: "24px",
                                fontSize: 12
                            }}
                        >
                            Ad Library
                        </Button>
                    </Col>
                    <Col>
                        <Button
                            onClick={() => setDrawerVisible(true)}
                            icon={<PlusOutlined />}
                            style={{
                                backgroundColor: "#91C25F",
                                color: "#000",
                                border: "none",
                                border: "#4caf50",
                                height: "24px",
                                width: "110px",
                                fontSize: 12
                            }}
                        >
                            New Campaign
                        </Button>
                    </Col>
                </div>

            </Row>
            <Row className="dashboard-row" style={{ width: '100%', display: 'flex', marginTop: "6px", gap: "4px" }}>
                <Col className="project-col" xs={24} sm={6} md={5} lg={3}>
                    <Space
                        orientation="vertical"
                        style={{
                            width: '100%',
                            margin: 0
                            // backgroundColor: theme === 'dark' ? '#333' : ''
                        }}
                    >
                        <SelectProjects
                            firstSelectValues={revenuePartner}
                            handleFirstSelectChange={handleFirstSelectChange}
                            transformedData={transformedData}
                            networksWithStatus={networksWithStatus}
                            theme={theme}
                        // route="dashboard"
                        />
                    </Space>
                </Col>
                <Col className="account-col" xs={24} sm={8} md={7} lg={4}>
                    <Space orientation="vertical" style={{ width: '100%', }} >
                        <SelectAccounts
                            filteredAccounts={filteredAccounts}
                            theme={theme}
                            setValue={setAccountsValue}
                            value={accountsValue}
                        />
                    </Space>
                </Col>
                <Col className="date-col" xs={18} sm={7} md={6} lg={4}>
                    <SelectDateDashboard
                        rangePresets={rangePresets}
                        selectedDates={selectedDates}
                        handleChangeDates={handleChangeDates}
                        isPickerOpen={isPickerOpen}
                        handleOpenChange={handleOpenChange}
                        setIsPickerOpen={setIsPickerOpen}
                        disabledDate={disabledDate}
                        onClickCloseButton={onClickCloseButton}
                        theme={theme}
                        route="reports"
                    /></Col>
                <Col>
                    <SubmitButton height={23} width={55} text="Apply" textSize="12px" onClick={OnClickSubmit} />
                </Col>

            </Row>
            {/* {selectedCampaigns.length > 0 && ( */}
            <Space style={{ marginTop: 2, marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <Button
                        className="campaigns-comment-button"
                        style={{ fontSize: 12, width: "65px", height: "24px", marginRight: 4, color: theme === "dark" ? "white" : "black" }} onClick={() => setCommentModalOpen(true)}
                        disabled={!selectedCampaigns.length}>
                        Comment
                    </Button>

                    <Button
                        className="campaigns-clone-button"
                        style={{ fontSize: 12, width: "60px", height: "24px", color: theme === "dark" ? "white" : "black" }}
                        // onClick={() => handleBulkClone(selectedCampaigns)}
                        disabled={!selectedCampaigns.length}>
                        Clone
                    </Button>
                </div>
                <Col style={{ display: "flex", flexWrap: "wrap", gap: "3px", alignItems: "center", }} >
                    {!isMobile && filteredMultipleAdsetCampaigns.length > 0 && (
                        <div
                            style={{
                                textAlign: "right",
                                fontSize: "12px",
                                paddingRight: "5px",
                                color: theme === "dark" ? "#e4e6eb" : "#050505",
                            }}
                        >
                            Total Campaigns: {filteredMultipleAdsetCampaigns.length}
                        </div>
                    )}


                    {/* 🔹 Status Filter */}
                    <Input
                        placeholder="Search..."
                        defaultValue=""
                        onChange={changeInputValue}
                        onPressEnter={() => setRefreshTabs(prev => prev + 1)}
                        // onChange={handleSearchChange}
                        // onPressEnter={handleSearchSubmit}
                        className={`campaigns-input ${theme === "dark" ? "custom-input-dark-campaign" : "custom-input-light-campaign"}`}
                        style={{
                            width: "150px",
                            border: "1px solid #4caf50",
                            fontSize: 12,
                            height: 24,
                            backgroundColor: theme === "dark" ? "transparent" : "white",
                            color: theme === "dark" ? "#ffffff" : "#000000",
                        }}
                    />
                    <Dropdown
                        classNames={{
                            root: theme === "dark" ? "campaigns-status-dropdown-dark" : "campaigns-status-dropdown-light",
                        }}
                        menu={{
                            items: [
                                {
                                    key: "all",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#122F6E",
                                                    marginRight: 6,
                                                }}
                                            />
                                            All
                                        </span>
                                    ),
                                },
                                {
                                    key: "active",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "green",
                                                    marginRight: 6,
                                                }}
                                            />
                                            Active
                                        </span>
                                    ),
                                },
                                {
                                    key: "pause",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "red",
                                                    marginRight: 6,
                                                }}
                                            />
                                            Paused
                                        </span>
                                    ),
                                },
                                {
                                    key: "pending",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#EC7117",
                                                    marginRight: 6,
                                                }}
                                            />
                                            Pending
                                        </span>
                                    ),
                                },
                                {
                                    key: "reject",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "red",
                                                    marginRight: 6,
                                                }}
                                            />
                                            Reject
                                        </span>
                                    ),
                                },
                                {
                                    key: "error",
                                    label: (
                                        <span style={{ fontSize: 12 }}>
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    width: 6,
                                                    height: 6,
                                                    borderRadius: "50%",
                                                    backgroundColor: "#EC7117",
                                                    marginRight: 6,
                                                }}
                                            />
                                            Error
                                        </span>
                                    ),
                                },
                            ],
                            selectedKeys: [campaignStatusFilter],
                            onClick: ({ key }) => setCampaignStatusFilter(key),
                        }}
                        trigger={["click"]}
                    >
                        <Button
                            className="campaigns-element-hide"
                            style={{
                                borderRadius: 8,
                                background: theme === "dark" ? "rgba(82,196,26,0.12)" : "#f6ffed",
                                border: "1px solid #4CAF50",
                                color: theme === "dark" ? "#95de64" : "#389e0d",
                                fontWeight: 500,
                                width: 80,
                                fontSize: 12,
                                height: 24
                            }}
                        >
                            <Space size={2}>
                                <FilterOutlined />
                                {campaignStatusFilter.charAt(0).toUpperCase() +
                                    campaignStatusFilter.slice(1)}
                                <DownOutlined style={{ fontSize: 10 }} />
                            </Space>
                        </Button>
                    </Dropdown>

                    <Dropdown
                        classNames={{ root: theme === "dark" ? "campaigns-status-dropdown-dark" : "campaigns-status-dropdown-light", }}
                        menu={{
                            items: [
                                { key: "All", label: "All" },
                                { key: "Daily", label: "Daily" },
                                { key: "Lifetime", label: "Lifetime" },
                            ],
                            selectedKeys: [typeFilter],
                            onClick: ({ key }) => setTypeFilter(key),
                        }}
                        trigger={["click"]}
                        popupRender={menu => (
                            <div className="campaign-dropdown">
                                {menu}
                            </div>
                        )}
                    >
                        <Button
                            className="campaigns-element-hide"
                            style={{
                                borderRadius: 8,
                                background:
                                    theme === "dark"
                                        ? "rgba(24,144,255,0.06)"
                                        : "#e6f7ff",
                                border: "1px solid #91d5ff",
                                color: theme === "dark" ? "#69c0ff" : "#1d39c4",
                                fontWeight: 500,
                                fontSize: 12,
                                height: 24
                            }}
                        >
                            {typeFilter} <DownOutlined />
                        </Button>
                    </Dropdown>
                    {/* {userdetails?.role !== "Network_Partner" && ( */}
                    <Button
                        className="campaigns-budget-button"
                        style={{
                            backgroundColor: "transparent",
                            padding: "5px 10px",
                            borderRadius: "8px",
                            fontSize: 12,
                            color: theme === "dark" ? "#fff" : "#000",
                            border: "1px solid #4caf50",
                            height: 24
                        }}
                    >
                        Budget: ${totalDailySpend}
                    </Button>
                </Col>
            </Space>
            {/* )} */}
            <div
                style={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                }}
            >
                {loading ? (
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Skeleton active paragraph={{ rows: 10 }} />
                    </div>
                ) : paginatedCampaigns.length > 0 ? (
                    paginatedCampaigns.map(record => (
                        <div key={record.identifier}>
                            <CampaignCard
                                record={record}
                                theme={theme}
                                selectedCampaigns={selectedCampaigns}
                                setSelectedCampaigns={setSelectedCampaigns}
                                userdetails={userdetails}
                                approveTheCampaign={approveTheCampaign}
                                rejectTheCampaign={rejectTheCampaign}
                                deleteTheCampaign={deleteTheCampaign}
                                userData={userData}
                            />
                        </div>
                    ))
                ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", border: "1px solid #4caf50" }}>
                        <Empty
                            description="No campaigns found"
                            style={{ margin: "auto", color: theme === "dark" ? "white" : "", }}
                        />
                    </div>
                )}
            </div>

            {!loading && filteredMultipleAdsetCampaigns.length > 0 && (
                <div
                    className={
                        theme === "dark"
                            ? "campaigns-pagination-dark"
                            : "campaigns-pagination-light"
                    }
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        height: 20,
                        marginTop: 2,
                        overflow: "visible",
                    }}
                >
                    {isMobile && filteredMultipleAdsetCampaigns.length > 0 && (
                        <div
                            style={{
                                textAlign: "right",
                                fontSize: "11px",
                                paddingRight: "5px",
                                color: theme === "dark" ? "#e4e6eb" : "#050505",
                            }}
                        >
                            Total Campaigns: {filteredMultipleAdsetCampaigns.length}
                        </div>
                    )}
                    <Pagination
                        classNames={{ root: "campaigns-pagination" }}
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredMultipleAdsetCampaigns.length}
                        onChange={(page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        }}
                        pageSizeOptions={[5, 10, 20, 50, 100]}
                        showSizeChanger={{
                            placement: "topLeft",
                            getPopupContainer: () => document.body,
                            classNames: {
                                popup: {
                                    root:
                                        theme === "dark"
                                            ? "campaigns-pagination-size-dropdown-dark"
                                            : "campaigns-pagination-size-dropdown-light",
                                },
                            },
                        }}
                        showQuickJumper={false}
                        showLessItems
                        size="small"
                        style={{ transform: "scale(0.82)" }}
                    />
                </div>
            )}
            <Modal
                title="Bulk Comment"
                open={commentModalOpen}
                onCancel={() => {
                    setCommentModalOpen(false);
                }}
                onOk={() => {
                    handleBulkComment(selectedCampaigns)
                }}
                confirmLoading={modalLoading}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                mask={{ closable: false }}
                modalRender={modal => (
                    <Spin spinning={modalLoading} size="large">
                        {modal}
                    </Spin>
                )}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="delete"
                                onClick={() => {
                                    // setCommentModalOpen(false);
                                    // setInuptCommentValue(commentValue);
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#ff4d4f", border: "1px solid #ff4d4f" }}>
                                Delete
                            </Button>
                            <Button
                                key="cancel"
                                onClick={() => {
                                    setCommentModalOpen(false);
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => {
                                    handleBulkComment(selectedCampaigns)
                                }}
                                style={{ backgroundColor: "#91C25F", fontSize: 12, height: 24, width: 35, color: "white" }}>
                                Ok
                            </Button>
                        </div>
                    </div>
                ]}
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
            >
                {/* <Spin spinning={modalLoading}> */}
                <Input
                    defaultValue=""
                    placeholder="Enter comment here"
                    style={{
                        width: "100%",
                        background: theme === "dark" ? "#333" : "#fff",
                        color: theme === "dark" ? "#fff" : "#333"
                    }}
                    className={theme === "dark" ? "dark-input" : ""}
                    styles={{
                        input: {
                            background: theme === "dark" ? "#333" : "#fff",
                            color: theme === "dark" ? "#fff" : "#333",
                            "::placeholder": {
                                color: theme === "dark" ? "#aaa" : "#999"
                            }
                        }
                    }}
                    onChange={e => commentInputValue.current = e.target.value}
                />
                {/* </Spin> */}
            </Modal>
        </div >
    )
}