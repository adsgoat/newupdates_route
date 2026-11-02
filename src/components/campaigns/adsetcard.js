import { useState } from "react";
import { Card, Tooltip, Switch, Typography, Badge, Button, Modal, Spin, InputNumber } from "antd";
import { PlusSquareOutlined, MinusSquareOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";
import moment from 'moment-timezone';
import AdCard from "./adcard";
const { Text } = Typography;

export default function AdsetCard({ record, adset, theme, userdetails }) {
    const ads = adset?.ads || [];
    const approvedCount = ads.filter(item => item.status === "Approved").length;
    const rejectedCount = ads.filter(item => item.status === "Rejected").length;
    const pendingCount = ads.filter(item => !item.status).length;
    const [expanded, setExpanded] = useState(false);

    const [loading, setLoading] = useState(false);
    // Status states
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);
    const [adsetStatus, setAdsetStatus] = useState(adset.Status === "ACTIVE" ? true : false);
    // Status states

    // Budget states
    const [budgetModalOpen, setBudgetModalOpen] = useState(false);
    const [budgetValue, setBudgetValue] = useState(adset.Daily_amount ? adset.Daily_amount / 100 : 0);
    const [inputBudgetValue, setInuptBudgetValue] = useState(budgetValue);
    // Budget states

    const handleStatusChange = async (record, status) => {
        setLoading(true)
        try {
            const response = await axios.post("/api/campaigns/adset/status", {
                campaignRef: record?.identifier,
                adsetKey: adset.id,
                newStatus: status ? "ACTIVE" : "PAUSED",
                username: userdetails?.username,
            })
            if (response.status === 200 || response.status === 201) {
                setAdsetStatus(status);
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

    const handleSendBudgetValue = async (record) => {
        setLoading(true)
        try {
            const budgetValueInInteger = Math.round(Number(inputBudgetValue) * 100)
            const response = await axios.post(`/api/campaigns/adset/budget`, {
                campaignRef: record?.identifier,
                adsetId: adset.id,
                newBudget: budgetValueInInteger,
                budgetType: adset.Budget_type,
                username: userdetails?.username,
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

    return (
        <Card
            size="small"
            style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
                padding: 5,
                borderRadius: 6,
                background: theme === "dark" ? "#1d1d1d" : "#fafafa",
                border: `1px solid ${theme === "dark" ? "#303030" : "#e5e7eb"}`,
            }}
            styles={{ body: { padding: "7px 10px" } }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                    }}
                >
                    <Text strong ellipsis style={{ fontSize: 12, color: theme === "dark" ? "white" : "" }}>
                        {adset.adsetName}
                    </Text>

                    <Tooltip title="Approved">
                        <span
                            style={{
                                color: "#4caf50",
                                fontWeight: "bold",
                                marginRight: 10,
                                fontSize: 12,
                            }}
                        >
                            {approvedCount}
                        </span>
                    </Tooltip>

                    <Tooltip title="Rejected">
                        <span
                            style={{
                                color: "red",
                                fontWeight: "bold",
                                marginRight: 10,
                                fontSize: 12,
                            }}
                        >
                            {rejectedCount}
                        </span>
                    </Tooltip>

                    <Tooltip title="Pending">
                        <span
                            className="blinking-campaigns"
                            style={{
                                color: "orange",
                                fontWeight: "bold",
                                fontSize: 12,
                            }}
                        >
                            {pendingCount}
                        </span>
                    </Tooltip>
                </div>

                <Switch
                    size="small"
                    checkedChildren="✓"
                    unCheckedChildren="✗"
                    disabled={!adset?.adsetId}
                    checked={adsetStatus}
                    style={{
                        transform: "scale(0.9)",
                        transformOrigin: "top center",
                        backgroundColor: adsetStatus ? "#91C25F" : "#d9d9d9",
                        marginRight: 5,
                    }}
                    onChange={(checked) => {
                        setStatusModalOpen(true)
                        setPendingStatus(checked)
                    }}
                />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                    }}
                >
                    <div
                        onClick={() => setExpanded(prev => !prev)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                        }}
                    >
                        {expanded ? (
                            <MinusSquareOutlined
                                style={{
                                    fontSize: 12,
                                    color: theme === "dark" ? "white" : "black",
                                }}
                            />
                        ) : (
                            <PlusSquareOutlined
                                style={{
                                    fontSize: 12,
                                    color: theme === "dark" ? "white" : "black",
                                }}
                            />
                        )}
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            color: theme === "dark" ? "white" : "",

                        }}
                    >
                        <Badge status="default" className={theme === "dark" ? "dark-badge" : ""} />
                        <Text
                            strong
                            ellipsis
                            style={{
                                fontSize: 10,
                                lineHeight: 1,
                                color: theme === "dark" ? "white" : ""
                            }}
                        >
                            {ads.length} Ads
                        </Text>
                    </div>
                </div>
                <div style={{ fontSize: 11, display: "flex", alignItems: "center", color: theme === "dark" ? "white" : "" }}>
                    {`Budget (${adset.Budget_type}):  `} <span style={{ fontWeight: "500", marginLeft: 2 }}> ${budgetValue}</span>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined style={{ color: theme === "dark" ? "white" : "black", fontSize: 12 }} />}
                        disabled={budgetValue <= 0}
                        onClick={() => setBudgetModalOpen(true)}
                    // onClick={handleView}
                    />
                </div>
            </div>

            {expanded &&
                <div style={{ padding: 5 }}>
                    <div
                        className="ads-grid"
                        style={{
                            display: "flex",
                            gap: 8,
                            overflowX: "auto",
                            overflowY: "hidden",
                            scrollSnapType: "x mandatory",
                            paddingBottom: 5,
                        }}
                    >
                        {(adset.ads || []).map((ad, index) => (
                            <div
                                key={ad.id}
                                style={{
                                    flex: "0 0 calc(50% - 4px)",
                                    minWidth: 0,
                                    scrollSnapAlign: "start",
                                }}
                            >
                                <AdCard
                                    ad={ad}
                                    theme={theme}
                                    adset={adset}
                                    record={record}
                                    userdetails={userdetails}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            }
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
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Adset:  {adset.adsetName}</p>
                    <p style={{ color: theme === "dark" ? "white" : "" }}>Budget type: {adset.Budget_type}</p>
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

        </Card>
    );
}