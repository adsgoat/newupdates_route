"use client";
import { useEffect, useState } from "react";
import { Card, Switch, Tooltip, Button, Typography, Divider, Modal, Spin, Input } from "antd";
import { GlobalOutlined, MoreOutlined, CheckCircleOutlined, CloseCircleOutlined, MessageOutlined, LikeOutlined, CommentOutlined, ShareAltOutlined } from "@ant-design/icons";
import { FcRemoveImage } from "react-icons/fc";
import axios from "axios";
import moment from 'moment-timezone';
const { Text } = Typography;

const isVideo = url => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url || "");
const isImage = url => /\.(jpg|jpeg|png|gif|webp|avif|svg)(\?.*)?$/i.test(url || "");

export default function AdCard({ ad, theme = "light", adset, record, userdetails, onStatusChange, onApprove, onReject, isMediaBuyer = false }) {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 576;
    const media = Array.isArray(ad?.filename) ? ad.filename[0]?.filename : ad?.filename;

    const [loading, setLoading] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [adApprovalStatus, setAdApprovalStatus] = useState(ad?.status || null);
    // Status states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [adStatus, setAdStatus] = useState(ad.Ad_Status === "ACTIVE" ? true : false);
    // Status states

    // Reject button states
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectedReason, setRejectionReason] = useState(ad?.rejectionReason || "");
    const [reasonError, setReasonError] = useState("");
    // Reject button states

    // Reject button states
    const [rejectReasonModalOpen, setRejectedReasonModal] = useState(false);
    const [editRejectedReason, setEditedRejectedReason] = useState(ad?.rejectionReason || "");
    const [editReasonError, setEditReasonError] = useState("");
    // Reject button states

    const handleStatusChange = async (record, status) => {
        setLoading(true)
        try {
            const response = await axios.post("/api/campaigns/ad/status", {
                campaignRef: record?.identifier,
                adsetId: adset.id,
                adId: ad.id,
                newStatus: status ? "ACTIVE" : "PAUSED",
                username: userdetails?.username,
            })
            if (response.status === 200 || response.status === 201) {
                setAdStatus(status);
                setStatusModalOpen(false);
            }
        }
        catch (err) {
            console.error("Adset status error", err);
        }
        finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setAdApprovalStatus(ad?.status || null)
    }, [record])

    const setApprove = async () => {
        setLoading(true)
        try {
            const res = await axios.post("/api/campaigns/ad/approval", {
                id: ad.id,
                Approved: userdetails.username, // Assuming userdetails has a name property
                datetime: moment()
                    .tz("Asia/Kolkata")
                    .format("YYYY-MM-DD HH:mm [IST]"),
                adsetid: adset.id,
                identifier: record?.identifier
            })
            if (res.status === 200 || res.status === 201) {
                setAdApprovalStatus("Approved");
                setRejectedReasonModal(false);
            }
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false);
        }
    }

    const setReject = async () => {
        const reason = rejectedReason.trim();

        if (!reason) {
            setReasonError("Please enter a valid rejection reason");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/api/campaigns/ad/reject", {
                id: ad.id,
                reason: reason,
                identifier: record?.identifier,
                adsetkey: adset.id,
                username: userdetails.username
            })
            if (res.status === 200 || res.status === 201) {
                setAdApprovalStatus("Rejected");
                setRejectModalOpen(false);
            }
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false);
        }
    }

    const setRejectReason = async () => {
        const reason = editRejectedReason.trim();

        if (!reason) {
            setReasonError("Please enter a valid rejection reason");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.put("/api/campaigns/ad/reject/reason", {
                id: record?.identifier,
                reason: reason,
                adId: ad?.id,
                adsetKey: adset.id,
                username: userdetails.username
            })

            if (res.status === 200 || res.status === 201) {
                setRejectionReason(reason);
                setRejectedReasonModal(false);
            }
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setLoading(false);
        }
    }

    return (
        <Card
            size="small"
            variant={false}
            style={{
                width: "100%",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                background: theme === "dark" ? "#1d1d1d" : "#fff",
            }}
            styles={{ body: { padding: 0 } }}
        >
            {/* Header */}
            <div style={{ padding: "10px 16px" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        marginBottom: 10,
                    }}
                >
                    <div style={{ flexShrink: 0 }}>
                        {media ? (
                            isImage(media) ? (
                                <img
                                    src={media}
                                    alt="ad"
                                    style={{
                                        width: 25,
                                        height: 25,
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : isVideo(media) ? (
                                <video
                                    src={media}
                                    width={40}
                                    height={40}
                                    muted
                                    style={{
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <div style={{ fontSize: 10 }}>No media</div>
                            )
                        ) : (
                            <Button
                                type="text"
                                size="small"
                                icon={<FcRemoveImage style={{ color: theme === "dark" ? "white" : "black" }} />}
                            />
                        )}
                    </div>

                    <div
                        style={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Text
                            strong
                            style={{
                                display: "block",
                                fontSize: 10,
                                flexWrap: 'wrap',
                                color: theme === "dark" ? "white" : ""
                            }}
                        >
                            {ad?.AddName || "Consumer finds"}
                        </Text>

                        <div
                            style={{
                                fontSize: 11,
                                color: "#888",
                                marginTop: 1,
                            }}
                        >
                            {ad?.pageName || <GlobalOutlined />}
                        </div>
                    </div>

                    <Switch
                        size="small"
                        checked={adStatus}
                        checkedChildren="✓"
                        unCheckedChildren="✗"
                        disabled={ad?.facebookUploadFailed || !ad.Addid}
                        onChange={(checked) => {
                            setStatusModalOpen(true)
                            setPendingStatus(checked)
                        }}
                        style={{
                            backgroundColor: adStatus ? "#91C25F" : undefined,
                            transform: "scale(0.8)",
                        }}
                    />

                    <Tooltip title="More Options">
                        <MoreOutlined
                            style={{
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        />
                    </Tooltip>
                </div>

                {ad?.message && (
                    <div
                        style={{
                            fontSize: 11,
                            color: theme === "dark" ? "#fff" : "#333",
                            marginBottom: 5,
                        }}
                    >
                        {Array.isArray(ad.message)
                            ? ad.message.map((msg, i) => (
                                <div key={i}>
                                    {i + 1}. {msg}
                                </div>
                            ))
                            : ad.message}
                    </div>
                )}
            </div>

            {/* Media */}
            <div
                style={{
                    width: "100%",
                    height: 200,
                }}
            >
                {media ? (
                    isVideo(media) ? (
                        <video
                            controls
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        >
                            <source src={media} type="video/mp4" />
                        </video>
                    ) : isImage(media) ? (
                        <img
                            src={media}
                            alt="content"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                textAlign: "center",
                                padding: 50,
                            }}
                        >
                            No media available
                        </div>
                    )
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: 50,
                        }}
                    >
                        {/* No media available */}
                        <FcRemoveImage fontSize={100} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: "10px 16px" }}>
                {ad?.headline && (
                    <div
                        style={{
                            fontSize: 10,
                            fontWeight: "bold",
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        {ad.headline}
                    </div>
                )}

                {ad?.Description && (
                    <div
                        style={{
                            fontSize: 10,
                            color: theme === "dark" ? "#aaa" : "#333",
                            marginBottom: 5,
                        }}
                    >
                        {ad.Description}
                    </div>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Text
                        type="secondary"
                        style={{ fontSize: 10, color: theme === "dark" ? "#aaa" : "" }}
                    >
                        {ad?.Caption}
                    </Text>

                    {ad?.Caption && (
                        <Button
                            type="primary"
                            size="small"
                            style={{
                                backgroundColor: "#91C25F",
                                border: 0,
                                color: "#000",
                                fontSize: 10,
                                height: 18
                            }}
                        >
                            Learn more
                        </Button>
                    )}
                </div>

                {ad?.Website_URL && (
                    <div
                        style={{
                            fontSize: 9,
                            color: "#888",
                            wordBreak: "break-word",
                            marginTop: 4,
                        }}
                    >
                        <GlobalOutlined />{" "}
                        <a
                            href={ad.Website_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {ad.Website_URL}
                        </a>
                    </div>
                )}
                <Divider style={{ margin: "2px 0px 2px 0px", borderColor: theme === "dark" ? "#fff" : undefined }} />
                {/* Like, Comment, Share */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Button
                        type="text"
                        size="small"
                        icon={<LikeOutlined style={{ color: theme === "dark" ? "white" : "black", fontSize: 11 }} />}
                        style={{ fontSize: 12, gap: 4, color: theme === "dark" ? "white" : "" }}
                    >
                        Like
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<CommentOutlined style={{ color: theme === "dark" ? "white" : "black", fontSize: 11 }} />}
                        style={{ fontSize: 12, gap: 4, padding: 0, color: theme === "dark" ? "white" : "" }}
                    >
                        Comment
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<ShareAltOutlined style={{ color: theme === "dark" ? "white" : "black", fontSize: 11 }} />}
                        style={{ fontSize: 12, gap: 4, color: theme === "dark" ? "white" : "" }}
                    >
                        Share
                    </Button>
                </div>


                {/* Actions */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    {!isMediaBuyer &&
                        adApprovalStatus !== "Approved" &&
                        adApprovalStatus !== "Rejected" && (
                            <>
                                <Button
                                    style={{ fontSize: 12, height: "20px", color: "#91C25F", border: "1px solid #91C25F", backgroundColor: "transparent" }}
                                    size="small"
                                    onClick={() => setApproveModalOpen(true)}
                                >
                                    Approve
                                </Button>
                                <Button danger
                                    style={{ fontSize: 12, height: "20px", backgroundColor: "transparent" }}
                                    size="small"
                                    onClick={() => setRejectModalOpen(true)}
                                >
                                    {/* Disapprove */}
                                    Reject
                                </Button>
                            </>
                        )}

                    {adApprovalStatus === "Approved" && (
                        <Text
                            style={{
                                color: "green",
                                fontWeight: "bold",
                                fontSize: 11,
                            }}
                        >
                            <CheckCircleOutlined /> Approved
                        </Text>
                    )}

                    {adApprovalStatus === "Rejected" && (
                        <Text
                            style={{
                                color: "red",
                                fontWeight: "bold",
                                fontSize: 11,
                            }}
                        >
                            <Tooltip
                                title={rejectedReason || ""}
                                styles={{
                                    container: {
                                        backgroundColor: theme === "dark" ? "#2b2b2b" : "#ffffff",
                                        color: theme === "dark" ? "#ffffff" : "#000000",
                                        borderRadius: 6,
                                        padding: "6px 10px",
                                        fontSize: "14px",
                                    }
                                }}
                            >
                                <MessageOutlined
                                    onClick={rejectedReason?.trim() ? () => {
                                        setRejectedReasonModal(true);
                                        setEditedRejectedReason(rejectedReason);
                                    } : undefined}
                                />{" "}
                            </Tooltip>
                            <CloseCircleOutlined /> Rejected
                        </Text>
                    )}
                </div>
            </div>
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
                onOk={setApprove}
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
                                onClick={setApprove}
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
                onOk={setReject}
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
                                onClick={setReject}
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
                title="Confirm rejection reason"
                open={rejectReasonModalOpen}
                onCancel={() => {
                    setRejectedReasonModal(false);
                    setEditReasonError("");
                    setReasonError("");
                }}
                onOk={setRejectReason}
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
                                    setRejectedReasonModal(false);
                                    setEditReasonError("");
                                    setReasonError("");
                                }}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={setRejectReason}
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
                        value={editRejectedReason}
                        onChange={e => {
                            setEditedRejectedReason(e.target.value);

                            if (reasonError) {
                                setEditReasonError("");
                            }
                        }}
                        rows={4}
                        status={editReasonError ? "error" : ""}
                        className={theme === "dark" ? "rejection-textarea-dark" : "rejection-textarea-light"}
                        style={{ backgroundColor: theme === "dark" ? "transparent" : "white", color: theme === "dark" ? "white" : "black" }}
                    />

                    {editReasonError && (
                        <div
                            style={{
                                color: "#ff4d4f",
                                marginTop: 5,
                                fontSize: 12,
                            }}
                        >
                            {editReasonError}
                        </div>
                    )}
                </Spin>
            </Modal>
        </Card>
    );
}