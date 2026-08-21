"use client"
import { useState, useRef } from 'react'
import { Tabs, Button } from "antd"
import { CloseOutlined, FolderOutlined, AppstoreOutlined, FileSearchOutlined } from '@ant-design/icons';
import CampaignTable from "./campaign/page";
import AdsetTable from "./adset/page";
import AdTable from './ad/page';
import SearchFilters from "../searchfilters/page"
const DailyReports = ({ theme, userData, activeTab, updatedRevenuePartner, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, userColumnStructure, campaignMap, adsetMap, commentsMap, Camapignlevelstatus, setCamapignlevelstatus, campaignComments, setCampaignComments, adLevelCreatives, setAdLevelCreatives, handleColumnMove, getMainMenuItems, customColumns, taxDetails, refreshTabs }) => {
    const [selectedCampaigns, setSelectedCampaigns] = useState([])
    const [selectedAdsets, setSelectedAdsets] = useState([])
    const [selectedAds, setSelectedAds] = useState([])
    const [leafCampaigns, setLeafCampaigns] = useState([]);
    const [leafAdsets, setLeafAdsets] = useState([]);
    const [leafAds, setLeafAds] = useState([]);
    const [activeTabForLiveReports, setActiveTabForLiveReports] = useState("1");
    const [searchValue, setSearchValue] = useState("");
    const [refresh, setRefresh] = useState(0);
    const campainRef = useRef();
    const adsetRef = useRef();
    const adRef = useRef();
    const showCampaignLevel = (data) => {
        setSelectedCampaigns(data);
        setSelectedAdsets([]);
        // console.log(data, "CampaignLeveldata");
    }
    const showAdsetLevel = (data) => {
        setSelectedAdsets(data);
        // console.log(data, "AdsetLeveldata");
    }
    const showAdLevel = (data) => {
        setSelectedAds(data);
    }
    const moveToNextTab = (tab) => {
        setActiveTabForLiveReports(tab);
    }
    const onClickRemoveSelectedCampaigns = () => {
        setSelectedCampaigns([]);
        setSelectedAdsets([]);
        setSelectedAds([]);
        setLeafCampaigns([]);
        setLeafAdsets([]);
        setLeafAds([]);
        if (campainRef.current) {
            campainRef?.current?.api?.deselectAll(); // ✅ clears selection in grid
            // showCampaignLevel([]);             // ✅ manually clears selection data
        }
        // removeSelectedCampaigns();
        // setRemoveSelectedCampaigns("");
        // setTimeout(() => {
        //     setRemoveSelectedCampaigns("Remove");
        // }
        //     , 100);
    }
    const onClickRemoveSelectedAdsets = () => {
        setSelectedAdsets([]);
        setSelectedAds([]);
        setLeafAdsets([]);
        setLeafAds([]);
        if (adsetRef.current) {
            adsetRef?.current?.api?.deselectAll(); // ✅ clears selection in grid
            // showCampaignLevel([]);             // ✅ manually clears selection data
        }
    }

    const onClickRemoveSelectedAds = () => {
        setSelectedAds([]);
        setLeafAds([]);
        if (adRef.current) {
            adRef?.current?.api?.deselectAll(); // ✅ clears selection in grid
            // showCampaignLevel([]);             // ✅ manually clears selection data
        }
    }
    const baseTabStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        fontWeight: 600,
        fontSize: 11,
        borderRadius: '6px 6px 0 0',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        height: "100%",
        display: "flex",
        // flexDirection: "column",
        minHeight: 0,
    };

    const getTabStyle = (isActive) => ({
        ...baseTabStyle,
        backgroundColor: isActive ? (theme === 'dark' ? '#1e1e1e' : '#fff') : (theme === 'dark' ? '#2a2a2a' : '#f0f2f5'),
        color: isActive ? (theme === 'dark' ? '#fff' : '#000') : (theme === 'dark' ? '#aaa' : '#6b7280'),
        boxShadow: isActive ? '0 0 0 1px #91C25F inset' : 'none',
        fontWeight: isActive ? 'normal' : 'bold',
    });
    const tabItemsForAccounts = [
        {
            permission: "campaign",
            key: "1",
            label: (
                <div
                    style={getTabStyle(activeTabForLiveReports === '1')}
                >
                    <FolderOutlined />
                    <span style={{ marginLeft: 4 }}>Campaigns</span>
                    {selectedCampaigns.length > 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickRemoveSelectedCampaigns();
                            }}
                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                            size="small"
                            type="text"
                            style={{
                                marginLeft: 6,
                                fontSize: 11,
                                height: 5,
                                color: theme === 'dark' ? '#fff' : '#000',
                            }}
                        >
                            {selectedCampaigns.length}
                        </Button>
                    )}
                </div>
            ),
            content: <div>{`Content for Campaign data (${selectedCampaigns.length} selected)`}</div>,
            children: (
                <CampaignTable
                    activeTab={activeTab}
                    activeTabForLiveReports={activeTabForLiveReports}
                    theme={theme}
                    updatedRevenuePartner={updatedRevenuePartner}
                    updatedAccountsValue={updatedAccountsValue}
                    updatedStartDate={updatedStartDate}
                    updatedEndDate={updatedEndDate}
                    updatedTime={updatedTime}
                    userColumnStructure={userColumnStructure}
                    customColumns={customColumns}
                    campaignMap={campaignMap}
                    adsetMap={adsetMap}
                    commentsMap={commentsMap}
                    Camapignlevelstatus={Camapignlevelstatus}
                    setCamapignlevelstatus={setCamapignlevelstatus}
                    campaignComments={campaignComments}
                    setCampaignComments={setCampaignComments}
                    adLevelCreatives={adLevelCreatives}
                    setAdLevelCreatives={setAdLevelCreatives}
                    searchValue={searchValue}
                    userData={userData}
                    showCampaignLevel={showCampaignLevel}
                    selectedCampaigns={selectedCampaigns}
                    gridRef={campainRef}
                    setSelectedCampaigns={setSelectedCampaigns}
                    moveToNextTab={moveToNextTab}
                    setLeafCampaigns={setLeafCampaigns}
                    leafCampaigns={leafCampaigns}
                    handleColumnMove={handleColumnMove}
                    getMainMenuItems={getMainMenuItems}
                    taxDetails={taxDetails}
                    refreshTabs={refreshTabs}
                    refresh={refresh}
                />
            ),
        },
        {
            permission: "adset",
            key: "2",
            label: (
                <div
                    style={getTabStyle(activeTabForLiveReports === '2')}
                >
                    <AppstoreOutlined />
                    <span style={{ marginLeft: 4 }}>Ad sets</span>
                    {selectedAdsets.length > 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickRemoveSelectedAdsets();
                            }}
                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                            size="small"
                            type="text"
                            style={{
                                marginLeft: 6,
                                fontSize: 11,
                                height: 5,
                                color: theme === 'dark' ? '#fff' : '#000',
                            }}
                        >
                            {selectedAdsets.length}
                        </Button>
                    )}
                </div>
            ),
            content: <div>{`Content for Adset data (${selectedAdsets.length} selected).`}</div>,
            children: (
                <AdsetTable
                    activeTab={activeTab}
                    activeTabForLiveReports={activeTabForLiveReports}
                    theme={theme}
                    updatedRevenuePartner={updatedRevenuePartner}
                    updatedAccountsValue={updatedAccountsValue}
                    updatedStartDate={updatedStartDate}
                    updatedEndDate={updatedEndDate}
                    updatedTime={updatedTime}
                    userColumnStructure={userColumnStructure}
                    customColumns={customColumns}
                    campaignMap={campaignMap}
                    adsetMap={adsetMap}
                    commentsMap={commentsMap}
                    Camapignlevelstatus={Camapignlevelstatus}
                    setCamapignlevelstatus={setCamapignlevelstatus}
                    campaignComments={campaignComments}
                    setCampaignComments={setCampaignComments}
                    adLevelCreatives={adLevelCreatives}
                    setAdLevelCreatives={setAdLevelCreatives}
                    selectedCampaigns={selectedCampaigns}
                    searchValue={searchValue}
                    userData={userData}
                    gridRef={adsetRef}
                    showAdsetLevel={showAdsetLevel}
                    setSelectedAdsets={setSelectedAdsets}
                    moveToNextTab={moveToNextTab}
                    setLeafCampaigns={setLeafAdsets}
                    leafCampaigns={leafAdsets}
                    handleColumnMove={handleColumnMove}
                    getMainMenuItems={getMainMenuItems}
                    taxDetails={taxDetails}
                    refreshTabs={refreshTabs}
                    refresh={refresh}
                />
            ),
        },
        {
            permission: "ad",
            key: "3",
            label: (
                <div
                    style={getTabStyle(activeTabForLiveReports === '3')}
                >
                    <FileSearchOutlined />
                    <span style={{ marginLeft: 4 }}>Ads</span>
                    {selectedAds.length > 0 && (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClickRemoveSelectedAds();
                            }}
                            icon={<CloseOutlined style={{ fontSize: 10 }} />}
                            size="small"
                            type="text"
                            style={{
                                marginLeft: 6,
                                fontSize: 11,
                                height: 5,
                                color: theme === 'dark' ? '#fff' : '#000',
                            }}
                        >
                            {selectedAds.length}
                        </Button>
                    )}
                </div>
            ),
            content: <div>{`Content for Ad data (${selectedAds.length} selected)`}</div>,
            children: (
                <AdTable
                    activeTab={activeTab}
                    activeTabForLiveReports={activeTabForLiveReports}
                    theme={theme}
                    updatedRevenuePartner={updatedRevenuePartner}
                    updatedAccountsValue={updatedAccountsValue}
                    updatedStartDate={updatedStartDate}
                    updatedEndDate={updatedEndDate}
                    updatedTime={updatedTime}
                    userColumnStructure={userColumnStructure}
                    customColumns={customColumns}
                    campaignMap={campaignMap}
                    adsetMap={adsetMap}
                    commentsMap={commentsMap}
                    Camapignlevelstatus={Camapignlevelstatus}
                    setCamapignlevelstatus={setCamapignlevelstatus}
                    campaignComments={campaignComments}
                    setCampaignComments={setCampaignComments}
                    adLevelCreatives={adLevelCreatives}
                    setAdLevelCreatives={setAdLevelCreatives}
                    searchValue={searchValue}
                    showAdLevel={showAdLevel}
                    userData={userData}
                    gridRef={adRef}
                    selectedCampaigns={selectedCampaigns}
                    selectedAdsets={selectedAdsets}
                    setLeafCampaigns={setLeafAds}
                    leafCampaigns={leafAds}
                    handleColumnMove={handleColumnMove}
                    getMainMenuItems={getMainMenuItems}
                    taxDetails={taxDetails}
                    refreshTabs={refreshTabs}
                    refresh={refresh}
                />
            ),
        },
    ]
    const handleChangeInput = (e) => {
        setSearchValue(e?.target?.value ?? '');
    }
    const handleBlur = () => {

    }
    const onClickRefresh = () => {
        setRefresh(prev => prev + 1);
    }
    const handleSlideChange = (key) => setActiveTabForLiveReports(key);
    return (
        <div
            className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}
            style={{
                marginTop: "5px",
                height: "100%",
                minHeight: 0,
            }}
        >
            <Tabs
                className="reports-tabs"
                activeKey={activeTabForLiveReports}
                onChange={handleSlideChange}
                items={tabItemsForAccounts}
                tabBarExtraContent={
                    <SearchFilters
                        theme={theme}
                        handleChangeInput={handleChangeInput}
                        handleBlur={handleBlur}
                        onClickRefresh={onClickRefresh}
                        accountsFromReports={updatedAccountsValue}
                        network={updatedRevenuePartner}
                        time={updatedTime}
                    />
                }
            />

        </div>
    )
}
export default DailyReports