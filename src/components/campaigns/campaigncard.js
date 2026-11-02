import { useState, useEffect } from "react";
import { Badge, Button, Card, Checkbox, Dropdown, Modal, Space, Tag, Typography, Switch, Tooltip, Input, Spin, InputNumber, Popover, Steps } from "antd";
import { EyeOutlined, EditOutlined, MoreOutlined, CommentOutlined, DeleteOutlined, HistoryOutlined, CloseCircleFilled, CheckCircleFilled, PlusSquareOutlined, MinusSquareOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { FaClone, FaEye, FaPenToSquare, FaTrashCan, FaRegCommentDots } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import AdsetCard from "./adsetcard";
import CampaignHistory from "./campaignhistory";
import axios from "axios";
import moment from 'moment-timezone';
const { Text } = Typography;

const CampaignCard = ({ record, theme, selectedCampaigns, setSelectedCampaigns, userdetails, approveTheCampaign, rejectTheCampaign, deleteTheCampaign, userData }) => {
    const doesAdsWentToFacebook = record.adsetsWithAds?.some(adset =>
        adset.ads?.some(ad => ad.facebookUploadFailed === true)
    );
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 576;
    const [loading, setLoading] = useState(false);
    // approval state
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [approvalState, setApprovalState] = useState(record.Approval);
    const [approvalDetailsObject, setApprovalDetailsObject] = useState({
        Approvedby: record.Approvedby || null,
        Approveddate: record.Approveddate || null,
        RejectedBy: record.RejectedBy || null,
        RejectedDate: record.RejectedDate || null,
        rejectionReason: record.rejectionReason || null
    })
    // approval state

    // Status states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [campaignStatus, setCampainStatus] = useState(record.Status === "ACTIVE" ? true : false);
    // Status states

    // Budget states
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [budgetValue, setBudgetValue] = useState(record.Daily_amount ? record.Daily_amount / 100 : 0);
    const [inputBudgetValue, setInuptBudgetValue] = useState(budgetValue);
    // Budget states

    // Comment states
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [commentObject, setCommentObject] = useState(record.comments);
    const [commentValue, setCommentValue] = useState(record?.comments?.comment ?? null);
    const [inputCommentValue, setInuptCommentValue] = useState(commentValue);
    // Comment states

    // Delete campaign states
    const [deleteCampaignModalOpen, setDeleteCampaignModalOpen] = useState(false);
    // Delete campaign states

    // Reject button states
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectedReason, setRejectionReason] = useState("");
    const [reasonError, setReasonError] = useState("");
    // Reject button states

    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        setCommentValue(record?.comments?.comment);
        setInuptCommentValue(record?.comments?.comment);
        setCommentObject(record.comments);
    }, [record])

    const handleApprove = async (record) => {
        setLoading(true);
        const dateAndTimeOfCampaignApproval = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm [IST]");
        try {
            const response = await axios.put(`/api/campaigns/campaign/approval?id=${record.identifier}`, {
                Approval: "Approved", // New approval value
                Approved: userdetails?.username, // Username of the person who approved it
                datetime: dateAndTimeOfCampaignApproval, // Current datetime in IST
            })
            if (response.status === 200 || response.status === 201) {
                setApprovalState("Approved")
                approveTheCampaign(record);
                setApprovalDetailsObject(prev => ({
                    ...prev,
                    Approvedby: userdetails?.username || null,
                    Approveddate: dateAndTimeOfCampaignApproval || null
                }))
            }
        }
        catch (err) {
            console.error(err);
        }
        finally {
            setLoading(false)
            setApproveModalOpen(false)
        }
    }

    const handleRejectClick = record => {
        // setRejectionReason("");
        setReasonError("");
        setRejectModalOpen(true);

    };

    // Confirm rejection
    const handleReject = async (record) => {
        const reason = rejectedReason.trim();

        if (!reason) {
            setReasonError("Please enter a valid rejection reason");
            return;
        }

        setLoading(true);
        const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
        const dateAndTimeOfCampaignApproval = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm [IST]");
        try {
            const response = await axios.put(`/api/campaigns/campaign/reject?id=${record.identifier}`, {
                reason: reason, // New approval value
                RejectedBy: userdetails?.username, // Username of the person who approved it
                datetime: dateAndTimeOfCampaignApproval, // Current datetime in IST
            })
            if (response.status === 200 || response.status === 201) {
                setApprovalState("Rejected")
                rejectTheCampaign(record, reason);
                setApprovalDetailsObject(prev => ({
                    ...prev,
                    RejectedBy: userdetails?.username || null,
                    RejectedDate: dateAndTimeOfCampaignApproval || null,
                    rejectionReason: reason || null
                }))
                setCommentValue(reason);
                setCommentObject(prev => ({
                    ...prev,
                    comment: reason,
                    createdBy: userdetails.username,
                    editedTime: editedTime
                }));
                setReasonError("");
            }
        }
        catch (err) {
            console.error("Reject error:", error);
        }
        finally {
            setLoading(false)
            setRejectModalOpen(false)
        }
    };

    const handleSendBudgetValue = async (record) => {
        setLoading(true)
        try {
            const budgetValueInInteger = Math.round(Number(inputBudgetValue) * 100)
            const response = await axios.put(`/api/campaigns/campaign/budget?id=${record.identifier}`, {
                Daily_amount: budgetValueInInteger,
                username: userdetails.username,
                campaignname: record.campaign_name,
                Account: record.Account_Number,
                BugetType: record.Budget_type
            })
            if (response.status === 200 || response.status === 201) {
                setBudgetValue(inputBudgetValue)
            }
        }
        catch (err) {
            console.error("Campaign budget error", err)
        }
        finally {
            setLoading(false)
            setBudgetModalOpen(false)
        }
    }

    // const handleStatusChange = async checked => {
    //     const status = checked ? "ACTIVE" : "PAUSED";

    //     try {
    //         // Use your existing status API/function here
    //         await handleStatusUpdate(record, status);
    //     } catch (error) {
    //         console.error("Failed to update campaign status:", error);
    //     }
    // };

    const handleStatusChange = async (record, pendingStatus) => {
        setLoading(true);
        try {
            const response = await axios.put(`/api/campaigns/campaign/status?id=${record.identifier}`, {
                Status: pendingStatus ? "ACTIVE" : "PAUSED", username: userdetails.username
            })
            if (response.status === 200 || response.status === 201) {
                setCampainStatus(pendingStatus);
            }
        }
        catch (err) {
            console.error("Campaign status error", err)
        }
        finally {
            setLoading(false)
            setStatusModalOpen(false)
        }
    };

    const isSelected = selectedCampaigns.some(
        item => item.identifier === record.identifier
    );

    const hasError =
        record?.campaignlevel_error ||
        record?.adsetErrors?.length ||
        record?.adErrors?.length;

    const handleSelect = checked => {
        setSelectedCampaigns(prev =>
            checked
                ? [...prev, record]
                : prev.filter(item => item.identifier !== record.identifier)
        );
    };

    const handleView = () => {
        // Keep your existing view logic here.
        handleEditClickMultipleAdsetData(record, true);
    };

    const handleEdit = () => {
        // Keep your existing edit logic here.
        handleEditClickMultipleAdsetData(record);
    };

    const handleComment = async (record) => {
        const editedTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD hh:mm:ss A");
        setLoading(true);
        try {
            const response = await axios.post("/api/campaigns/comments/single", {
                Account: record.Account_Number,
                campaignid: record.identifier,
                campaignname: record.campaign_name,
                level: "Launcher",
                comment: inputCommentValue,
                editedTime: editedTime,
                username: userdetails.username
            })
            if (response.status === 200 || response.status === 201) {
                setCommentValue(inputCommentValue);
                setCommentObject(prev => ({
                    ...prev,
                    comment: inputCommentValue,
                    createdBy: userdetails.username,
                    editedTime: editedTime
                }));
                setCommentModalOpen(false);
            }
        }
        catch (err) {
            console.error("Comment creation error", err);
        }
        finally {
            setLoading(false)
        }
    };

    const handleDelete = async (campaign) => {
        // Keep your existing delete logic here.
        setLoading(true);
        try {
            const response = await axios.delete(`/api/campaigns/campaign/delete?id=${campaign.identifier}`);
            if (response.status === 200 || response.status === 201) {
                deleteTheCampaign(campaign)
            }
        }
        catch (err) {
            console.error("Campaign Delete error", err)
        }
        finally {
            setLoading(false)
            setDeleteCampaignModalOpen(false);
        }
    };

    const handleHistory = async () => {
        setHistoryOpen(true);
        // setHistoryLoading(true);

        // try {
        //     // Keep your existing history API call here.
        //     const response = await getCampaignHistory(record);

        //     setHistoryData(response?.data || response || []);
        // } catch (error) {
        //     console.error("Failed to fetch campaign history:", error);
        //     setHistoryData([]);
        // } finally {
        //     setHistoryLoading(false);
        // }
    };

    const menuItems = [
        {
            key: "history",
            icon: <HistoryOutlined />,
            label: "View history",
            onClick: handleHistory,
        },
        {
            type: "divider",
        },
        {
            key: "delete",
            danger: true,
            disabled: Boolean(record.campaignid),
            icon: <DeleteOutlined />,
            label: "Delete",
            onClick: () => setDeleteCampaignModalOpen(true),
        },
    ];

    // const renderErrorTooltip = (record, theme = "light") => {
    //     const campaignErr = record?.campaignlevel_error;
    //     const adsetErrs = Array.isArray(record?.adsetErrors)
    //         ? record.adsetErrors
    //         : [];
    //     const adErrsFlat = Array.isArray(record?.adErrors) ? record.adErrors : [];
    //     const adErrsVerbose = Array.isArray(record?.adErrorsByAdset)
    //         ? record.adErrorsByAdset
    //         : [];

    //     const hasCampaign = !!campaignErr;
    //     const hasAdset = adsetErrs.length > 0;
    //     const hasAd = adErrsVerbose.length > 0 || adErrsFlat.length > 0;
    //     const hasAny = hasCampaign || hasAdset || hasAd;

    //     if (!hasAny) {
    //         return (
    //             <span style={{ color: theme === "dark" ? "#ddd" : "#333" }}>
    //                 No errors found
    //             </span>
    //         );
    //     }

    //     return (
    //         <div style={{ maxWidth: 420 }}>
    //             {hasCampaign && (
    //                 <div style={{ marginBottom: 8 }}>
    //                     <div style={{ fontWeight: 600, marginBottom: 4 }}>
    //                         Campaign level
    //                     </div>
    //                     <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.3 }}>
    //                         {normalizeError(campaignErr)}
    //                     </div>
    //                 </div>
    //             )}

    //             {hasAdset && (
    //                 <div style={{ marginBottom: 8 }}>
    //                     <div style={{ fontWeight: 600, marginBottom: 4 }}>
    //                         Adset level{" "}
    //                         <span style={{ opacity: 0.7 }}>({adsetErrs.length})</span>
    //                     </div>
    //                     <div style={{ fontWeight: 600, marginBottom: 4 }}>Adset level</div>
    //                     <div style={{ display: "grid", gap: 6 }}>
    //                         {adsetErrs.slice(0, 6).map((it, i) => (
    //                             <div key={`${it?.key || i}`} style={{ lineHeight: 1.3 }}>
    //                                 <span style={{ fontWeight: 500 }}>
    //                                     {it?.name || it?.key || `adset_${i + 1}`}:
    //                                 </span>{" "}
    //                                 <span>{normalizeError(it?.error)}</span>
    //                             </div>
    //                         ))}
    //                         {adsetErrs.length > 6 && (
    //                             <div style={{ opacity: 0.8 }}>
    //                                 …and {adsetErrs.length - 6} more adset errors
    //                             </div>
    //                         )}
    //                     </div>
    //                 </div>
    //             )}

    //             {hasAd && (
    //                 <div>
    //                     <div style={{ fontWeight: 600, marginBottom: 4 }}>Ad level</div>
    //                     <div style={{ display: "grid", gap: 6 }}>
    //                         {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat)
    //                             .slice(0, 6)
    //                             .map((it, i) => (
    //                                 <div
    //                                     key={`${it?.adsetKey || it?.index || i}`}
    //                                     style={{ lineHeight: 1.3 }}
    //                                 >
    //                                     {/* If we have verbose rows, show "Adset → Ad" */}
    //                                     {adErrsVerbose.length ? (
    //                                         <>
    //                                             <span style={{ fontWeight: 600 }}>
    //                                                 {resolveAdsetName(record, it.adsetKey, it.adsetName)}
    //                                             </span>
    //                                             <span> → </span>
    //                                             <span style={{ fontWeight: 500 }}>{it.adName}</span>
    //                                             <span>: </span>
    //                                             <span>{normalizeError(it.error)}</span>
    //                                         </>
    //                                     ) : (
    //                                         <>
    //                                             <span style={{ fontWeight: 500 }}>
    //                                                 {it?.name ?? `ad${(it?.index ?? i) + 1}`}
    //                                             </span>
    //                                             <span>: </span>
    //                                             <span>{normalizeError(it?.error)}</span>
    //                                         </>
    //                                     )}
    //                                 </div>
    //                             ))}
    //                         {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length >
    //                             6 && (
    //                                 <div style={{ opacity: 0.8 }}>
    //                                     …and{" "}
    //                                     {(adErrsVerbose.length ? adErrsVerbose : adErrsFlat).length -
    //                                         6}{" "}
    //                                     more ad errors
    //                                 </div>
    //                             )}
    //                     </div>
    //                 </div>
    //             )}
    //         </div>
    //     );
    // };

    const normalizeError = error => {
        if (!error) return "";
        if (typeof error === "string") return error;

        return (
            error.error_user_msg ||
            error.message ||
            error.error_user_title ||
            JSON.stringify(error)
        );
    };

    const renderErrorTooltip = (record, theme = "light") => {
        const campaignErr = record?.errors?.campaign;
        const adsetErrs = Array.isArray(record?.errors?.adset)
            ? record.errors.adset
            : [];
        const adErrs = Array.isArray(record?.errors?.ad)
            ? record.errors.ad
            : [];

        const hasCampaign = !!campaignErr;
        const hasAdset = adsetErrs.length > 0;
        const hasAd = adErrs.length > 0;

        if (!hasCampaign && !hasAdset && !hasAd) {
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
                            <span style={{ opacity: 0.7 }}>
                                ({adsetErrs.length})
                            </span>
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                            {adsetErrs.slice(0, 6).map((item, index) => (
                                <div
                                    key={item?.adsetId || index}
                                    style={{ lineHeight: 1.3 }}
                                >
                                    <span style={{ fontWeight: 500 }}>
                                        {item?.adsetName || item?.adsetId || `Adset ${index + 1}`}:
                                    </span>{" "}
                                    <span>{normalizeError(item?.error)}</span>
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
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                            Ad level{" "}
                            <span style={{ opacity: 0.7 }}>
                                ({adErrs.length})
                            </span>
                        </div>

                        <div style={{ display: "grid", gap: 6 }}>
                            {adErrs.slice(0, 6).map((item, index) => (
                                <div
                                    key={item?.adId || index}
                                    style={{ lineHeight: 1.3 }}
                                >
                                    <span style={{ fontWeight: 600 }}>
                                        {item?.adsetName || item?.adsetId}
                                    </span>
                                    <br />
                                    {" → "}
                                    <span style={{ fontWeight: 500 }}>
                                        {item?.adName || item?.adId || `Ad ${index + 1}`}
                                    </span>
                                    {": "}
                                    <br />
                                    <span>{normalizeError(item?.error)}</span>
                                </div>
                            ))}

                            {adErrs.length > 6 && (
                                <div style={{ opacity: 0.8 }}>
                                    …and {adErrs.length - 6} more ad errors
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const hasAnyError =
        !!record?.errors?.campaign ||
        !!record?.errors?.adset ||
        !!record?.errors?.ad;

    return (
        <>
            <Card
                size="small"
                style={{
                    borderRadius: 8,
                    border: `1px solid ${isSelected
                        ? "#91C25F"
                        : theme === "dark"
                            ? "#303030"
                            : "#e5e7eb"
                        }`,
                    background: theme === "dark" ? "#202120" : "#fff",
                }}
                styles={{ body: { padding: "3px 6px" } }}
            >
                <div
                    className="campaigns-card-layout"
                    style={{
                        display: "flex",
                        width: "100%",
                        minWidth: 0,
                    }}
                >
                    {/* Checkbox / Expand */}
                    <div
                        style={{
                            marginRight: 8,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Checkbox
                            checked={isSelected}
                            onChange={e => handleSelect(e.target.checked)}
                            style={{
                                transform: "scale(0.8)",
                                transformOrigin: "center",
                                margin: 0,
                            }}
                        />

                        <div onClick={() => setExpanded(prev => !prev)}>
                            {expanded ? (
                                <MinusSquareOutlined
                                    style={{
                                        fontSize: 14,
                                        color: theme === "dark" ? "white" : "black",
                                    }}
                                />
                            ) : (
                                <PlusSquareOutlined
                                    style={{
                                        fontSize: 14,
                                        color: theme === "dark" ? "white" : "black",
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Left container */}
                    <div
                        className="campaigns-card-left"
                        style={{
                            flex: 1,
                            minWidth: 0,
                            marginRight: 10,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                justifyContent: "center",
                                gap: 5,
                                width: "100%",
                            }}
                        >
                            {/* Campaign name */}
                            <Space size={8} align="start">
                                {doesAdsWentToFacebook ? (
                                    <span
                                        style={{
                                            background: "red",
                                            borderRadius: "50%",
                                            padding: "3px",
                                            display: "inline-flex",
                                        }}
                                    >
                                        <Tooltip
                                            title="Ad creatives have not been created for this campaign. Please check the page access permissions for the token."
                                            styles={{
                                                container: {
                                                    backgroundColor:
                                                        theme === "dark"
                                                            ? "#2b2b2b"
                                                            : "#ffffff",
                                                    color:
                                                        theme === "dark"
                                                            ? "#ffffff"
                                                            : "#000000",
                                                    borderRadius: 6,
                                                    padding: "6px 10px",
                                                    fontSize: "14px",
                                                },
                                            }}
                                        >
                                            <FaFacebook
                                                color="white"
                                                fontSize={9}
                                            />
                                        </Tooltip>
                                    </span>
                                ) : record.fbstatus === "Live" ? (
                                    <CheckCircleFilled
                                        style={{
                                            color: "#91C25F",
                                            fontSize: 13,
                                        }}
                                        className="black-icon-active-1"
                                    />
                                ) : (
                                    <CloseCircleFilled
                                        style={{
                                            color: "#EC7117",
                                            fontSize: 14,
                                        }}
                                        className="black-icon-pause-1"
                                    />
                                )}

                                <div>
                                    <Text
                                        strong
                                        style={{
                                            fontSize: 12.5,
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                            lineHeight: "16px",
                                        }}
                                    >
                                        <Popover
                                            trigger="hover"
                                            placement="right"
                                            styles={{
                                                container: {
                                                    background:
                                                        theme === "dark"
                                                            ? "#333"
                                                            : "#fff",
                                                },
                                            }}
                                            classNames={{
                                                root:
                                                    theme === "dark"
                                                        ? "campaigns-history-popover-dark"
                                                        : "campaigns-history-popover-light",
                                            }}
                                            style={{
                                                backgroundColor:
                                                    theme === "dark" ? "#333" : "",
                                            }}
                                            content={
                                                <div
                                                    className={`campaigns-history-steps-wrapper ${theme === "dark"
                                                        ? "campaigns-history-steps-dark"
                                                        : "campaigns-history-steps-light"
                                                        }`}
                                                >
                                                    <Steps
                                                        className="campaigns-history-steps"
                                                        orientation="vertical"
                                                        size="small"
                                                        items={[
                                                            record?.createdDate && {
                                                                title: (
                                                                    <b>
                                                                        Campaign Created
                                                                    </b>
                                                                ),
                                                                content: (
                                                                    <Text
                                                                        style={{
                                                                            fontSize: 11,
                                                                            color:
                                                                                theme ===
                                                                                    "dark"
                                                                                    ? "white"
                                                                                    : "",
                                                                        }}
                                                                    >
                                                                        {
                                                                            record.createdDate
                                                                        }
                                                                    </Text>
                                                                ),
                                                                status: "finish",
                                                            },

                                                            record?.campaignid
                                                                ? {
                                                                    title: (
                                                                        <b>
                                                                            Campaign
                                                                            Launched in
                                                                            Facebook
                                                                        </b>
                                                                    ),
                                                                    content: (
                                                                        <Text
                                                                            style={{
                                                                                fontSize: 11,
                                                                                color:
                                                                                    theme ===
                                                                                        "dark"
                                                                                        ? "white"
                                                                                        : "",
                                                                            }}
                                                                        >
                                                                            {
                                                                                record.campaignid
                                                                            }
                                                                        </Text>
                                                                    ),
                                                                    status: "finish",
                                                                }
                                                                : record?.errors
                                                                    ?.campaign
                                                                    ? {
                                                                        title: (
                                                                            <b
                                                                                style={{
                                                                                    color:
                                                                                        "#ff4d4f",
                                                                                }}
                                                                            >
                                                                                Campaign
                                                                                launching
                                                                                Failed
                                                                            </b>
                                                                        ),
                                                                        content: (
                                                                            <div className="campaigns-history-error">
                                                                                Error:{" "}
                                                                                {normalizeError(
                                                                                    record
                                                                                        .errors
                                                                                        .campaign
                                                                                )}
                                                                            </div>
                                                                        ),
                                                                        status: "error",
                                                                    }
                                                                    : null,

                                                            ...(record?.adsetsWithAds ||
                                                                [])
                                                                .map(adset => {
                                                                    const adsetError =
                                                                        record?.errors?.adset?.find(
                                                                            err =>
                                                                                err?.adsetId ===
                                                                                adset?.adsetId ||
                                                                                err?.adsetName ===
                                                                                adset?.adsetName
                                                                        );

                                                                    const adErrors =
                                                                        Array.isArray(
                                                                            record?.errors
                                                                                ?.ad
                                                                        )
                                                                            ? record.errors.ad.filter(
                                                                                err =>
                                                                                    err?.adsetId ===
                                                                                    adset?.adsetId ||
                                                                                    err?.adsetName ===
                                                                                    adset?.adsetName
                                                                            )
                                                                            : [];

                                                                    if (
                                                                        !adset.adsetId &&
                                                                        !adsetError
                                                                    ) {
                                                                        return null;
                                                                    }

                                                                    return {
                                                                        title: (
                                                                            <div
                                                                                title={
                                                                                    adset.adsetName
                                                                                }
                                                                                className="campaigns-history-step-title campaigns-history-adset-title"
                                                                                style={{
                                                                                    color:
                                                                                        adsetError
                                                                                            ? "#ff4d4f"
                                                                                            : undefined,
                                                                                }}
                                                                            >
                                                                                {adsetError
                                                                                    ? `Adset launching failed: ${adset.adsetName}`
                                                                                    : `Adset launched: ${adset.adsetName}`}
                                                                            </div>
                                                                        ),

                                                                        content: (
                                                                            <div>
                                                                                {adset.adsetId && (
                                                                                    <div className="campaigns-history-step-id">
                                                                                        {
                                                                                            adset.adsetId
                                                                                        }
                                                                                    </div>
                                                                                )}

                                                                                {adsetError && (
                                                                                    <div className="campaigns-history-error">
                                                                                        Error:{" "}
                                                                                        {normalizeError(
                                                                                            adsetError.error
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {!!adset
                                                                                    .ads
                                                                                    ?.length && (
                                                                                        <Steps
                                                                                            className="campaigns-history-ad-steps"
                                                                                            orientation="vertical"
                                                                                            size="small"
                                                                                            items={adset.ads.map(
                                                                                                ad => {
                                                                                                    const adError =
                                                                                                        adErrors.find(
                                                                                                            err =>
                                                                                                                err?.adId ===
                                                                                                                ad?.Addid ||
                                                                                                                err?.adName ===
                                                                                                                ad?.AddName
                                                                                                        );

                                                                                                    const hasAdError =
                                                                                                        !!adError;

                                                                                                    return {
                                                                                                        title: (
                                                                                                            <div
                                                                                                                title={
                                                                                                                    ad.AddName
                                                                                                                }
                                                                                                                className="campaigns-history-step-title campaigns-history-ad-title"
                                                                                                                style={{
                                                                                                                    color:
                                                                                                                        hasAdError
                                                                                                                            ? "#ff4d4f"
                                                                                                                            : undefined,
                                                                                                                }}
                                                                                                            >
                                                                                                                {hasAdError
                                                                                                                    ? `Ad launching failed: ${ad.AddName}`
                                                                                                                    : `Ad launched: ${ad.AddName}`}
                                                                                                            </div>
                                                                                                        ),

                                                                                                        content:
                                                                                                            ad.Addid ? (
                                                                                                                <div className="campaigns-history-step-id">
                                                                                                                    {
                                                                                                                        ad.Addid
                                                                                                                    }
                                                                                                                </div>
                                                                                                            ) : hasAdError ? (
                                                                                                                <div className="campaigns-history-error">
                                                                                                                    Error:{" "}
                                                                                                                    {normalizeError(
                                                                                                                        adError.error
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="campaigns-history-error">
                                                                                                                    Ad
                                                                                                                    was
                                                                                                                    not
                                                                                                                    launched
                                                                                                                </div>
                                                                                                            ),

                                                                                                        status:
                                                                                                            ad.Addid
                                                                                                                ? "finish"
                                                                                                                : "error",

                                                                                                        icon: ad.Addid ? (
                                                                                                            <CheckOutlined
                                                                                                                className="campaigns-history-ad-check"
                                                                                                                style={{
                                                                                                                    fontSize: 12,
                                                                                                                }}
                                                                                                            />
                                                                                                        ) : (
                                                                                                            <CloseOutlined
                                                                                                                className="campaigns-history-ad-error"
                                                                                                                style={{
                                                                                                                    fontSize: 12,
                                                                                                                }}
                                                                                                            />
                                                                                                        ),
                                                                                                    };
                                                                                                }
                                                                                            )}
                                                                                        />
                                                                                    )}
                                                                            </div>
                                                                        ),

                                                                        status: adset.adsetId
                                                                            ? "finish"
                                                                            : "error",
                                                                    };
                                                                })
                                                                .filter(Boolean),
                                                        ].filter(Boolean)}
                                                    />
                                                </div>
                                            }
                                        >
                                            <span style={{ lineHeight: "14px" }}> {record.campaign_name} </span>
                                        </Popover>
                                    </Text>
                                </div>
                            </Space>

                            {/* Campaign details */}
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    columnGap: 10,
                                    rowGap: 2,
                                    flexWrap: "wrap",
                                    width: "100%",
                                    lineHeight: 1,
                                }}
                            >
                                <Space size={4}>
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 10,
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    >
                                        Approval
                                    </Text>

                                    <Tag
                                        color={
                                            approvalState === "Approved"
                                                ? "green"
                                                : approvalState === "Rejected"
                                                    ? "red"
                                                    : "orange"
                                        }
                                        style={{
                                            margin: 0,
                                            fontSize: 11,
                                        }}
                                    >
                                        {approvalState === "PENDING_APPROVAL"
                                            ? "Pending"
                                            : approvalState || "Pending"}
                                    </Tag>
                                </Space>

                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 10,
                                        color:
                                            theme === "dark"
                                                ? "white"
                                                : "black",
                                    }}
                                >
                                    Created: {record.createdDate || "-"}
                                </Text>

                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 10,
                                        color:
                                            theme === "dark"
                                                ? "white"
                                                : "black",
                                    }}
                                >
                                    Created by: {record.createdby || "-"}
                                </Text>

                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 10,
                                        color:
                                            theme === "dark"
                                                ? "white"
                                                : "black",
                                    }}
                                >
                                    Account: {record.Account_Number}
                                </Text>

                                {approvalState === "Approved" && (
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 10,
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    >
                                        Approved by:{" "}
                                        {approvalDetailsObject.Approvedby}
                                    </Text>
                                )}

                                {approvalState === "Rejected" && (
                                    <Text
                                        type="secondary"
                                        style={{
                                            fontSize: 10,
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    >
                                        Rejected by:{" "}
                                        {approvalDetailsObject.RejectedBy}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right container */}
                    <div
                        className="campaigns-card-right"
                        style={{
                            flex: "0 0 auto",
                            flexShrink: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            gap: 2,
                            whiteSpace: "nowrap",
                        }}
                    >
                        {/* Action icons */}
                        <Space
                            className="campaign-card-actions"
                            size={2}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <Tooltip
                                title={
                                    record.Status === "ACTIVE"
                                        ? "Pause campaign"
                                        : "Activate campaign"
                                }
                            >
                                <Switch
                                    size="small"
                                    checkedChildren="✓"
                                    unCheckedChildren="✗"
                                    disabled={doesAdsWentToFacebook}
                                    style={{
                                        transform: "scale(0.9)",
                                        transformOrigin: "top center",
                                        backgroundColor: campaignStatus
                                            ? "#91C25F"
                                            : "#d9d9d9",
                                        marginRight: 5,
                                    }}
                                    checked={campaignStatus}
                                    onChange={checked => {
                                        setStatusModalOpen(true);
                                        setPendingStatus(checked);
                                    }}
                                />
                            </Tooltip>

                            <Tooltip
                                title={renderErrorTooltip(record, theme)}
                                styles={{
                                    container: {
                                        backgroundColor:
                                            theme === "dark"
                                                ? "#2b2b2b"
                                                : "#ffffff",
                                        color:
                                            theme === "dark"
                                                ? "#ffffff"
                                                : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: "11px",
                                    },
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: hasAnyError
                                            ? "#EC7117"
                                            : "#91C25F",
                                        color: "#000",
                                        borderRadius: "50%",
                                        width: "16px",
                                        height: "16px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 10,
                                    }}
                                >
                                    {record.adsetsWithAds?.length}
                                </div>
                            </Tooltip>

                            <Button
                                type="text"
                                size="small"
                                icon={
                                    <EyeOutlined
                                        style={{
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    />
                                }
                                onClick={handleView}
                            />

                            <Button
                                type="text"
                                size="small"
                                style={{ fontSize: 12 }}
                                icon={
                                    <FaPenToSquare
                                        style={{
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    />
                                }
                                onClick={handleEdit}
                            />

                            <Button
                                type="text"
                                size="small"
                                style={{ fontSize: 12 }}
                                icon={
                                    <FaClone
                                        style={{
                                            color:
                                                theme === "dark"
                                                    ? "white"
                                                    : "black",
                                        }}
                                    />
                                }
                                onClick={handleEdit}
                            />

                            <Tooltip
                                title={commentValue || ""}
                                styles={{
                                    container: {
                                        backgroundColor:
                                            theme === "dark"
                                                ? "#2b2b2b"
                                                : "#ffffff",
                                        color:
                                            theme === "dark"
                                                ? "#ffffff"
                                                : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: "14px",
                                    },
                                }}
                            >
                                <Button
                                    type="text"
                                    style={{ fontSize: 12 }}
                                    icon={
                                        <CommentOutlined
                                            style={{
                                                color: commentValue
                                                    ? "blue"
                                                    : theme === "dark"
                                                        ? "white"
                                                        : "black",
                                            }}
                                        />
                                    }
                                    size="small"
                                    onClick={() => setCommentModalOpen(true)}
                                />
                            </Tooltip>

                            <Dropdown
                                menu={{ items: menuItems }}
                                trigger={["click"]}
                                popupRender={menu => (
                                    <div
                                        className={`campaign-dropdown ${theme === "dark"
                                            ? "campaigns-dropdown-dark"
                                            : ""
                                            }`}
                                    >
                                        {menu}
                                    </div>
                                )}
                            >
                                <Button
                                    type="text"
                                    size="small"
                                    style={{ fontSize: 12 }}
                                    icon={
                                        <MoreOutlined
                                            style={{
                                                color:
                                                    theme === "dark"
                                                        ? "white"
                                                        : "black",
                                            }}
                                        />
                                    }
                                />
                            </Dropdown>
                        </Space>

                        {/* Approve / Reject / Budget */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                gap: 8,
                                flexWrap: "nowrap",
                                whiteSpace: "nowrap",
                                width: "max-content",
                            }}
                        >
                            <Button
                                style={{
                                    fontSize: 11,
                                    height: "18px",
                                    color: "#91C25F",
                                    border: "1px solid #91C25F",
                                    display:
                                        approvalState === "PENDING_APPROVAL"
                                            ? "block"
                                            : "none",
                                    backgroundColor: "transparent",
                                }}
                                size="small"
                                onClick={() => setApproveModalOpen(true)}
                            >
                                Approve
                            </Button>

                            <Button
                                danger
                                style={{
                                    fontSize: 11,
                                    height: "18px",
                                    display:
                                        approvalState === "PENDING_APPROVAL"
                                            ? "block"
                                            : "none",
                                    backgroundColor: "transparent",
                                }}
                                size="small"
                                onClick={() => handleRejectClick(record)}
                            >
                                Reject
                            </Button>

                            <Space
                                size={6}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "nowrap",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 10,
                                        color:
                                            theme === "dark"
                                                ? "white"
                                                : "black",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {`Budget (${record.Budget_type})`}:
                                </Text>

                                <Text
                                    strong
                                    style={{
                                        fontSize: 12,
                                        color:
                                            theme === "dark"
                                                ? "white"
                                                : "black",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    ${budgetValue}
                                </Text>

                                <Button
                                    type="text"
                                    style={{ fontSize: 12 }}
                                    icon={
                                        <EditOutlined
                                            style={{
                                                color:
                                                    theme === "dark"
                                                        ? "white"
                                                        : "black",
                                            }}
                                        />
                                    }
                                    size="small"
                                    disabled={budgetValue <= 0}
                                    onClick={() => setBudgetModalOpen(true)}
                                />
                            </Space>
                        </div>
                    </div>
                </div>
            </Card>

            {expanded && (
                <div
                    className="adsets-grid"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: 6,
                        padding: 6,
                        width: "100%",
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        overflow: "hidden",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        backgroundColor: "transparent",
                    }}
                >
                    {(record.adsetsWithAds || []).map((adset, index) => (
                        <div
                            key={adset.adsetId || adset.key || index}
                            style={{
                                minWidth: 0,
                                maxWidth: "100%",
                            }}
                        >
                            <AdsetCard
                                adset={adset}
                                record={record}
                                theme={theme}
                                userdetails={userdetails}
                            />
                        </div>
                    ))}
                </div>
            )}

            <Modal
                title={<div className="campaigns-history-modal-title" style={{ color: theme === "dark" ? "white" : "" }}>{record.campaign_name}</div>}
                open={historyOpen}
                onCancel={() => setHistoryOpen(false)}
                className={`campaigns-history-modal ${theme === "dark" ? "campaigns-dark-modal" : ""}`}
                footer={null}
                destroyOnHidden
                centered
                width="90vw"
                height="90vh"
                // styles={{
                //     content: {
                //         height: "90vh",
                //         padding: 0,
                //     },
                //     body: {
                //         height: "calc(90vh - 55px)",
                //         overflow: "hidden",
                //     },
                // // }}
                // styles={{
                //     content: {
                //         padding: 0
                //     },
                //     header: {
                //         margin: 0,
                //         // padding: "16px 24px"
                //     },
                //     body: {
                //         padding: 0,
                //         margin: 0
                //     }
                // }}

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
                <CampaignHistory
                    type=""
                    id={record.identifier}
                    account={record.Account_Number}
                    theme={theme}
                    userData={userData}
                />
            </Modal>

            <Modal
                open={statusModalOpen}
                title="Confirm Action"
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                onCancel={() => setStatusModalOpen(false)}
                onOk={() => {
                    handleStatusChange(record, pendingStatus);
                }}
                mask={{ closable: false, }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => setStatusModalOpen(false)}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => {
                                    handleStatusChange(record, pendingStatus);
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
                <Spin spinning={loading}>
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Are you sure you want to change the status to{" "}
                        <strong>{pendingStatus ? "Active" : "Pause"}</strong>?</p>
                </Spin>
            </Modal>
            <Modal
                open={approveModalOpen}
                width={isMobile ? "90vw" : "50vw"}
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                title="Confirm approval"
                onCancel={() => setApproveModalOpen(false)}
                onOk={() => {
                    handleApprove(record);
                }}
                mask={{ closable: false, }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => setApproveModalOpen(false)}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => {
                                    handleApprove(record);
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
                <Spin spinning={loading}>
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Are you sure you want to approve this campaign?</p>
                </Spin>
            </Modal>
            <Modal
                title="Confirm rejection"
                open={rejectModalOpen}
                onCancel={() => {
                    setRejectModalOpen(false);
                    setRejectionReason("");
                    setReasonError("");
                }}
                onOk={() => handleReject(record)}
                confirmLoading={loading}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                mask={{ closable: false }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => {
                                    setRejectModalOpen(false);
                                    setRejectionReason("");
                                    setReasonError("");
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => handleReject(record)}
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
                <Spin spinning={loading}>
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Are you sure you want to reject?</p>

                    <Input.TextArea
                        placeholder="Enter rejection reason"
                        value={rejectedReason}
                        onChange={e => {
                            setRejectionReason(e.target.value);

                            if (reasonError) {
                                setReasonError("");
                            }
                        }}
                        rows={4}
                        status={reasonError ? "error" : ""}
                        className={theme === "dark" ? "rejection-textarea-dark" : "rejection-textarea-light"}
                        style={{ backgroundColor: theme === "dark" ? "transparent" : "white", color: theme === "dark" ? "white" : "black" }}
                    />

                    {reasonError && (
                        <div
                            style={{
                                color: "#ff4d4f",
                                marginTop: 5,
                                fontSize: 12,
                            }}
                        >
                            {reasonError}
                        </div>
                    )}
                </Spin>
            </Modal>
            <Modal
                open={deleteCampaignModalOpen}
                width={isMobile ? "90vw" : "50vw"}
                className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                title="Delete campaign"
                onCancel={() => setDeleteCampaignModalOpen(false)}
                onOk={() => {
                    handleDelete(record);
                }}
                mask={{ closable: false, }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => setDeleteCampaignModalOpen(false)}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => {
                                    handleDelete(record);
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
                <Spin spinning={loading}>
                    <p style={{ color: theme === "dark" ? "white" : "" }}> Are you sure you want to delete this campaign?</p>
                </Spin>
            </Modal>

            <Modal
                title="Edit Budget"
                open={budgetModalOpen}
                onCancel={() => {
                    setBudgetModalOpen(false);
                    setInuptBudgetValue(budgetValue);
                }}
                onOk={() => handleSendBudgetValue(record)}
                confirmLoading={loading}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                mask={{ closable: false }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => {
                                    setBudgetModalOpen(false);
                                    setInuptBudgetValue(budgetValue);
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => handleSendBudgetValue(record)}
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
                <Spin spinning={loading}>

                    {/* <Input.TextArea
                        placeholder="Enter rejection reason"
                        value={rejectedReason}
                        onChange={e => {
                            setRejectionReason(e.target.value);

                            if (reasonError) {
                                setReasonError("");
                            }
                        }}
                        rows={4}
                        status={reasonError ? "error" : ""}
                        className={theme === "dark" ? "rejection-textarea-dark" : "rejection-textarea-light"}
                        style={{ backgroundColor: theme === "dark" ? "transparent" : "white", color: theme === "dark" ? "white" : "black" }}
                    /> */}
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Campaign:  {record.campaign_name}</p>
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Budget type: {record.Budget_type}</p>
                    <InputNumber
                        min={0}
                        step={0.01}
                        value={inputBudgetValue}
                        style={{ width: "100%" }}
                        classNames={{ root: theme === "dark" ? "dark-input-number" : "" }}
                        styles={theme === "dark" ? {
                            root: { background: "#333", color: "#fff" },
                            input: { background: "#333", color: "#fff" },
                            actions: { background: "#333" },
                            action: { background: "#333", color: "#fff" }
                        } : {}}
                        onChange={e => setInuptBudgetValue(e)}
                    />
                </Spin>
            </Modal>

            <Modal
                title={<p style={{ fontSize: 14, margin: 0 }}>{record.campaign_name}</p>}
                open={commentModalOpen}
                onCancel={() => {
                    setCommentModalOpen(false);
                    setInuptCommentValue(commentValue);
                }}
                onOk={() => handleComment(record)}
                confirmLoading={loading}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
                mask={{ closable: false }}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: commentValue ? "space-between" : "flex-end", width: "100%" }}>
                        {commentValue && <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 11 }}>Last Edited Time:</p>
                            <p style={{ margin: 0, fontSize: 11 }}>{commentObject.editedTime}</p>
                            <p style={{ margin: 0, fontWeight: 500, fontSize: 11 }}>Last Edited By:</p>
                            <p style={{ margin: 0, fontSize: 11 }}>{commentObject.createdBy}</p>
                        </div>}
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
                                    setInuptCommentValue(commentValue);
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={() => handleComment(record)}
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
                <Spin spinning={loading}>

                    {/* <Input.TextArea
                        placeholder="Enter rejection reason"
                        value={rejectedReason}
                        onChange={e => {
                            setRejectionReason(e.target.value);

                            if (reasonError) {
                                setReasonError("");
                            }
                        }}
                        rows={4}
                        status={reasonError ? "error" : ""}
                        className={theme === "dark" ? "rejection-textarea-dark" : "rejection-textarea-light"}
                        style={{ backgroundColor: theme === "dark" ? "transparent" : "white", color: theme === "dark" ? "white" : "black" }}
                    /> */}
                    <Input
                        value={inputCommentValue}
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
                        onChange={e => setInuptCommentValue(e.target.value)}
                    />
                </Spin>
            </Modal>
        </>
    );
};

export default CampaignCard;