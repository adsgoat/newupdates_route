"use client"
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Row, Col, Space, Grid, Tabs, Modal, Input } from "antd"
import axios from 'axios';
import dayjs from 'dayjs';
import RouteDescription from "../../components/common/routedescription";
import SelectProjects from "../../components/common/selectprojects";
import SelectAccounts from "../../components/common/selectaccount";
import SelectDateDashboard from "../../components/common/selectdatedashboard";
import SelectDateSingleCalendarDashboard from "../../components/common/selectdatesinglecalendar"
import SelectTimezone from "../../components/common/selecttimezone";
import SubmitButton from "../../components/common/submitbutton";
import { NetworkDefaultTimezones, newtworkCollections, revenuePartnerNames, timezones, rangePresets } from "../commonfunctionsforroutes"
import StoreReportsValues from "../../services/reports/storereportsvalues/page"
import LiveReports from "./livereports/page";
import DailyReports from "./dailyreports/page";
import AgencyAndBMNameReports from "./agencyreports/page"
import DomainReports from "./domainreports/page"
import HourlyTable from "./hourly/page"
import DayOfHourTable from "./dayofhour/page"
import KeywordTable from "./keywordreports/page"
import CountryReports from "./countryreports/page"
import { sanitizeNumericValue, computeRPC, computeCPCLC, computeCPL, computeNCPL, computeMargin, computeFMargin, computeROI, computeCTR, computeAggregatedRPC, computeAggregatedCPCLC, computeAggregatedNCPL, computeAggregatedCPL, computeAggregatedMargin, computeAggregatedFMargin, computeAggregatedROI, computeAggregatedCTR, cpcSpender1, customAggFunc } from "./columndefs/functions/customcolumn";
const { useBreakpoint } = Grid;
export default function ReportsPage({ userData, cache, userdetails }) {
  const taxDetails = Object.entries(userData).flatMap(
    ([network, accounts]) =>
      accounts.map((account) => ({
        network,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        tax: account.tax,
      }))
  );
  const screens = useBreakpoint();
  const transformData = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          return [key, value.map(obj => ({ accountNumber: obj.accountNumber, accountName: obj.accountName, status: obj.status, }))];
        }
        return [key, value];
      })
    );
  };
  const transformedData = transformData(userData);
  // console.log(transformedData);
  const defaultCategory = Object.keys(transformedData)[0];
  const networks = Object.keys(userData);
  const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
  const defaultDates = cache ? [dayjs(cache.startDate), dayjs(cache.endDate)] : [dayjs(yesterday), dayjs(yesterday)];
  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };
  const [startDate, setStartDate] = useState(cache ? cache.startDate : yesterday);
  const [updatedStartDate, setUpdtedStartDate] = useState(cache ? cache.startDate : yesterday);
  const [endDate, setEndDate] = useState(cache ? cache.endDate : yesterday);
  const [updatedEndDate, setUpdatedEndDate] = useState(cache ? cache.endDate : yesterday);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [networksWithStatus, setNetworksWithStatus] = useState([]);
  const [userColumnStructure, setUserColumnStructure] = useState([]);
  //custom columns
  const [customColumns, setCustomColumns] = useState([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [formula, setFormula] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  //custom columns
  const [time, setTime] = useState(cache ? cache.timezone : NetworkDefaultTimezones[defaultCategory]);
  const [updatedTime, setUpdatedTime] = useState(cache ? cache.timezone : NetworkDefaultTimezones[defaultCategory]);
  const [selectedDates, setSelectedDates] = useState(defaultDates);
  const [revenuePratner, setRevenuePartner] = useState(cache ? cache.network : networks[0]);
  const [updatedRevenuePartner, setUpdatedReevenuePartner] = useState(cache ? cache.network : networks[0]);
  const accountsForAccess = userData[revenuePratner];
  const [accountsValue, setAccountsValue] = useState(cache ? cache.accounts : [transformedData[revenuePratner][0]?.accountNumber]);
  const [updatedAccountsValue, setUpdatedAccountsValue] = useState(cache ? cache.accounts : [transformedData[revenuePratner][0]?.accountNumber]);
  const [activeTab, setActiveTab] = useState("1");
  const [Camapignlevelstatus, setCamapignlevelstatus] = useState([]);
  const [campaignComments, setCampaignComments] = useState([]);
  const [adLevelCreatives, setAdLevelCreatives] = useState([]);
  const [refreshTabs, setRefreshTabs] = useState(0);

  const handleOk = () => {
    if (!newColumnName || !formula) {
      message.error("Please fill in all fields.");
      return;
    }
    const lowerCaseFormula = formula.toLowerCase();
    const field = newColumnName.trim().toLowerCase();
    if (customColumns.some(col => col.field === field)) {
      message.error("Column already exists.");
      return;
    }
    const newColumnDef = {
      headerName: newColumnName,
      field,
      isCustom: true,
      valueGetter: (params) => {
        if (params.node.group && params.node.aggData) {
          return (sanitizeNumericValue(params.node.aggData[field]) || 0);
        }
        const data = params.data;
        if (!data) { return 0; }
        try {
          const values = { ...data };

          if (lowerCaseFormula.includes("margin")) {
            values.margin = computeMargin(data);
          }
          if (lowerCaseFormula.includes("fmargin")) {
            values.fmargin = computeFMargin(data);
          }
          if (lowerCaseFormula.includes("cpclinkclikcs")) {
            values.cpclinkclicks = computeCPCLC(data);
          }
          if (lowerCaseFormula.includes("roi")) {
            values.roi = computeROI(data);
          }
          if (lowerCaseFormula.includes("ctr")) {
            values.ctr = computeCTR(data);
          }
          if (lowerCaseFormula.includes("rpc")) {
            values.rpc = computeRPC(data);
          }
          if (lowerCaseFormula.includes("cpc")) {
            values.cpc = sanitizeNumericValue(data.cpc);
          }
          if (lowerCaseFormula.includes("cpl")) {
            values.cpl = computeCPL(data);
          }
          if (lowerCaseFormula.includes("ncpl")) {
            values.ncpl = computeNCPL(data);
          }

          const originalKeys = Object.keys(values);
          const sanitizedKeys = originalKeys.map(key => key.replace(/[^a-zA-Z_$0-9]/g, "_"));
          const keyMapping = {};
          sanitizedKeys.forEach((key, index) => { keyMapping[key] = originalKeys[index]; });
          const sanitizedValues = sanitizedKeys.map(key => sanitizeNumericValue(values[keyMapping[key]]));
          const safeFormula = lowerCaseFormula.replace(/\/(\s*)0/g, "/(0 === 0 ? 1 : 0)");
          const func = new Function(...sanitizedKeys, `return ${safeFormula}`);
          const result = func(...sanitizedValues);
          return (isNaN(result) || !isFinite(result)) ? 0 : Number(result.toFixed(2));
        }
        catch (error) {
          console.error("Error evaluating formula:", error);
          return 0;
        }
      },
      sortable: true,
      filter: true,
      aggFunc: (params) => params.rowNode.group ? customAggFunc(params, lowerCaseFormula) : null,
      cellStyle: { backgroundColor: "skyblue" },
      headerCellStyle: { backgroundColor: "skyblue", color: "black" },
      headerTooltip: formula
    };

    setCustomColumns(prev => [...prev, newColumnDef]);
    setNewColumnName("");
    setFormula("");
    setIsModalOpen(false);
  };
  const handleCancel = () => { setIsModalOpen(false); };
  const showModal = () => { setIsModalOpen(true); };

  const getMainMenuItems = (params) => {
    const defaultItems = params.defaultItems.slice();
    const resetColumnsItemIndex = defaultItems.findIndex(item => item === "resetColumns");

    if (resetColumnsItemIndex > -1) {

      defaultItems[resetColumnsItemIndex] = {
        name: "Reset Columns (Custom)",
        action: () => { handleColumnMove(columnStructure); },
        cssClasses: ["custom-reset-columns-item"]
      };

      defaultItems.splice(
        resetColumnsItemIndex + 1,
        0,
        {
          name: "Add New Column",
          action: showModal,
          cssClasses: ["custom-new-item"]
        }
      );
    }

    return defaultItems;
  };
  const handleColumnMove = async (newOrder) => {
    setUserColumnStructure(newOrder)
    await axios.put(`api/reports/columnstructure/update`, { updateDataArray: newOrder });
  };

  const campaignMap = useMemo(() => {
    const map = new Map();
    Camapignlevelstatus.forEach((item) => {
      const key = `${item.name}_${item.campaign_id}`; // 👈 combine both
      map.set(key, { start: item.start, end: item.end });
    });
    return map;
  }, [Camapignlevelstatus]);
  const adsetMap = useMemo(() => {
    const map = new Map();
    Camapignlevelstatus.forEach((item) => {
      item.adsets?.forEach((adset) => {
        const key = `${adset.name}_${adset.adset_id}`;
        map.set(key, { start: adset.start_time, end: adset.end_time });
      });
    });
    return map;
  }, [Camapignlevelstatus]);
  const commentsMap = useMemo(() => {
    const map = new Map();
    campaignComments.forEach((item) => {
      const key = `${item.campaignid}_${item.Account}_${item.level}`; // unique combo
      map.set(key, { category: item.category });
    });
    return map;
  }, [campaignComments]);

  const networkTabs = useMemo(() => {
    switch (updatedRevenuePartner) {
      case "FB_Mnet":
        return [
          {
            permission: "domain",
            key: "4",
            label: "Domain",
            children: (
              <DomainReports
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userData={userData}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            ),
          },
          {
            permission: "hour",
            key: "5",
            label: "Hourly",
            children: (
              <HourlyTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            )
          },
          {
            permission: "day_of_hour",
            key: "6",
            label: "Day of Hour",
            children:
              (<DayOfHourTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />)
            ,
          },
        ];
      case "FB_Media":
        return [
          {
            permission: "domain",
            key: "4",
            label: "Domain",
            children: (
              <DomainReports
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userData={userData}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            ),
          },
          {
            permission: "hour",
            key: "5",
            label: "Hourly",
            children: (
              <HourlyTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            )
          },
          {
            permission: "day_of_hour",
            key: "6",
            label: "Day of Hour",
            children:
              (<DayOfHourTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />)
            ,
          },
        ];
      case "FB_MnetBing":
        return [
          {
            permission: "domain",
            key: "4",
            label: "Domain",
            children: (
              <DomainReports
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userData={userData}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            ),
          },
          {
            permission: "hour",
            key: "5",
            label: "Hourly",
            children: (
              <HourlyTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />
            )
          },
          {
            permission: "day_of_hour",
            key: "6",
            label: "Day of Hour",
            children:
              (<DayOfHourTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />)
            ,
          },
        ];

      case "FB_TonicRsoc":
        return [
          {
            permission: "keywords",
            key: "4",
            label: "Keywords",
            children:
              <KeywordTable
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userColumnStructure={userColumnStructure}
                campaignMap={campaignMap}
                adsetMap={adsetMap}
                commentsMap={commentsMap}
                Camapignlevelstatus={Camapignlevelstatus}
                setCamapignlevelstatus={setCamapignlevelstatus}
                campaignComments={campaignComments}
                setCampaignComments={setCampaignComments}
                adLevelCreatives={adLevelCreatives}
                setAdLevelCreatives={setAdLevelCreatives}
                userData={userData}
                handleColumnMove={handleColumnMove}
                getMainMenuItems={getMainMenuItems}
                customColumns={customColumns}
                taxDetails={taxDetails}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />,
          },
        ];

      case "FB_Predicto":
        return [
          {
            permission: "country",
            key: "4",
            label: "Country",
            children:
              <CountryReports
                theme={theme}
                activeTab={activeTab}
                updatedRevenuePartner={updatedRevenuePartner}
                updatedAccountsValue={updatedAccountsValue}
                updatedStartDate={updatedStartDate}
                updatedEndDate={updatedEndDate}
                updatedTime={updatedTime}
                userData={userData}
                refreshTabs={refreshTabs}
                userdetails={userdetails}
              />,
          },
        ];

      default:
        return [];
    }
  }, [updatedRevenuePartner, activeTab, theme, updatedAccountsValue, updatedStartDate, updatedEndDate, updatedTime, userData, userColumnStructure, campaignComments, Camapignlevelstatus, refreshTabs]);
  const tabItemsForAccounts = [
    {
      permission: "live",
      key: "1",
      label: "Live",
      children: (
        <LiveReports
          theme={theme}
          activeTab={activeTab}
          updatedRevenuePartner={updatedRevenuePartner}
          updatedAccountsValue={updatedAccountsValue}
          updatedStartDate={updatedStartDate}
          updatedEndDate={updatedEndDate}
          updatedTime={updatedTime}
          userColumnStructure={userColumnStructure}
          campaignMap={campaignMap}
          adsetMap={adsetMap}
          commentsMap={commentsMap}
          Camapignlevelstatus={Camapignlevelstatus}
          setCamapignlevelstatus={setCamapignlevelstatus}
          campaignComments={campaignComments}
          setCampaignComments={setCampaignComments}
          adLevelCreatives={adLevelCreatives}
          setAdLevelCreatives={setAdLevelCreatives}
          userData={userData}
          handleColumnMove={handleColumnMove}
          getMainMenuItems={getMainMenuItems}
          customColumns={customColumns}
          taxDetails={taxDetails}
          refreshTabs={refreshTabs}
          userdetails={userdetails}
        />
      ),
    },
    {
      permission: "daily",
      key: "2",
      label: "Daily",
      children: (
        <DailyReports
          theme={theme}
          activeTab={activeTab}
          updatedRevenuePartner={updatedRevenuePartner}
          updatedAccountsValue={updatedAccountsValue}
          updatedStartDate={updatedStartDate}
          updatedEndDate={updatedEndDate}
          updatedTime={updatedTime}
          userColumnStructure={userColumnStructure}
          campaignMap={campaignMap}
          adsetMap={adsetMap}
          commentsMap={commentsMap}
          Camapignlevelstatus={Camapignlevelstatus}
          setCamapignlevelstatus={setCamapignlevelstatus}
          campaignComments={campaignComments}
          setCampaignComments={setCampaignComments}
          adLevelCreatives={adLevelCreatives}
          setAdLevelCreatives={setAdLevelCreatives}
          userData={userData}
          handleColumnMove={handleColumnMove}
          getMainMenuItems={getMainMenuItems}
          customColumns={customColumns}
          taxDetails={taxDetails}
          refreshTabs={refreshTabs}
          userdetails={userdetails}
        />
      ),
    },
    {
      permission: "agency",
      key: "3",
      label: "Agency",
      children: (
        <AgencyAndBMNameReports
          theme={theme}
          activeTab={activeTab}
          updatedRevenuePartner={updatedRevenuePartner}
          updatedAccountsValue={updatedAccountsValue}
          updatedStartDate={updatedStartDate}
          updatedEndDate={updatedEndDate}
          updatedTime={updatedTime}
          userData={userData}
          getMainMenuItems={getMainMenuItems}
          customColumns={customColumns}
          taxDetails={taxDetails}
          refreshTabs={refreshTabs}
          userdetails={userdetails}
        />
      ),
    },
    ...networkTabs,
  ]
  const handleSlideChange = (key) => {
    console.log("TAB CLICKED:", key);
    setActiveTab(key);
  };
  const getNetworks = async () => {
    const data = await fetch("/api/reports/network");
    return await data.json();
  }

  const getColumnStructure = async () => {
    const { data } = await axios.get("/api/reports/columnstructure/get")
    return data;
  }
  const handleFirstSelectChange = (newCategories) => {
    setRevenuePartner(newCategories);
    setAccountsValue([transformedData[newCategories][0]?.accountNumber]);
  };
  const onChangeTime = (value) => { setTime(value) };
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
  const OnClickSubmit = async () => {
    setUpdatedReevenuePartner(revenuePratner);
    setUpdatedAccountsValue(accountsValue);
    setUpdtedStartDate(startDate);
    setUpdatedEndDate(endDate);
    setUpdatedTime(time);
    setRefreshTabs(prev => prev + 1);
    setCamapignlevelstatus([]);
    axios.post("/api/reports/storereportsvalues", { network: revenuePratner, accounts: accountsValue, startDate: startDate, endDate: endDate, timezone: time })
  }

  const filteredAccounts = useMemo(() => { return transformedData[revenuePratner] }, [revenuePratner]);

  useEffect(() => {

    const networksData = async () => {
      try {
        const [columns, data] = await Promise.all([
          getColumnStructure(),
          getNetworks(),
        ]);

        setNetworksWithStatus(data);
        setUserColumnStructure(columns?.data?.columnStructure);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    networksData();

  }, [userData])
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', paddingLeft: "5px", paddingRight: "5px", height: "100%",
      overflowY: "auto", boxSizing: "border-box",
      backgroundColor: theme === "dark" ? "black" : null
    }}>
      <Row style={{ width: "100%", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "4px" }}>
        <Col xs={12} sm={10} md={10} lg={3}>
          <Space orientation="vertical" style={{ width: '100%' }}>
            <SelectProjects
              firstSelectValues={revenuePratner}
              handleFirstSelectChange={handleFirstSelectChange}
              transformedData={transformedData}
              networksWithStatus={networksWithStatus}
              theme={theme}
              route="reports"
            />
          </Space>
        </Col>
        <Col xs={15} sm={12} md={13} lg={4}>
          <SelectAccounts
            filteredAccounts={filteredAccounts}
            theme={theme}
            setValue={setAccountsValue}
            value={accountsValue}
          />
        </Col>
        <Col xs={20} sm={14} md={14} lg={4}>
          {screens.md && (<SelectDateDashboard
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
          />)}
          {!screens.md && (<SelectDateSingleCalendarDashboard
            rangePresets={rangePresets}
            selectedDates={selectedDates}
            handleChangeDates={handleChangeDates}
            isPickerOpen={isPickerOpen}
            handleOpenChange={handleOpenChange}
            setIsPickerOpen={setIsPickerOpen}
            disabledDate={disabledDate}
            onClickCloseButton={onClickCloseButton}
            theme={theme}
          />)}
        </Col>
        <Col xs={8} sm={7} md={6} lg={2}>
          <SelectTimezone time={time} timezones={timezones} onChangeTime={onChangeTime} theme={theme} />
        </Col>
        <Col lg={2}>
          <SubmitButton height={23} width={55} text="Apply" textSize="12px" onClick={OnClickSubmit} />
        </Col>
        <Col flex="auto">
          <div className="route-description">
            <RouteDescription Title="Strategic Reports Center" Description="Deep insights for strategic decisions"
              theme="light" textAlignment="right" />
          </div>
        </Col>
      </Row>
      <Row>
        <div
          className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}
          style={{ width: "100%" }}
        // style={{
        //   padding: "1px 1px 1px 12px", marginTop: 8, borderRadius: 12, backgroundColor: theme === "dark" ? "#1E1E1E" : "#e6e6e6", boxShadow: theme === "dark" ? "0 1px 3px rgba(0,0,0,0.6)" : "0 1px 6px rgba(0,0,0,0.08)",
        // }}
        >
          <Tabs activeKey={activeTab} onChange={handleSlideChange} items={tabItemsForAccounts} />
        </div>
      </Row>
      <Modal
        title="Add New Column"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add"
        cancelText="Cancel"
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
      >
        <Input value={newColumnName} placeholder="Enter Column Name" style={{ marginBottom: "10px", }}
          onChange={(e) => setNewColumnName(e.target.value)} />
        <Input value={formula} placeholder="Enter Formula" onChange={(e) => setFormula(e.target.value)} />
      </Modal>
    </div>
  );
}