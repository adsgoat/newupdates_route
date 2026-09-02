"use client"
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import React from 'react';
import debounce from 'lodash.debounce';
import dayjs from 'dayjs';
import { Grid, Row, Col, Space, Divider, Checkbox, ConfigProvider, Tooltip, Tabs, Skeleton } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import RouteDescription from "../../components/common/routedescription";
import SelectProjects from "../../components/common/selectprojects";
import SelectAccountsDashboard from "../../components/common/selectaccountdashboard";
import SelectTimezone from "../../components/common/selecttimezone";
import SelectDateDashboard from "../../components/common/selectdatedashboard";
import SelectDateSingleCalendarDashboard from "../../components/common/selectdatesinglecalendar"
import ReloadButton from "../../components/common/reloadbuttion";
import ProjectReports from "../../components/dashboard/projectreport";
import Cards from "../../components/dashboard/cards"
import axios from 'axios';
import { columnDefs, columnDefs1, columnDefs2, columnDefs3, columnDefs4 } from "./columndefs";
import { groupByAccountNumberAndDate, groupByAccountNumberAndDateDataOfProfitAccounts, groupByAccountNumberAndDateDataOfLossAccounts, groupByAccountNumber, getTop5BySpend, getTop5ByRevenue, getTop5ByProfit, groupByCampaignAndDate, getCampaignsByDate, getTopFiveSpendCampaignsByDate, getTopFiveRevenueCampaignsByDate, getTopFiveProfitCampaignsByDate, getAllProfitableCampaignsByDate, getAllUnprofitableCampaignsByDate, groupDataByDomainAndAccount } from "./functions"
import { NetworkDefaultTimezones, newtworkCollections, revenuePartnerNames, timezones, rangePresets } from "../commonfunctionsforroutes"
const { useBreakpoint } = Grid;
// const rangePresets = [
//   {
//     label: 'Today',
//     value: [dayjs().add(0, 'd'), dayjs().add(0, 'd')],
//   },
//   {
//     label: 'Yesterday',
//     value: [dayjs().add(-1, 'd'), dayjs().add(-1, 'd')],
//   },
//   {
//     label: 'Last 7 Days',
//     value: [dayjs().add(-7, 'd'), dayjs()],
//   },
//   {
//     label: 'Last 14 Days',
//     value: [dayjs().add(-14, 'd'), dayjs()],
//   },
//   {
//     label: 'Last 30 Days',
//     value: [dayjs().add(-30, 'd'), dayjs()],
//   },
//   {
//     label: 'Last 60 Days',
//     value: [dayjs().add(-60, 'd'), dayjs()],
//   },
//   {
//     label: 'Last 90 Days',
//     value: [dayjs().add(-90, 'd'), dayjs()],
//   },
//   {
//     label: 'This Month',
//     value: [dayjs().startOf('month'), dayjs()],
//   },
//   {
//     label: 'Last Month',
//     value: [
//       dayjs().subtract(1, 'month').startOf('month'),
//       dayjs().subtract(1, 'month').endOf('month'),
//     ],
//   },
// ];
export default function DashboardPage({ email, userData, userPermissions, auth, }) {
  // console.log(auth)
  // console.log(userPermissions, "userPermissions");
  // console.log(userPermissionsInfo, "userPermissionsInfo");
  const dashboardVisibility = userPermissions?.permissions?.find(item => Object.hasOwn(item, "dashboard"))?.dashboard ?? {};
  // console.log(dashboardVisibility);
  const screens = useBreakpoint();
  const [theme, setTheme] = useState('light');
  // const NetworkDefaultTimezones = {
  //   "FB_Mnet": "UTC",
  //   "FB_MnetBing": "UTC",
  //   "FB_Enki": "UTC",
  //   "FB_System1": 'UTC',
  //   "FB_Rsoc": 'PDT',
  //   "FB_Tonic": 'PDT',
  //   "FB_DomainActive": "PDT",
  //   "FB_Bodies": "UTC",
  //   "FB_Bodies1": "UTC",
  //   "Newsbreak_DA": "PDT",
  //   "FB_Tonic1": "PDT",
  //   "FB_Sedo": "CET",
  //   "FB_TonicRsoc": "PDT",
  //   "FB_InuvoPrism": "PDT",
  //   "FB_CodeFuel": "UTC",
  //   "FB_Predicto": "EDT",
  //   "FB_Affinity": "PDT",
  //   "FB_Botup": "EDT",
  //   "Outbrain_TonicRsoc": "EDT",
  //   "FB_MWG": "UTC",
  //   "Taboola_Inuvoprism": "PDT"
  // }

  // const newtworkCollections = {
  //   "FB_Mnet": "Facebook_Mnet_Daily",
  //   "FB_MnetBing": "Facebook_MnetBing_Daily",
  //   "FB_Enki": "Facebook_Enki",
  //   "FB_System1": 'Facebook_System1',
  //   "FB_Rsoc": 'Facebook_Rsoc',
  //   "FB_Tonic": 'Facebook_Tonic',
  //   "FB_DomainActive": "Facebook_DActive_Names",
  //   "FB_Bodies": "Facebook_Bodies",
  //   "FB_Bodies1": "Facebook_Bodies1",
  //   "Newsbreak_DA": "Newsbreak_DomainActive",
  //   "FB_Tonic1": "Facebook_Tonic1",
  //   "FB_Sedo": "Facebook_Sedo",
  //   "FB_TonicRsoc": "Facebook_TonicRsoc",
  //   "FB_InuvoPrism": "Facebook_InuvoPrismDaily",
  //   "FB_CodeFuel": "Facebook_CodeFuel_Daily",
  //   "FB_Predicto": "Facebook_Predicto_Daily",
  //   "FB_Affinity": "Facebook_Affinity_Daily",
  //   "FB_Botup": "Facebook_Botup_Daily",
  //   "Outbrain_TonicRsoc": "Outbrain_TonicRsoc",
  //   "FB_MWG": "Facebook_Mwg_Daily",
  //   "Taboola_Inuvoprism": "Taboola_InuvoPrismDaily"
  // }

  // const revenuePartnerNames = {
  //   "MEDIA_DOT_NET": "FB_Mnet",
  //   "MEDIA_DOT_NET_BING": "FB_MnetBing",
  //   "Bodies": "FB_Bodies",
  //   "TONIC": "FB_Tonic",
  //   "TONIC1": "FB_Tonic1",
  //   "Domain Active": "FB_DomainActive",
  //   "ENKI": "FB_Enki",
  //   "System1": "FB_System1",
  //   "Domain_Active": "Newsbreak_DA",
  //   "Sedo": "FB_Sedo",
  //   "Tonic_Rsoc": "FB_TonicRsoc",
  //   "Inuvo_Prism": "FB_InuvoPrism",
  //   "Code_Fuel": "FB_CodeFuel",
  //   "Predicto": "FB_Predicto",
  //   "Affinity": "FB_Affinity",
  //   "Botup": "FB_Botup",
  //   "Outbrain_Tonic_Rsoc": "Outbrain_TonicRsoc",
  //   "MWG": "FB_MWG",
  //   "Taboola_Inuvoprism": "Taboola_Inuvoprism"
  // };
  // const timezones = [
  //   'UTC',
  //   'EEST',
  //   'EDT',
  //   'CST',
  //   'PDT',
  //   'IST',
  //   'BST',
  //   'GMT',
  //   'MST',
  //   'CDT',
  //   'AST',
  //   'DST',
  //   'CEST',
  //   'CET'
  // ];
  const transformData = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        // Check if the value is an array and if it contains objects
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          // Convert array of objects to array of accountNumbers
          return [key, value.map(obj => ({ accountNumber: obj.accountNumber, accountName: obj.accountName, status: obj.status, }))];
        }
        // If it's not an array of objects, keep it as is
        return [key, value];
      })
    );
  };
  function groupDataByBMNameAndAgencyName(data, dateField) {
    // console.log(dateField);
    const DomainGroupedData = data?.reduce((acc, obj) => {
      const { spend, estimated_revenue, BMName, AgencyName, accountNumber, revenuePartner } = obj;
      const specifiedDate = obj[`${dateField}Date`]; // Dynamically get the date based on the field

      // Create a unique key for grouping by domain, specifiedDate, and accountNumber
      const key = `${specifiedDate}-${BMName}-${AgencyName}-${accountNumber}`;

      if (!acc[key]) {
        acc[key] = {
          specifiedDate,
          BMName,
          AgencyName,
          spend: 0,
          estimated_revenue: 0,
          fbLeads: 0,
          conversions: 0,
          fbClicks: 0,
          fbLinkClicks: 0, //new
          impressions: 0, // new
          accountNumber,
          accountName: userData[revenuePartnerNames[revenuePartner]]?.find(each => each.accountNumber === accountNumber)?.accountName
        };
      }

      // Sum the fields (spend, estimated_revenue) based on the new grouping
      acc[key].spend += spend;
      acc[key].estimated_revenue += estimated_revenue;
      acc[key].fbLeads += obj.fbLeads !== null && obj.fbLeads !== undefined ? parseInt(obj.fbLeads) : 0;
      acc[key].conversions += obj.conversions !== null && obj.conversions !== undefined ? parseInt(obj.conversions) : 0;
      acc[key].fbClicks += obj.fbClicks ? parseInt(obj.fbClicks) : 0;
      acc[key].fbLinkClicks += obj.fbLinkClicks ? parseInt(obj.fbLinkClicks) : 0; // new
      acc[key].impressions += obj.impressions ? parseInt(obj.impressions) : 0; // new

      return acc;
    }, {});

    // Convert the grouped data object back to an array and add the profit field
    const domainResult = Object.values(DomainGroupedData).map(item => {
      item.profit = item.estimated_revenue - item.spend; // Calculate profit
      return item;
    });

    return domainResult;
  }
  const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
  const defaultDates = [dayjs(yesterday), dayjs(yesterday)];
  const disabledDate = (current) => {
    return current && current > dayjs().endOf('day');
  };
  const transformedData = transformData(userData);
  const defaultCategory = Object.keys(transformedData)[0];
  const timeZoneForColumnDefs = useRef('UTC');
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);
  const [timeZone, setTimeZone] = useState('UTC');
  const [searchValue, setSearchValue] = useState('');
  const [networksWithStatus, setNetworksWithStatus] = useState([]);
  const [firstSelectValues, setFirstSelectValues] = useState([defaultCategory]);
  const [time, setTime] = useState(NetworkDefaultTimezones[defaultCategory]);
  const [skeletonLoading, setSkeletonLoading] = useState(true);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedDates, setSelectedDates] = useState(defaultDates);
  const [selectedItems, setSelectedItems] = useState({
    [defaultCategory]: transformedData[defaultCategory], // Default all items in the first category
  });

  const [previousDataDates, setPreviousDataDates] = useState({});
  const [data, setData] = useState(null);
  const [previousData, setPreviousData] = useState([])

  const handleFirstSelectChange = (newCategories) => {
    // Automatically select all items for newly added categories
    setSkeletonLoading(true);
    setFirstSelectValues(newCategories);

    setSelectedItems((prevSelected) => {
      const updatedSelectedItems = { ...prevSelected };

      // Remove categories that are deselected
      Object.keys(prevSelected).forEach((category) => {
        if (!newCategories.includes(category)) {
          delete updatedSelectedItems[category]; // Remove deselected categories
        }
      });

      // For any new category, select all items by default
      newCategories.forEach((category) => {
        if (!prevSelected[category] && transformedData[category]) {
          updatedSelectedItems[category] = transformedData[category]; // Select all items by default
        }
      });

      return updatedSelectedItems;
    });

    // Check if only 'FB_Tonic' is selected and update the timezone
    // if (newCategories.length === 1 && newCategories[0] === 'FB_Tonic') {
    //     setTime('PDT'); // Change to PDT when FB_Tonic is selected
    // } else if(newCategories.length === 1 && newCategories[0] === 'FB_Tonic1'){
    //     setTime('PDT')
    // }else if(newCategories.length === 1 && newCategories[0] === 'FB_TonicRsoc'){
    //     setTime('PDT')
    // }else if(newCategories.length === 1 && newCategories[0] === 'FB_Predicto'){
    //     setTime('EDT')
    // }else if(newCategories.length === 1 && newCategories[0] === 'FB_Sedo'){
    //     setTime('CET')
    // }
    // else {
    //     setTime('UTC'); // Default to UTC otherwise
    // }
    if (newCategories.length === 1) {
      setTime(NetworkDefaultTimezones[newCategories[0]] || "UTC")
    } else {
      setTime('UTC'); // Default to UTC otherwise
    }
  };
  const debouncedUpdateSelectedItems = useCallback(
    debounce((category, checkedValues) => {

      setSelectedItems(prev => {
        const fullList = transformedData[category] || [];

        // 1Find previously selected items that were NOT visible in filtered results
        const previouslySelected = prev[category] || [];

        const hiddenItems = previouslySelected.filter(item =>
          !filteredDataForCategory[category].some(f =>
            f.accountNumber.toString() === item.accountNumber.toString()
          )
        );

        // 2 Build updated selection from checkedValues + hiddenItems
        const updatedSelected = [
          ...hiddenItems,
          ...fullList.filter(item =>
            checkedValues.includes(item.accountNumber.toString())
          )
        ];

        return {
          ...prev,
          [category]: updatedSelected
        };
      });

    }, 200),
    [transformedData]
  );
  const handleGroupChange = (checkedValues, category) => {
    setSkeletonLoading(true);
    // Call the debounced function to update the state
    debouncedUpdateSelectedItems(category, checkedValues);
    setSearchValue('');
  };
  const handleSelectAllChange = (isChecked, category) => {
    if (isChecked) {
      setSearchValue(""); // Reset search value when network is selected
    }
    setSkeletonLoading(true);
    const newSelectedValues = isChecked ? transformedData[category] : [];
    setSelectedItems((prevSelected) => ({
      ...prevSelected,
      [category]: newSelectedValues,
    }));
    // setSkeletonLoading(false); // Optionally stop loading
  };
  const filteredDataForCategory = {};
  firstSelectValues.forEach(category => {
    filteredDataForCategory[category] =
      transformedData[category]?.filter(item =>
      // item.accountNumber?.toString().toLowerCase().includes(searchValue)
      (item.accountNumber?.toString().toLowerCase().includes(searchValue) ||
        item.accountName?.toLowerCase().includes(searchValue))
      ) || [];
  });
  const renderInnerSelects = (theme) => {
    return firstSelectValues.map((category) => {
      const allSelected =
        transformedData[category]?.length === selectedItems[category]?.length;

      // Filter transformedData based on search query
      const filteredData = transformedData[category]?.filter(item =>
      // item.accountNumber?.toString().toLowerCase().includes(searchValue)
      (item.accountNumber?.toString().toLowerCase().includes(searchValue) ||
        item.accountName?.toLowerCase().includes(searchValue))
      ) || [];
      // console.log(`Transformed data for category ${category}:`, transformedData[category]);

      return (
        <div key={category}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: theme === 'dark' ? 'white' : 'black',
              width: "100%"
            }}
          >
            <Divider style={{ color: theme === 'dark' ? 'white' : 'black', fontSize: "16px" }}>
              <ConfigProvider
                theme={{
                  components: {
                    Checkbox: {
                      colorPrimary: '#5c94ad',
                      colorPrimaryHover: '#1677FF',
                    },
                  },
                }}
              >
                <Checkbox
                  checked={allSelected}
                  onChange={(e) => handleSelectAllChange(e.target.checked, category)}
                  style={{ marginRight: '5px', fontSize: "13px" }}
                  className={theme === 'dark' ? 'checkbox-dark' : 'checkbox-light'}
                />
                <span style={{ fontSize: "14px" }}>{category}</span>
              </ConfigProvider>
            </Divider>
          </div>
          <ConfigProvider
            theme={{
              components: {
                Checkbox: {
                  colorPrimary: '#5c94ad',
                  colorPrimaryHover: '#1677FF',
                },
              },
            }}
          >
            <Checkbox.Group
              options={filteredData
                .sort((a, b) => {
                  if (a.status === 'Active' && b.status !== 'Active') return -1;
                  if (a.status !== 'Active' && b.status === 'Active') return 1;
                  return 0;
                })
                .map((item) => {
                  const accountNumber = item?.accountNumber ? item.accountNumber.toString() : 'Unknown';
                  return {
                    label: (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingLeft: '5px',
                        borderBottom: '1px solid #ddd',
                      }}>
                        <div style={{ display: 'flex' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', marginRight: '5px' }}>
                            <span style={{ color: theme === "dark" ? "#fff" : "#000", fontWeight: '600', fontSize: "12px" }}>{accountNumber}</span>
                            <span style={{ color: theme === "dark" ? "#fff" : "#000", fontSize: "12px" }}>{item.accountName || ''}</span>

                          </div>
                          <div>
                            {item.status === 'Active' ? (
                              <CheckCircleFilled style={{ color: '#91C25F', fontSize: 14 }} />
                            ) : (
                              <CloseCircleFilled style={{ color: '#EC7117', fontSize: 14 }} />
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                    value: accountNumber,
                  };
                })}
              value={selectedItems[category]?.map(item => item.accountNumber?.toString()) || []}
              onChange={(checkedValues) => handleGroupChange(checkedValues, category)}
              className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
            />
          </ConfigProvider>
        </div>
      );
    });
  };
  const handleSearchChange = (value) => {
    setSearchValue(value.toLowerCase());  // Store lowercase search term
  };
  const getNetworks = async () => {
    const data = await fetch("/api/dashboard/network");
    return await data.json();
  }
  const onClickNetwork = async () => {
    const data = await getNetworks();
    console.log(data);
  }
  const onChangeTime = (value) => {
    // setTimeZone(value);
    // timeZoneForColumnDefs.current = value;
    setTime(value)
  };

  const handleChangeDates = (dates) => {
    setSelectedDates(dates || []); // Save selected dates in state
    setIsPickerOpen(true); // Ensure the RangePicker stays open after date selection
  };

  const onClickCloseButton = () => {
    setIsPickerOpen(false)
    setSelectedDates([dayjs(startDate), dayjs(endDate)])
  }
  const handleSubmit = () => {
    if (selectedDates.length === 1) {
      const [start] = selectedDates;
      const formattedStart = start ? start.format('YYYY-MM-DD') : '';
      setStartDate(formattedStart);
      setEndDate(''); // Keep endDate empty if only startDate is selected
    } else if (selectedDates.length === 2) {
      const [start, end] = selectedDates;
      const formattedStart = start ? start.format('YYYY-MM-DD') : '';
      const formattedEnd = end ? end.format('YYYY-MM-DD') : '';
      if (startDate !== formattedStart || endDate !== formattedEnd) {
        setSkeletonLoading(true); // Start loading when dates change
      }
      setStartDate(formattedStart);
      setEndDate(formattedEnd);
    }

    // Close the date picker only after clicking submit
    setIsPickerOpen(false);
  };
  const handleOpenChange = (open) => {
    if (!open && !isPickerOpen) {
      // This condition ensures we only close when the user clicks outside
      setIsPickerOpen(false);
    } else if (open) {
      setIsPickerOpen(true); // Ensure it remains open if interacting with it
    }
  };
  const refreshUsers = () => {
    try {
      setSkeletonLoading(true);
      functionCallForResponse(selectedItems);

    } catch (error) {
      console.error("Error refreshing account data:", error);

    }
  };
  const functionCallForResponse = debounce(async (data) => {
    const transformObjectKeys = (obj) => {
      const transformedObject = {};

      Object.keys(obj).forEach((key) => {
        // Split the key by underscore
        const splitKey = key.split('_');

        // Join the array back into a string for the new key
        let newKey;
        if (key === "Newsbreak_DA") {
          newKey = "Newsbreak_DomainActive"
        } else if (key === "FB_DomainActive") {
          newKey = "Facebook_DActive_Names"
        } else if (key === "FB_Mnet") {
          newKey = "Facebook_Mnet_Daily"
        } else if (key === "FB_MnetBing") {
          newKey = "Facebook_MnetBing_Daily"
        } else if (key === "FB_InuvoPrism") {
          newKey = "Facebook_InuvoPrismDaily"
        }
        else if (key === "FB_CodeFuel") {
          newKey = "Facebook_CodeFuel_Daily"
        }
        else if (key === "FB_Predicto") {
          newKey = "Facebook_Predicto_Daily"
        }
        else if (key === "FB_Affinity") {
          newKey = "Facebook_Affinity_Daily"
        } else if (key === "FB_Botup") {
          newKey = "Facebook_Botup_Daily"
        } else if (key === "Outbrain_TonicRsoc") {
          newKey = "Outbrain_TonicRsoc"
        } else if (key === "FB_MWG") {
          newKey = "Facebook_Mwg_Daily"
        } else if (key === "Taboola_Inuvoprism") {
          newKey = "Taboola_InuvoPrismDaily"
        }
        else { newKey = "Facebook_" + splitKey[1]; }

        // Initialize the array if the key doesn't exist
        if (!transformedObject[newKey]) {
          transformedObject[newKey] = [];
        }

        // Check if the value is an array
        if (Array.isArray(obj[key])) {
          // Loop through the array and extract each accountNumber
          obj[key].forEach(item => {
            if (item.accountNumber) {
              transformedObject[newKey].push(item.accountNumber);
            }
          });
        } else if (obj[key]?.accountNumber) {
          // If it's an object, directly push the accountNumber
          transformedObject[newKey].push(obj[key].accountNumber);
        }
      });

      return transformedObject;
    };
    const transformedObject = transformObjectKeys(data);
    let response;
    try {
      //Dashboardnew
      // response = await axios.post(`http://test.app.vyaktimetrics.com/dashboard/data?timezone=${time}&start_date=${startDate}&end_date=${endDate}`, { formattedData: [transformedObject] });
      const payload = {
        time: time,
        startDate: startDate,
        endDate: endDate,
        transformedObject: [transformedObject]
      }
      response = await axios.post(
        "/api/dashboard/data",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    } catch (error) {
      // message.error('API failed to fetch the data please click the reload button', 8);
    }
    const responseData = response?.data?.data || [];
    const previousData = response?.data?.previousDays || [];
    setPreviousDataDates(response?.data?.previousRange || {});
    setData(responseData);
    setPreviousData(previousData)
    setSkeletonLoading(false);
  }, 1500);;
  const calculateTotals = (rows) => {
    return rows.reduce((totals, row) => {
      totals.spend += Number(row.spend || 0);
      totals.estimated_revenue += Number(row.estimated_revenue || 0);
      totals.profit += Number(row.profit || 0);

      totals.conversions += Number(row.conversions || 0);
      totals.fbLeads += Number(row.fbLeads || 0);
      totals.fbClicks += Number(row.fbClicks || 0);
      totals.fbLinkClicks += Number(row.fbLinkClicks || 0);
      totals.impressions += Number(row.impressions || 0);

      // Include these if they exist in your data
      totals.accountNumber += Number(row.accountNumber || 0);
      totals.rpc += Number(row.rpc || 0);
      totals.cpl += Number(row.cpl || 0);
      totals.ncpl += Number(row.ncpl || 0);
      totals.cpc += Number(row.cpc || 0);
      totals.cpclinkclicks += Number(row.cpclinkclicks || 0);
      totals.Filteration += Number(row.Filteration || 0);
      totals.ctr += Number(row.ctr || 0);
      totals.cpm += Number(row.cpm || 0);
      totals.roi += Number(row.roi || 0);
      totals.margin += Number(row.margin || 0);
      totals.fmargin += Number(row.fmargin || 0);

      return totals;
    }, {
      spend: 0,
      estimated_revenue: 0,
      profit: 0,

      conversions: 0,
      fbLeads: 0,
      fbClicks: 0,
      fbLinkClicks: 0,
      impressions: 0,

      accountNumber: 0,
      rpc: 0,
      cpl: 0,
      ncpl: 0,
      cpc: 0,
      cpclinkclicks: 0,
      Filteration: 0,
      ctr: 0,
      cpm: 0,
      roi: 0,
      margin: 0,
      fmargin: 0,
    });
  };

  const updatePinnedBottomRow = (api, call) => {
    // console.log(call);

    if (!api) return;

    const rows = [];

    api.forEachNodeAfterFilterAndSort((node) => {
      if (!node.group && !node.footer && !node.rowPinned && node.data) {
        rows.push(node.data);
      }
    });

    const pinnedNode = api.getPinnedBottomRow(0);

    if (!rows.length) {
      Object.assign(pinnedNode.data, {
        spend: 0,
        estimated_revenue: 0,
        profit: 0,
        conversions: 0,
        fbLeads: 0,
        fbClicks: 0,
        fbLinkClicks: 0,
        impressions: 0,
        rpc: 0,
        cpl: 0,
        ncpl: 0,
        cpc: 0,
        cpclinkclicks: 0,
        ctr: 0,
        cpm: 0,
        roi: 0,
        margin: 0,
        fmargin: 0,
        Filteration: 0,
      });

      api.refreshCells({
        rowNodes: [pinnedNode],
        force: true,
      });

      return;
    };

    const t = calculateTotals(rows);

    const rpc = t.conversions ? t.estimated_revenue / t.conversions : 0;
    const revenue = rpc * t.fbLeads;

    const row = {
      // revenuePartner: "Grand Total",

      spend: t.spend,
      estimated_revenue: t.estimated_revenue,
      profit: t.profit,
      conversions: t.conversions,
      fbLeads: t.fbLeads,
      fbClicks: t.fbClicks,
      fbLinkClicks: t.fbLinkClicks,
      impressions: t.impressions,

      rpc: Number(rpc.toFixed(2)),
      cpl: t.fbLeads ? Number((t.spend / t.fbLeads).toFixed(2)) : 0,
      ncpl: t.conversions ? Number((t.spend / t.conversions).toFixed(2)) : 0,
      cpc: t.fbClicks ? Number((t.spend / t.fbClicks).toFixed(2)) : 0,
      cpclinkclicks: t.fbLinkClicks ? Number((t.spend / t.fbLinkClicks).toFixed(2)) : 0,
      ctr: t.impressions ? Number(((t.fbClicks / t.impressions) * 100).toFixed(2)) : 0,
      cpm: t.impressions ? Number(((t.spend / t.impressions) * 1000).toFixed(2)) : 0,
      roi: t.spend ? Number((((t.estimated_revenue - t.spend) / t.spend) * 100).toFixed(2)) : 0,
      margin: t.estimated_revenue
        ? Number((((t.estimated_revenue - t.spend) / t.estimated_revenue) * 100).toFixed(2))
        : 0,
      fmargin: revenue
        ? Number((((t.estimated_revenue - t.spend) / revenue) * 100).toFixed(2))
        : 0,
      Filteration: t.fbLeads
        ? Number((((t.fbLeads - t.conversions) / t.fbLeads) * 100).toFixed(2))
        : 0,
    };



    if (!pinnedNode) return;

    Object.assign(pinnedNode.data, row);

    api.refreshCells({
      rowNodes: [pinnedNode],
      force: true,
    });
  };
  useEffect(() => {
    // if(selectedItems.length > 0){
    if (startDate !== '' && endDate !== '') {
      setSkeletonLoading(true)
      functionCallForResponse(selectedItems);
    }
    // }
  }, [selectedItems, time, startDate, endDate])

  useEffect(() => {

    const networksData = async () => {
      const data = await getNetworks();
      // console.log(data, "networksData");
      setNetworksWithStatus(data);
    }
    networksData();

  }, [])

  const autoGroupColumnDefOverAllReport = {
    headerName: 'Group', // Display name for the grouped column
    minWidth: 250, // Set width for grouped rows
    resizable: true, // Enable resizing
    sortable: true, // Enable sorting
    cellRendererParams: {
      suppressCount: true, // Suppress row count in the grouped column
      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return "Total";
        }

        return params.value;
      }
    },
  };

  const autoGroupColumnDef = {
    headerName: 'Campaign name', // Display name for the grouped column
    minWidth: 430, // Set width for grouped rows
    resizable: true, // Enable resizing
    sortable: true, // Enable sorting
    cellRendererParams: {
      suppressCount: true, // Suppress row count in the grouped column
    },
  };

  const autoGroupColumnDefDomain = {
    headerName: 'Domain', // Display name for the grouped column
    minWidth: 250, // Set width for grouped rows
    resizable: true, // Enable resizing
    sortable: true, // Enable sorting
    cellRendererParams: {
      suppressCount: true, // Suppress row count in the grouped column
    },
    filter: "agTextColumnFilter",
    filterValueGetter: (params) => {
      if (params.node.group) {
        // Use the group key (campaign name)
        return params.node.key;
      }
      // For leaf rows, use the campaign_name or any field
      return params.data?.domain || '';
    },
    cellRendererParams: {
      suppressCount: true,

      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return "Total";
        }

        return params.value;
      }
    }
  };
  const autoGroupColumnDefAgency = {
    headerName: 'BM name', // Display name for the grouped column
    minWidth: 250, // Set width for grouped rows
    resizable: true, // Enable resizing
    sortable: true, // Enable sorting
    cellRendererParams: {
      suppressCount: true, // Suppress row count in the grouped column
    },
    filter: "agTextColumnFilter",
    filterValueGetter: (params) => {
      if (params.node.group) {
        // Use the group key (campaign name)
        return params.node.key;
      }
      // For leaf rows, use the campaign_name or any field
      return params.data?.BMName || '';
    },
    cellRendererParams: {
      suppressCount: true,

      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return "Total";
        }

        return params.value;
      }
    }
  };

  const autoGroupColumnDefProfit = {
    headerName: 'Account number',
    minWidth: 300,
    sortable: true,
    filter: "agTextColumnFilter",
    filterValueGetter: (params) => {
      if (params.node.group) {
        // Use the group key (campaign name)
        return params.node.key;
      }
      // For leaf rows, use the campaign_name or any field
      return params.data?.accountNumber || '';
    },
    cellRendererParams: {
      suppressCount: false,
      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return 'Total';
        }

        const firstColumnValue = params.node.key; // campaign name
        const campaignName = params.node.key;
        const groupedData = params.node.allLeafChildren
          ? params.node.allLeafChildren.map(childNode => childNode.data)
          : [];

        // Ensure groupedData has at least one element
        if (groupedData.length === 0) {
          return '';
        }

        // Safeguard against undefined or missing properties
        const firstGroupedItem = groupedData[0] || {};
        const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
          ? revenuePartnerNames[firstGroupedItem.revenuePartner]
          : 'Unknown Partner';

        const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';

        const valueWithCount = `${firstColumnValue}`;
        return (
          <div style={{ width: '100%', marginRight: '10px' }}>
            <span
              onClick={() => {
                const data = {
                  network: revenuePartnerNameToPassToReports,
                  accountNumber: accountNumberToPassToReports,
                  time: time,
                  startDate: startDate,
                  endDate: endDate,
                  accountName: userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName
                };
                // console.log(userdetails?.adAccounts[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName);
                // Convert data to query string
                const queryString = new URLSearchParams(data).toString();
                const url = `/Reports?${queryString}`;

                // Open the URL in a new tab
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              {valueWithCount}
            </span>
          </div>
        );
      }
    },
    cellRendererFramework: (params) => {
      if (params.node.group) {
        // Keep the original logic for grouped rows
        return params.valueFormatted || params.value || params.node.key;
      }

      // For ungrouped rows, handle navigation directly
      const accountNumber = params.data?.accountNumber || 'Unknown Account';
      const revenuePartner = params.data?.revenuePartner || 'Unknown Partner';

      const data = {
        network: revenuePartner,
        accountNumber,
        time,
        startDate,
        endDate,
      };

      const queryString = new URLSearchParams(data).toString();
      const url = `/Reports?${queryString}`;

      return (
        <span
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => {
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        >
          {accountNumber}
        </span>
      );
    }
  };

  const autoGroupColumnDefLoss = {
    headerName: 'Account number',
    minWidth: 200,
    sortable: true,
    filter: "agTextColumnFilter",
    filterValueGetter: (params) => {
      if (params.node.group) {
        // Use the group key (campaign name)
        return params.node.key;
      }
      // For leaf rows, use the campaign_name or any field
      return params.data?.accountNumber || '';
    },
    //  cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
    // autoHeight: true,
    cellRendererParams: {
      suppressCount: false,
      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return 'Total';
        }

        const firstColumnValue = params.node.key;  // campaign name
        const campaignName = params.node.key;
        const groupedData = params.node.allLeafChildren
          ? params.node.allLeafChildren.map(childNode => childNode.data)
          : [];

        // Ensure groupedData has at least one element
        if (groupedData.length === 0) {
          return '';
        }

        // Safeguard against undefined or missing properties
        const firstGroupedItem = groupedData[0] || {};
        const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
          ? revenuePartnerNames[firstGroupedItem.revenuePartner]
          : 'Unknown Partner';

        const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';

        const valueWithCount = `${firstColumnValue}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

            <span
              onClick={() => {
                const data = {
                  network: revenuePartnerNameToPassToReports,
                  accountNumber: accountNumberToPassToReports,
                  time: time,
                  startDate: startDate,
                  endDate: endDate,
                };

                // Convert data to query string
                const queryString = new URLSearchParams(data).toString();
                const url = `/Reports?${queryString}`;

                // Open the URL in a new tab
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              {valueWithCount}
            </span>

          </div>
        );
      }
    }
  };

  const autoGroupColumnDefCampaigns = {
    headerName: 'Campaign name',
    minWidth: 335,
    sortable: true,
    cellStyle: { whiteSpace: "normal", lineHeight: "1.5" }, // Enables text wrapping
    autoHeight: true,
    filter: "agTextColumnFilter",
    valueFormatter: (params) => {
      // GROUP ROW
      if (params.node?.group) {
        const firstChild = params.node.childrenAfterGroup?.[0]?.data;
        return firstChild?.campaign_name ?? params.node.key;
      }

      // LEAF ROW
      return params.value;
    },
    filterValueGetter: (params) => {
      if (params.node.group) {
        // Use the group key (campaign name)
        return params.node.key;
      }
      // For leaf rows, use the campaign_name or any field
      return params.data?.campaign_name || '';
    },
    cellRendererParams: {
      suppressCount: false,
      innerRenderer: (params) => {
        if (params.node.rowPinned) {
          return 'Total';
        }


        const campaignName = params.node.key;
        const groupedData = params.node.allLeafChildren
          ? params.node.allLeafChildren.map(childNode => childNode.data)
          : [];

        // Ensure groupedData has at least one element
        if (groupedData.length === 0) {
          return '';
        }

        // Safeguard against undefined or missing properties
        const firstGroupedItem = groupedData[0] || {};
        const firstColumnValue = groupedData[0]?.campaign_name || params.node.key; // campaign name
        const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
          ? revenuePartnerNames[firstGroupedItem.revenuePartner]
          : 'Unknown Partner';
        const collectionName = newtworkCollections[revenuePartnerNameToPassToReports];

        const accountNumberToPassToReports = firstGroupedItem.accountNumber || 'Unknown Account';
        const campaignNameToPass = firstGroupedItem.campaign_name || 'Unknown Account';

        const valueWithCount = `${firstColumnValue}`;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span
              onClick={() => {
                // const data = {
                //     network: revenuePartnerNameToPassToReports,
                //     accountNumber: accountNumberToPassToReports,
                //     time: time,
                //     startDate: startDate,
                //     endDate: endDate,
                // };

                // // Convert data to query string
                // const queryString = new URLSearchParams(data).toString();
                const url = `/DailyAndCampaignHistory/CampaignHistory/${campaignName}-${accountNumberToPassToReports}-${time}-${collectionName}`;
                // console.log(url);

                // Open the URL in a new tab
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              <Tooltip
                styles={{
                  body: {
                    backgroundColor: theme === 'dark' ? '#111' : '#fff',
                    color: theme === 'dark' ? '#fff' : '#000',
                    border: '1px solid #ccc',
                    borderRadius: 6,
                  }
                }}
                title={(() => {
                  const [text, setText] = React.useState("Click to Copy");
                  const handleCopy = (e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(valueWithCount);
                    setText("Copied");
                    setTimeout(() => setText("Copy"), 1000);
                  };
                  return (
                    <span style={{ cursor: "pointer" }} onClick={handleCopy}>
                      {text}
                    </span>
                  );
                })()}
              >
                {valueWithCount}
              </Tooltip>

            </span>
          </div>
        );
      }
    },
    cellRendererFramework: (params) => {
      if (params.node.group) {
        // Keep the original logic for grouped rows
        return params.valueFormatted || params.value || params.node.key;
      }

      // For ungrouped rows, handle navigation directly
      const accountNumber = params.data?.accountNumber || 'Unknown Account';
      const revenuePartner = params.data?.revenuePartner || 'Unknown Partner';

      const data = {
        network: revenuePartner,
        accountNumber,
        time,
        startDate,
        endDate,
      };

      const queryString = new URLSearchParams(data).toString();
      const url = `/Reports?${queryString}`;

      return (
        <span
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => {
            window.open(url, '_blank', 'noopener,noreferrer');
          }}
        >
          {accountNumber}
        </span>
      );
    }
  };

  const [defaultColDef] = useState({
    flex: 4,
    sortable: true,
    filter: true,
    resizable: true,
    enableRowGroup: true,

  });

  const onCellClicked = (params) => {

    const field = params.colDef.field || params.node.field;

    if (field === 'accountNumber') {
      const accountNumberToPassToReports = params.value;
      // console.log(params.node);
      const groupedData = params.node.allLeafChildren
        ? params.node.allLeafChildren.map(childNode => childNode.data)
        : [params.node.data];

      const firstGroupedItem = groupedData[0] || {};
      const revenuePartnerNameToPassToReports = firstGroupedItem.revenuePartner
        ? revenuePartnerNames[firstGroupedItem.revenuePartner]
        : 'Unknown Partner';

      const data = {
        network: revenuePartnerNameToPassToReports,
        accountNumber: accountNumberToPassToReports,
        time: time,
        startDate: startDate,
        endDate: endDate,
        accountName: userData[revenuePartnerNameToPassToReports]?.find(each => each.accountNumber === accountNumberToPassToReports)?.accountName
      };
      const queryString = new URLSearchParams(data).toString();
      const url = `/Reports?${queryString}`;

      // Open the URL in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
      // console.log('Clicked accountNumber:', params.value, params.node);
    }
  };

  const onFilterChanged = (params) => {
    // updatePinnedBottomRow(params.api);
    // params.api.refreshClientSideRowModel('aggregate');
    params.api.refreshCells({ force: true });

  };

  const allTabsForAccounts = [
    {
      permission: "profit",
      key: "1",
      label: "Profit",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={groupByAccountNumberAndDateDataOfProfitAccounts}
          columnDefs={columnDefs1}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefProfit}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "loss",
      key: "2",
      label: "Loss",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={groupByAccountNumberAndDateDataOfLossAccounts}
          columnDefs={columnDefs1}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefLoss}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "top_5_spend",
      key: "3",
      label: "Top 5 Spend",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTop5BySpend}
          columnDefs={columnDefs1}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefProfit}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "top_5_revenue",
      key: "4",
      label: "Top 5 Revenue",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTop5ByRevenue}
          columnDefs={columnDefs1}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefProfit}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "top_5_profit",
      key: "5",
      label: "Top 5 Profit",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTop5ByProfit}
          columnDefs={columnDefs1}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefProfit}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
  ]

  const allTabsForCampaigns = [
    {
      permission: "spend",
      key: "1",
      label: "Spend",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTopFiveSpendCampaignsByDate}
          columnDefs={columnDefs2}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefCampaigns}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "revenue",
      key: "2",
      label: "Revenue",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTopFiveRevenueCampaignsByDate}
          columnDefs={columnDefs2}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefCampaigns}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "profit",
      key: "3",
      label: "Profit",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getTopFiveProfitCampaignsByDate}
          columnDefs={columnDefs2}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefCampaigns}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "all_profit",
      key: "4",
      label: "All Profit",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getAllProfitableCampaignsByDate}
          columnDefs={columnDefs2}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefCampaigns}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "all_loss",
      key: "5",
      label: "All Loss",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={getAllUnprofitableCampaignsByDate}
          columnDefs={columnDefs2}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefCampaigns}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
  ]
  const allTabsForAgencyAndDomain = [
    {
      permission: "domain",
      key: "1",
      label: "Domain",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={groupDataByDomainAndAccount}
          columnDefs={columnDefs3}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefDomain}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    },
    {
      permission: "agency",
      key: "2",
      label: "Agency",
      children: (
        <ProjectReports
          theme={theme}
          selectedItems={selectedItems}
          skeletonLoading={skeletonLoading}
          rowData={data}
          func={groupDataByBMNameAndAgencyName}
          columnDefs={columnDefs4}
          defaultColDef={defaultColDef}
          autoGroupColumnDef={autoGroupColumnDefAgency}
          onCellClicked={onCellClicked}
          onFilterChanged={onFilterChanged}
          time={time}
          updatePinnedBottomRow={updatePinnedBottomRow}
        />
      ),
    }
  ]

  const tabItemsForAccounts = allTabsForAccounts.filter(tab =>
    (dashboardVisibility.ad_accounts ?? []).includes(tab.permission)
  );

  const tabItemsForCampaigns = allTabsForCampaigns.filter(tab =>
    (dashboardVisibility.top_campaigns ?? []).includes(tab.permission)
  );

  const tabItemsForAgencyAndDomain = allTabsForAgencyAndDomain.filter(tab =>
    (dashboardVisibility.domain_agency ?? []).includes(tab.permission)
  );
  const [activeTab, setActiveTab] = useState(tabItemsForAccounts.length ? tabItemsForAccounts[0]?.key : "1");
  const [activeTab1, setActiveTab1] = useState(tabItemsForCampaigns.length ? tabItemsForCampaigns[0]?.key : "1");
  const [activeTab3, setActiveTab3] = useState(tabItemsForAgencyAndDomain.length ? tabItemsForAgencyAndDomain[0]?.key : "1");

  const handleSlideChange = (key) => setActiveTab(key);
  const handleSlideChange1 = (key) => setActiveTab1(key);
  const handleTabChange3 = (key) => setActiveTab3(key);
  return (
    <div style={{
      padding: "10px", height: "100%",
      overflowY: "auto", boxSizing: "border-box",
    }}>
      <Row style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Col flex="auto">
          <div className="route-description">
            <RouteDescription Title="Analytics dashboard" Description="Real-time insights for your digital campaigns" theme={theme} />
          </div>
        </Col>
        <div style={{
          // width: '62%', 
          // display: 'flex', justifyContent: 'flex-end',
          // // height: '35px', 
          // // borderRadius: 12,
          // backgroundColor: theme === 'dark' ? '#1E1E1E' : '#dbd9d9ff',
          // padding: "5px",
          // marginBottom: '5px',

          // boxShadow:
          //   theme === 'dark'
          //     ? '0 1px 3px rgba(0,0,0,0.6)'
          //     : '0 1px 6px rgba(0, 0, 0, 0.04)',
        }}
          className={`select-items ${theme === "dark" ? "select-items-dark" : "select-items-light"}`}
        >
          <Row style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <Col xs={12} sm={10} md={10} lg={5}>
              <Space
                orientation="vertical"
                style={{
                  width: '100%',
                  // backgroundColor: theme === 'dark' ? '#333' : ''
                }}
              >
                <SelectProjects
                  firstSelectValues={firstSelectValues}
                  handleFirstSelectChange={handleFirstSelectChange}
                  transformedData={transformedData}
                  networksWithStatus={networksWithStatus}
                  theme={theme}
                  route="dashboard"
                />
              </Space>
            </Col>
            <Col xs={15} sm={12} md={13} lg={7}>
              <Space
                orientation="vertical"
                style={{
                  width: '100%',
                  // backgroundColor: theme === 'dark' ? '#333' : ''
                }}
              >
                <SelectAccountsDashboard
                  handleSearchChange={handleSearchChange}
                  renderInnerSelects={renderInnerSelects}
                  theme={theme}
                />
              </Space>
            </Col>
            <Col xs={8} sm={7} md={6} lg={3}>
              <SelectTimezone time={time} timezones={timezones} onChangeTime={onChangeTime} theme={theme} />
            </Col>
            <Col xs={20} sm={14} md={14} lg={7}>
              {/* Desktop */}
              {screens.md && (<SelectDateDashboard
                rangePresets={rangePresets}
                selectedDates={selectedDates}
                handleChangeDates={handleChangeDates}
                isPickerOpen={isPickerOpen}
                handleOpenChange={handleOpenChange}
                setIsPickerOpen={setIsPickerOpen}
                disabledDate={disabledDate}
                onClickCloseButton={onClickCloseButton}
                handleSubmit={handleSubmit}
                theme={theme}
                route="dashboard"
              />)}
              {/* Mobile & Tablet */}
              {!screens.md && (<SelectDateSingleCalendarDashboard
                rangePresets={rangePresets}
                selectedDates={selectedDates}
                handleChangeDates={handleChangeDates}
                isPickerOpen={isPickerOpen}
                handleOpenChange={handleOpenChange}
                setIsPickerOpen={setIsPickerOpen}
                disabledDate={disabledDate}
                onClickCloseButton={onClickCloseButton}
                handleSubmit={handleSubmit}
                theme={theme}
              />)}
            </Col>
            <Col>
              <ReloadButton refreshUsers={refreshUsers} height={"23px"} width={"23px"} />
            </Col>
          </Row>

        </div>
      </Row>
      <Cards skeletonLoading={skeletonLoading} data={data} previousData={previousData} selectedItems={selectedItems} previousDataDates={previousDataDates} theme={theme} />
      {dashboardVisibility?.project_report &&
        (
          <div
            style={{
              width: '100%',
              marginTop: "12px",
              borderRadius: 12,
              backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
              padding: 10,
              height: 'auto', // ✅ Key: no fixed height
              boxShadow:
                theme === 'dark'
                  ? '0 1px 3px rgba(0,0,0,0.6)'
                  : '0 1px 6px rgba(0,0,0,0.08)',
            }}>
            <Col>
              <h4
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  marginTop: 0,
                  marginBottom: 10,
                  // marginLeft: 10,
                  color: theme === 'dark' ? '#fff' : '#111827',
                }}
              >Project report</h4>
            </Col>
            {skeletonLoading ?
              <Skeleton active
                paragraph={{
                  rows: 8,
                }}
                className={theme === "dark" ? "dark-skeleton" : ""}
              /> :
              <ProjectReports theme={theme} selectedItems={selectedItems} skeletonLoading={skeletonLoading} rowData={data} func={groupByAccountNumberAndDate} columnDefs={columnDefs} defaultColDef={defaultColDef} autoGroupColumnDef={autoGroupColumnDefOverAllReport} onCellClicked={onCellClicked} onFilterChanged={onFilterChanged} time={time} updatePinnedBottomRow={updatePinnedBottomRow} />
            }

          </div>
        )
      }
      {dashboardVisibility?.ad_accounts && (
        <Row style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>
          <Col>
            <div
              style={{
                width: '100%',
                borderRadius: 12,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                padding: 10,
                height: 'auto', // ✅ Key: no fixed height
                boxShadow:
                  theme === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 6px rgba(0,0,0,0.08)',
              }}
            >
              <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Col>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      marginTop: 0,
                      marginBottom: 0,
                      // marginLeft: 10,
                      color: theme === 'dark' ? '#fff' : '#111827',
                    }}
                  >
                    Ad accounts
                  </h4>
                </Col>
              </Row>
              {skeletonLoading ?
                <Skeleton active
                  paragraph={{
                    rows: 8,
                  }}
                  className={theme === "dark" ? "dark-skeleton" : ""}
                /> :
                <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
                  <Tabs
                    activeKey={activeTab}
                    onChange={handleSlideChange}
                    items={tabItemsForAccounts}
                  />
                </div>
              }
              {/* <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
              <Tabs
                activeKey={activeTab}
                onChange={handleSlideChange}
                items={tabItemsForAccounts}
              />
            </div> */}
            </div>
          </Col>
        </Row>
      )}
      {dashboardVisibility?.top_campaigns && (
        <Row style={{ display: 'flex', flexDirection: 'column', marginTop: "20px" }}>
          <Col>
            <div
              style={{
                width: '100%',
                borderRadius: 12,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                padding: 10,
                height: 'auto', // ✅ Key: no fixed height
                boxShadow:
                  theme === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 6px rgba(0,0,0,0.08)',
              }}
            >
              <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Col>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      marginTop: 0,
                      marginBottom: 0,
                      // marginLeft: 10,
                      color: theme === 'dark' ? '#fff' : '#111827',
                    }}
                  >
                    Top campaigns
                  </h4>
                </Col>
              </Row>
              {skeletonLoading ?
                <Skeleton active
                  paragraph={{
                    rows: 8,
                  }}
                  className={theme === "dark" ? "dark-skeleton" : ""}
                /> :
                <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
                  <Tabs
                    activeKey={activeTab1}
                    onChange={handleSlideChange1}
                    items={tabItemsForCampaigns}
                  />
                </div>
              }
              {/* <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
              <Tabs
                activeKey={activeTab1}
                onChange={handleSlideChange1}
                items={tabItemsForCampaigns}
              />
            </div> */}
            </div>
          </Col>
        </Row>
      )}
      {dashboardVisibility.domain_agency && (
        <Row style={{ display: 'flex', flexDirection: 'column', marginTop: '20px' }}>
          <Col>
            <div
              style={{
                width: '100%',
                borderRadius: 12,
                backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e6e6e6',
                padding: 10,
                height: 'auto', // ✅ Key: no fixed height
                boxShadow:
                  theme === 'dark'
                    ? '0 1px 3px rgba(0,0,0,0.6)'
                    : '0 1px 6px rgba(0,0,0,0.08)',
              }}
            >
              <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Col>
                  <h4
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      marginTop: 0,
                      marginBottom: 0,
                      // marginLeft: 10,
                      color: theme === 'dark' ? '#fff' : '#111827',
                    }}
                  >
                    Insights by Domain & Agency
                  </h4>
                </Col>
              </Row>
              {skeletonLoading ?
                <Skeleton active
                  paragraph={{
                    rows: 8,
                  }}
                  className={theme === "dark" ? "dark-skeleton" : ""}
                /> :
                <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
                  <Tabs
                    activeKey={activeTab3}
                    onChange={handleTabChange3}
                    items={tabItemsForAgencyAndDomain}
                  />
                </div>
              }
              {/* <div className={theme === "dark" ? "theme-dark-tab" : "theme-light-tab"}>
              <Tabs
                activeKey={activeTab3}
                onChange={handleTabChange3}
                items={tabItemsForAgencyAndDomain}
              />
            </div> */}
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}
