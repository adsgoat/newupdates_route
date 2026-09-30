"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FilterOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  HistoryOutlined,
  WalletOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import {
  Table,
  Tag,
  Button,
  Col,
  Card,
  Drawer,
  Dropdown,
  Flex,
  Input,
  Row,
  Select,
  Spin,
  Menu,
  Space,
  Modal,
  message,
  Switch,
  Tooltip,
  ConfigProvider,
  Skeleton,
  Tabs,
  Popconfirm,
  Checkbox,
  Popover,
  Steps,
  Tree,
  Timeline
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  CloseOutlined,
  SwapRightOutlined,
  PlusOutlined,
  CopyOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  LinkOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
  DownOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import CreateCampaignDrawer from "./camp-components/create_camapaign";
import CreateDraft from "./camp-components/CreateDraft";
import EditAllLevelDataDrawer from "./camp-components/EditAllLevelData";
import ViewDrawer from "./camp-components/view-campaign";
import EditMultipleAdsetCampaignDrawer from "./camp-components/editMultipleAdsetCampaign";
import CloneMultipleAdsetCampaignDrawer from "./camp-components/cloneMultipleAdsetsCampaign";
// import EditOnlyCampaignDrawer from './camp-components/EditCamp';
import EditCampaignDrawer1 from "./camp-components/EditCamp";
import axios from "axios";
import EditCampaignDrawer from "./camp-components/edit-campaign";
// import { useTokenContext } from "../components/parent";

import Adsets from "./camp-components/Adsets";
import Editcampaign from "./camp-components/EditCampaign";
import Editcam from "./camp-components/EditCampaign";
import DuplicateCampaignDrawer from "./camp-components/Dupcampaign";
import { redirect } from "next/navigation";
import ExpandedRowContent from "./camp-components/expandcreatives";
import ExpandedAdsetsContent from "./camp-components/expandcreativesformultipleadsets";
import AddSuggestedKeywordModal from "./camp-components/urlbuilder/predicto-article"
import moment from "moment-timezone";
import dayjs from "dayjs";
import { DatePicker } from "antd";
import StickyBox from "react-sticky-box";
import { FaClone, FaEye, FaPenToSquare, FaTrashCan, FaRegCommentDots } from "react-icons/fa6";
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";
import { IoMdCreate } from "react-icons/io";
import { FaFacebook } from "react-icons/fa";
import { useSearchParams } from "next/navigation";
// const CampaignHistoryModal = React.lazy(() => import('../Campaigns/camp-components/campaignHistory'));

import { Token } from "aws-sdk";
import { AccountBalance } from "@mui/icons-material";
import { render } from "react-dom";
const { RangePicker } = DatePicker;
// import { redirect } from 'next/navigation';

const CampaignPage = () => {
  const { userdetails } = useTokenContext();
  // console.log("useTokenContext", userdetails);
  const isMobile = window.innerWidth <= 500;

  if (!userdetails?.adAccounts) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <Flex align="center" gap="middle">
                <Spin size="large" />
            </Flex> */}
        <div style={{ padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 20 }} />
        </div>
      </div>
    );
  }
  if (userdetails?.role === "Revenue_Partner") {
    redirect("/Dashboard");
  }
  const searchParams = useSearchParams();
  const networkFromUrl = searchParams.get("network");
  const accountFromUrl = searchParams.get("account");
  const campaignIdFromUrl = searchParams.get("campaignId");
  const { adAccounts } = userdetails || {};
  const [hovered, setHovered] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [paginationSize, setPaginationSize] = useState(10);
  const [searchInput, setSearchInput] = useState(campaignIdFromUrl ? campaignIdFromUrl : "");
  const [filteredData, setFilteredData] = useState([]);
  const [sendInputToApi, setSendInputToApi] = useState("");
  const [cdrawerVisible, setDrawerVisible] = useState(false);
  const [createNewDraft, setCreateNewDraft] = useState(false);
  const [dupdrawerVisible, setdupDrawerVisible] = useState(false);
  const [campaignData, setCampaignData] = useState([]);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [editOnlyDrawerVisible, setEditOnlyDrawerVisible] = useState(false);
  const [
    viewEditAllLevelDataDrawerVisible,
    setViewEditAllLevelDataDrawerVisible,
  ] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [selectedOnlyEditData, setSelectedOnlyEditData] = useState(null);
  const [selectedEditAllLevelData, setSelectedEditAllLevelData] =
    useState(null);
  const [viewEditDrawerVisible, setViewEditDrawerVisible] = useState(false);
  const [selectedEditRowData, setSelectedEditRowData] = useState(null);
  const [EditcamapaignDrawerVisible, setEditcamapaignDrawerVisible] =
    useState(false);
  const [selectedEditCampaign, setselectedEditCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingForMultipleAdsets, setLoadingForMultipleAdsets] = useState(false);
  const [draftsLoading, setDraftsLoading] = useState(true);
  const [draftsData, setDraftsData] = useState([]);
  const [adsetsdrawerVisible, setadsetsDrawerVisible] = useState(false);
  const [adsetcampaigndata, setadsetcampaigndata] = useState(null);
  const [duplicatenewcampaigns, setduplicatenewcampaigns] = useState(null);
  const [refrst, setRefrst] = useState(false);
  const [options, setOptions] = useState([]);
  const [createcamselectedacc, setcreatecamselectedacc] = useState("");
  const [selectedKey, setSelectedKey] = useState(networkFromUrl ? networkFromUrl : null);
  const [selectedValue, setSelectedValue] = useState(accountFromUrl ? [accountFromUrl] : []);
  const [valueOptions, setValueOptions] = useState([]);
  const [error, setError] = useState(false);
  const { theme } = useTokenContext();
  const [isOpen, setIsOpen] = useState(false); // State to track if dropdown is open
  const yesterday = dayjs().subtract(0, "day").format("YYYY-MM-DD");
  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(yesterday);
  const [startDateForAds, setStartDateForAds] = useState(yesterday);
  const [endDateForAds, setEndDateForAds] = useState(yesterday);
  const [selected, setSelected] = useState("Choose Option");
  const [deleteDraftId, setDeleteDraftId] = useState("");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDraftToEdit, setSelecetedDraftToEdit] = useState({});
  const [multipleAdsetCampaignData, setMultipleAdsetCampaignData] = useState(
    []
  );
  var token = localStorage.getItem("token")
  const [networksWithStatus, setNetworksWithStatus] = useState([]);
  const [activeTab, setActiveTab] = useState("2");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("all");
  const [selectedEditMultipleAdsetData, setSelectedEditMultipleAdsetData] =
    useState(null);
  const [selectedCloneMultipleAdsetData, setSelectedCloneMultipleAdsetData] =
    useState(null);
  const [
    viewEditMultipleAdsetDataDrawerVisible,
    setViewEditMultipleAdsetDataDrawerVisible,
  ] = useState(false);
  const [
    viewCloneMultipleAdsetDataDrawerVisible,
    setViewCloneMultipleAdsetDataDrawerVisible,
  ] = useState(false);
  const [view, setView] = useState(false);
  const [accountChanged, setAccountChanged] = useState(false);
  const [comment, setComment] = useState("");
  const [isModalVisibles, setIsModalVisibles] = useState(false);
  const [firstColumnValue, setFirstColumnValue] = useState("");
  const [universalOject, setUniversalOject] = useState({});
  const [launcherComments, setLauncherComments] = useState([]);
  const [isModalVisiblesForBulkComments, setIsModalVisiblesForBulkComments] = useState(false);
  const [checkedRowIds, setCheckedRowIds] = useState([]);
  const [checkedRowRecords, setCheckedRowRecords] = useState([]);
  const [commentForBulkComments, setCommentForBulkComments] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCampaignIdForHistory, setSelectedCampaignIdForHistory] = useState(null);
  const [selectedAccountForHistory, setSelectedAccountForHistory] = useState(null);
  const [accountBalance, setAccountBalance] = useState("");
  const [accountRemaining, setAccountRemaining] = useState("");
  const [adDetails, setAdDetails] = useState({});
  const [adsCount, setAdsCount] = useState({});
  const [loadingAd, setLoadingAd] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  const [adIds, setAdIds] = useState("");
  const [showTaboolaStatus, setShowTaboolaStatus] = useState(false);
  const [showPredictoadStatus, setShowPredictoadStatus] = useState(false);
  const [showPredictoKeywordStatus, setShowPredictoKeywordStatus] = useState(false);
  const [platform, setPlatform] = useState(2);
  const [tableData, setTableData] = useState([]);
  const [predictoAdStatusData, setPredictoAdStatusData] = useState([]);
  const [predictoAdDeatils, setPredictoAdDeatils] = useState([]);
  const [predictoKeywordStatusData, setPredictoKeywordStatusData] = useState([]);
  const [predictoKeywordArticleStatusData, setPredictoKeywordArticleStatusData] = useState([]);
  const [searchAdId, setSearchAdId] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [predictoAdPoliciesAppliedSearch, setPredictoAdPoliciesAppliedSearch] = useState("");
  const keywordStatusDataRef = useRef([]);
  const [languageSearch, setLanguageSearch] = useState("all");
  const [statusSearch, setStatusSearch] = useState("all");
  const [verticleSearch, setVerticleSearch] = useState("all");
  const filtersList = useRef({ languageList: [], statusList: [], verticleList: [] })
  const [loadingKeyword, setLoadingKeyword] = useState(true);
  const [loadingAdPolicies, setLoadingAdPolicies] = useState(true);
  const [loadingArticleForKeyword, setLoadingArticleForKeyword] = useState([]);
  const [loadingCampaignDetails, setLoadingCampaignDetails] = useState({});
  const [openComponentForCreateArticle, setOpenComponentForCreateArticle] = useState(false);
  const lastUpdatedDateandTime = useRef("");
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneCampaigns, setCloneCampaigns] = useState([]);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneProject, setCloneProject] = useState(null);
  const [cloneAccount, setCloneAccount] = useState(null);
  const [cloneSelectedKey, setCloneSelectedKey] = useState(undefined);
  const [cloneIsOpen, setCloneIsOpen] = useState(false);
  const [cloneSelectedValue, setCloneSelectedValue] = useState([]);
  const [cloneSearchText, setCloneSearchText] = useState("");

  // console.log(checkedRowRecords);
  // console.log(multipleAdsetCampaignData);
  // const [isOpen, setIsOpen] = useState(false);
  const onStatusFilterChange = (key) => {
    setCampaignStatusFilter(key);
  };
  // useEffect(() => {
  //   const networkFromUrl = searchParams.get("network");
  //   const accountFromUrl = searchParams.get("account");
  //   const campaignIdFromUrl = searchParams.get("campaignId");

  //   if (networkFromUrl) {
  //     setSelectedKey(networkFromUrl);
  //   }

  //   if (accountFromUrl) {
  //     setSelectedValue([accountFromUrl]);
  //   }

  //   if (campaignIdFromUrl) {
  //     setSearchInput(campaignIdFromUrl);
  //   }
  //    setIsReady(true);
  // }, []);
  useEffect(() => {
    const fetchNetworksData = async () => {
      try {
        const res = await axios.get('https://fblaunching.vyaktimetrics.com/open/get/networksData', {
          headers: {
            Authorization: token,

          }
        });
        setNetworksWithStatus(res.data);
      } catch (error) {
        console.error('Error to fetching networksData:', error);
      }
    };
    fetchNetworksData();
  }, []);
  const getFilteredSingleCampaigns = () => {
    return campaignData.filter((campaign) => {
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
      if (campaignStatusFilter === "error") {
        return (
          (campaign.adsetErrors?.length || 0) > 0 ||
          (campaign.adErrors?.length || 0) > 0 ||
          (campaign.campaignlevel_error)
        );
      }
      return true;
    });
  };

  // const getFilteredMultipleAdsetCampaigns = () => {
  //   return multipleAdsetCampaignData.filter((campaign) => {
  //     if (campaignStatusFilter === "active") {
  //       return campaign.Status === "ACTIVE" && campaign.Approval === "Approved";
  //     }
  //     if (campaignStatusFilter === "pause") {
  //       return campaign.Status === "PAUSED" && campaign.Approval === "Approved";
  //     }
  //     if (campaignStatusFilter === "pending") {
  //       return campaign.Approval === "PENDING_APPROVAL";
  //     }
  //     if (campaignStatusFilter === "reject") {
  //       return campaign.Approval === "Rejected";
  //     }
  //     if (campaignStatusFilter === "error") {
  //       return (
  //         (campaign.adsetErrors?.length || 0) > 0 ||
  //         (campaign.adErrors?.length || 0) > 0 ||
  //         (campaign.campaignlevel_error)
  //       );
  //     }
  //     if (typeFilter === "Daily") {
  //       if (campaign.budgetType?.toLowerCase() !== "daily") {
  //         return false;
  //       }
  //     }

  //     if (typeFilter === "Lifetime") {
  //       if (campaign.budgetType?.toLowerCase() !== "lifetime") {
  //         return false;
  //       }
  //     }

  //     return true;

  //   });
  // };

  const filteredMultipleAdsetCampaigns = useMemo(() => {
    return multipleAdsetCampaignData.filter((campaign) => {

      if (campaignStatusFilter === "active") {
        return (
          campaign.Status === "ACTIVE" &&
          campaign.Approval === "Approved"
        );
      }

      if (campaignStatusFilter === "pause") {
        return (
          campaign.Status === "PAUSED" &&
          campaign.Approval === "Approved"
        );
      }

      if (campaignStatusFilter === "pending") {
        return campaign.Approval === "PENDING_APPROVAL";
      }

      if (campaignStatusFilter === "reject") {
        return campaign.Approval === "Rejected";
      }

      if (campaignStatusFilter === "error") {
        return (
          (campaign.adsetErrors?.length || 0) > 0 ||
          (campaign.adErrors?.length || 0) > 0 ||
          campaign.campaignlevel_error
        );
      }

      if (typeFilter === "Daily") {
        if (campaign.budgetType?.toLowerCase() !== "daily") {
          return false;
        }
      }

      if (typeFilter === "Lifetime") {
        if (campaign.budgetType?.toLowerCase() !== "lifetime") {
          return false;
        }
      }

      return true;
    });
  }, [
    multipleAdsetCampaignData,
    campaignStatusFilter,
    typeFilter,
  ]);

  const gridThemeClass =
    theme === "dark" ? "ag-theme-alpine-dark" : "ag-theme-alpine";
  // console.log(selectedKey, "selectedKeyselectedKeyselectedKey");

  // const [selectedAccount, setSelectedAccount] = useState('All');
  const restrictedEmails = [
    "creatives@adsgoat.in",
    "mnetadmin@winkleads.com",
    "creativeteam@winkleads.com",
    "shravan.k@winkleads.com",
    "abhynay.k@winkleads.com",
  ];

  //commneted the api 2026-05-22
  // const handleIconClick = async (identifier) => {
  //   if (!identifier) return;
  //   if (adDetails[identifier]) return;
  //   setLoadingAd(identifier);
  //   try {
  //     const response = await fetch("https://www.testapi.adsgoat.in/api/getAdDetails", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: token,
  //       },
  //       body: JSON.stringify({ identifier }),
  //     });

  //     const data = await response.json();

  //     if (data?.data) {
  //       setAdDetails((prev) => ({
  //         ...prev,
  //         [identifier]: data.data,
  //       }));

  //       setAdsCount((prev) => ({
  //         ...prev,
  //         [identifier]: data.totalAds,
  //       }));
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoadingAd(null);
  //   }
  // };

  const rangePresets = [
    {
      label: "ALL",
      value: [dayjs().startOf("year"), dayjs()],
    },
    {
      label: "Today",
      value: [dayjs(), dayjs()],
    },
    {
      label: "Yesterday",
      value: [dayjs().subtract(1, "day"), dayjs().subtract(1, "day")],
    },
    {
      label: "Last 7 Days",
      value: [dayjs().subtract(7, "day"), dayjs()],
    },
    {
      label: "Last 14 Days",
      value: [dayjs().subtract(14, "day"), dayjs()],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().subtract(30, "day"), dayjs()],
    },
    {
      label: "Last 60 Days",
      value: [dayjs().subtract(60, "day"), dayjs()],
    },
    {
      label: "Last 90 Days",
      value: [dayjs().subtract(90, "day"), dayjs()],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs()],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
  ];

  const userPickedRef = useRef(false);

  // Function to disable future dates
  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const handleTabChange = (key) => {
    // console.log("Switched to Tab:", key); // Debugging log
    setActiveTab(key);
  };

  // Function to handle click on campaign name
  const handleCampaignNameClick = (record) => {
    setadsetcampaigndata(record);
    // console.log(record, "adsets data");
    setadsetsDrawerVisible(true);
  };

  const changeRRefrst = () => {
    // alert("hey rerendering")
    setRefrst((els) => !els);
  };

  const changeDraftRefresh = () => {
    setDraftsLoading(true);
  };

  // console.log("localStorage", localStorage.getItem("token"))
  // var token = localStorage.getItem("token");

  const handleViewClick = (record) => {
    // console.log(record, "viewdata campaign");
    setSelectedRowData(record);
    setViewDrawerVisible(true);
  };

  const handleEditOnlyClick = (record) => {
    // console.log(record, "viewdata campaign");
    setSelectedOnlyEditData(record);
    setEditOnlyDrawerVisible(true);
  };

  const handleEditClickAllLevelData = (record) => {
    // console.log(record, "viewdata campaign")
    setSelectedEditAllLevelData(record);
    setViewEditAllLevelDataDrawerVisible(true);
  };
  // const handleEditClick = (record) => {
  //     console.log(record, "Editdata")
  //     setSelectedEditRowData(record);
  //     setViewEditDrawerVisible(true);
  // };
  // const handleEditcampaign = (record) => {
  //     console.log(record, "Editcamapaign")
  //     setselectedEditCampaign(record);
  //     setEditcamapaignDrawerVisible(true);
  // }

  const accountsForAccess = adAccounts[selectedKey];
  // console.log(accountsForAccess, "accounts Access");

  const accountsAccess = accountsForAccess === undefined ? [] : accountsForAccess;


  const items = [
    // { key: "1", label: "Old", content: "Content for Live data" },
    { key: "2", label: "New", content: "Content for Daily data" },
  ];

  const handleCarouselChange = (index) => {
    setActiveTab(index);
  };

  const renderCarouselNav = () => (
    <StickyBox
      offsetTop={64}
      offsetBottom={20}
      style={{
        zIndex: 1,
        padding: "10px",
        marginBottom: "5px",
        marginLeft: "5px",
        paddingLeft: "5px",
        borderRadius: 12,
        // backgroundColor: theme === "dark" ? "#1E1E1E" : "#e6e6e6",
        padding: 3,
        //   boxShadow:
        //     theme === "dark"
        //       ? "0 1px 3px rgba(0,0,0,0.6)"
        //       : "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={handleCarouselChange}
        items={items.map((item) => ({
          key: item.key,
          // label: item.label,
          label: (
            <Tooltip
              title={
                item.key === "1"
                  ? "Campaigns Before 11-08-2025"
                  : "Campaigns After 11-08-2025"
              }
              placement="top"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <span>{item.label}</span>
            </Tooltip>
          ),
        }))}
        className={`left-pill-tabs ${theme === "dark" ? "pill-tabs-dark" : "pill-tabs-light"
          }`}
        style={{
          backgroundColor: "transparent",
          padding: "0",
          marginBottom: "0",
        }}
        tabBarStyle={{
          fontSize: "12px",
          padding: "0",
          height: "30px",
          lineHeight: "30px",
          marginBottom: "-1px",
          borderBottom: "none",
        }}
      />
    </StickyBox>
  );

  const getTheCampaignLimit = async () => {
    const campaignLimit = await axios.get('https://fblaunching.vyaktimetrics.com/open/campaignlimitperday', {
      headers: {
        Authorization: token,
      }
    });
    return campaignLimit.data;
  }

  const showDrawer = async () => {
    const limit = await getTheCampaignLimit();
    console.log(limit)
    if (limit.data.remainingCount > 0 || limit.data.remainingCount === "No_Limit") {
      if (limit.data.remainingCount !== "No_Limit" && limit.data.remainingCount <= 10) {
        // message.warning(`Campaign launch limit is nearly reached. Only ${limit.data.remainingCount} campaign launches remaining.`)
        message.open({
          type: "warning",
          content: `Campaign launch limit is nearly reached. Only ${limit.data.remainingCount} campaign launches remaining.`,
          style: {
            marginTop: "20px",
          },
          className: theme === "dark" ? "custom-warning-dark" : "custom-warning-light",
        });

      }
      setDrawerVisible(true)
    }
    else {
      // message.warning("Campaign launch limit reached. Unable to launch new campaigns.");
      message.open({
        type: "warning",
        content: "Campaign launch limit reached. Unable to launch new campaigns.",
        style: {
          marginTop: "20px",
        },
        className: theme === "dark" ? "custom-warning-dark" : "custom-warning-light"
      });
      setDrawerVisible(false);
    }
  };

  const showCreateNewDraftDrawer = () => {
    setCreateNewDraft(true);
    setSelecetedDraftToEdit({}); // Reset selected draft to edit
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setadsetsDrawerVisible(false);
    setEditcamapaignDrawerVisible(false);
    setdupDrawerVisible(false);
    setViewEditAllLevelDataDrawerVisible(false);
    setCreateNewDraft(false);
    setViewEditMultipleAdsetDataDrawerVisible(false);
    setViewCloneMultipleAdsetDataDrawerVisible(false);
    setSelectedEditMultipleAdsetData(null);
    setSelectedCloneMultipleAdsetData(null);
  };

  useEffect(() => {
    if (userdetails?.adAccounts) {
      const adAccountOptions = Object.keys(userdetails?.adAccounts).map(
        (key) => ({
          value: key,
          label: key,
        })
      );
      setOptions(adAccountOptions);
    }
  }, []);

  // Populate value options in the second dropdown based on selected key
  // useEffect(() => {
  //     if (userdetails) {
  //         const values = userdetails?.adAccounts[selectedKey] || [];
  //         setValueOptions(values.map(value => ({
  //             value,
  //             label: value
  //         })));
  //     } else {
  //         setValueOptions([]);
  //     }
  // }, [selectedKey]);
  useEffect(() => {
    if (selectedKey && userdetails?.adAccounts) {
      // Mapping over the accounts based on the selected key
      const accountNumbers = userdetails.adAccounts[selectedKey]?.map(
        (account) => ({
          value: account.accountNumber, // Set value as accountNumber
          label: account.accountNumber, // Set label as accountNumber
          accountName: account.accountName, // Include accountName for conditional rendering
          status: account.status,
        })
      );
      setValueOptions(accountNumbers); // Update valueOptions with account numbers
    } else {
      setValueOptions([]);
    }
  }, [selectedKey, userdetails]);

  // Fetch campaign data based on selected value
  // const fetchData = async (accountNumber = null) => {
  //     setLoading(true);
  //     setError(null);
  //     try {
  //         const response = await axios.get(`https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}`, {
  //             headers: {
  //                 'Authorization': localStorage.getItem("token"),
  //             }
  //         });
  //         const allCampaigns = response?.data;

  //         // Filter campaigns based on selected value && accountNumber !== 'All'
  //         const filteredCampaignData = accountNumber
  //             ? allCampaigns.filter(campaign => cam/api/getpaign.Account_Number === accountNumber)
  //             : allCampaigns.filter(campaign => userdetails?.adAccounts[selectedKey]?.includes(campaign.Account_Number));

  //         setcreatecamselectedacc(accountNumber)

  //         setCampaignData(filteredCampaignData);
  //     } catch (error) {
  //         console.error("Error fetching campaign list:", error);
  //         setError("Failed to fetch campaign data.");
  //     } finally {
  //         setLoading(false);
  //     }
  // };

  //Commented the api 2026-05-22
  // const fetchData = async (
  //   accountNumber = null,
  //   start = startDate,
  //   end = endDate,
  //   search = ""
  // ) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     // Construct URL with optional startDate and endDate
  //     //https://www.testapi.adsgoat.in
  //     let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;

  //     if (start && end) {
  //       url += `&startDate=${start}&endDate=${end}`;
  //     }
  //     if (search) {
  //       url += `&searchInput=${search}`; // Append search input if provided
  //     }
  //     console.log("Fetching data from URL:", url);

  //     const response = await axios.get(url, {
  //       headers: {
  //         Authorization: localStorage.getItem("token"),
  //       },
  //     });
  //     const allCampaigns = response?.data;

  //     // Filter campaigns based on selected value && accountNumber !== 'All'
  //     const filteredCampaignData = accountNumber
  //       ? allCampaigns.filter(
  //         (campaign) => campaign.Account_Number === accountNumber
  //       )
  //       : allCampaigns.filter((campaign) =>
  //         userdetails?.adAccounts[selectedKey]?.includes(
  //           campaign.Account_Number
  //         )
  //       );

  //     setcreatecamselectedacc(accountNumber);

  //     setCampaignData(allCampaigns);
  //   } catch (error) {
  //     console.error("Error fetching campaign data:", error);
  //     setError("Failed to fetch campaign data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchMultipleAdsetCampaigns = async (
    accountNumber = null,
    start = startDate,
    end = endDate,
    search = ""
  ) => {
    setLoadingForMultipleAdsets(true);
    setError(null);
    try {
      // Construct URL with optional startDate and endDate
      //https://www.testapi.adsgoat.in
      // let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      //commneted 2026-05-22
      // let url = `https://www.testapi.adsgoat.in/api/newGetFormDatanew?accountNumber=${accountNumber}&network=${selectedKey}`;
      let url = `https://fblaunching.vyaktimetrics.com/open/campaigns/list?accountNumber=${accountNumber}&network=${selectedKey}`;
      if (start && end) {
        url += `&startDate=${start}&endDate=${end}`;
      }
      if (search) {
        url += `&searchInput=${search}`; // Append search input if provided
      }
      // console.log("Fetching data from URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const allCampaigns = response?.data?.data;

      // console.log(allCampaigns, "all multiple adset campaigns");

      // Filter campaigns based on selected value && accountNumber !== 'All'
      const filteredCampaignData = accountNumber
        ? allCampaigns.filter(
          (campaign) => campaign.Account_Number === accountNumber
        )
        : allCampaigns.filter((campaign) =>
          userdetails?.adAccounts[selectedKey]?.includes(
            campaign.Account_Number
          )
        );

      setcreatecamselectedacc(accountNumber);

      // console.log(filteredCampaignData, "multiple adset campaigns");
      setMultipleAdsetCampaignData(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    } finally {
      setLoadingForMultipleAdsets(false);
    }
  };

  const fetchLauncherComments = async (
    accountNumber = null,
  ) => {
    // setLoadingForMultipleAdsets(true);
    // setError(null);
    try {
      // Construct URL with optional startDate and endDate
      //https://www.testapi.adsgoat.in
      // let url = `https://www.testapi.adsgoat.in/api/getFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      // let url = `https://www.testapi.adsgoat.in/api/newGetFormData?accountNumber=${accountNumber}&network=${selectedKey}`;
      // if (start && end) {
      //   url += `&startDate=${start}&endDate=${end}`;
      // }
      // if (search) {
      //   url += `&searchInput=${search}`; // Append search input if provided
      // }
      // console.log("Fetching data from URL:", url);

      //commneted 2026-05-22
      // const url = `https://www.testapi.adsgoat.in/api/GetCommentsForCampaignLauncher?accountNumber=${accountNumber}`
      const url = `https://fblaunching.vyaktimetrics.com/open/launcher-comments/campaigns?accountNumber=${accountNumber}`

      const response = await axios.get(url, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });
      const allCampaigns = response?.data;

      // console.log(allCampaigns, "all multiple adset campaigns");
      setLauncherComments(allCampaigns);

      // console.log(filteredCampaignData, "multiple adset campaigns");

      // // setMultipleAdsetCampaignData(filteredCampaignData);
      // setMultipleAdsetCampaignData(allCampaigns);
    } catch (error) {
      console.error("Error fetching campaign data:", error);
      setError("Failed to fetch campaign data.");
    }
  };

  //commented 2026-05-22
  // const fetchDrafts = async () => {
  //   setDraftsLoading(true);
  //   // setError(null);
  //   try {
  //     //https://www.testapi.adsgoat.in
  //     const response = await axios.get(
  //       `https://www.testapi.adsgoat.in/api/drafts?email=${userdetails?.email}`,
  //       {
  //         headers: {
  //           Authorization: localStorage.getItem("token"),
  //         },
  //       }
  //     );
  //     const allDrafts = response?.data;

  //     // Filter drafts based on selected value && accountNumber !== 'All'
  //     // const filteredDraftsData = allDrafts.filter(draft => userdetails?.adAccounts[selectedKey]?.includes(draft.Account_Number));

  //     setDraftsData(allDrafts);
  //   } catch (error) {
  //     console.error("Error fetching draft data:", error);
  //     setError("Failed to fetch draft data.");
  //   }
  // };
  const fetchAccountDetails = async (accounts) => {
    try {
      const token = localStorage.getItem("token");
      const formattedAccounts = Array.isArray(accounts)
        ? accounts
        : [accounts];

      const response = await fetch("https://fblaunching.vyaktimetrics.com/open/account-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({
          accounts: formattedAccounts,
        }),
      });

      const data = await response.json();
      if (!response.ok) return;
      const totalBalance = data.data
        .filter(item => item.success)
        .reduce((sum, item) => sum + Number(item.data.balance), 0);

      const totalRemaining = data.data
        .filter(item => item.success)
        .reduce((sum, item) => sum + Number(item.data.remaining_amount), 0);

      setAccountBalance(totalBalance);
      setAccountRemaining(totalRemaining)

    } catch (error) {
      console.error("Error fetching account details:", error);
    }
  };
  // Handle date range change
  const handleChange = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      // const formattedStart = start.format("YYYY-MM-DD");
      // const formattedEnd = end.format("YYYY-MM-DD");

      // setStartDate(formattedStart);
      // setEndDate(formattedEnd);

      // if (selectedValue) {
      //   fetchData(selectedValue, formattedStart, formattedEnd);
      //   fetchMultipleAdsetCampaigns(
      //     selectedValue,
      //     formattedStart,
      //     formattedEnd
      //   );
      // }
      setStartDate(start.format("YYYY-MM-DD"));
      setEndDate(end.format("YYYY-MM-DD"));
    }
  };

  const handleChangeDatesForPredictoAds = (dates) => {
    if (dates && dates.length === 2) {
      const [start, end] = dates;
      // const formattedStart = start.format("YYYY-MM-DD");
      // const formattedEnd = end.format("YYYY-MM-DD");

      // setStartDate(formattedStart);
      // setEndDate(formattedEnd);

      // if (selectedValue) {
      //   fetchData(selectedValue, formattedStart, formattedEnd);
      //   fetchMultipleAdsetCampaigns(
      //     selectedValue,
      //     formattedStart,
      //     formattedEnd
      //   );
      // }
      setStartDateForAds(start.format("YYYY-MM-DD"));
      setEndDateForAds(end.format("YYYY-MM-DD"));
    }
  };

  const allowFetchOnSelectRef = useRef(false);
  const handleCloneKeyChange = (value) => {
    setCloneSelectedKey(value);

    setShowPredictoadStatus(false);
    setShowTaboolaStatus(false);
    setShowPredictoKeywordStatus(false);
    // If changing network should clear selected accounts
    setCloneSelectedValue([]);
  };

  const handleCloneSearch = (value) => {
    setCloneSearchText(value);
  };

  const handleCloneDropdownVisibleChange = (open) => {
    setCloneIsOpen(open);
  };

  const closeCloneModal = () => {
    setIsCloneModalOpen(false);

    setCloneSelectedKey(undefined);
    setCloneSelectedValue([]);
    setCloneSearchText("");
    setCloneIsOpen(false);
  };
  const handleKeyChange = (key) => {
    setSelectedKey(key);
    setSelectedValue([]);
    setShowPredictoadStatus(false);
    setShowTaboolaStatus(false);
    setShowPredictoKeywordStatus(false);
  };

  const handleValueChange = (value) => {
    setSelectedValue(value);
    allowFetchOnSelectRef.current = false;
  };

  const handleApply = () => {
    if (selectedValue && startDate && endDate) {
      // fetchData(selectedValue, startDate, endDate);
      campaignIdFromUrl === searchInput && setSearchInput("");
      fetchLauncherComments(selectedValue);
      fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
      setAccountChanged(false);

      allowFetchOnSelectRef.current = true;
    } else {
      message.warning("Please select project, account and date range");
    }
  };
  const handleAccountBalance = () => {
    if (selectedValue) {
      fetchAccountDetails(selectedValue);
    }
    else {
      message.warning("Please select project, account and date range");
    }
  }

  // useEffect(() => {
  //   if (!selectedValue || !startDate || !endDate) return;
  //   fetchData(selectedValue, startDate, endDate);
  // }, [refrst]);

  // useEffect(() => {
  //   if (!selectedValue || !startDate || !endDate) return;
  //   if (!allowFetchOnSelectRef.current) return;
  //   fetchData(selectedValue, startDate, endDate);

  //   allowFetchOnSelectRef.current = false;
  // }, [selectedValue]);

  useEffect(() => {
    if (!selectedValue || !startDate || !endDate) return;
    if (!allowFetchOnSelectRef.current) return;
    // fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
    allowFetchOnSelectRef.current = false;
  }, [selectedValue]);
  // useEffect(() => {
  //   if (!selectedValue || !startDate || !endDate) return;
  //   fetchLauncherComments(selectedValue);
  //   fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
  // }, [refrst]);

  useEffect(() => {
    if (!selectedKey || !selectedValue || !startDate || !endDate) return;

    fetchLauncherComments(selectedValue);

    fetchMultipleAdsetCampaigns(
      selectedValue,
      startDate,
      endDate,
      searchInput || ""
    );

  }, [refrst]);

  // Handle value change
  // const handleValueChange = (value) => {
  //   setSelectedValue(value);
  //   // fetchData(value); // Fetch data based on selected value
  //   // fetchMultipleAdsetCampaigns(value); // Fetch multiple adset campaigns based on selected value
  // };
  // const handleApply = () => {
  //   if (selectedValue && startDate && endDate) {
  //     fetchData(selectedValue, startDate, endDate);
  //     fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate);
  //   } else {
  //     message.warning({
  //       content: "Please select project, account and date range",
  //       className: theme === "dark" ? "dark-message" : ""
  //     });
  //   }
  // };

  // useEffect(() => {
  //   if (selectedValue) {
  //     fetchData(selectedValue);
  //   }
  // }, [refrst, selectedValue]);

  // useEffect(() => {
  //   if (selectedValue) {
  //     fetchMultipleAdsetCampaigns(selectedValue);
  //   }
  // }, [refrst, selectedValue]);

  //commented 2026-05-22

  // useEffect(() => {
  //   if (draftsLoading) {
  //     fetchDrafts();
  //   }
  // }, [draftsLoading]);

  const handleRefresh = () => {
    if (selectedValue) {
      // fetchData(selectedValue);
      fetchLauncherComments(selectedValue);
      fetchMultipleAdsetCampaigns(selectedValue);
    } // This will re-fetch the data or update the component
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setPaginationSize(8);
      } else if (window.innerWidth < 2560) {
        setPaginationSize(100);
      } else {
        setPaginationSize(100);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchInput(searchValue);
    // console.log("Search Input:", searchValue);
    if (!searchValue) {
      setSendInputToApi("");
      // fetchData(selectedValue, startDate, endDate, searchValue);
      fetchMultipleAdsetCampaigns(
        selectedValue,
        startDate,
        endDate,
        searchValue
      );
      // console.log("Search Input is empty, resetting filtered data");
    }
    // const filtered = campaignData.filter((item) =>
    //     Object.values(item).some((field) =>
    //         typeof field === 'string' && field.toLowerCase().includes(searchValue)
    //     )
    // );
    // setFilteredData(filtered);
  };
  const handleSearchPredictoAds = (e) => {
    const searchValue = (e.target.value);
    if (!searchValue) {
      setSearchAdId("")
      setPredictoAdPoliciesAppliedSearch([])
      return;
    }
    const searchArray = searchValue.split(",").map(item => item.trim()).filter(Boolean);
    setSearchAdId(searchValue)
    setPredictoAdPoliciesAppliedSearch(searchArray)
  }
  const handleSearchSubmit = () => {
    setSendInputToApi(searchInput);
    // fetchData(selectedValue, startDate, endDate, searchInput); // Fetch data with search input
    fetchMultipleAdsetCampaigns(selectedValue, startDate, endDate, searchInput); // Fetch multiple adset campaigns with search input
    // console.log("Search Input:", searchInput);
    // console.log("Selected Input:", searchInput.length);
  };

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [useaproval, setuseraproval] = useState(null);
  const [isModalVisibleForAdsets, setIsModalVisibleForAdsets] = useState(false);
  const [useaprovalForAdsets, setuseraprovalForAdsets] = useState(null);
  const [userdisaprovalForAdsets, setuserdisaprovalForAdsets] = useState(null);
  const [isModalVisibleForAdsetsdisapprove, setIsModalVisibleForAdsetsdisapprove] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [rejectedReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  //commented 2026-05-22
  // const handleUpdateApproval = async (id, newApprovalValue) => {
  //   try {
  //     const response = await fetch(
  //       `https://www.testapi.adsgoat.in/api/updateApproval/${id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: localStorage.getItem("token"),
  //         },
  //         body: JSON.stringify({
  //           Approval: newApprovalValue, // New approval value
  //           Approved: userdetails?.userName, // Username of the person who approved it
  //           datetime: moment()
  //             .tz("Asia/Kolkata")
  //             .format("YYYY-MM-DD HH:mm [IST]"), // Current datetime in IST
  //         }),
  //       }
  //     );

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log(data);
  //       setCampaignData((prevData) =>
  //         prevData.map((record) =>
  //           record.identifier === id
  //             ? { ...record, Approval: newApprovalValue }
  //             : record
  //         )
  //       );

  //       message.open({
  //         type: 'success',
  //         content: "Approval confirmed",
  //         className: theme === 'dark' ? 'dark-message' : '',
  //       });

  //       setIsModalVisible(false); // Close modal after updating
  //       changeRRefrst();
  //       // setTimeout(() => {
  //       //     window.location.reload();
  //       // }, 2000);
  //     } else {
  //       console.error("Failed to update approval");
  //       // Handle failure
  //     }
  //   } catch (error) {
  //     console.error("Error updating approval:", error);
  //     // Handle error
  //   }
  // };

  const handleUpdateApprovalForAdsets = async (id, newApprovalValue) => {
    try {
      //https://www.testapi.adsgoat.in
      const dateAndTimeOfCampaignApproval = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm [IST]");
      const response = await fetch(
        // `https://www.testapi.adsgoat.in/api/newupdateApprovalnew/${id}`
        `https://fblaunching.vyaktimetrics.com/open/approval/campaign/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            Approval: newApprovalValue, // New approval value
            Approved: userdetails?.userName, // Username of the person who approved it
            datetime: dateAndTimeOfCampaignApproval, // Current datetime in IST
          }),
        }
      );

      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        // setCampaignData((prevData) =>
        //   prevData.map((record) =>
        //     record.identifier === id
        //       ? { ...record, Approval: newApprovalValue }
        //       : record
        //   )
        // );
        setMultipleAdsetCampaignData((prev) =>
          prev.map((item) => {
            if (item.identifier === id) {
              return {
                ...item,
                Approval: newApprovalValue,
                Approvedby: userdetails?.userName,
                Approveddate: dateAndTimeOfCampaignApproval,
              };
            }

            return item;
          })
        );

        message.open({
          type: 'success',
          content: "Approval confirmed",
          className: theme === 'dark' ? 'dark-message' : '',
        });
        setIsModalVisible(false); // Close modal after updating
        // changeRRefrst();
        // setTimeout(() => {
        //     window.location.reload();
        // }, 2000);
      } else {
        console.error("Failed to update approval");
        // Handle failure
      }
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };
  const handleUpdateDisapprovalForAdsets = async (id) => {
    try {
      const dateAndTimeOfCampaignRejection = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm [IST]")
      const response = await fetch(
        // `https://www.testapi.adsgoat.in/api/newupdateDisapproval/${id}`,
        `https://fblaunching.vyaktimetrics.com/open/reject/campaign/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token"),
          },
          body: JSON.stringify({
            reason: rejectedReason,
            RejectedBy: userdetails?.userName,
            datetime: dateAndTimeOfCampaignRejection,
          }),
        }
      );

      if (response.ok) {
        // const data = await response.json();
        // console.log(data);
        // setCampaignData((prevData) =>
        //   prevData.map((record) =>
        //     record.identifier === id
        //       ? {
        //         ...record,
        //         Approval: "Rejected",
        //         // RejectedBy: userdetails?.userName,
        //         // RejectedDate: moment().format("YYYY-MM-DD HH:mm"),
        //       }
        //       : record
        //   )
        // );
        setMultipleAdsetCampaignData((prev) => prev.map(item => {
          if (item.identifier === id) {
            return ({ ...item, Approval: "Rejected", rejectionReason: rejectedReason, RejectedBy: userdetails?.userName, RejectedDate: dateAndTimeOfCampaignRejection })
          }
          return item;
        }))
        message.open({
          type: "success",
          content: "Disapproval confirmed",
          className: theme === "dark" ? "dark-message" : "",
        });

        setIsModalVisibleForAdsetsdisapprove(false);
        // changeRRefrst();

      } else {
        console.error("Failed to update disapproval");
      }
    } catch (error) {
      console.error("Error updating disapproval:", error);
    }
  };
  const handleApproval = (record) => {
    // console.log(record, "record");
    setuseraproval(record);
    setIsModalVisible(true);
  };

  const handleApprovalforAdsets = (record) => {
    // console.log(record, "record");
    setuseraprovalForAdsets(record);
    setIsModalVisibleForAdsets(true);
  };
  const handledisApprovalforAdsets = (record) => {
    // console.log(record, "record");
    setuserdisaprovalForAdsets(record);
    setIsModalVisibleForAdsetsdisapprove(true);
  };

  const handleOk = async () => {
    try {
      // Call the handleUpdateApproval function with the appropriate parameters
      await handleUpdateApproval(useaproval.identifier, "Approved");
      // Log the message to the console
      // console.log("Approval confirmed");
      // Close the modal
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };

  const handleOkForAdsets = async () => {
    try {
      // Call the handleUpdateApproval function with the appropriate parameters
      await handleUpdateApprovalForAdsets(
        useaprovalForAdsets.identifier,
        "Approved"
      );
      // Log the message to the console
      // console.log(userdetails?.role, "AAAAAApproval confirmed");

      if (userdetails?.role === "Network_Partner") {
        await onToggleStatusForMultipleAdsets(useaprovalForAdsets, "ACTIVE");
      }

      setIsModalVisibleForAdsets(false);
    } catch (error) {
      console.error("Error updating approval:", error);
      // Handle error
    }
  };
  const handleOkForAdsetsdisapprove = async () => {
    try {
      if (!userdisaprovalForAdsets) return;
      if (!rejectedReason?.trim()) {
        setReasonError("Rejection reason is required");
        return;
      }

      await handleUpdateDisapprovalForAdsets(
        userdisaprovalForAdsets.identifier
      );
      await fetchLauncherComments(selectedValue)
      setIsModalVisibleForAdsetsdisapprove(false);
      setuserdisaprovalForAdsets(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error updating disapproval:", error);
    }
  };

  //commented 2026-05-22
  // const handleOkDeleteDraft = async () => {
  //   try {
  //     const response = await axios.delete(
  //       `https://www.testapi.adsgoat.in/api/drafts/${encodeURIComponent(
  //         userdetails.email
  //       )}/${deleteDraftId}`,
  //       {
  //         headers: {
  //           Authorization: localStorage.getItem("token"),
  //         },
  //       }
  //     );
  //     if (response.status === 200) {
  //       message.success("Draft deleted successfully");
  //       setDeleteModalVisible(false);
  //       changeDraftRefresh();
  //     }
  //   } catch (error) {
  //     console.error("Error deleting draft:", error);
  //     message.error("Failed to delete draft");
  //   }
  // };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  //commented 2026-05-22
  // const onToggleStatus = async (record, checked) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     console.log("hello siddu", record, checked);

  //     // Update status on your backend
  //     const backendResponse = await fetch(
  //       `https://www.testapi.adsgoat.in/api/status/${record?.identifier}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: token,
  //         },
  //         body: JSON.stringify({ Status: checked ? "ACTIVE" : "PAUSED" }),
  //       }
  //     );

  //     const responseData = await backendResponse.json();
  //     setCampaignData((prevCampaigns) =>
  //       prevCampaigns.map((campaign) =>
  //         campaign.identifier === record.identifier
  //           ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
  //           : campaign
  //       )
  //     );
  //     console.log("Backend response status:", backendResponse.status);
  //     console.log("Backend response data:", responseData);

  //     if (backendResponse.ok) {
  //       // If campaignId is available, update the Facebook campaign status
  //       if (record.campaignid) {
  //         try {
  //           const fbResponse = await axios.post(
  //             `https://graph.facebook.com/v22.0/${record.campaignid}`,
  //             null,
  //             {
  //               params: {
  //                 status: checked ? "ACTIVE" : "PAUSED",
  //                 access_token: record.access_token,
  //               },
  //               headers: {
  //                 "Content-Type": "application/json",
  //               },
  //             }
  //           );

  //           console.log("Facebook API response:", fbResponse.data);

  //           if (fbResponse.status === 200) {
  //             if (fbResponse.data?.success === true) {
  //               var mains = "Launched";
  //             } else {
  //               var mains = "PAUSE";
  //             }
  //             message.open({
  //               type: 'success',
  //               content: `Campaign ${checked ? "Launched" : "Paused"} Successfully`,
  //               className: theme === 'dark' ? 'dark-message' : '',
  //             });

  //             // Update the state to reflect the change in UI
  //             setCampaignData((prevCampaigns) =>
  //               prevCampaigns.map((campaign) =>
  //                 campaign.identifier === record.identifier
  //                   ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
  //                   : campaign
  //               )
  //             );
  //           } else {
  //             console.error(
  //               "Failed to update facebook status:",
  //               fbResponse.data
  //             );
  //             message.error(
  //               `Failed to update facebook status: ${fbResponse.data.error.message}`
  //             );
  //           }
  //         } catch (fbError) {
  //           console.error("Error updating facebook status:", fbError);
  //           message.error(
  //             `Error updating facebook status: ${fbError.response?.data?.error?.message || fbError.message
  //             }`
  //           );
  //         }
  //       } else {
  //         // If no campaignId is available, only update the backend
  //         message.open({
  //           type: 'success',
  //           content: "Campaign launched successfully",
  //           className: theme === 'dark' ? 'dark-message' : '',
  //         });
  //         // Update the state to reflect the change in UI
  //         setCampaignData((prevCampaigns) =>
  //           prevCampaigns.map((campaign) =>
  //             campaign.identifier === record.identifier
  //               ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
  //               : campaign
  //           )
  //         );
  //       }
  //     } else {
  //       console.error("Failed to update backend status:", responseData);
  //       message.error(
  //         `Failed to update status: ${responseData.message || "Unknown error"}`
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     message.error("Error updating status");
  //   }
  // };
  const handleCloneSubmit = async () => {
    if (!cloneCampaigns?.length) {
      message.warning("Please select at least one campaign");
      return;
    }

    if (!cloneSelectedValue?.length) {
      message.warning("Please select at least one account");
      return;
    }

    try {
      setCloneLoading(true);

      console.log("=================================");
      console.log("FULL CAMPAIGNS:", cloneCampaigns);
      console.log("TARGET ACCOUNTS:", cloneSelectedValue);
      console.log(
        "TOTAL CAMPAIGNS:",
        cloneCampaigns.length * cloneSelectedValue.length
      );
      console.log("=================================");

      const response = await axios.post(
        "https://fblaunching.vyaktimetrics.com/open/campaigns/cloneMutlipeCampaigns",
        {
          campaigns: cloneCampaigns,
          accountNumbers: cloneSelectedValue,
          username:userdetails?.userName
        },
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("CLONE RESPONSE:", response?.data);

      message.success(
        response?.data?.message ||
        "Campaigns cloned successfully"
      );

      setIsCloneModalOpen(false);

      setCloneSelectedValue([]);
      setCloneSelectedKey(undefined);
      setCloneSearchText("");

    } catch (error) {
      console.error(
        "Clone campaign error:",
        error?.response?.data || error
      );

      message.error(
        error?.response?.data?.message ||
        "Failed to clone campaigns"
      );
    } finally {
      setCloneLoading(false);
    }
  };

  const onToggleStatusForMultipleAdsets = async (record, checked) => {
    try {
      const token = localStorage.getItem("token");
      const username = userdetails.userName;
      // console.log("Tokensssssssssssssssssssssssss:", token);

      // Update status on your backend https://www.testapi.adsgoat.in
      const backendResponse = await fetch(
        // `https://www.testapi.adsgoat.in/api/newstatusnew/${record?.identifier}`,
        `https://fblaunching.vyaktimetrics.com/campaigns/status/${record?.identifier}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ Status: checked ? "ACTIVE" : "PAUSED", username: username }),
        }
      );

      const responseData = await backendResponse.json();
      setMultipleAdsetCampaignData((prevCampaigns) =>
        prevCampaigns.map((campaign) =>
          campaign.identifier === record.identifier
            ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
            : campaign
        )
      );
      // console.log("Backend response status:", backendResponse.status);
      // console.log("Backend response data:", responseData);

      if (backendResponse.ok) {
        if (record.campaignid) {
          try {
            const fbResponse = await axios.post(
              `https://graph.facebook.com/v22.0/${record.campaignid}`,
              null,
              {
                params: {
                  status: checked ? "ACTIVE" : "PAUSED",
                  access_token: record.access_token,
                },
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );

            // console.log("Facebook API response:", fbResponse.data);

            if (fbResponse.status === 200) {
              if (fbResponse.data?.success === true) {
                var mains = "Launched";
              } else {
                var mains = "PAUSE";
              }
              message.open({
                type: 'success',
                content: `Campaign ${checked ? "Launched" : "Paused"} Successfully`,
                className: theme === 'dark' ? 'dark-message' : '',
              });

              // Update the state to reflect the change in UI
              setCampaignData((prevCampaigns) =>
                prevCampaigns.map((campaign) =>
                  campaign.identifier === record.identifier
                    ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                    : campaign
                )
              );
            } else {
              console.error(
                "Failed to update facebook status:",
                fbResponse.data
              );
              message.error(
                `Failed to update facebook status: ${fbResponse.data.error.message}`
              );
            }
          } catch (fbError) {
            console.error("Error updating facebook status:", fbError);
            message.error(
              `Error updating facebook status: ${fbError.response?.data?.error?.message || fbError.message
              }`
            );
          }
        } else {
          // If no campaignId is available, only update the backend
          message.open({
            type: 'success',
            content: "Campaign launched successfully",
            className: theme === 'dark' ? 'dark-message' : '',
          });

          // Update the state to reflect the change in UI
          setCampaignData((prevCampaigns) =>
            prevCampaigns.map((campaign) =>
              campaign.identifier === record.identifier
                ? { ...campaign, Status: checked ? "ACTIVE" : "PAUSED" }
                : campaign
            )
          );
        }
      } else {
        console.error("Failed to update backend status:", responseData);
        message.error(
          `Failed to update status: ${responseData.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Error updating status");
    }
  };
  const EditableFieldForMultpleAdsets = ({
    value,
    record,
    dataIndex,
    updateTableRow,
    changeRRefrst,
  }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleEdit = () => {
      setEditing(true);
    };

    const handleSave = async () => {
      if (record && inputValue) {
        try {
          const budgets = inputValue * 100; // Convert input value to the required format (cents)
          const username = userdetails?.userName;
          const campaignname = record?.campaign_name;
          const Account = record?.Account_Number;
          const BudgetType = record?.budgetType;

          // Step 1: Update the daily budget in your backend https://www.testapi.adsgoat.in
          const response = await fetch(
            // `https://www.testapi.adsgoat.in/api/newdailyBudgetnew/${record?.identifier}`,
            `https://fblaunching.vyaktimetrics.com/campaigns/budget/${record?.identifier}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: localStorage.getItem("token"),
              },
              body: JSON.stringify({ Daily_amount: budgets, username: username, campaignname: campaignname, Account: Account, BugetType: BudgetType }),
            }
          );

          if (response.ok) {
            // console.log("Daily amount updated successfully in backend");
            // console.log(record, "budget")

            // Step 2: If campaignId is available, update the budget on Facebook
            if (record.campaignid) {
              const budgetParams = {
                access_token: record.access_token,
                ...(BudgetType === "daily" && { daily_budget: budgets }),
                ...(BudgetType === "lifetime" && { lifetime_budget: budgets }),
              };
              try {
                const fbResponse = await axios.post(
                  `https://graph.facebook.com/v22.0/${record.campaignid}`,
                  null,
                  {
                    // params: {
                    //   daily_budget: budgets,
                    //   access_token: record.access_token,
                    // },
                    params: budgetParams,
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                if (fbResponse.status === 200) {
                  // console.log("Daily budget updated successfully on Facebook");
                  message.open({
                    type: 'success',
                    content: `${BudgetType} amount updated successfully on both backend and Facebook`,
                    className: theme === 'dark' ? 'dark-message' : '',
                  });

                  // Update the table row data with the new daily amount
                  updateTableRow({ ...record, Daily_amount: budgets });

                  // Trigger a refresh or any other necessary updates
                  changeRRefrst();
                } else {
                  console.error("Failed to update daily amount on Facebook");
                  // message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
                }
              } catch (fbError) {
                console.error(
                  "Error updating daily amount on Facebook:",
                  fbError
                );
                // message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
              }
            } else {
              // If no campaignId, just update the backend
              message.open({
                type: 'success',
                content: "Daily amount updated successfully ",
                className: theme === 'dark' ? 'dark-message' : '',
              })

              // Update the table row data with the new daily amount
              updateTableRow({ ...record, Daily_amount: budgets });

              // Trigger a refresh or any other necessary updates
              changeRRefrst();
            }
          } else {
            console.error("Failed to update daily amount in backend");
            message.error("Failed to update daily amount in backend");
          }
        } catch (error) {
          console.error("Error updating daily amount:", error);
          message.error("Error updating daily amount");
        }
      }

      setEditing(false);
    };

    return (
      <div>
        {editing ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onPressEnter={handleSave}
            onBlur={handleSave}
            autoFocus
            className={
              theme === "dark" ? "custom-input-dark" : "custom-input-light"
            }
          />
        ) : (
          value !== 0 &&
          value !== "" && (
            <div
              onClick={handleEdit}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DollarOutlined className="custom-dollar-icon" />
              <span style={{ color: "#1890ff" }}>{value}</span>
              <span style={{ marginLeft: "5px" }}>{record.budgetType}</span>
              {/* <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} /> */}
            </div>
          )
        )}
      </div>
    );
  };
  const EditableField = ({
    value,
    record,
    dataIndex,
    updateTableRow,
    changeRRefrst,
  }) => {
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value);

    const handleInputChange = (e) => {
      setInputValue(e.target.value);
    };

    const handleEdit = () => {
      setEditing(true);
    };
    //commented 2026-05-22
    // const handleSave = async () => {
    //   if (record && inputValue) {
    //     try {
    //       const budgets = inputValue * 100; // Convert input value to the required format (cents)

    //       // Step 1: Update the daily budget in your backend
    //       const response = await fetch(
    //         `https://www.testapi.adsgoat.in/api/dailyBudget/${record?.identifier}`,
    //         {
    //           method: "PUT",
    //           headers: {
    //             "Content-Type": "application/json",
    //             Authorization: localStorage.getItem("token"),
    //           },
    //           body: JSON.stringify({ Daily_amount: budgets }),
    //         }
    //       );

    //       if (response.ok) {
    //         console.log("Daily amount updated successfully in backend");

    //         // Step 2: If campaignId is available, update the budget on Facebook
    //         if (record.campaignid) {
    //           try {
    //             const fbResponse = await axios.post(
    //               `https://graph.facebook.com/v22.0/${record.campaignid}`,
    //               null,
    //               {
    //                 params: {
    //                   daily_budget: budgets,
    //                   access_token: record.access_token,
    //                 },
    //                 headers: {
    //                   "Content-Type": "application/json",
    //                 },
    //               }
    //             );

    //             if (fbResponse.status === 200) {
    //               console.log("Daily budget updated successfully on Facebook");
    //               message.open({
    //                 type: 'success',
    //                 content: "Daily amount updated successfully on both backend and Facebook",
    //                 className: theme === 'dark' ? 'dark-message' : '',
    //               })
    //               // Update the table row data with the new daily amount
    //               updateTableRow({ ...record, Daily_amount: budgets });

    //               // Trigger a refresh or any other necessary updates
    //               changeRRefrst();
    //             } else {
    //               console.error("Failed to update daily amount on Facebook");
    //               // message.error(`Failed to update daily amount on Facebook: ${fbResponse.data.error.message}`);
    //             }
    //           } catch (fbError) {
    //             console.error(
    //               "Error updating daily amount on Facebook:",
    //               fbError
    //             );
    //             // message.error(`Error updating daily amount on Facebook: ${fbError.response?.data?.error?.message || fbError.message}`);
    //           }
    //         } else {
    //           // If no campaignId, just update the backend
    //           message.open({
    //             type: 'success',
    //             content: "Daily amount updated successfully",
    //             className: theme === 'dark' ? 'dark-message' : '',
    //           })

    //           // Update the table row data with the new daily amount
    //           updateTableRow({ ...record, Daily_amount: budgets });

    //           // Trigger a refresh or any other necessary updates
    //           changeRRefrst();
    //         }
    //       } else {
    //         console.error("Failed to update daily amount in backend");
    //         message.error("Failed to update daily amount in backend");
    //       }
    //     } catch (error) {
    //       console.error("Error updating daily amount:", error);
    //       message.error("Error updating daily amount");
    //     }
    //   }

    //   setEditing(false);
    // };

    return (
      <div>
        {editing ? (
          <Input
            value={inputValue}
            onChange={handleInputChange}
            // onPressEnter={handleSave}
            // onBlur={handleSave}
            autoFocus
            className={
              theme === "dark" ? "custom-input-dark" : "custom-input-light"
            }
          />
        ) : (
          value !== 0 &&
          value !== "" && (
            <div
              onClick={handleEdit}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DollarOutlined className="custom-dollar-icon" />
              <span style={{ color: "#1890ff" }}>{value}</span>
              <span style={{ marginLeft: "5px" }}>{record.budgetType}</span>
              {/* <EditOutlined style={{ marginLeft: "5px", cursor: "pointer" }} /> */}
            </div>
          )
        )}
      </div>
    );
  };

  const updateTablebudget = (updatedRecord) => {
    setCampaignData((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.identifier === updatedRecord.identifier
          ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
          : campaign
      )
    );
  };

  const updateTablebudgetforAdsests = (updatedRecord) => {
    setMultipleAdsetCampaignData((prevCampaigns) =>
      prevCampaigns.map((campaign) =>
        campaign.identifier === updatedRecord.identifier
          ? { ...campaign, Daily_amount: updatedRecord.Daily_amount }
          : campaign
      )
    );
  };

  const duplicatenewcampaign = (record) => {
    // console.log(record, "duplicate camapaign");
    setDrawerVisible(true);
    setdupDrawerVisible(true);
    setduplicatenewcampaigns(record);
  };
  const newtworkCollections = {
    FB_Mnet: "Facebook_Mnet",
    FB_MnetBing: "Facebook_MnetBing",
    FB_Enki: "Facebook_Enki",
    FB_System1: "Facebook_System1",
    FB_Rsoc: "Facebook_Rsoc",
    FB_Tonic: "Facebook_Tonic",
    FB_DomainActive: "Facebook_DomainActive",
    FB_Bodies: "Facebook_Bodies",
    FB_Bodies1: "Facebook_Bodies1",
    Newsbreak_DA: "Newsbreak_DomainActive",
  };
  const filteredCampaigns = filteredMultipleAdsetCampaigns;

  const handleEditClickMultipleAdsetData = (record, status) => {
    // console.log(record, "viewdata campaign")
    setSelectedEditMultipleAdsetData(record);
    setViewEditMultipleAdsetDataDrawerVisible(true);
    setView(status);
  };

  const handleCloneClickMultipleAdsetData = async (record, status) => {
    // console.log(record, "viewdata campaign")
    const limit = await getTheCampaignLimit();
    if (limit.data.remainingCount > 0 || limit.data.remainingCount === "No_Limit") {
      // setDrawerVisible(true);
      // setdupDrawerVisible(true);
      // setduplicatenewcampaigns(record);
      if (limit.data.remainingCount !== "No_Limit" && limit.data.remainingCount <= 10) {
        // message.warning(`Campaign launch limit is nearly reached. Only ${limit.data.remainingCount} campaign launches remaining.`)
        message.open({
          type: "warning",
          content: `Campaign launch limit is nearly reached. Only ${limit.data.remainingCount} campaign launches remaining.`,
          style: {
            marginTop: "20px",
          },
          className: theme === "dark" ? "custom-warning-dark" : "custom-warning-light",
        });
      }
      setSelectedCloneMultipleAdsetData(record);
      setViewCloneMultipleAdsetDataDrawerVisible(true);

    }
    else {
      // message.warning("Campaign launch limit reached. Unable to launch new campaigns.");
      message.open({
        type: "warning",
        content: "Campaign launch limit reached. Unable to launch new campaigns.",
        style: {
          marginTop: "20px",
        },
        className: theme === "dark" ? "custom-warning-dark" : "custom-warning-light",
      });
      setViewCloneMultipleAdsetDataDrawerVisible(false);
    }

  };

  // Safely stringify any error (string / object)
  const normalizeError = (err) => {
    if (!err) return "";
    if (typeof err === "string") return err;
    if (typeof err?.message === "string") return err.message;
    try {
      // Short, single-line JSON
      const s = JSON.stringify(err);
      return s?.length > 200 ? s.slice(0, 200) + "…" : s;
    } catch {
      return String(err);
    }
  };

  // Build tooltip JSX for a record
  const renderErrorTooltip = (record, theme = "light") => {
    const campaignErr = record?.campaignlevel_error;
    const adsetErrs = Array.isArray(record?.adsetErrors)
      ? record.adsetErrors
      : [];
    const adErrsFlat = Array.isArray(record?.adErrors) ? record.adErrors : [];
    const adErrsVerbose = Array.isArray(record?.adErrorsByAdset)
      ? record.adErrorsByAdset
      : [];

    const hasCampaign = !!campaignErr;
    const hasAdset = adsetErrs.length > 0;
    const hasAd = adErrsVerbose.length > 0 || adErrsFlat.length > 0;
    const hasAny = hasCampaign || hasAdset || hasAd;

    if (!hasAny) {
      return (
        <span style={{ color: theme === "dark" ? "#ddd" : "#333" }}>
          No errors found
        </span>
      );
    }

    return (
      <div style={{ maxWidth: 420 }}>
        {hasCampaign && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Campaign level
            </div>
            <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.3 }}>
              {normalizeError(campaignErr)}
            </div>
          </div>
        )}

        {hasAdset && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              Adset level{" "}
              <span style={{ opacity: 0.7 }}>({adsetErrs.length})</span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Adset level</div>
            <div style={{ display: "grid", gap: 6 }}>
              {adsetErrs.slice(0, 6).map((it, i) => (
                <div key={`${it?.key || i}`} style={{ lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 500 }}>
                    {it?.name || it?.key || `adset_${i + 1}`}:
                  </span>{" "}
                  <span>{normalizeError(it?.error)}</span>
                </div>
              ))}
              {adsetErrs.length > 6 && (
                <div style={{ opacity: 0.8 }}>
                  …and {adsetErrs.length - 6} more adset errors
                </div>
              )}
            </div>
          </div>
        )}

        {hasAd && (
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Ad level</div>
            <div style={{ display: "grid", gap: 6 }}>
              {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat)
                .slice(0, 6)
                .map((it, i) => (
                  <div
                    key={`${it?.adsetKey || it?.index || i}`}
                    style={{ lineHeight: 1.3 }}
                  >
                    {/* If we have verbose rows, show "Adset → Ad" */}
                    {adErrsVerbose.length ? (
                      <>
                        <span style={{ fontWeight: 600 }}>
                          {resolveAdsetName(record, it.adsetKey, it.adsetName)}
                        </span>
                        <span> → </span>
                        <span style={{ fontWeight: 500 }}>{it.adName}</span>
                        <span>: </span>
                        <span>{normalizeError(it.error)}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ fontWeight: 500 }}>
                          {it?.name ?? `ad${(it?.index ?? i) + 1}`}
                        </span>
                        <span>: </span>
                        <span>{normalizeError(it?.error)}</span>
                      </>
                    )}
                  </div>
                ))}
              {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length >
                6 && (
                  <div style={{ opacity: 0.8 }}>
                    …and{" "}
                    {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length -
                      6}{" "}
                    more ad errors
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Turn "adsetlevel_1" into a friendly label if no proper name is found
  const resolveAdsetName = (record, adsetKey, nameCandidate) => {
    const isKeyLike = (s) =>
      typeof s === "string" && /^adsetlevel[_-]?\d+$/i.test(s);

    // 1) if candidate is a real name (not a key), use it
    if (nameCandidate && !isKeyLike(nameCandidate)) return nameCandidate;

    // 2) try from adsetErrors (already enriched on the backend)
    const fromErr = (
      Array.isArray(record?.adsetErrors) ? record.adsetErrors : []
    ).find((e) => e.key === adsetKey)?.name;
    if (fromErr && !isKeyLike(fromErr)) return fromErr;

    // 3) try from adsetNameMap
    const fromMap = record?.adsetNameMap?.[adsetKey];
    if (fromMap && !isKeyLike(fromMap)) return fromMap;

    // 4) fallback: humanize the key
    if (adsetKey) {
      const m = String(adsetKey).match(/(\d+)$/);
      return m ? `Adset ${m[1]}` : String(adsetKey);
    }
    return "Adset";
  };

  const handleDeleteCampaign = async (identifier) => {
    try {
      // setDeletingId(identifier);
      // console.log("identifier:", identifier);

      const response = await axios.delete(
        // `https://www.testapi.adsgoat.in/api/newcampaigns/${identifier}`
        `https://fblaunching.vyaktimetrics.com/open/campaigns/${identifier}`,
        { headers: { Authorization: token } }
      );

      if (response.status === 200) {
        // console.log("delete")
        setMultipleAdsetCampaignData((prev) => prev.filter(item => item.identifier !== identifier))
      }

      // changeRRefrst && changeRRefrst();

      message.open({
        type: 'success',
        content: "Campaign deleted",
        className: theme === 'dark' ? 'dark-message' : '',
      })
    } catch (err) {
      console.error("Delete campaign error:", {
        status: err?.response?.status,
        data: err?.response?.data,
        msg: err?.message,
      });
      message.error(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete campaign"
      );
    }
  };

  const columns = [
    {
      title: "Status",
      dataIndex: "fbstatus",
      key: "fbstatus",
      width: 120,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {record.fbstatus === "Live" ? (
            <CheckCircleFilled
              style={{ color: "#91C25F", fontSize: 16 }}
              className="black-icon-active-1"
            />
          ) : (
            <CloseCircleFilled
              style={{ color: "#EC7117", fontSize: 16 }}
              className="black-icon-pause-1"
            />
          )}
          <Switch
            checked={record.Status === "ACTIVE"}
            onChange={(checked) => onToggleStatus(record, checked)}
            checkedChildren="✓"
            unCheckedChildren="✗"
            size="default"
            style={{
              backgroundColor:
                record.Status === "ACTIVE" ? "#91C25F" : undefined,
              minWidth: 40,
              height: 22,
            }}
          />
        </div>
      ),
    },
    {
      title: "Campaign name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: 320,
      align: "center",
      render: (text, record) => (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >
          <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
          {record.reports && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#333" : "white",
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title="View Report">
                <LinkOutlined
                  style={{ color: "blue", fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/LiveHistory/LiveCampaignHistory/${record?.campaignid}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Tooltip
            title="View details"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaEye />}
              onClick={() => handleViewClick(record)}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
          <Tooltip
            title="Edit campaign"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaPenToSquare />}
              onClick={() => handleEditClickAllLevelData(record)}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
          {!restrictedEmails.includes(userdetails.email) && (
            <Tooltip
              title="Duplicate campaign"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaClone />}
                onClick={() => duplicatenewcampaign(record)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  borderRadius: "6px",
                  border: "none",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
          )}
          <Tooltip
            title="Delete campaign"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: "14px",
            }}
          >
            <Button
              icon={<FaTrashCan color="#EC7117" />}
              style={{
                // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                borderRadius: "6px",
                border: "none",
                cursor: "not-allowed",
                padding: "4px 8px",
                backgroundColor:
                  theme === "dark" ? "transparent" : "transparent",
                color: theme === "dark" ? "#fff" : "#000",
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Budget",
      dataIndex: "Daily_amount",
      key: "Daily_amount",
      width: 100,
      align: "center",
      render: (Daily_amount, record) =>
        loading ? (
          <Spin />
        ) : (
          record?.Daily_amount !== undefined && (
            <EditableField
              value={record.Daily_amount / 100}
              record={record}
              dataIndex="Daily_amount"
              updateTableRow={updateTablebudget}
            />
          )
        ),
    },
    {
      title: "Account number",
      dataIndex: "Account_Number",
      key: "Account_Number",
      width: 160,
      align: "center",
      render: (text, record) => (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div>{record.Account_Number}</div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
          >
            <Tooltip title="Approved">
              <span
                style={{
                  color: "#4caf50",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                {record.approvedCount}
              </span>
            </Tooltip>
            <Tooltip title="Rejected">
              <span
                style={{
                  color: "#EC7117",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
              >
                {record.rejectedCount}
              </span>
            </Tooltip>
            <Tooltip title="Pending">
              <span
                className="blinking"
                style={{ color: "#EC7117", fontWeight: "bold" }}
              >
                {record.pendingCount}
              </span>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 100,
      align: "center",
    },
    {
      title: "Created by",
      dataIndex: "createdby",
      key: "createdby",
      width: 100,
      align: "center",
    },
    {
      title: "Approved",
      dataIndex: "Approval",
      key: "Approval",
      width: 100,
      align: "center",
      render: (text, record) => {
        let color = "black";
        let displayText = text;
        if (text === "PENDING_APPROVAL") {
          color = "#EC7117";
          displayText = "Pending";
        } else if (text === "Approved") {
          color = "#4caf50";
        }
        const approvedBy = record?.Approvedby || "N/A";
        return (
          <div>
            <span style={{ color }}>{displayText}</span>
            {text === "Approved" && (
              <>
                <br />
                <small style={{ color: "gray" }}>{approvedBy}</small>
              </>
            )}
          </div>
        );
      },
    },
    {
      title: "Permission",
      dataIndex: "Approval",
      key: "permission",
      width: 120,
      align: "center",
      render: (text, record) => (
        <>
          {record.Approval === "PENDING_APPROVAL" && (
            <>
              <Button
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  borderColor: "#91C25F",
                  borderWidth: "0px",
                }}
                onClick={() => handleApproval(record)} // This sets useaproval and opens modal
              >
                Approve
              </Button>

              {/* Show Modal only for selected record */}
              {useaproval?.identifier === record.identifier && (
                <Modal
                  title="Confirm approval"
                  open={isModalVisible}
                  onOk={handleOk}
                  onCancel={() => setIsModalVisible(false)}
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                >
                  <p>Are you sure you want to approve?</p>
                </Modal>
              )}
            </>
          )}
        </>
      ),
    },
  ];
  const columnsforTaboolaStatus = [
    {
      title: "Session ID",
      dataIndex: "sessionId",
      key: "sessionId",
      width: 250,
    },
    {
      title: "Ad ID",
      dataIndex: "adId",
      key: "adId",
    },
    {
      title: "Account ID",
      dataIndex: "accountId",
      key: "accountId",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          "-1": "Unknown",
          "0": "Failed",
          "1": "Pass",
          "2": "ApprovalOverride",
          "3": "FailedOverride",
          "4": "Error",
          "5": "Appealed",
          "6": "Resubmit",
          "7": "Invalid URL",
        };

        return statusMap[status] || status;
      },
    },
    {
      title: "Blacklisted",
      dataIndex: "isBlacklisted",
      key: "isBlacklisted",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      title: "Creative Score",
      dataIndex: "creativeScore",
      key: "creativeScore",
    },
    {
      title: "Reason",
      dataIndex: "scoringReasoning",
      key: "scoringReasoning",
      width: 200,
      render: (text) => (
        <Tooltip
          placement="right"
          overlayInnerStyle={{
            backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
          title={
            <div
              style={{
                maxWidth: "500px",
              }}
            >
              {text}
            </div>
          }
        >
          <span
            style={{
              display: "inline-block",
              width: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    }

  ];
  const columnsforPredictoadStatus = [
    {
      title: "Account ID",
      dataIndex: "ad_account_id",
      key: "accountId",
    },
    {
      title: "Campaign ID",
      dataIndex: "campaign_id",
      key: "campaignId",
      render: (text, record) => {
        const findTheAdDetailsObject = predictoAdDeatils.find(
          (item) => item.id === record.ad_id
        );

        const isCopied =
          loadingCampaignDetails[`campaign-${record.ad_id}`]?.copied;

        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{text}</span>

            {findTheAdDetailsObject && (
              <Tooltip
                title={isCopied ? "Copied!" : "Click to copy"}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      findTheAdDetailsObject?.campaign?.name || ""
                    );

                    setLoadingCampaignDetails((prev) => ({
                      ...prev,
                      [`campaign-${record.ad_id}`]: { copied: true },
                    }));

                    setTimeout(() => {
                      setLoadingCampaignDetails((prev) => ({
                        ...prev,
                        [`campaign-${record.ad_id}`]: { copied: false },
                      }));
                    }, 2000);
                  }}
                >
                  {findTheAdDetailsObject?.campaign?.name}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Adset ID",
      dataIndex: "adset_id",
      key: "adsetId",
      render: (text, record) => {
        const findTheAdDetailsObject = predictoAdDeatils.find(
          (item) => item.id === record.ad_id
        );

        const isCopied =
          loadingCampaignDetails[`adset-${record.ad_id}`]?.copied;

        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{text}</span>

            {findTheAdDetailsObject && (
              <Tooltip
                title={isCopied ? "Copied!" : "Click to copy"}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      findTheAdDetailsObject?.adset?.name || ""
                    );

                    setLoadingCampaignDetails((prev) => ({
                      ...prev,
                      [`adset-${record.ad_id}`]: { copied: true },
                    }));

                    setTimeout(() => {
                      setLoadingCampaignDetails((prev) => ({
                        ...prev,
                        [`adset-${record.ad_id}`]: { copied: false },
                      }));
                    }, 2000);
                  }}
                >
                  {findTheAdDetailsObject?.adset?.name}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Ad ID",
      dataIndex: "ad_id",
      key: "adId",
      render: (text) => {
        const findTheAdDetailsObject = predictoAdDeatils.find(
          (item) => item.id === text
        );

        const isCopied =
          loadingCampaignDetails[`ad-${text}`]?.copied;

        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>{text}</span>

            {findTheAdDetailsObject && (
              <Tooltip
                title={isCopied ? "Copied!" : "Click to copy"}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <span
                  style={{
                    fontWeight: 400,
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      findTheAdDetailsObject?.name || ""
                    );

                    setLoadingCampaignDetails((prev) => ({
                      ...prev,
                      [`ad-${text}`]: { copied: true },
                    }));

                    setTimeout(() => {
                      setLoadingCampaignDetails((prev) => ({
                        ...prev,
                        [`ad-${text}`]: { copied: false },
                      }));
                    }, 2000);
                  }}
                >
                  {findTheAdDetailsObject?.name}
                </span>
              </Tooltip>
            )}
          </div>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text) => {
        const status = text === "approved";
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {status
              ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
              : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
            <span>{text}</span>
          </div>
        )
      }
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => value.split("T")[0],
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (value) => value.split("T")[0],
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 150,
      render: (text) => (
        <Tooltip
          placement="right"
          overlayInnerStyle={{
            backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
          title={
            <div
              style={{
                maxWidth: "500px",
              }}
            >
              {text}
            </div>
          }
        >
          <span
            style={{
              display: "inline-block",
              width: "200px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    }

  ];
  const columnsforPredictoKeywordStatus = [
    {
      title: "Keyword",
      dataIndex: "keyword",
      key: "keyword",
      render: (_, record) => {
        const status = record.status?.toLowerCase();

        const statusConfig = {
          approved: {
            color: "#52c41a",
            text: "Approved",
          },
          disapproved: {
            color: "#ff4d4f",
            text: "Denied",
          },
          error: {
            color: "red",
            text: "Error",
          },
          processing: {
            color: "#8c8c8c",
            text: "Processing",
          },
          pending: {
            color: "#fa8c16",
            text: "pending",
          },
          queued: {
            color: "#8c8c8c",
            text: "Queued",
          }
        };

        const config = statusConfig[status] || {
          color: "#8c8c8c",
          text: "Unknown",
        };

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Tooltip overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }} title={config.text}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  minWidth: 10,
                  minHeight: 10,
                  flexShrink: 0,
                  borderRadius: "50%",
                  backgroundColor: config.color,
                  display: "inline-block",
                  cursor: "pointer",
                }}
              />
            </Tooltip>

            <div style={{ display: "flex", flexDirection: "column", minWidth: 0, }}>
              <strong style={{ fontSize: "12px" }}>{record.keyword}</strong>
              <span style={{ fontWeight: 300, fontSize: "12px" }}>ID {record.id}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Native Keyword",
      dataIndex: "native_keyword",
      key: "native_keyword",
    },
    {
      title: "Lauguage",
      dataIndex: "language",
      key: "language",
    },
    {
      title: "Vertical",
      dataIndex: "vertical",
      key: "vertical",
    },

    {
      title: "Title",
      dataIndex: "article_headline",
      key: "article_headline",
      render: (text) => {
        if (!text) {
          return (
            <div
              style={{
                textAlign: "center",
                width: "100%",
              }}
            >
              -
            </div>
          );
        }

        return (
          <Tooltip
            placement="right"
            overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}
            title={
              <div
                style={{
                  maxWidth: "500px",
                }}
              >
                {text}
              </div>
            }
          >
            <span
              style={{
                display: "inline-block",
                width: "150px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: "Link",
      dataIndex: "link",
      key: "link",
      render: (_, record) => {
        const article = predictoKeywordArticleStatusData.find(
          (item) => item.keyword_id === record.id
        );

        // No object found
        // if (!article) {
        //   const isProcessing = record.status?.toLowerCase() === "processing";

        //   return (
        //     <Tooltip
        //       title={isProcessing ? "Article generation is in progress" : "Click to get Article"}
        //       overlayInnerStyle={{
        //         backgroundColor:
        //           theme === "dark" ? "#2b2b2b" : "#ffffff",
        //         color: theme === "dark" ? "#ffffff" : "#000000",
        //       }}
        //     >
        //       <ReloadOutlined
        //         style={{
        //           cursor: isProcessing ? "not-allowed" : "pointer",
        //           color: isProcessing ? "#bfbfbf" : "#1890ff",
        //           fontSize: "16px",
        //           opacity: isProcessing ? 0.5 : 1,
        //         }}
        //         onClick={
        //           () => fetchPredictoArticleForKeyword(record)
        //         }
        //       />
        //     </Tooltip>
        //   );
        // }
        if (!article) {
          const isProcessing = record.status?.toLowerCase() === "processing";
          const isLoading = loadingArticleForKeyword.includes(record.id);

          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                minHeight: "40px",
              }}
            >
              {isLoading ? (
                <Spin size="small" />
              ) : (
                <Tooltip
                  title={
                    isProcessing
                      ? "Article generation is in progress"
                      : "Click to get Article"
                  }
                  overlayInnerStyle={{
                    backgroundColor:
                      theme === "dark" ? "#2b2b2b" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                  }}
                >
                  <ReloadOutlined
                    style={{
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      color: isProcessing ? "#bfbfbf" : "#1890ff",
                      fontSize: "16px",
                      opacity: isProcessing ? 0.5 : 1,
                    }}
                    onClick={() => {
                      if (!isProcessing) {
                        fetchPredictoArticleForKeyword(record);
                      }
                    }}
                  />
                </Tooltip>
              )}
            </div>
          );
        }

        // Object found but URL missing
        if (!article.url) {
          return <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}>
            -
          </div>;
        }

        return (
          <div>
            <div>
              <strong>Article ID:</strong> {article.article_id}
            </div>

            <Tooltip
              placement="right"
              overlayInnerStyle={{
                backgroundColor:
                  theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
              }}
              title={
                <div
                  style={{
                    maxWidth: "500px",
                    wordBreak: "break-word",
                  }}
                >
                  {article.url}
                </div>
              }
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  width: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#1890ff",
                }}
              >
                {article.url}
              </a>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: "Suggested Keywords",
      dataIndex: "suggested_keywords",
      key: "suggested_keywords",
      width: 250,
      render: (value) => {
        let keywords = [];

        try {
          if (Array.isArray(value)) {
            keywords = value;
          } else if (typeof value === "string") {
            if (value.trim().startsWith("[")) {
              keywords = JSON.parse(value);
            } else {
              keywords = value.split(",").map(item => item.trim());
            }
          }
        } catch (err) {
          return "-";
        }

        const visibleKeywords = keywords.slice(0, 2);
        const hiddenKeywords = keywords.slice(2);

        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {visibleKeywords.map((keyword, index) => (
              <Tag key={index}
                style={
                  {
                    ...(theme === "dark"
                      ? {
                        background: "#3a3a3a",
                        color: "#fff",
                        border: "1px solid #555",
                      }
                      : {}),
                    whiteSpace: "normal",
                    lineHeight: "16px"
                    // wordBreak: "break-word",
                    // height: "auto",
                    // lineHeight: "18px",
                  }
                }
              >{keyword}</Tag>
            ))}

            {hiddenKeywords.length > 0 && (
              <Tooltip
                dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
                className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {hiddenKeywords.map((keyword, index) => (
                      <div key={index}>{keyword}</div>
                    ))}
                  </div>
                }
              >
                <Tag
                  style={
                    theme === "dark"
                      ? {
                        cursor: "pointer",
                        background: "#3a3a3a",
                        color: "#fff",
                        border: "1px solid #555",
                      }
                      : {
                        cursor: "pointer",
                      }
                  }
                >
                  +{hiddenKeywords.length} more
                </Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 150,
      render: (text) => (
        <Tooltip
          placement="right"
          overlayInnerStyle={{
            backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
            color: theme === "dark" ? "#ffffff" : "#000000",
          }}
          title={
            <div
              style={{
                maxWidth: "500px",
              }}
            >
              {text}
            </div>
          }
        >
          <span
            style={{
              display: "inline-block",
              width: "150px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      render: (value) => value.split("T")[0],
    },

  ];
  const columnsformultipleadsets = [
    {
      title: "Status",
      dataIndex: "fbstatus",
      key: "fbstatus",
      width: 80,
      align: "center",
      render: (text, record) => {
        const doesAdsWentToFacebook = record.allAds.some(
          item => item.facebookUploadFailed === true
        );
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {doesAdsWentToFacebook ?
              <span
                style={{
                  background: "red",
                  borderRadius: "50%",
                  padding: "3px",
                  display: "inline-flex",
                }}
              >
                <FaFacebook color="white" />
              </span>
              :
              (
                record.fbstatus === "Live" ? (
                  <CheckCircleFilled
                    style={{ color: "#91C25F", fontSize: 16 }}
                    className="black-icon-active-1"
                  />
                ) : (
                  <CloseCircleFilled
                    style={{ color: "#EC7117", fontSize: 16 }}
                    className="black-icon-pause-1"
                  />
                )
              )}
            {/* {record.fbstatus === "Live" ? (
              <CheckCircleFilled
                style={{ color: "#91C25F", fontSize: 16 }}
                className="black-icon-active-1"
              />
            ) : (
              <CloseCircleFilled
                style={{ color: "#EC7117", fontSize: 16 }}
                className="black-icon-pause-1"
              />
            )} */}

            <Switch
              checked={record.Status === "ACTIVE"}
              onChange={(checked) =>
                onToggleStatusForMultipleAdsets(record, checked)
              }
              disabled={doesAdsWentToFacebook}
              checkedChildren="✓"
              unCheckedChildren="✗"
              // disabled={record.Approval !== "Approved"}
              size="default"
              style={{
                backgroundColor:
                  record.Status === "ACTIVE" ? "#91C25F" : undefined,
                minWidth: 40,
                height: 22,
              }}
            />

          </div>
        )
      },
    },
    {
      title: "Campaign name",
      dataIndex: "campaign_name",
      key: "campaign_name",
      width: 300,
      align: "center",
      // render: (text, record) => (
      //   <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      //     <span>{text}({record.adsetCount})</span>
      //   </div>
      // )
      // render: (text, record) => (
      //   <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      //     <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
      //     {record.reports && (
      //       <span style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: theme === 'dark' ? '#333' : 'white', marginLeft: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      //         <Tooltip title="View Report">
      //           <LinkOutlined
      //             style={{ color: 'blue', fontSize: 14 }}
      //             onClick={(e) => {
      //               e.stopPropagation();
      //               window.open(`/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`, '_blank', 'noopener,noreferrer');
      //             }}
      //           />
      //         </Tooltip>
      //       </span>
      //     )}
      //   </div>
      // ),
      render: (text, record) => (
        <div
          style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
        >

          {/* <span
          // onClick={() => handleCampaignNameClick(record)}
          >{text}</span> */}
          <Popover
            trigger="hover"
            placement="right"
            content={
              <div style={{ width: 320, maxHeight: 420, overflowY: "auto", }}>
                <Steps
                  direction="vertical"
                  size="small"
                  items={[

                    record?.createdDate && {
                      title: <b>Campaign Created</b>,
                      description: record.createdDate,
                      status: "finish",
                    },


                    // record?.campaignid && {
                    //   title: <b>Campaign Launched in Facebook</b>,
                    //   description: record.campaignid,
                    //   status: "finish",
                    // },

                    record?.campaignid
                      ? {
                        title: <b>Campaign Launched in Facebook</b>,
                        description: record.campaignid,
                        status: "finish",
                      }
                      : record?.campaignlevel_error && {
                        title: <b>Campaign launching Failed</b>,
                        description: (
                          <div style={{ color: "red", fontSize: 12 }}>
                            Error: {record.campaignlevel_error.message || record.campaignlevel_error.error_user_msg || record.campaignlevel_error}
                          </div>
                        ),
                        status: "error",
                      },
                    ...(record?.adsetsWithAds || [])
                      .map((adset) => {
                        const adsetError = record?.adsetErrors?.find(
                          (err) => err.name === adset.adsetName
                        );

                        console.log(record, "record");
                        if (!adset.adsetId && !adsetError) return null;


                        return {
                          title: (
                            <div
                              title={adset.adsetName}
                              style={{
                                maxWidth: 260,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: "bold"
                              }}
                            >
                              {adsetError
                                ? `Adset launching failed: ${adset.adsetName}`
                                : `Adset launched: ${adset.adsetName}`}
                            </div>
                          ),
                          description: (
                            <div>
                              {adset.adsetId && (
                                <div style={{ marginBottom: 6, color: "#888" }}>
                                  {adset.adsetId}
                                </div>
                              )}


                              {!adset.adsetId && adsetError && (
                                <div style={{ color: "red", fontSize: 12 }}>
                                  Error: {adsetError.error?.error_user_msg || adsetError.message || adsetError.error}
                                </div>
                              )}
                              <Steps
                                direction="vertical"
                                size="small"
                                style={{ marginLeft: 10 }}
                                items={(adset?.ads || []).map((ad, i) => {


                                  const adError = record?.adErrorsByAdset?.find(
                                    (err) =>
                                      err.adsetKey === adset.key &&
                                      err.adIndex === i
                                  );
                                  if (!ad.adId && !adError) return null;
                                  return {
                                    title: (
                                      <div
                                        title={ad.adName}
                                        style={{
                                          maxWidth: 200,
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          fontWeight: "bold"
                                        }}
                                      >
                                        {adError
                                          ? `Ad launching failed: ${ad.adName}`
                                          : `Ad launched: ${ad.adName}`}
                                      </div>
                                    ),


                                    description: (
                                      <>
                                        {ad.adId && (
                                          <div style={{ fontSize: 12, color: "#888" }}>
                                            {ad.adId}
                                          </div>
                                        )}


                                        {adError && (
                                          <div style={{ color: "red", fontSize: 12 }}>
                                            Error: {adError.error || adError.error?.error_user_msg}
                                          </div>
                                        )}
                                      </>
                                    ),


                                    status: adError ? "error" : "finish",
                                  };
                                })}
                              />
                            </div>
                          ),
                          status: adset.adsetId ? "finish" : "error",
                        };
                      })
                      .filter(Boolean),
                  ].filter(Boolean)}
                />
              </div>
            }
          >
            <span>{text}</span>
          </Popover>
          {record.reports && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: theme === "dark" ? "#333" : "white",
                marginLeft: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Tooltip title="View Report">
                <LinkOutlined
                  style={{ color: "blue", fontSize: 14 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/LiveHistory/LiveCampaignHistory/${record?.campaignid}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                />
              </Tooltip>
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Account number",
      dataIndex: "Account_Number",
      key: "Account_Number",
      width: 120,
      align: "center",

    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 180,
    //   align: "center",
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         display: "flex",
    //         alignItems: "center",
    //         justifyContent: "center",
    //         gap: "8px",
    //       }}
    //     >
    //       <Tooltip
    //         title="View details"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaEye />}
    //           onClick={() => handleEditClickMultipleAdsetData(record, true)}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             padding: "4px 8px",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       <Tooltip
    //         title="Edit campaign"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaPenToSquare />}
    //           // disabled={record.fbstatus === "Live"}
    //           onClick={() => handleEditClickMultipleAdsetData(record, false)}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             padding: "4px 8px",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       {!restrictedEmails.includes(userdetails.email) && (
    //         <Tooltip
    //           title="Duplicate campaign"
    //           overlayInnerStyle={{
    //             backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //             color: theme === "dark" ? "#ffffff" : "#000000",
    //             borderRadius: 6,
    //             padding: "6px 10px",
    //             fontSize: "14px",
    //           }}
    //         >
    //           <Button
    //             icon={<FaClone />}
    //             onClick={() => handleCloneClickMultipleAdsetData(record)}
    //             style={{
    //               // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //               border: "none",
    //               borderRadius: "6px",
    //               padding: "4px 8px",
    //               backgroundColor:
    //                 theme === "dark" ? "transparent" : "transparent",
    //               color: theme === "dark" ? "#fff" : "#000",
    //             }}
    //           />
    //         </Tooltip>
    //       )}
    //       <Tooltip
    //         title="Delete campaign"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <Button
    //           icon={<FaTrashCan color="#EC7117" />}
    //           style={{
    //             // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
    //             border: "none",
    //             borderRadius: "6px",
    //             cursor: "not-allowed",
    //             backgroundColor:
    //               theme === "dark" ? "transparent" : "transparent",
    //             color: theme === "dark" ? "#fff" : "#000",
    //           }}
    //         />
    //       </Tooltip>
    //       <Tooltip
    //         title="Number of adsets"
    //         overlayInnerStyle={{
    //           backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
    //           color: theme === "dark" ? "#ffffff" : "#000000",
    //           borderRadius: 6,
    //           padding: "6px 10px",
    //           fontSize: "14px",
    //         }}
    //       >
    //         <div
    //           style={{
    //             backgroundColor: "#bce396ff",
    //             color: "#000",
    //             borderRadius: "60%",
    //             width: "20px",
    //             height: "20px",
    //             textAlign: "center",
    //           }}
    //         >
    //           {record.adsetCount}
    //         </div>
    //       </Tooltip>
    //     </div>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "center",
      render: (text, record) => {
        const hasAnyError =
          !!record?.campaignlevel_error ||
          (Array.isArray(record?.adsetErrors) &&
            record.adsetErrors.length > 0) ||
          (Array.isArray(record?.adErrors) && record.adErrors.length > 0);
        const commentForCampaign = launcherComments.find(item => item.Account === record.Account_Number && item.campaignid === record.identifier && item.level === "Launcher") || {};

        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              // gap: "5px",
            }}
          >
            <Tooltip
              title="View details"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaEye />}
                onClick={() => handleEditClickMultipleAdsetData(record, true)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "4px",
                  paddingRight: "6px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
            <Tooltip
              title="Edit campaign"
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={<FaPenToSquare />}
                // disabled={record.fbstatus === "Live"}
                onClick={() => handleEditClickMultipleAdsetData(record, false)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>
            {!restrictedEmails.includes(userdetails.email) && (
              <Tooltip
                title="Duplicate campaign"
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <Button
                  icon={<FaClone />}
                  // disabled={true}
                  onClick={() => handleCloneClickMultipleAdsetData(record)}
                  style={{
                    // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    backgroundColor:
                      theme === "dark" ? "transparent" : "transparent",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                />
              </Tooltip>
            )}

            <Tooltip
              title={commentForCampaign.comment ? commentForCampaign.comment : "Comment"}
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Button
                icon={commentForCampaign.comment ? <FaRegCommentDots /> : <IoMdCreate />}
                // disabled={record.fbstatus === "Live"}
                // onClick={() => handleEditClickMultipleAdsetData(record, false)}
                onClick={() => handleClickComment(record)}
                style={{
                  // border: `1px solid ${theme === "dark" ? "#555" : "#d9d9d9"}`,
                  border: "none",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  backgroundColor:
                    theme === "dark" ? "transparent" : "transparent",
                  color: theme === "dark" ? "#fff" : "#000",
                }}
              />
            </Tooltip>

            {/* {record.fbstatus === "No-Live" && ( */}
            <Tooltip
              // title="Delete campaign"
              title={
                record.fbstatus === "No-Live"
                  ? "Delete campaign"
                  : "Status must be 'No-Live' to delete'"
              }
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <Popconfirm
                title={
                  <span style={{ color: theme === "dark" ? "#fff" : "#333" }}>
                    Are you sure you want to delete this campaign?
                  </span>
                }
                onConfirm={() => handleDeleteCampaign(record.identifier)}
                okText="Yes"
                cancelText="No"
                disabled={record.fbstatus !== "No-Live"}
                okButtonProps={{
                  style: { backgroundColor: "#91C25F", color: "#fff" },
                }}
                cancelButtonProps={{
                  style: {
                    backgroundColor: theme === "dark" ? "#000" : "#fff",
                    color: theme === "dark" ? "#fff" : "#333",
                    border: "none",
                  },
                }}
                style={{ color: theme === "dark" ? "#fff" : "#333" }}
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#1f1f1f" : "#fff",
                  color: theme === "dark" ? "#fff" : "#333",
                  borderRadius: 8,
                  padding: "10px 16px",
                }}
              >
                <Button
                  icon={<FaTrashCan color="#EC7117" />}
                  disabled={record.fbstatus !== "No-Live"}
                  style={{
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    color: theme === "dark" ? "#fff" : "#000",
                  }}
                />
              </Popconfirm>
            </Tooltip>
            {/* )} */}

            <Tooltip
              title={renderErrorTooltip(record, theme)}
              overlayInnerStyle={{
                backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: "14px",
              }}
            >
              <div
                style={{
                  // backgroundColor: "#bce396ff",
                  backgroundColor: hasAnyError ? "#EC7117" : "#91C25F",
                  color: "#000",
                  borderRadius: "60%",
                  width: "20px",
                  height: "20px",
                  textAlign: "center",
                }}
              >
                {record.adsetCount}
              </div>
            </Tooltip>
            {/* {record.fbstatus !== "No-Live" && (
              <Tooltip
                title={
                  loadingAd === record.identifier ? (
                    "Loading..."
                  ) : adDetails[record.identifier] ? (
                    <div style={{ minWidth: 260, maxHeight: 300, overflowY: "auto" }}>
                      {Object.values(adDetails[record.identifier]).map(
                        (adset, index) => (
                          <div key={index} style={{ marginBottom: 12 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                marginBottom: 6,
                                maxWidth: 220,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={adset.AdsetName}
                            >
                              {adset.AdsetName}
                            </div>
                            {adset.ads?.map((ad, i) => (
                              <div
                                key={i}
                                style={{
                                  fontSize: 12,
                                  marginBottom: 6,
                                  paddingLeft: 6,
                                }}
                              >
                                <div
                                  style={{
                                    maxWidth: 220,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={ad.name}
                                >
                                  <b>Add Name:</b> {ad.name}
                                </div>

                                <div>
                                  <b>Status:</b> {ad.effective_status}
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    " "
                  )
                }
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#EC7117",
                    color: "#000",
                    borderRadius: "60%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                    textAlign: "center",
                    marginLeft: "5px"
                  }}
                  onMouseEnter={() => {
                    if (!adDetails[record.identifier]) {
                      handleIconClick(record.identifier);
                    }
                  }}
                >
                  {adsCount[record.identifier]}
                </div>
              </Tooltip>
            )} */}
          </div>
        );
      },
    },
    {
      title: "Budget",
      dataIndex: "Daily_amount",
      key: "Daily_amount",
      width: 90,
      align: "center",
      render: (Daily_amount, record) =>
        loading ? (
          <Spin />
        ) : (
          record?.Daily_amount !== undefined && (
            <EditableFieldForMultpleAdsets
              value={record.Daily_amount / 100}
              record={record}
              dataIndex="Daily_amount"
              updateTableRow={updateTablebudgetforAdsests}
            />
          )
        ),
    },
    // {
    //   title: "Account number",
    //   dataIndex: "Account_Number",
    //   key: "Account_Number",
    //   width: 160,
    //   align: "center",
    //   render: (text, record) => (
    //     <div
    //       style={{
    //         display: "flex",
    //         flexDirection: "column",
    //         alignItems: "center",
    //       }}
    //     >
    //       <div>{record.Account_Number}</div>
    //       <div
    //         style={{ display: "flex", justifyContent: "center", marginTop: 2 }}
    //       >
    //         <Tooltip title="Approved">
    //           <span
    //             style={{
    //               color: "#4caf50",
    //               fontWeight: "bold",
    //               marginRight: 10,
    //             }}
    //           >
    //             {record.approvedCount}
    //           </span>
    //         </Tooltip>
    //         <Tooltip title="Rejected">
    //           <span
    //             style={{ color: "red", fontWeight: "bold", marginRight: 10 }}
    //           >
    //             {record.rejectedCount}
    //           </span>
    //         </Tooltip>
    //         <Tooltip title="Pending">
    //           <span
    //             className="blinking"
    //             style={{ color: "orange", fontWeight: "bold" }}
    //           >
    //             {record.pendingCount}
    //           </span>
    //         </Tooltip>
    //       </div>
    //     </div>
    //   ),
    // },
    {
      title: "Date",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 100,
      align: "center",
    },
    {
      title: "Created by",
      dataIndex: "createdby",
      key: "createdby",
      width: 100,
      align: "center",
    },
    {
      title: "Approved",
      dataIndex: "Approval",
      key: "Approval",
      width: 110,
      align: "center",
      render: (text, record) => {
        let color = "black";
        let displayText = text;
        if (text === "PENDING_APPROVAL") {
          color = "#EC7117";
          displayText = "Pending";
        } else if (text === "Approved") {
          color = "#4caf50";
        } else if (text === "Rejected") {
          color = "red"
        }
        // console.log(record, "recordada")
        const approvedBy = record?.Approvedby || "N/A";
        const approvedDate = record?.Approveddate
          ? moment(record.Approveddate, "YYYY-MM-DD HH:mm z")
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY HH:mm")
          : "N/A";
        const RejectedBy = record?.RejectedBy || "N/A";
        const RejectedDate = record?.RejectedDate
          ? moment(record.RejectedDate, "YYYY-MM-DD HH:mm z")
            .tz("Asia/Kolkata")
            .format("DD-MM-YYYY HH:mm")
          : "N/A";
        return (
          <div>
            <span style={{ color }}>{displayText}</span>
            {/* {text === "Approved" && (
              <>
                <br />
                <small style={{ color: "gray" }}>{approvedBy}</small>
                <br />
                <span style={{ color: "gray", fontSize: "8px" }}>{approvedDate}</span>
              </>
            )} */}
            {text === "Approved" && (
              <div style={{ lineHeight: "12px" }}>
                <span style={{ color: "gray", fontSize: "11px", display: "block" }}>
                  {approvedBy}
                </span>
                <span style={{ color: "gray", fontSize: "9px", display: "block", marginTop: 2, display: approvedDate !== "N/A" ? "block" : "none" }}>
                  {approvedDate}
                </span>
              </div>
            )}
            {text === "Rejected" && (
              <div style={{ lineHeight: "12px" }}>
                <span style={{ color: "gray", fontSize: "11px", display: "block" }}>
                  {RejectedBy}
                </span>
                <span style={{ color: "gray", fontSize: "9px", display: "block", marginTop: 2, display: RejectedDate !== "N/A" ? "block" : "none" }}>
                  {RejectedDate}
                </span>
              </div>
            )}
          </div>
        );
      },
    },
    // {
    //   title: "Permission",
    //   dataIndex: "Approval",
    //   key: "permission",
    //   width: 120,
    //   align: "center",
    //   render: (text, record) => (
    //     <>
    //       {record.Approval === "PENDING_APPROVAL" && (
    //         <>
    //           <Button
    //             style={{
    //               backgroundColor: "#91C25F",
    //               color: "#000",
    //               borderColor: "#91C25F",
    //               borderWidth: "0px",
    //             }}
    //             onClick={() => handleApprovalforAdsets(record)} // This sets useaproval and opens modal
    //           >
    //             Approve
    //           </Button>

    //           {/* Show Modal only for selected record */}
    //           {useaprovalForAdsets?.identifier === record.identifier && (
    //             <Modal
    //               title="Confirm approval"
    //               open={isModalVisibleForAdsets}
    //               onOk={handleOkForAdsets}
    //               onCancel={() => setIsModalVisibleForAdsets(false)}
    //               className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
    //                 }`}
    //             >
    //               <p>Are you sure you want to approve?</p>
    //             </Modal>
    //           )}
    //         </>
    //       )}
    //     </>
    //   ),
    // },
    // {
    //   title: "Permission",
    //   dataIndex: "Approval",
    //   key: "permission",
    //   width: 120,
    //   align: "center",
    //   render: (text, record) => {
    //     const approval = record?.Approval?.toLowerCase();
    //     const fbstatus = record?.fbstatus?.toLowerCase();
    //     return fbstatus === "live" ? (
    //       <Tooltip title="View History">
    //         <HistoryOutlined
    //           style={{
    //             fontSize: 16,
    //             color: theme === "dark" ? "#91C25F" : "#37474F",
    //             cursor: "pointer",
    //           }}
    //           onClick={(e) => {
    //             e.stopPropagation();
    //             const accountNumber = record?.Account_Number;
    //             if (accountNumber) {
    //              const href = `/Campaigns/CampaignHistory?account=${encodeURIComponent(accountNumber)}`;
    //               window.open(href, "_blank", "noopener,noreferrer");
    //             } else {
    //               console.error("Account number missing for this record");
    //             }
    //           }}
    //         />
    //       </Tooltip>
    //     ) : approval === "pending_approval" ? (
    //       <>
    //         <Button
    //           style={{
    //             backgroundColor: "#91C25F",
    //             color: "#000",
    //             border: "none",
    //           }}
    //           onClick={() => handleApproval(record)}
    //         >
    //           Approve
    //         </Button>
    //         {useaproval?.identifier === record.identifier && (
    //           <Modal
    //             title="Confirm approval"
    //             open={isModalVisible}
    //             onOk={handleOk}
    //             onCancel={() => setIsModalVisible(false)}
    //             className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
    //               }`}
    //           >
    //             <p>Are you sure you want to approve?</p>
    //           </Modal>
    //         )}
    //       </>
    //     ) : null; 
    //   },
    // }
    {
      title: "Permission",
      dataIndex: "Approval",
      key: "permission",
      // width: 110,
      // ellipsis: true,
      align: "center",
      render: (text, record) => {
        const approval = record?.Approval?.toLowerCase();
        const fbstatus = record?.fbstatus?.toLowerCase();
        const accountNumber = record?.Account_Number;
        const identifier = record?.identifier;

        const openCampaignHistory = ({ identifier, accountNumber }) => {
          if (!identifier || !accountNumber) {
            console.error("Missing campaign ID or account number");
            return;
          }
          setSelectedCampaignIdForHistory(identifier);
          setSelectedAccountForHistory(accountNumber);
          setHistoryOpen(true);
        };
        if (record.Approval === "Approved" || record.Approval === "Rejected") {
          return (
            <Tooltip title="View Campaign History" overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}>
              <HistoryOutlined
                style={{
                  fontSize: 16,
                  color: theme === "dark" ? "#91C25F" : "#37474F",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openCampaignHistory({
                    accountNumber,
                    identifier

                  });
                }}
              />
            </Tooltip>
          );
        }
        if (approval === "pending_approval") {
          return (
            <>
              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "5px",
                whiteSpace: "nowrap",
              }}>
                <Button
                  style={{
                    backgroundColor: "#91C25F",
                    color: "#000",
                    border: "none",
                    width: "62px"
                  }}
                  onClick={() => handleApprovalforAdsets(record)}
                >
                  Approve
                </Button>
                <Button
                  style={{
                    backgroundColor: "#fb4437ff",
                    color: "#000",
                    border: "none",
                    width: "82px"
                  }}
                  onClick={() => handledisApprovalforAdsets(record)}
                >
                  Disapprove
                </Button>
              </div>
              {useaprovalForAdsets?.identifier === record.identifier && (
                <Modal
                  title="Confirm approval"
                  open={isModalVisibleForAdsets}
                  onOk={handleOkForAdsets}
                  onCancel={() => setIsModalVisibleForAdsets(false)}
                  className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                >
                  <p>Are you sure you want to approve?</p>
                </Modal>
              )}


            </>

          );
        }
        return null;
      },
    }


  ];

  //     const columns = [

  //         {
  //             title: 'Status',
  //             dataIndex: 'fbstatus',
  //             key: 'fbstatus',
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //             render: (text, record) => (
  //                 <>
  //                     {/* Display green check or red close icon based on fbstatus */}
  //                     {record.fbstatus === 'Live' ? (
  //                         <CheckCircleFilled style={{ color: 'green' }} className='black-icon-active' />
  //                     ) : (
  //                         <CloseCircleFilled style={{ color: 'red' }}   className='black-icon-pause-1' />
  //                     )}

  //                     {/* Display link icon if reports field is true */}
  //                     {record.reports === true && (
  //                         <LinkOutlined
  //                             style={{ color: 'blue', marginLeft: '8px', cursor: 'pointer' }}
  //                             onClick={() =>
  //                                 window.open(
  //                                     `/LiveHistory/LiveCampaignHistory/${record?.campaign_name}-${record?.Account_Number}-UTC-${newtworkCollections[selectedKey]}`,
  //                                     '_blank', // Opens in a new tab
  //                                     'noopener,noreferrer' // Security and performance considerations
  //                                 )
  //                             }
  //                         />
  //                     )}
  //                 </>
  //             ),
  //         },

  //         {
  //             title: "Campaign Name",
  //             dataIndex: "campaign_name",
  //             key: "campaign_name",
  //             width: '20%', // Adjust width
  //             align: 'left',  // Left align to keep names readable
  //             render: (text, record) => (

  //                 <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
  //                     <span onClick={() => handleCampaignNameClick(record)}>{text}</span>
  //                     {!restrictedEmails.includes(userdetails.email) && (
  //                         <span style={{
  //                             width: '24px',
  //                             height: '24px',
  //                             borderRadius: '50%',
  //                             // backgroundColor: '#e6f7ff',
  //                             backgroundColor: theme === "dark" ? "#333" : "white",
  //                             marginLeft: '5px',
  //                             display: 'flex',
  //                             alignItems: 'center',
  //                             justifyContent: 'center'
  //                         }}>
  //                             <Tooltip title="Clone">
  //                                 <CopyOutlined style={{ color: 'red' }} onClick={() => duplicatenewcampaign(record)} />
  //                             </Tooltip>
  //                         </span>
  //                     )}
  //                 </div>
  //             ),
  //         },
  //         {
  //             title: "Account Number",
  //             dataIndex: "Account_Number",
  //             key: "Account_Number",
  //             width: '15%',  // Adjust width
  //             align: 'center',  // Center align since it's numeric
  //             render: (text, record) => (
  //                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  //                     {/* Account Number */}
  //                     <div>{record.Account_Number}</div>

  //                     {/* Approved, Rejected, Pending - stacked vertically */}
  //                     <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2px' }}>
  //                         {/* Approved */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
  //                             <Tooltip title="Approved">
  //                                 <span style={{ color: 'green', fontWeight: 'bold' }}>{record.approvedCount}</span>
  //                             </Tooltip>
  //                         </div>

  //                         {/* Rejected */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '15px' }}>
  //                             <Tooltip title="Rejected">
  //                                 <span style={{ color: 'red', fontWeight: 'bold' }}>{record.rejectedCount}</span>
  //                             </Tooltip>
  //                         </div>

  //                         {/* Pending */}
  //                         <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  //                             <Tooltip title="Pending">
  //                                 <span className="blinking" style={{ color: 'orange', fontWeight: 'bold' }}>{record.pendingCount}</span>
  //                             </Tooltip>
  //                         </div>
  //                     </div>
  //                 </div>
  //             ),
  //         },
  //         {
  //             title: "Created Date",
  //             dataIndex: "createdDate",
  //             key: "createdDate",
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //         },

  //         {
  //             title: "Created By",
  //             dataIndex: "createdby",
  //             key: "createdby",
  //             width: '12%',  // Adjust width
  //             align: 'center',
  //         },
  //         {
  //             title: "Budget",
  //             dataIndex: "Daily_amount",
  //             key: "Daily_amount",
  //             width: '10%',  // Adjust width
  //             align: 'center',
  //             render: (Daily_amount, record) => (
  //                 <>
  //                     {loading ? (
  //                         <Spin />
  //                     ) : (
  //                         record?.Daily_amount !== undefined && (
  //                             <EditableField
  //                                 value={record.Daily_amount / 100}
  //                                 record={record}
  //                                 dataIndex="Daily_amount"
  //                                 updateTableRow={updateTablebudget}
  //                             />
  //                         )
  //                     )}
  //                 </>
  //             ),
  //         },
  //         {
  //             title: "Status",
  //             dataIndex: "Status",
  //             key: "Status",
  //             width: '10%',
  //             align: "center",
  //             render: (text, record) => (
  //                 <Switch
  //                     checked={record.Status === 'ACTIVE'}
  //                     onChange={(checked) => onToggleStatus(record, checked)}
  //                     checkedChildren="ACTIVE"
  //                     unCheckedChildren="PAUSED"
  //                     style={{ backgroundColor: record.Status === 'ACTIVE' && "#91C25F" }}
  //                 />
  //             )
  //         },

  //         {
  //             title: "Approve",
  //             dataIndex: "Approval",
  //             key: "Approval",
  //             width: '7%',
  //             align: 'center',
  //             render: (text, record) => {
  //               console.log(record, "recordeddata");

  //               let color = 'black';
  //               let displayText = text;

  //               // Modify color and text based on status
  //               if (text === "PENDING_APPROVAL") {
  //                 color = 'red';
  //                 displayText = 'Pending'; // Show 'Pending' text instead of the original value
  //               } else if (text === "Approved") {
  //                 color = 'green';
  //               }

  //               // Accessing the Approved by field from the record
  //               const approvedBy = record?.Approvedby || "N/A"; // Replace 'Approved' with actual field name if needed

  //               return (
  //                 <div>
  //                   <span style={{ color }}>{`${displayText}`}</span>
  //                   {text === "Approved" && (
  //                     <>
  //                       <br />
  //                       <small style={{ color: 'gray' }}> {approvedBy}</small>
  //                     </>
  //                   )}
  //                 </div>
  //               );
  //             },
  //           }
  // ,
  //         {
  //             title: '',
  //             dataIndex: 'Action',
  //             align: "center",
  //             render: (_, record) => {
  //                 console.log('Record in Action column:', record);
  //                 console.log(campaignData, "campaigns data");
  //                 // console.log('fbstatus:', record.fbstatus);

  //                 const errorDisplay = (campaign, adset, ad) => {
  //                     if (campaign) {
  //                         return "Campaign Level Error: \n" + campaign;
  //                     } else if (adset) {
  //                         return "Adset Level Error: \n" + adset;
  //                     } else if (ad) {
  //                         return "Ad Level Error: \n" + ad;
  //                     }
  //                     return null;
  //                 };

  //                 if (record.Approval === 'Approved') {
  //                     return (
  //                         <div style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
  //                             <Button className="dark-icon-button" icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
  //                             <Button className="dark-icon-button" icon={<EditOutlined />} onClick={() => handleEditClickAllLevelData(record)} style={{marginLeft:'10px'}}></Button>
  //                             {(record.adlevel_error || record.campaignlevel_error || record.adsetlevel_error) && (
  //                                 <Tooltip title={errorDisplay(record.campaignlevel_error,record.adsetlevel_error,record.adlevel_error)}>
  //                                     <InfoCircleOutlined style={{marginLeft:'10px', color:"red", fontSize:'15px'}}/>
  //                                 </Tooltip>
  //                             ) }
  //                         </div>
  //                     )
  //                 }
  //                 // console.log('Record Status:', record?.fbstatus);
  //                 // if (record.fbstatus === 'Live'){
  //                 //     console.log('Record in Action column:', record);
  //                 //     return (
  //                 //         <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button>
  //                 //     )
  //                 // }

  //                 return (
  //                     <Space size="middle">
  //                         <Button className="dark-icon-button" icon={<EyeOutlined />} onClick={() => handleViewClick(record)}></Button>
  //                         {record.fbstatus !== 'Live' && (
  //                             // <Button icon={<EditOutlined />} onClick={() => handleEditOnlyClick(record)}></Button>
  //                             <Button className="dark-icon-button" icon={<EditOutlined />} onClick={() => handleEditClickAllLevelData(record)}></Button>
  //                         )}
  //                         {record.Approval === 'PENDING_APPROVAL' && (
  //                             <Button style={{backgroundColor:'#91C25F', color: "#000", borderColor: '#91C25F', borderWidth: "0px"}} onClick={() => handleApproval(record)}>Approve</Button>
  //                         )}
  //                         <Modal
  //                             title="Confirm Approval"
  //                             visible={isModalVisible}
  //                             onOk={handleOk}
  //                             onCancel={handleCancel}
  //                             className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
  //                         >
  //                             <p>Are you sure you want to approve?</p>
  //                         </Modal>
  //                     </Space>
  //                 );
  //             }
  //         }

  //     ];
  // console.log(selectedKey);
  // const totalDailySpend = (searchInput ? filteredData : campaignData).reduce((sum, record) => {
  //     return sum + (record.Daily_amount || 0);
  // }, 0) / 100;  // Assuming Daily_amount is in cents
  // const totalDailySpend =
  //   campaignData.reduce((sum, record) => {
  //     return sum + (record.Daily_amount || 0);
  //   }, 0) / 100; // Assuming Daily_amount is in cents
  const totalDailySpend = (() => {
    if (activeTab === "1") {
      return (
        getFilteredSingleCampaigns().reduce(
          (sum, record) => sum + (record.Daily_amount || 0),
          0
        ) / 100
      ).toFixed(2);
    } else if (activeTab === "2") {
      return (
        filteredMultipleAdsetCampaigns.reduce(
          (sum, record) => sum + (record.Daily_amount || 0),
          0
        ) / 100
      ).toFixed(2);
    }
    return "0.00";
  })();

  const onClickDeleteDraft = (id) => {
    // console.log(id, "draft id");
    setDeleteModalVisible(true);
    setDeleteDraftId(id);
  };

  const onClickEditDraft = (id) => {
    setCreateNewDraft(true);
    // setSelecetedDraftToEdit(draftsData.find(draft => draft.id === id));
  };

  // const draftDropdownMenu = (
  //     <Menu
  //       items={draftsData.map((draft) => ({
  //         key: draft.Draft_Name,
  //         label: (
  //           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  //             <span>{draft.Draft_Name}</span>
  //             <span>
  //               <EditOutlined  onClick={()=>{
  //                 setCreateNewDraft(true)
  //                 setSelecetedDraftToEdit(draft);
  //               }} style={{ marginRight: 8 }} />
  //               <DeleteOutlined onClick={() => onClickDeleteDraft(draft.id)} />

  //             </span>
  //           </div>
  //         )
  //       }))}
  //       onClick={(e) => setSelected(e.key)}
  //     />
  // );
  const draftDropdownMenu = (
    <Menu
      items={draftsData.map((draft) => ({
        key: draft.Draft_Name,
        label: (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px",
              borderBottom: "1px solid #f0f0f0",
              backgroundColor: theme === "dark" ? "#2f2f2f" : "#fff",
              color: theme === "dark" ? "#fff" : "#333",
              borderRadius: "4px",
            }}
          >
            <span
              style={{
                // fontWeight: 'bold',
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#333",
              }}
            >
              {draft.Draft_Name}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Tooltip title="Edit">
                <EditOutlined
                  onClick={() => {
                    setCreateNewDraft(true);
                    setSelecetedDraftToEdit(draft);
                  }}
                  style={{
                    marginRight: 10,
                    color: theme === "dark" ? "#fff" : "#007bff",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                  }}
                />
              </Tooltip>
              <Tooltip title="Delete">
                <DeleteOutlined
                  onClick={() => onClickDeleteDraft(draft.id)}
                  style={{
                    color: theme === "dark" ? "#fff" : "#ff4d4f",
                    fontSize: "16px",
                    cursor: "pointer",
                    transition: "color 0.3s ease",
                  }}
                />
              </Tooltip>
            </span>
          </div>
        ),
      }))}
      onClick={(e) => setSelected(e.key)}
    />
  );

  const handleDropdownVisibleChange = (open) => {
    setIsOpen(open); // Set dropdown open state
    // setAccountNumberToPass(null);
  };

  const onChangeSelect = (value) => {
    // setAccount(value);
  }

  const handleChange1 = (currentVisibleSelected) => {
    const visible = filteredAccounts.map(a => String(a.accountNumber));
    const current = currentVisibleSelected.map(String);
    const added = current.filter(id => !selectedValue.includes(id));
    let updated = Array.from(new Set([...selectedValue, ...added]));
    const removed = visible.filter(id =>
      selectedValue.includes(id) && !current.includes(id)
    );
    updated = updated.filter(id => !removed.includes(id));
    setSelectedValue(updated);
    userPickedRef.current = true;
    const last = currentVisibleSelected[currentVisibleSelected.length - 1];
    if (last) {
      const findAccount = (data, accountNumber) =>
        Object.values(data).flat().find((item) => item.accountNumber === accountNumber) || null;
      const accName = findAccount(userdetails?.adAccounts, last);
    }

    onChangeSelect(updated);
    setAccountChanged(true);
  };


  const filteredAccounts = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return accountsAccess;
    return accountsAccess.filter((a) =>
      `${a.accountNumber} ${a.accountName || ""}`.toLowerCase().includes(q)
    );
  }, [accountsAccess, searchText]);

  // const renderAccountsCheckboxes = (theme) => (
  //   <Checkbox.Group
  //     options={filteredAccounts.map((account) => ({
  //       value: String(account.accountNumber),
  //       label: (
  //         <div
  //           style={{
  //             display: 'flex',
  //             justifyContent: 'space-between',
  //             alignItems: 'center',
  //             padding: '5px 10px',
  //             borderBottom: '1px solid #ddd'
  //           }}
  //         >
  //           <div style={{ display: 'flex', flexDirection: 'column' }}>
  //             <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
  //             {/* show accountName only when dropdown open (same as your old pattern) */}
  //             {isOpen && (
  //               <span style={{ fontSize: 12, color: 'gray' }}>
  //                 {account.accountName || ''}
  //               </span>
  //             )}
  //           </div>
  //           <span style={{ textAlign: 'right', marginLeft: 10 }}>
  //             {account.status === "Active" ? (
  //               <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
  //             ) : (
  //               <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />
  //             )}
  //           </span>
  //         </div>
  //       ),
  //     }))}
  //     value={selectedValue}      // array of selected accountNumbers
  //     onChange={handleChange1}   // updates your selectedValue + notifies parent
  //     className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
  //   />
  // );

  const handleCancels = () => setIsModalVisibles(false);

  const handleOks = async () => {
    const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    const commentText = comment.trim();

    if (commentText === "") {
      message.warning("Please enter valid comment");
      return;
    }
    const username = userdetails?.userName;
    const response = await axios.post(
      // "https://www.testapi.adsgoat.in/api/newcreatecommentForLauncher",
      "https://fblaunching.vyaktimetrics.com/open/launcher-comments",
      { Account: universalOject.Account, campaignid: universalOject.campaignid, campaignname: universalOject.campaignname, level: "Launcher", comment: commentText, editedTime: editedTime, username: username },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {
      setLauncherComments(prev => {

        const existsIndex = prev.findIndex(item =>
          item.Account === universalOject.Account &&
          item.campaignid === universalOject.campaignid &&
          item.campaignname === universalOject.campaignname &&
          item.level === "Launcher"
        );

        // If exists → update it
        if (existsIndex !== -1) {
          const updated = [...prev];
          updated[existsIndex] = {
            ...updated[existsIndex],
            comment: commentText,      // <-- your comment variable
            editedTime: editedTime            // formatted time
          };
          return updated;
        }

        // If not exists → add new object
        return [
          ...prev,
          {
            Account: universalOject.Account,
            campaignid: universalOject.campaignid,
            campaignname: universalOject.campaignname,
            level: "Launcher",
            comment: commentText,
            editedTime: editedTime
          }
        ];
      });

    }
    setIsModalVisibles(false);
  }

  const handleDelete = async () => {
    const username = userdetails?.userName;
    // const response = await axios.delete(
    //   // "https://www.testapi.adsgoat.in/api/newdeleteCommentForLauncher",
    //   "https://fblaunching.vyaktimetrics.com/open/launcher-comments",
    //   { Account: universalOject.Account, campaignid: universalOject.campaignid, campaignname: universalOject.campaignname, level: "Launcher", comment: comment, username: username },
    //   {
    //     headers: {
    //       Authorization: localStorage.getItem("token"),
    //     }
    //   }
    // );
    const response = await axios.delete(
      "https://fblaunching.vyaktimetrics.com/open/launcher-comments",
      {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
        data: {
          Account: universalOject.Account,
          campaignid: universalOject.campaignid,
          campaignname: universalOject.campaignname,
          level: "Launcher",
          comment: comment,
          username: username,
        },
      }
    );
    if (response.status === 200 || response.status === 201) {
      setLauncherComments(prev => {

        const existsIndex = prev.findIndex(item =>
          item.Account === universalOject.Account &&
          item.campaignid === universalOject.campaignid &&
          item.campaignname === universalOject.campaignname &&
          item.level === "Launcher"
        );

        // If exists → REMOVE it
        if (existsIndex !== -1) {
          return prev.filter((_, index) => index !== existsIndex);
        }

        // If not exists → ADD new object
        return [
          ...prev,
          {
            Account: universalOject.Account,
            campaignid: universalOject.campaignid,
            campaignname: universalOject.campaignname,
            level: "Launcher",
            comment: comment,
            editedTime: editedTime
          }
        ];
      });


    }
    setIsModalVisibles(false);
  };

  const handleClickComment = (record) => {
    setIsModalVisibles(true)
    setFirstColumnValue(record.campaign_name)
    const commentObject = launcherComments.find(item => item.Account === record.Account_Number && item.campaignid === record.identifier && item.level === "Launcher") || { campaignname: record.campaign_name, Account: record.Account_Number, campaignid: record.identifier, level: "Launcher" };
    setUniversalOject(commentObject)
    if (commentObject.comment) {
      setComment(commentObject.comment)
    } else {
      setComment("")
    }
  }

  const handleCancelsForBulkComments = () => setIsModalVisiblesForBulkComments(false);
  const handleOksForBulkComments = async () => {
    const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");

    const commentText = commentForBulkComments.trim();

    if (checkedRowRecords.length === 0) {
      message.warning("Please select at least one campaign");
      return;
    }

    if (commentText === "") {
      message.warning("Please enter valid comment");
      return;
    }
    const username = userdetails?.userName;
    const response = await axios.post(
      // "https://www.testapi.adsgoat.in/api/newbulkCreateCommentForLauncher",
      "https://fblaunching.vyaktimetrics.com/open/comments/bulk-create",
      {
        items: checkedRowRecords.map(c => ({
          Account: c.Account_Number,
          campaignid: c.identifier,
          campaignname: c.campaign_name,
          comment: commentText,
          editedTime: editedTime,
          username: username
        })),
        level: "Launcher"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {

      setLauncherComments(prev => {
        const updatedList = [...prev];

        checkedRowRecords.forEach(c => {
          const Account = c.Account_Number;
          const campaignid = c.identifier;
          const campaignname = c.campaign_name;

          const existsIndex = updatedList.findIndex(item =>
            item.Account === Account &&
            item.campaignid === campaignid &&
            item.campaignname === campaignname &&
            item.level === "Launcher"
          );

          if (existsIndex !== -1) {
            // ✅ Update existing object
            updatedList[existsIndex] = {
              ...updatedList[existsIndex],
              comment: commentText,
              editedTime: editedTime
            };
          } else {
            // ✅ Add new object
            updatedList.push({
              Account,
              campaignid,
              campaignname,
              level: "Launcher",
              comment: commentText,
              editedTime: editedTime
            });
          }
        });

        return updatedList;
      });

    }

    setIsModalVisiblesForBulkComments(false);
  }

  const handleDeleteForBulkComments = async () => {
    if (checkedRowRecords.length === 0) {
      message.warning("Please select at least one campaign to delete comment");
      return;
    }
    const username = userdetails?.userName;
    const response = await axios.post(
      // "https://www.testapi.adsgoat.in/api/newbulkDeleteCommentForLauncher",
      "https://fblaunching.vyaktimetrics.com/open/comments/bulk-delete",
      {
        items: checkedRowRecords.map(c => ({
          Account: c.Account_Number,
          campaignid: c.identifier,
          campaignname: c.campaign_name,
          username: username
        })),
        level: "Launcher"
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: localStorage.getItem("token"),
        }
      }
    );
    if (response.status === 200 || response.status === 201) {

      setLauncherComments(prev => {

        return prev.filter(item =>
          !checkedRowRecords.some(c =>
            item.Account === c.Account_Number &&
            item.campaignid === c.identifier &&
            item.campaignname === c.campaign_name &&
            item.level === "Launcher"
          )
        );

      });

    }

    setIsModalVisiblesForBulkComments(false);
  };

  // const tableData = getFilteredMultipleAdsetCampaigns();
  const hasData = Array.isArray(checkedRowRecords) && checkedRowRecords.length > 0;


  const renderAccountsCheckboxes = (theme) => {
    const activeAccountNumbers = filteredAccounts
      .filter(acc => acc.status === "Active")
      .map(acc => String(acc.accountNumber));

    const allActiveSelected =
      activeAccountNumbers.length > 0 &&
      activeAccountNumbers.every(acc => selectedValue.includes(acc));

    return (
      <>
        <div style={{ padding: '5px 10px', borderBottom: '1px solid #ddd' }}>
          <Checkbox
            className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
            checked={allActiveSelected}
            indeterminate={
              selectedValue.length > 0 &&
              !allActiveSelected &&
              activeAccountNumbers.some(acc => selectedValue.includes(acc))
            }
            onChange={(e) => {
              if (e.target.checked) {
                handleChange1(activeAccountNumbers);
              } else {
                const remaining = selectedValue.filter(
                  val => !activeAccountNumbers.includes(val)
                );
                handleChange1(remaining);
              }
            }}
          >
            <strong>All Accounts</strong>
          </Checkbox>
          <TiTickOutline
            style={{
              fontSize: 20,
              color: "#52c41a",
              cursor: "pointer",
            }}
            title="Select All Active Accounts"
            onClick={handleApply}
          />
          <TiTimesOutline
            style={{
              fontSize: 20,
              color: "#ff4d4f",
              cursor: "pointer",
            }}
            title="Unselect All"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleChange1([]);

            }}
          />
        </div>
        <Checkbox.Group
          options={filteredAccounts.map((account) => ({
            value: String(account.accountNumber),
            label: (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 10px',
                  borderBottom: '1px solid #ddd'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>{account.accountNumber}</span>
                  {isOpen && (
                    <span style={{ fontSize: 12, color: 'gray' }}>
                      {account.accountName || ''}
                    </span>
                  )}
                </div>
                <span style={{ textAlign: 'right', marginLeft: 10 }}>
                  {account.status === "Active" ? (
                    <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} />
                  ) : (
                    <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} />
                  )}
                </span>
              </div>
            ),
          }))}
          value={selectedValue}
          onChange={handleChange1}
          className={theme === 'dark' ? 'checkbox-group-dark' : 'checkbox-group-light'}
        />
      </>
    );
  };
  const renderCloneAccountsCheckboxes = (theme) => {
    const accounts =
      userdetails?.adAccounts?.[cloneSelectedKey] || [];

    // Search accounts
    const filteredAccounts = accounts.filter((account) =>
      String(account?.accountNumber || "")
        .toLowerCase()
        .includes(cloneSearchText.toLowerCase())
    );

    // Only valid account numbers
    const accountNumbers = filteredAccounts
      .map((account) => account?.accountNumber)
      .filter(Boolean);

    // Check whether all currently visible accounts are selected
    const allSelected =
      accountNumbers.length > 0 &&
      accountNumbers.every((accountNumber) =>
        cloneSelectedValue.includes(accountNumber)
      );

    // Check whether some accounts are selected
    const someSelected =
      accountNumbers.some((accountNumber) =>
        cloneSelectedValue.includes(accountNumber)
      );

    // ==============================
    // SELECT / UNSELECT ALL
    // ==============================
    const handleSelectAllCloneAccounts = () => {
      // Only ACTIVE accounts
      const activeAccountNumbers = filteredAccounts
        .filter(
          (account) =>
            account?.status === "Active" ||
            account?.status === "ACTIVE"
        )
        .map((account) => account?.accountNumber)
        .filter(Boolean);

      const allActiveSelected =
        activeAccountNumbers.length > 0 &&
        activeAccountNumbers.every((accountNumber) =>
          cloneSelectedValue.includes(accountNumber)
        );

      if (allActiveSelected) {
        // Unselect only active accounts
        setCloneSelectedValue((prev) =>
          prev.filter(
            (accountNumber) =>
              !activeAccountNumbers.includes(accountNumber)
          )
        );
      } else {
        // Select only active accounts
        setCloneSelectedValue((prev) => [
          ...new Set([
            ...prev,
            ...activeAccountNumbers,
          ]),
        ]);
      }
    };

    // ==============================
    // NO ACCOUNTS
    // ==============================
    if (!cloneSelectedKey) {
      return (
        <div
          style={{
            padding: "10px",
            textAlign: "center",
            color:
              theme === "dark"
                ? "#aaa"
                : "#999",
          }}
        >
          Please select a network
        </div>
      );
    }

    if (accounts.length === 0) {
      return (
        <div
          style={{
            padding: "10px",
            textAlign: "center",
            color:
              theme === "dark"
                ? "#aaa"
                : "#999",
          }}
        >
          No accounts available
        </div>
      );
    }

    return (
      <div>
        {/* ================================= */}
        {/* ALL ACCOUNTS */}
        {/* ================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 4px",
            marginBottom: 5,
            borderBottom:
              theme === "dark"
                ? "1px solid #444"
                : "1px solid #ddd",
            cursor: "pointer",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            handleSelectAllCloneAccounts();
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={
                !allSelected && someSelected
              }
              onChange={(e) => {
                e.stopPropagation();

                handleSelectAllCloneAccounts();
              }}
            />

            <span
              style={{
                marginLeft: 8,
                fontWeight: 600,
                color:
                  theme === "dark"
                    ? "#fff"
                    : undefined,
              }}
            >
              All Accounts
            </span>
          </div>
        </div>

        {/* ================================= */}
        {/* ACCOUNTS */}
        {/* ================================= */}

        {filteredAccounts.length === 0 ? (
          <div
            style={{
              padding: "10px",
              textAlign: "center",
              color:
                theme === "dark"
                  ? "#aaa"
                  : "#999",
            }}
          >
            No accounts found
          </div>
        ) : (
          filteredAccounts.map((account) => {
            const accountNumber =
              account?.accountNumber;

            if (!accountNumber) {
              return null;
            }

            const checked =
              cloneSelectedValue.includes(
                accountNumber
              );

            const isActive =
              account?.status === "Active" ||
              account?.status === "ACTIVE";

            return (
              <div
                key={accountNumber}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "7px 4px",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setCloneSelectedValue((prev) => {
                    if (
                      prev.includes(accountNumber)
                    ) {
                      return prev.filter(
                        (item) =>
                          item !== accountNumber
                      );
                    }

                    return [
                      ...prev,
                      accountNumber,
                    ];
                  });
                }}
              >
                {/* ========================= */}
                {/* LEFT SIDE */}
                {/* ========================= */}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Checkbox
                    checked={checked}
                    onChange={(e) => {
                      e.stopPropagation();

                      setCloneSelectedValue(
                        (prev) => {
                          if (
                            e.target.checked
                          ) {
                            return prev.includes(
                              accountNumber
                            )
                              ? prev
                              : [
                                ...prev,
                                accountNumber,
                              ];
                          }

                          return prev.filter(
                            (item) =>
                              item !==
                              accountNumber
                          );
                        }
                      );
                    }}
                  />

                  <div
                    style={{
                      marginLeft: 8,
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* ACCOUNT NUMBER */}
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        color:
                          theme === "dark"
                            ? "#fff"
                            : undefined,
                      }}
                    >
                      {accountNumber}
                    </span>

                    {/* ACCOUNT NAME */}
                    {account?.accountName && (
                      <span
                        style={{
                          fontSize: 12,
                          marginTop: 2,
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                          color:
                            theme === "dark"
                              ? "#aaa"
                              : "#888",
                        }}
                      >
                        {account.accountName}
                      </span>
                    )}
                  </div>
                </div>

                {/* ========================= */}
                {/* STATUS */}
                {/* ========================= */}

                <div
                  style={{
                    marginLeft: 10,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {isActive ? (
                    <CheckCircleFilled
                      style={{
                        color: "#91C25F",
                        fontSize: 15,
                      }}
                      className="black-icon-active-1"
                    />
                  ) : (
                    <CloseCircleFilled
                      style={{
                        color: "#EC7117",
                        fontSize: 15,
                      }}
                      className="black-icon-pause-1"
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    );
  };
  const fetchInitialData = async () => {
    try {
      const response = await axios.get(
        "https://fblaunching.vyaktimetrics.com/open/taboola/ad-status/list",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data?.ok) {
        setTableData(response.data.data || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInitialDataForPredictoAdStatus = async () => {
    try {
      setLoadingAdPolicies(true)
      const response = await axios.get(
        "https://fblaunching.vyaktimetrics.com/open/predicto/ad-status/list",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data?.ok) {
        setPredictoAdStatusData(response.data.data || []);
        setPredictoAdDeatils(response.data.adDetails)
      }
    } catch (error) {
      console.error(error);
    }
    finally {
      setLoadingAdPolicies(false);
    }
  };

  const fetchInitialDataForPredictoKeywordStatus = async () => {
    setLoadingKeyword(true);
    try {

      const response = await axios.get(
        "https://fblaunching.vyaktimetrics.com/open/predicto/keyword/keyword-status/list",
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data?.ok) {
        setPredictoKeywordStatusData(response.data.data || []);
        const statusList = [...new Set(response.data.data.map(item => item.status))];
        const languageList = [...new Set(response.data.data.map(item => item.language))];
        const verticleList = [...new Set(response.data.data.map(item => item.vertical))];
        keywordStatusDataRef.current = response.data.data || [];
        filtersList.current = response.data.data.length ? ({ languageList: languageList, statusList: statusList, verticleList: verticleList }) : { languageList: [], statusList: [], verticleList: [] }
        setPredictoKeywordArticleStatusData(response.data.article);
        lastUpdatedDateandTime.current = `Last updated ${response.data.data[0].last_updated}`
        setLoadingKeyword(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingKeyword(false);
    }
  };

  const fetchPredictoArticleForKeyword = async (keyword) => {
    setLoadingArticleForKeyword((prev) => [...prev, keyword.id]);
    try {

      const response = await axios.post(
        "https://fblaunching.vyaktimetrics.com/open/predicto/keyword/article-status-single",
        { keyword: keyword },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      if (response.data?.success) {
        setPredictoKeywordArticleStatusData((prev) => {
          const exists = prev.some(
            (item) => item.keyword_id === response.data.results.keyword_id
          );

          return exists
            ? prev.map((item) =>
              item.keyword_id === response.data.results.keyword_id
                ? { ...item, ...response.data.results }
                : item
            )
            : [...prev, response.data.results];
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingArticleForKeyword((prev) =>
        prev.filter((id) => id !== keyword.id)
      );
    }
  }

  // useEffect(() => {
  //   if (keywordSearch) {
  //     const getTheSearchResult = keywordStatusDataRef.current.filter(item => item.keyword.toLowerCase().includes(keywordSearch.toLowerCase()))
  //     setPredictoKeywordStatusData(getTheSearchResult);
  //     // console.log(getTheSearchResult);
  //   }
  //   else {
  //     setPredictoKeywordStatusData(keywordStatusDataRef.current)
  //   }
  // }, [keywordSearch, verticleSearch, statusSearch, languageSearch])
  useEffect(() => {
    let filteredData = [...keywordStatusDataRef.current];

    if (keywordSearch) {
      filteredData = filteredData.filter((item) =>
        item.keyword
          ?.toLowerCase()
          .includes(keywordSearch.toLowerCase())
      );
    }

    if (verticleSearch && verticleSearch !== "all") {
      filteredData = filteredData.filter(
        (item) => item.vertical === verticleSearch
      );
    }

    if (statusSearch && statusSearch !== "all") {
      filteredData = filteredData.filter(
        (item) => item.status === statusSearch
      );
    }

    if (languageSearch && languageSearch !== "all") {
      filteredData = filteredData.filter(
        (item) => item.language === languageSearch
      );
    }

    setPredictoKeywordStatusData(filteredData);
  }, [keywordSearch, verticleSearch, statusSearch, languageSearch]);

  const handleCheckStatus = async () => {
    try {
      setLoading(true);

      const ids = adIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const response = await axios.post(
        "https://fblaunching.vyaktimetrics.com/open/taboola/ad-status",
        {
          adIds: ids,
          adNetwork: platform
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // const { sessionId, results } = response.data;

      // const tableRows = results.map((item) => ({
      //   ...item,
      //   sessionId,
      // }));

      // setTableData(tableRows);
      const { sessionId, results } = response.data;

      setTableData(prev => {
        const existing = new Map(
          prev.map(item => [item.adId, item])
        );

        results.forEach(item => {
          existing.set(item.adId, {
            ...existing.get(item.adId),
            ...item,
            sessionId,
          });
        });

        return [...existing.values()];
      });

      message.success("Ad status fetched successfully");
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
        "Failed to fetch ad status"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCheckPredictoAdStatus = async () => {
    try {
      setLoading(true);

      const ids = adIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

      const response = await axios.post(
        "https://fblaunching.vyaktimetrics.com/open/predicto/ad-status",
        {
          adIds: ids,
          dates: { startDate: startDateForAds, endDate: endDateForAds },
          adNetwork: platform
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // const { sessionId, results } = response.data;

      // const tableRows = results.map((item) => ({
      //   ...item,
      //   sessionId,
      // }));

      // setTableData(tableRows);
      const { sessionId, results } = response.data;

      setPredictoAdStatusData(prev => {
        const existing = new Map(
          prev.map(item => [item.ad_id, item])
        );

        const newItems = [];

        results.forEach(item => {
          if (existing.has(item.ad_id)) {
            // Update existing object
            existing.set(item.ad_id, {
              ...existing.get(item.ad_id),
              ...item,
            });
          } else {
            // Collect new objects
            newItems.push(item);
          }
        });

        return [...newItems, ...existing.values()];
      });

      message.success("Ad status fetched successfully");
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
        "Failed to fetch ad status"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCheckPredictoKeywordStatus = async () => {
    try {
      setLoading(true);
      setLoadingKeyword(true);

      const response = await axios.get(
        "https://fblaunching.vyaktimetrics.com/open/predicto/keyword/keyword-status",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // const { sessionId, results } = response.data;

      // const tableRows = results.map((item) => ({
      //   ...item,
      //   sessionId,
      // }));

      // setTableData(tableRows);
      const { results } = response.data;

      if (response.data?.success) {
        const descOrderByCreatedDate = results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setPredictoKeywordStatusData(descOrderByCreatedDate || []);
        const statusList = [...new Set(results.map(item => item.status))];
        const languageList = [...new Set(results.map(item => item.language))];
        const verticleList = [...new Set(results.map(item => item.vertical))];
        keywordStatusDataRef.current = descOrderByCreatedDate || [];
        filtersList.current = results.length ? ({ languageList: languageList, statusList: statusList, verticleList: verticleList }) : { languageList: [], statusList: [], verticleList: [] }
        // setPredictoKeywordArticleStatusData(response.data.article);
        lastUpdatedDateandTime.current = `Last updated ${results[0].last_updated}`
        setLoadingKeyword(false);
      }

      message.success("Keyword status fetched successfully");
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
        "Failed to fetch ad status"
      );
    } finally {
      setLoading(false);
      setLoadingKeyword(false);
    }
  };
  const handleToggleTaboolaStatus = async () => {
    if (!showTaboolaStatus) {
      await fetchInitialData();
    }
    setShowTaboolaStatus(!showTaboolaStatus);
  };

  const handleTogglePredictoAdStatus = async () => {
    if (!showPredictoadStatus) {
      setShowPredictoKeywordStatus(false);
      setShowPredictoadStatus(true);
      await fetchInitialDataForPredictoAdStatus();
    }
    else {
      setShowPredictoadStatus(false);
    }
    // setShowPredictoadStatus(!showPredictoadStatus);
    // setShowPredictoKeywordStatus(false)
  }

  const handleTogglePredictoKeywordStatus = async () => {
    // if (!showPredictoKeywordStatus) {
    //   setLoadingKeyword(true);
    //   await fetchInitialDataForPredictoKeywordStatus();
    // }
    // setShowPredictoKeywordStatus(!showPredictoKeywordStatus);
    // setShowPredictoadStatus(false)
    if (!showPredictoKeywordStatus) {
      setShowPredictoKeywordStatus(true);
      setShowPredictoadStatus(false);

      await fetchInitialDataForPredictoKeywordStatus();
    } else {
      setShowPredictoKeywordStatus(false);
    }
  }

  const filteredTableData = appliedSearch
    ? tableData.filter((item) =>
      item.adId?.toString().includes(appliedSearch.trim())
    )
    : tableData;

  // const filteredPredictoAdStatusData = predictoAdPoliciesAppliedSearch
  //   ? predictoAdStatusData.filter((item) =>
  //     item.ad_id?.toString().includes(predictoAdPoliciesAppliedSearch.trim())
  //   )
  //   : predictoAdStatusData;
  const filteredPredictoAdStatusData = predictoAdPoliciesAppliedSearch.length
    ? predictoAdStatusData.filter((item) =>
      predictoAdPoliciesAppliedSearch.includes(item.ad_id?.toString())
    )
    : predictoAdStatusData;

  const renderExpandedRow = useCallback(
    (record) => (
      <ExpandedAdsetsContent
        record={record}
        network={selectedKey}
      />
    ),
    [selectedKey]
  );

  // const storeTheKeyword = (keyword) => {
  //   console.log(keyword, "keyword");
  //   setPredictoKeywordStatusData(prev => ([keyword, ...prev]))
  //   keywordStatusDataRef.current 
  //   setOpenComponentForCreateArticle(false)
  // }
  const storeTheKeyword = (keyword) => {
    const updatedData = [keyword, ...(keywordStatusDataRef.current || [])];

    keywordStatusDataRef.current = updatedData;
    setPredictoKeywordStatusData(updatedData);

    setOpenComponentForCreateArticle(false);
  };

  return (
    <div>
      <CreateCampaignDrawer
        visible={cdrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        draftsData={draftsData}
      />

      <EditAllLevelDataDrawer
        visible={viewEditAllLevelDataDrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedEditAllLevelData}
      />

      <EditMultipleAdsetCampaignDrawer
        view={view}
        visible={viewEditMultipleAdsetDataDrawerVisible}
        accountis={selectedEditMultipleAdsetData?.Account_Number}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedEditMultipleAdsetData}
      />
      <CloneMultipleAdsetCampaignDrawer
        visible={viewCloneMultipleAdsetDataDrawerVisible}
        accountis={createcamselectedacc}
        onClose={onCloseDrawer}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
        selectedRow={selectedCloneMultipleAdsetData}
      />

      <DuplicateCampaignDrawer
        visible={dupdrawerVisible}
        onClose={onCloseDrawer}
        selectedRow={duplicatenewcampaigns}
        changeRRefrst={changeRRefrst}
        network={selectedKey}
      />

      <CreateDraft
        visible={createNewDraft}
        onClose={onCloseDrawer}
        changeRRefrst={changeDraftRefresh}
        selectedDraftToEdit={selectedDraftToEdit}
      />

      <ViewDrawer
        rowData={selectedRowData}
        visible={viewDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setViewDrawerVisible(false)}
      />
      <EditCampaignDrawer
        rowData={selectedEditRowData}
        visible={viewEditDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setViewEditDrawerVisible(false)}
      />
      <EditCampaignDrawer1
        rowData={selectedOnlyEditData}
        visible={editOnlyDrawerVisible}
        changeRRefrst={changeRRefrst}
        onClose={() => setEditOnlyDrawerVisible(false)}
      />

      <AddSuggestedKeywordModal
        open={openComponentForCreateArticle}
        onClose={() => setOpenComponentForCreateArticle(false)}
        // onSuccess={() => refetch()}
        storeInState={storeTheKeyword}
      />
      {/* <Editcam
                rowData={selectedEditCampaign}
                visible={EditcamapaignDrawerVisible}
                onClose={() => setEditcamapaignDrawerVisible(false)}
            /> */}
      <Card
        style={{
          marginBottom: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          borderRadius: "10px",
        }}
        headStyle={{
          borderBottom: "none",
          paddingBottom: 0,
        }}
        title={
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: theme === "dark" ? "#fff" : "#1c1e21",
                lineHeight: "30px",
              }}
            >
              Campaign Management
            </div>
            <div
              style={{
                fontSize: 12,
                color: theme === "dark" ? "#b0b3b8" : "#65676b",
              }}
            >
              Create, manage, and optimize your advertising campaigns
            </div>
          </div>
        }
        size="small"
        extra={
          <div style={{ display: 'flex', gap: "10px" }}>
            <Tooltip title="Click the icon to view the latest spent and remaining amount" overlayInnerStyle={{
              backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
              color: theme === "dark" ? "#ffffff" : "#000000",
            }}>
              <SyncOutlined style={{ fontSize: "18px", cursor: "pointer" }} onClick={handleAccountBalance} />
            </Tooltip>

            <span
              style={{
                backgroundColor: "transparent",
                padding: "5px 8px",
                borderRadius: "8px",
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid #4caf50",
              }}
            >
              Spent: ${accountBalance}
            </span>
            <span
              style={{
                backgroundColor: "transparent",
                padding: "5px 8px",
                borderRadius: "8px",
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#000",
                border: '1px solid #91d5ff',
              }}
            >
              Remaining amount: ${accountRemaining}
            </span>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `/Campaigns/AdLibrary`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }}

              style={{
                backgroundColor: "#91C25F",
                color: "#000",
                border: "none",
                border: "#4caf50",
              }}
            >
              Ad Library
            </Button>
            {userdetails?.role !== "Network_Partner" && (

              <Button
                onClick={showDrawer}
                icon={<PlusOutlined className="black-icon" />}
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  border: "none",
                  border: "#4caf50",
                }}
              >
                New Campaign
              </Button>

            )}
          </div>
        }

      >

        {/* Entire filter section in one single aligned row */}
        <Row
          align="middle"
          justify="space-between"
          style={{ flexWrap: "wrap", rowGap: "5px" }}
        >

          <Col
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              alignItems: "center",
            }}
          >
            {/* 🔹 Select Project */}
            <Select
              showSearch
              placeholder="Select Projects"
              style={{ width: isMobile ? 210 : 130 }}
              onChange={handleKeyChange}
              value={selectedKey}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select`}
            >
              {/* {options.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))} */}
              {options
                .sort((a, b) => {
                  const aActive = networksWithStatus.find(n => n.Network === a.label)?.Status === "Active" ? 1 : 0;
                  const bActive = networksWithStatus.find(n => n.Network === b.label)?.Status === "Active" ? 1 : 0;
                  return bActive - aActive; // active first
                })
                .map(option => {
                  const isActive = networksWithStatus.find(n => n.Network === option.label)?.Status === "Active";
                  return (
                    <Option key={option.value} value={option.value}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isActive
                          ? <CheckCircleFilled style={{ color: '#91C25F', fontSize: 15 }} className='black-icon-active-1' />
                          : <CloseCircleFilled style={{ color: '#EC7117', fontSize: 15 }} className='black-icon-pause-1' />}
                        <span>{option.label}</span>
                      </div>
                    </Option>
                  );
                })
              }


            </Select>

            {/* 🔹 Select Account */}
            {/* <Select
              showSearch
              mode="multiple"
              placeholder="Select Accounts"
              style={{ width: 225 }}
              onChange={handleValueChange}
              disabled={!selectedKey}
              value={selectedValue}
              optionLabelProp="label" 
              maxTagCount={1}                                      // 👈 always show only the first selected
              maxTagPlaceholder={(omitted) => `+${omitted.length}`} // 👈 rest as a count
              optionFilterProp="children"
              filterOption={(input, option) =>
                /^[0-9]*$/.test(input) &&
                option?.value.toString().includes(input)
              }
              onDropdownVisibleChange={(open) => setIsOpen(open)}
              dropdownClassName={theme === "dark" && "custom-dropdown"}
              className={`${theme === "dark" ? "dark-theme" : "light-theme"
                } green-border-select vm-accounts-one-line`}
            >
              {valueOptions.map((option) => (
                <Select.Option key={option.value} value={option.value} label={option.value}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "70%",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {option.label}
                      </p>
                      {isOpen && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            color: "gray",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {option.accountName || ""}
                        </p>
                      )}
                    </div>
                    <span>
                      {option.status === "Active" ? (
                        <CheckCircleFilled
                          style={{ color: "#91C25F", fontSize: 15 }}
                          className='black-icon-active-1'
                        />
                      ) : (
                        <CloseCircleFilled
                          style={{ color: "#EC7117", fontSize: 15 }}
                          className='black-icon-pause-1'
                        />
                      )}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select> */}

            <Select
              showSearch
              onSearch={setSearchText}
              searchValue={searchText}
              placeholder="Select Account"
              // Keep the visible state you already have
              open={isOpen}
              onDropdownVisibleChange={handleDropdownVisibleChange}

              // 👇 Show first account + count
              value={
                selectedValue.length === 0
                  ? undefined
                  : selectedValue.length === 1
                    ? selectedValue[0] // just that account number
                    : `${selectedValue[0]}, +${selectedValue.length - 1} more`
              }

              dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
              className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
              style={{
                width: isMobile ? '350px' : '250px',
                whiteSpace: 'nowrap',
                color: theme === 'dark' ? 'white' : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                border: '1px solid #4CAF50',
                borderRadius: '6px',
              }}

              // We are not using built-in options anymore
              optionFilterProp="value"
              // options={accountsAccess.map(createOption)}  // ❌ remove
              // onChange={handleChange1}                    // ❌ remove

              // Custom dropdown with checkboxes (no tick marks in the menu)
              dropdownRender={() => (
                <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
                  {renderAccountsCheckboxes(theme)}
                </div>
              )}
            />

            {/* 🔹 Date Picker */}
            {/* <ConfigProvider
              theme={{
                token: { colorPrimary: "#91C25F", colorTextLightSolid: "#000" },
              }}
            >
              <RangePicker
                className="green-border-picker"
                presets={rangePresets}
                onChange={handleChange}
                disabledDate={disabledDate}
                style={{
                  width: 215,
                  backgroundColor: theme === "dark" ? "#555" : undefined,
                  color: theme === "dark" ? "white" : undefined,
                }}
                defaultValue={[dayjs(), dayjs()]}
                dropdownClassName={`${theme === "dark" ? "dark-theme-dropdown" : ""
                  }`}
              />
            </ConfigProvider> */}

            <Col flex="none" className='Dashboard-Details-1'>
              <ConfigProvider
                // locale={locale}
                theme={{
                  token: {
                    colorPrimary: '#91C25F',
                    colorTextLightSolid: '#000',
                  },
                }}
              >
                <RangePicker
                  presets={rangePresets}
                  onChange={handleChange}
                  disabledDate={disabledDate}
                  // defaultValue={defaultDates}
                  defaultValue={[dayjs(), dayjs()]}
                  format="YYYY-MM-DD"
                  style={{
                    width: '220px',
                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                    color: theme === 'dark' ? 'white' : undefined,
                    border: '1px solid #4CAF50',
                    borderRadius: '6px'
                  }}
                  dropdownClassName={`${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                />
              </ConfigProvider>
            </Col>
            <Col flex="none" className='Dashboard-Details-2'>
              <ConfigProvider
                // locale={locale}
                theme={{
                  token: {
                    colorPrimary: '#91C25F',
                    colorTextLightSolid: '#000',
                  },
                }}
              >
                <RangePicker
                  presets={rangePresets}
                  onChange={handleChange}
                  disabledDate={disabledDate}
                  // defaultValue={defaultDates}
                  defaultValue={[dayjs(), dayjs()]}
                  format="YYYY-MM-DD"
                  style={{
                    width: isMobile ? '340px' : '240px',
                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                    color: theme === 'dark' ? 'white' : undefined,
                    border: '1px solid #4CAF50',
                    borderRadius: '6px'
                  }}
                  // dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}
                  dropdownClassName={`custom-single-month-picker Dashboard-Details-2${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                />
              </ConfigProvider>
            </Col>
            {/* 🔹 Apply Button */}
            <Button
              type="primary"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              onClick={handleApply}
              style={{
                backgroundColor: hovered ? "#91C25F" : "transparent",
                border: "1px solid #4CAF50",
                borderRadius: "8px",
                color: theme === "dark" ? "#ffffff" : "#000000",
                height: "32px",
                padding: "0 8px",
                transition: "all 0.15s ease-in-out",
              }}
            >
              Apply
            </Button>
            {(selectedKey === "Taboola_Inuvoprism" &&
              <Button
                type="primary"
                // onMouseEnter={() => setHovered(true)}
                // onMouseLeave={() => setHovered(false)}
                // onClick={() => setShowTaboolaStatus(!showTaboolaStatus)}
                onClick={handleToggleTaboolaStatus}
                style={{
                  backgroundColor: "#91C25F",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  height: "32px",
                  padding: "0 8px",
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {showTaboolaStatus ? "Launching" : "Ad Policies"}
              </Button>
            )}
            {(selectedKey === "FB_Predicto" &&
              <Button
                type="primary"
                // onMouseEnter={() => setHovered(true)}
                // onMouseLeave={() => setHovered(false)}
                // onClick={() => setShowTaboolaStatus(!showTaboolaStatus)}
                onClick={handleTogglePredictoAdStatus}
                style={{
                  backgroundColor: "#91C25F",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  height: "32px",
                  padding: "0 8px",
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {showPredictoadStatus ? "Launching" : "Ad Policies"}
              </Button>
            )}
            {(selectedKey === "FB_Predicto" &&
              <Button
                type="primary"
                // onMouseEnter={() => setHovered(true)}
                // onMouseLeave={() => setHovered(false)}
                // onClick={() => setShowTaboolaStatus(!showTaboolaStatus)}
                onClick={handleTogglePredictoKeywordStatus}
                style={{
                  backgroundColor: "#91C25F",
                  border: "1px solid #4CAF50",
                  borderRadius: "8px",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  height: "32px",
                  padding: "0 8px",
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {showPredictoKeywordStatus ? "Launching" : "Article"}
              </Button>
            )}
            {isMobile && filteredMultipleAdsetCampaigns.length > 0 && (
              <div
                style={{
                  textAlign: "right",
                  fontSize: "13px",
                  paddingLeft: "15px",
                  color: theme === "dark" ? "#e4e6eb" : "#050505",
                }}
              >
                Total Campaigns: {filteredMultipleAdsetCampaigns.length}
              </div>
            )}

            {/* 🔹 Search */}
          </Col>
          <Col
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "3px",
              alignItems: "center",
            }}
          >
            {!isMobile && filteredMultipleAdsetCampaigns.length > 0 && (
              <div
                style={{
                  textAlign: "right",
                  fontSize: "13px",
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
              value={searchInput}
              onChange={handleSearchChange}
              onPressEnter={handleSearchSubmit}
              className={
                theme === "dark" ? "custom-input-dark" : "custom-input-light"
              }
              style={{
                width: "150px",
                border: "1px solid #4caf50",
              }}
            />
            <Dropdown
              overlay={
                <Menu
                  onClick={({ key }) => onStatusFilterChange(key)}
                  items={[
                    {
                      key: "all",
                      label: (
                        <span
                          style={{
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#122F6E",
                              marginRight: "6px",
                            }}
                          ></span>
                          All
                        </span>
                      ),
                    },
                    {
                      key: "active",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "green",
                              marginRight: "6px",
                            }}
                          ></span>
                          Active
                        </span>
                      ),
                    },
                    {
                      key: "pause",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "red",
                              marginRight: "6px",
                            }}
                          ></span>
                          Paused
                        </span>
                      ),
                    },
                    {
                      key: "pending",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#EC7117",
                              marginRight: "6px",
                            }}
                          ></span>
                          Pending
                        </span>
                      ),
                    },
                    {
                      key: "reject",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "red",
                              marginRight: "6px",
                            }}
                          ></span>
                          Reject
                        </span>
                      ),
                    },
                    {
                      key: "error",
                      label: (
                        <span
                          style={{
                            fontSize: "13px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#EC7117",
                              marginRight: "6px",
                            }}
                          ></span>
                          Error
                        </span>
                      ),
                    },
                  ]}
                />
              }
              trigger={["click"]}
            >
              <Button
                style={{
                  borderRadius: 8,
                  background:
                    theme === "dark" ? "rgba(82,196,26,0.12)" : "#f6ffed",
                  border: "1px solid #4CAF50",
                  color: theme === "dark" ? "#95de64" : "#389e0d",
                  fontWeight: 500,
                  width: 80,
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
              overlay={
                <Menu
                  onClick={({ key }) => setTypeFilter(key)}
                  items={[
                    { key: 'All', label: 'All' },
                    { key: 'Daily', label: 'Daily' },
                    { key: 'Lifetime', label: 'Lifetime' },
                  ]}
                />
              }
              trigger={['click']}
            >
              <Button
                style={{
                  borderRadius: 8,
                  background: theme === 'dark' ? 'rgba(24,144,255,0.06)' : '#e6f7ff',
                  border: '1px solid #91d5ff',
                  color: theme === 'dark' ? '#69c0ff' : '#1d39c4',
                  fontWeight: 500,

                }}
              >
                {typeFilter} <DownOutlined />
              </Button>
            </Dropdown>

            {/* 🔹 Total Daily Spend */}
            {/* <span
              style={{
                backgroundColor: "transparent",
                padding: "5px 14px",
                borderRadius: "8px",
                fontSize: "14px",
                color: theme === "dark" ? "#fff" : "#000",
                border: "1px solid #4caf50",
              }}
            >
              Budget: ${totalDailySpend}
            </span> */}
            {userdetails?.role !== "Network_Partner" && (
              <span
                style={{
                  backgroundColor: "transparent",
                  padding: "5px 10px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: theme === "dark" ? "#fff" : "#000",
                  border: "1px solid #4caf50",
                }}
              >
                Budget: ${totalDailySpend}
              </span>
            )}
            {/* 🔹 Refresh Button */}
            <Button
              type="primary"
              onClick={handleRefresh}
              icon={<ReloadOutlined className="black-icon" />}
              style={{
                backgroundColor: "#91C25F",
                color: "#000",
                border: "none",
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* <div>{renderCarouselNav()}</div> */}

      {/* {loading ? (
        <Skeleton
          active
          paragraph={{ rows: 12 }}
          style={{ marginTop: "10px" }}
        />
      ) 
      : (
        // <Table
        //     style={{
        //         width: "100%",
        //         height: "calc(100vh - 300px)", // Full height minus header/footer space
        //         minHeight: "100%", // Ensures minimum height is filled even with fewer rows
        //         tableLayout: "fixed", // Ensures proper layout of the table with defined width
        //     }}
        //     className={`custom-dark-table ${theme === 'dark' ? 'dark-mode-pagination' : 'light-mode-pagination'}`}
        //     columns={columns}
        //     dataSource={campaignData.map((item, index) => ({
        //         ...item,
        //         key: index
        //     })).reverse()}
        //     pagination={{ pageSize: paginationSize }}
        //     scroll={{
        //         x: 'max-content', // Enable horizontal scroll if needed
        //          y: 'calc(63vh)'
        //     }}
        //     expandable={{
        //         expandedRowRender: (record) => (
        //             <ExpandedRowContent
        //                 record={record}
        //                 changeRRefrst={changeRRefrst}
        //                 network={selectedKey}
        //             />
        //         ),
        //         rowExpandable: (record) => !!record
        //     }}

        // />
        // <div>
        //   <div>

        //   </div>
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            renderTabBar={() => <></>}
          >
            <Tabs.TabPane key="1">
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columns}
                dataSource={getFilteredSingleCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedRowContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane key="2">
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columnsformultipleadsets}
                dataSource={getFilteredMultipleAdsetCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedAdsetsContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </Tabs.TabPane>
          </Tabs>
        </div>
        // </div>
      )} */}
      {showTaboolaStatus && !showPredictoadStatus && !showPredictoKeywordStatus && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "5px",
                padding: "3px",

              }}
            >
              <Input.TextArea
                rows={2}
                value={adIds}
                style={{
                  minWidth: "450px",
                  backgroundColor: theme === "dark" ? "#313131" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderColor: theme === "dark" ? "#434343" : "#d9d9d9",
                }}
                onChange={(e) => setAdIds(e.target.value)}
                placeholder="Enter Ad IDs separated by commas"
              />
              <Select
                value={platform}
                onChange={value => setPlatform(value)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                style={{ width: 170 }}
                options={[
                  { label: "Facebook", value: 1 },
                  { label: "Taboola", value: 2 },
                ]}
              />
              <Button
                loading={loading}
                disabled={loading}
                style={{
                  backgroundColor: "#91c25f",
                  border: "1px solid #91c25f",
                  width: "100px",
                }}
                type="primary"
                onClick={handleCheckStatus}
              >
                {loading ? "Fetching..." : "Check Status"}
              </Button>
            </div>
            <div>

              <Input
                placeholder="Search Ad ID..."
                value={searchAdId}
                onChange={(e) => setSearchAdId(e.target.value)}
                onPressEnter={() => setAppliedSearch(searchAdId)}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
                style={{
                  width: "180px",
                  border: "1px solid #4caf50",
                  margin: "10px",
                }}
              />
            </div>
          </div>
          <Table
            columns={columnsforTaboolaStatus}
            className={`custom-dark-table ${theme === "dark"
              ? "dark-mode-pagination"
              : "light-mode-pagination"
              }`}
            // dataSource={tableData}
            dataSource={filteredTableData}
            rowKey="adId"
            pagination={{
              pageSize: paginationSize,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setPaginationSize(pageSize);
              }
            }}
          />
        </div>
      )}
      {showPredictoadStatus && !showTaboolaStatus && !showPredictoKeywordStatus && (
        <div>
          <Row style={{ display: "flex", justifyContent: "space-between" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "5px",
                padding: "3px",
                flexWrap: "wrap",
                // width:"100%"
              }}
            >
              <Col>
                <Input.TextArea
                  rows={2}
                  value={adIds}
                  style={{
                    minWidth: "450px",
                    backgroundColor: theme === "dark" ? "#313131" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#000000",
                    borderColor: theme === "dark" ? "#434343" : "#d9d9d9",
                  }}
                  onChange={(e) => setAdIds(e.target.value)}
                  placeholder="Enter Ad IDs separated by commas"
                />
              </Col>
              <Col flex="none" className='Dashboard-Details-1'>
                <ConfigProvider
                  // locale={locale}
                  theme={{
                    token: {
                      colorPrimary: '#91C25F',
                      colorTextLightSolid: '#000',
                    },
                  }}
                >
                  <RangePicker
                    presets={rangePresets}
                    onChange={handleChangeDatesForPredictoAds}
                    disabledDate={disabledDate}
                    // defaultValue={defaultDates}
                    defaultValue={[dayjs(), dayjs()]}
                    format="YYYY-MM-DD"
                    style={{
                      width: '220px',
                      backgroundColor: theme === 'dark' ? '#555' : undefined,
                      color: theme === 'dark' ? 'white' : undefined,
                      border: '1px solid #4CAF50',
                      borderRadius: '6px'
                    }}
                    dropdownClassName={`${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                  />
                </ConfigProvider>
              </Col>
              <Col flex="none" className='Dashboard-Details-2'>
                <ConfigProvider
                  // locale={locale}
                  theme={{
                    token: {
                      colorPrimary: '#91C25F',
                      colorTextLightSolid: '#000',
                    },
                  }}
                >
                  <RangePicker
                    presets={rangePresets}
                    onChange={handleChangeDatesForPredictoAds}
                    disabledDate={disabledDate}
                    // defaultValue={defaultDates}
                    defaultValue={[dayjs(), dayjs()]}
                    format="YYYY-MM-DD"
                    style={{
                      width: isMobile ? '340px' : '240px',
                      backgroundColor: theme === 'dark' ? '#555' : undefined,
                      color: theme === 'dark' ? 'white' : undefined,
                      border: '1px solid #4CAF50',
                      borderRadius: '6px'
                    }}
                    // dropdownClassName={theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}
                    dropdownClassName={`custom-single-month-picker Dashboard-Details-2${theme === 'dark' ? 'dark-theme-dropdown' : 'light-theme-dropdown'}`}
                  />
                </ConfigProvider>
              </Col>
              <Col>
                <Button
                  loading={loading}
                  disabled={loading}
                  style={{
                    backgroundColor: "#91c25f",
                    border: "1px solid #91c25f",
                    width: "100px",
                  }}
                  type="primary"
                  onClick={handleCheckPredictoAdStatus}
                >
                  {loading ? "Fetching..." : "Check Status"}
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  onClick={fetchInitialDataForPredictoAdStatus}
                  icon={<ReloadOutlined className="black-icon" />}
                  style={{
                    backgroundColor: "#91C25F",
                    color: "#000",
                    border: "none",
                    width: "50px",
                  }}
                />
              </Col>
            </div>
            <div>
              <Input
                placeholder="Search Ad ID..."
                value={searchAdId}
                onChange={handleSearchPredictoAds}
                // onPressEnter={() => setAppliedSearch(searchAdId)}
                className={
                  theme === "dark" ? "custom-input-dark" : "custom-input-light"
                }
                style={{
                  width: "250px",
                  border: "1px solid #4caf50",
                  margin: "10px",
                }}
              />
            </div>
          </Row>
          {loadingAdPolicies ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 280px)", }}>
              <Spin size="large" />
            </div>

          )
            :
            <Table
              columns={columnsforPredictoadStatus}
              className={`custom-dark-table ${theme === "dark"
                ? "dark-mode-pagination"
                : "light-mode-pagination"
                }`}
              style={{
                width: "100%",
                // height: "calc(100vh - 300px)",
                height: isMobile
                  ? "calc(100vh - 180px)"
                  : "calc(100vh - 280px)",
                // minHeight: '100%',
                // tableLayout: "fixed",
              }}
              scroll={{
                x: "auto",
                y: isMobile
                  ? "calc(100vh - 40px)"
                  : "calc(100vh - 240px)",
              }}
              // dataSource={tableData}
              dataSource={filteredPredictoAdStatusData}
              rowKey="adId"
              pagination={{
                pageSize: paginationSize,
                showSizeChanger: true,
                onChange: (page, pageSize) => {
                  setPaginationSize(pageSize);
                }
              }}
            />
          }
        </div>
      )}
      {!showPredictoadStatus && !showTaboolaStatus && showPredictoKeywordStatus && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <Input
                prefix={
                  <SearchOutlined
                    style={{
                      color: "#8c8c8c",
                      fontSize: "16px",
                    }}
                  />
                }
                placeholder="Search For Keywords..."
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                // onPressEnter={() => setAppliedSearch(searchAdId)}
                style={{
                  width: "350px",
                  // height: "32px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  border:
                    theme === "dark"
                      ? "1px solid #555"
                      : "1px solid #d9d9d9",
                  boxShadow: "none",
                }}
              />
              <Select
                showSearch
                value={languageSearch}
                onChange={value => setLanguageSearch(value)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                style={{ width: 170, marginLeft: "10px", marginRight: "10px" }}
                options={[
                  { label: "All Language", value: "all" },
                  ...filtersList.current.languageList.map(item => ({ label: item, value: item }))
                ]}
              />
              <Select
                showSearch
                value={statusSearch}
                onChange={value => setStatusSearch(value)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                style={{ width: 170, marginRight: "10px" }}
                options={[
                  { label: "All Status", value: "all" },
                  ...filtersList.current.statusList.map(item => ({ label: item, value: item }))
                ]}
              />
              <Select
                showSearch
                value={verticleSearch}
                onChange={value => setVerticleSearch(value)}
                dropdownClassName={theme === "dark" && "custom-dropdown"}
                style={{ width: 170 }}
                options={[
                  { label: "All Verticles", value: "all" },
                  ...filtersList.current.verticleList.map(item => ({ label: item, value: item }))
                ]}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "5px",
                padding: "3px",

              }}
            >
              <Button
                onClick={() => setOpenComponentForCreateArticle(true)}
                icon={<PlusOutlined className="black-icon" />}
                style={{
                  backgroundColor: "#91c25f",
                  border: "1px solid #91c25f",
                  width: "120px",
                  // marginRight: "5px"
                }}
                type="primary"
              >
                Create Article
              </Button>
              <Tooltip
                title={
                  lastUpdatedDateandTime.current
                }
                placement="top"
                overlayInnerStyle={{
                  backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                  color: theme === "dark" ? "#ffffff" : "#000000",
                  borderRadius: 6,
                  padding: "6px 10px",
                  fontSize: "14px",
                }}
              >
                <Button
                  loading={loading}
                  disabled={loading}
                  style={{
                    backgroundColor: "#91c25f",
                    border: "1px solid #91c25f",
                    width: "120px",
                  }}
                  type="primary"
                  onClick={handleCheckPredictoKeywordStatus}
                >
                  {loading ? "Fetching..." : "Get Latest Data"}
                </Button>
              </Tooltip>
              <Button
                type="primary"
                onClick={fetchInitialDataForPredictoKeywordStatus}
                icon={<ReloadOutlined className="black-icon" />}
                style={{
                  backgroundColor: "#91C25F",
                  color: "#000",
                  border: "none",
                  width: "50px",
                }}
              />
            </div>

          </div>
          {loadingKeyword ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: isMobile ? "calc(100vh - 180px)" : "calc(100vh - 280px)", }}>
              <Spin size="large" />
            </div>

          ) : (<Table
            scroll={{
              y: isMobile
                ? "calc(100vh - 180px)"
                : "calc(100vh - 280px)",
            }}
            size="small"
            columns={columnsforPredictoKeywordStatus}
            className={`custom-dark-table ${theme === "dark"
              ? "dark-mode-pagination"
              : "light-mode-pagination"
              }`}
            // dataSource={tableData}
            dataSource={predictoKeywordStatusData}
            rowKey="id"
            pagination={{
              pageSize: paginationSize,
              showSizeChanger: true,
              onChange: (page, pageSize) => {
                setPaginationSize(pageSize);
              }
            }}
          />)}
        </div>
      )}
      {!showTaboolaStatus && !showPredictoadStatus && !showPredictoKeywordStatus && (
        <div>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            renderTabBar={() => <></>}
          >
            {/* <Tabs.TabPane key="1">
            {loading ? (
              <Skeleton
                active
                paragraph={{ rows: 12 }}
                style={{ marginTop: "10px" }}
              />
            ) : (
              <Table
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)",
                  // minHeight: '100%',
                  tableLayout: "fixed",
                }}
                className={`custom-dark-table ${theme === "dark"
                  ? "dark-mode-pagination"
                  : "light-mode-pagination"
                  }`}
                columns={columns}
                dataSource={getFilteredSingleCampaigns()
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .reverse()}
                pagination={{ pageSize: paginationSize }}
                scroll={{
                  x: "auto",
                  y: "calc(63vh)",
                }}
                expandable={{
                  expandedRowRender: (record) => (
                    <ExpandedRowContent
                      record={record}
                      changeRRefrst={changeRRefrst}
                      network={selectedKey}
                    />
                  ),
                  rowExpandable: (record) => !!record,
                }}
                rowClassName={() => "custom-row"}
                rowKey="key"
                components={{
                  body: {
                    row: (props) => (
                      <tr
                        {...props}
                        style={{
                          ...props.style,
                          height: "32px",
                        }}
                      />
                    ),
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          ...props.style,
                          paddingTop: "6px",
                          paddingBottom: "6px",
                          fontSize: "13px",
                        }}
                      />
                    ),
                  },
                }}
              />
            )
            }
          </Tabs.TabPane> */}
            <Tabs.TabPane key="2">
              {loadingForMultipleAdsets ? (
                <Skeleton
                  active
                  paragraph={{ rows: isMobile ? 20 : 12 }}
                  style={{ marginTop: "10px" }}
                />
              ) : (
                <Table
                  style={{
                    width: "100%",
                    // height: "calc(100vh - 300px)",
                    height: isMobile
                      ? "calc(100vh - 180px)"
                      : "calc(100vh - 280px)",
                    // minHeight: '100%',
                    // tableLayout: "fixed",
                  }}
                  // style={{
                  //   width: "100%",
                  //   tableLayout: "fixed",
                  // }}
                  className={`custom-dark-table ${theme === "dark"
                    ? "dark-mode-pagination"
                    : "light-mode-pagination"
                    }`}
                  columns={columnsformultipleadsets}
                  rowSelection={{
                    columnWidth: 30,
                    type: "checkbox",
                    selectedRowKeys: checkedRowIds,
                    onChange: (rowIds, rowRecords) => {
                      setCheckedRowIds(rowIds);
                      setCheckedRowRecords(rowRecords);
                    },
                    columnTitle: (checkboxNode) => (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {checkboxNode} {/* ✅ Select-all checkbox */}

                        {/* <IoMdCreate
                        style={{ cursor: "pointer", }}
                        onClick={(e) => {
                          e.stopPropagation(); // ⛔ prevent select-all toggle
                          // handleHeaderIconClick();
                          // console.log(checkedRowRecords);
                          setIsModalVisiblesForBulkComments(true)
                        }}
                      /> */}
                        <IoMdCreate
                          style={{
                            cursor: hasData ? "pointer" : "not-allowed",
                            opacity: hasData ? 1 : 0.4,
                            pointerEvents: hasData ? "auto" : "none", // 🔒 fully disable
                          }}
                          onClick={(e) => {
                            if (!hasData) return;

                            e.stopPropagation(); // ⛔ prevent select-all toggle
                            setIsModalVisiblesForBulkComments(true);
                          }}
                        />
                        <FaClone
                          style={{
                            cursor: hasData ? "pointer" : "not-allowed",
                            opacity: hasData ? 1 : 0.4,
                          }}
                          onClick={async (e) => {
                            e.stopPropagation();

                            if (!hasData) {
                              message.warning("Please select at least one campaign");
                              return;
                            }

                            try {
                              setCloneLoading(true);

                              const completeCampaigns = [];

                              for (const record of checkedRowRecords) {
                                console.log("Fetching campaign:", record.campaign_name);

                                const response = await axios.get(
                                  `https://fblaunching.vyaktimetrics.com/open/campaigns/view/${record.identifier}`,
                                  {
                                    headers: {
                                      Authorization: token,
                                    },
                                  }
                                );

                                const completeCampaignDetails =
                                  response?.data?.data?.[0];

                                if (completeCampaignDetails) {
                                  completeCampaigns.push(completeCampaignDetails);
                                }
                              }

                              console.log(
                                "COMPLETE CAMPAIGNS FOR CLONE:",
                                completeCampaigns
                              );

                              setCloneCampaigns(completeCampaigns);
                              setIsCloneModalOpen(true);

                            } catch (error) {
                              console.error(
                                "Error fetching complete campaign details:",
                                error?.response?.data || error
                              );

                              message.error("Failed to fetch campaign details");
                            } finally {
                              setCloneLoading(false);
                            }
                          }}
                        />
                      </div>
                    ),
                  }}
                  // dataSource={filteredMultipleAdsetCampaigns
                  //   .map((item, index) => ({
                  //     ...item,
                  //     key: index,
                  //   }))
                  //   .reverse()}
                  dataSource={[...filteredMultipleAdsetCampaigns].reverse()}
                  rowKey={(record) => record.identifier}
                  // pagination={{ pageSize: paginationSize }}
                  pagination={{
                    pageSize: paginationSize,
                    showSizeChanger: true,
                    onChange: (page, pageSize) => {
                      setPaginationSize(pageSize);
                    }
                  }}
                  // scroll={{
                  //   x: "auto",
                  //   y: "calc(63vh)",
                  // }}
                  // scroll={{
                  //   x: "max-content",
                  //   y: isMobile ? "50vh" : "63vh",
                  // }}
                  scroll={{
                    x: "auto",
                    y: isMobile
                      ? "calc(100vh - 40px)"
                      : "calc(100vh - 240px)",
                  }}
                  expandable={{
                    expandedRowRender: (record) => (
                      <ExpandedAdsetsContent
                        record={record}
                        changeRRefrst={changeRRefrst}
                        network={selectedKey}
                      />
                    ),
                    rowExpandable: (record) => !!record,
                  }}
                  // expandable={{
                  //   expandedRowRender: renderExpandedRow,
                  //   rowExpandable: (record) => !!record,
                  // }}
                  rowClassName={() => "custom-row"}
                  // rowKey="key"
                  components={{
                    body: {
                      row: (props) => (
                        <tr
                          {...props}
                          style={{
                            ...props.style,
                            height: "32px",
                          }}
                        />
                      ),
                      cell: (props) => (
                        <td
                          {...props}
                          style={{
                            ...props.style,
                            paddingTop: "6px",
                            paddingBottom: "6px",
                            fontSize: "13px",
                          }}
                        />
                      ),
                    },
                  }}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
      <Modal
        title="Clone Campaign"
        open={isCloneModalOpen}
        onCancel={() => {
          setIsCloneModalOpen(false);
          setCloneSelectedKey(undefined);
          setCloneSelectedValue([]);
          setCloneSearchText("");
          setCloneIsOpen(false);
        }}
        width={500}
        footer={null}
      >
        {cloneLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
            }}
          >
            <Spin />
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {/* ============================= */}
            {/* NETWORK + ACCOUNT */}
            {/* ============================= */}

            <div
              style={{
                display: "flex",
                gap: 20,
                width: "100%",
                alignItems: "flex-start",
              }}
            >

              {/* ================= NETWORK ================= */}

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Network
                </div>

                <Select
                  showSearch
                  placeholder="Select Projects"
                  style={{
                    width: "100%",
                  }}
                  value={cloneSelectedKey}
                  onChange={(value) => {
                    setCloneSelectedKey(value);

                    // Important:
                    // Network changed → clear ONLY clone accounts
                    setCloneSelectedValue([]);
                  }}
                  dropdownClassName={
                    theme === "dark"
                      ? "custom-dropdown"
                      : ""
                  }
                  className={`${theme === "dark"
                    ? "dark-theme"
                    : "light-theme"
                    } green-border-select`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {options
                    .slice()
                    .sort((a, b) => {
                      const aActive =
                        networksWithStatus.find(
                          (n) =>
                            n.Network === a.label
                        )?.Status === "Active"
                          ? 1
                          : 0;

                      const bActive =
                        networksWithStatus.find(
                          (n) =>
                            n.Network === b.label
                        )?.Status === "Active"
                          ? 1
                          : 0;

                      return bActive - aActive;
                    })
                    .map((option) => {
                      const isActive =
                        networksWithStatus.find(
                          (n) =>
                            n.Network === option.label
                        )?.Status === "Active";

                      return (
                        <Option
                          key={option.value}
                          value={option.value}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            {isActive ? (
                              <CheckCircleFilled
                                style={{
                                  color: "#91C25F",
                                  fontSize: 15,
                                }}
                                className="black-icon-active-1"
                              />
                            ) : (
                              <CloseCircleFilled
                                style={{
                                  color: "#EC7117",
                                  fontSize: 15,
                                }}
                                className="black-icon-pause-1"
                              />
                            )}

                            <span>
                              {option.label}
                            </span>
                          </div>
                        </Option>
                      );
                    })}
                </Select>
              </div>

              {/* ================= ACCOUNT ================= */}

              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  style={{
                    marginBottom: 8,
                    fontWeight: 500,
                  }}
                >
                  Account
                </div>

                <Select
                  showSearch
                  placeholder="Select Account"

                  onSearch={(value) => {
                    setCloneSearchText(value);
                  }}

                  searchValue={cloneSearchText}

                  open={cloneIsOpen}

                  onDropdownVisibleChange={(open) => {
                    setCloneIsOpen(open);
                  }}

                  value={
                    cloneSelectedValue.length === 0
                      ? undefined
                      : cloneSelectedValue.length === 1
                        ? cloneSelectedValue[0]
                        : `${cloneSelectedValue[0]}, +${cloneSelectedValue.length - 1
                        } more`
                  }

                  dropdownClassName={
                    theme === "dark"
                      ? "custom-dropdown"
                      : ""
                  }

                  className={
                    theme === "dark"
                      ? "dark-theme"
                      : "light-theme"
                  }

                  style={{
                    width: "100%",
                    whiteSpace: "nowrap",
                    color:
                      theme === "dark"
                        ? "white"
                        : undefined,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    border: "1px solid #4CAF50",
                    borderRadius: "6px",
                  }}

                  onClick={(e) => {
                    e.stopPropagation();
                  }}

                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}

                  dropdownRender={() => (
                    <div
                      style={{
                        maxHeight: 300,
                        overflowY: "auto",
                        padding: 8,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {cloneSelectedKey ? (
                        renderCloneAccountsCheckboxes(
                          theme
                        )
                      ) : (
                        <div
                          style={{
                            padding: 10,
                            color: "#999",
                          }}
                        >
                          Please select a network
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* ================= BUTTONS ================= */}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                marginTop: 30,
              }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCloneModalOpen(false);
                }}
                disabled={cloneLoading}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                loading={cloneLoading}
                disabled={
                  !cloneSelectedKey ||
                  cloneSelectedValue.length === 0 ||
                  cloneCampaigns.length === 0
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  handleCloneSubmit();
                }}
              >
                Submit
              </Button>
            </div>
          </div>
        )}
      </Modal>
      {!restrictedEmails.includes(userdetails.email) && (
        <Drawer
          title={adsetcampaigndata?.campaign_name || ""}
          placement="right"
          onClose={onCloseDrawer}
          open={adsetsdrawerVisible}
          width="100%" // Adjust width as needed
          style={{
            backgroundColor: theme === "dark" ? "#333" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
          }}
        >
          <Adsets
            selectedRow={adsetcampaigndata}
            onClose={onCloseDrawer}
            changeRRefrst={changeRRefrst}
            network={selectedKey}
          />
        </Drawer>
      )}

      {/* <Drawer
                title={adsetcampaigndata?.campaign_name || ''}
                placement="right"
                onClose={onCloseDrawer}
                open={adsetsdrawerVisible}
                width="90%" // Adjust width as needed
            >
                <Adsets selectedRow={adsetcampaigndata} onClose={onCloseDrawer} changeRRefrst={changeRRefrst} />
            </Drawer> */}
      {/* <Modal
        title="Confirm approval"
        visible={deleteModalVisible}
        onOk={handleOkDeleteDraft}
        onCancel={() => setDeleteModalVisible(false)}
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
      >
        <p>Are you sure you want to delete this draft</p>
      </Modal> */}

      <Modal
        title={firstColumnValue}
        visible={isModalVisibles}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
        onOk={handleOks}
        onCancel={handleCancels}
        footer={[
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: 'flex', flexDirection: "column" }}>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                Last Edited Time:
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                {universalOject?.editedTime || ""}
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                Last Edited By:
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                {universalOject?.createdBy || ""}
              </span>
            </div>
            <div>
              <Button
                key="delete"
                type="danger"
                onClick={handleDelete}
                style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
              >
                Delete
              </Button>
              <Button key="cancel" onClick={handleCancels} style={{ marginLeft: "4px" }}>
                Cancel
              </Button>
              <Button key="ok" onClick={handleOks} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                Ok
              </Button>
            </div>
          </div>
        ]}
      >
        <Input.TextArea
          placeholder="Enter your comments here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </Modal>
      <Modal
        title={"Campaigns"}
        visible={isModalVisiblesForBulkComments}
        className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
        onOk={handleOksForBulkComments}
        onCancel={handleCancelsForBulkComments}
        footer={[
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: 'flex', flexDirection: "column" }}>
              {/* <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                Last Edited Time:
              </span>
              <span style={{ marginRight: "auto", fontSize: "14px", color: theme === "dark" ? "white" : "black" }}>
                {universalOject?.editedTime || ""}
              </span> */}
            </div>
            <div>
              <Button
                key="delete"
                type="danger"
                onClick={handleDeleteForBulkComments}
                style={{ marginRight: 'auto', border: "1px solid #e3e3da" }}
              >
                Delete
              </Button>
              <Button key="cancel" onClick={handleCancelsForBulkComments} style={{ marginLeft: "4px" }}>
                Cancel
              </Button>
              <Button key="ok" onClick={handleOksForBulkComments} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>
                Ok
              </Button>
            </div>
          </div>
        ]}
      >
        <Input.TextArea
          placeholder="Enter your comments here"
          value={commentForBulkComments}
          onChange={(e) => setCommentForBulkComments(e.target.value)}
        />
      </Modal>
      <CampaignHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        identifier={selectedCampaignIdForHistory}
        adAccounts={adAccounts}
        accountNumber={selectedAccountForHistory}
      />

      <Modal
        title="Confirm disapproval"
        open={isModalVisibleForAdsetsdisapprove}
        onOk={handleOkForAdsetsdisapprove}
        onCancel={() => setIsModalVisibleForAdsetsdisapprove(false)}
        confirmLoading={loading}
        className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
      >
        <p>Are you sure you want to disapprove?</p>

        <Input.TextArea
          placeholder="Enter rejection reason"
          value={rejectedReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            if (reasonError) setReasonError("");
          }}
          rows={4}
          status={reasonError ? "error" : ""}
        />

        {reasonError && (
          <div style={{ color: "#ff4d4f", marginTop: 5 }}>
            {reasonError}
          </div>
        )}
      </Modal>
    </div>

  );
};
export default CampaignPage;
