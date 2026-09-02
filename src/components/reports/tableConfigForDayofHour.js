"use client";
import moment from 'moment-timezone';
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Tooltip, Switch, Modal, Input, Button, Row, Dropdown, Col, Space, Typography, Badge, Select } from "antd";
import { EditOutlined, GlobalOutlined, NumberOutlined, FilterOutlined, DownOutlined, InfoCircleOutlined, DownloadOutlined, PushpinOutlined, PlusOutlined } from "@ant-design/icons"
import { RxSwitch } from "react-icons/rx";
const { Text } = Typography;
const TableConfigForDayOfHour = ({ theme, userData, updatedAccountsValue, updatedTime, updatedRevenuePartner, cronStatus, revenueCron, fbCron, setInsideInput, insideInput, campaignStatusFilter, setCampaignStatusFilter, typeFilter, setTypeFilter, onBtExport, maxNetworkHour, maxHour, tab,latestHour, selectedHour, setSelectedHour, tableLoading, setTableLoading }) => {
    const accountsAccess = userData[updatedRevenuePartner];
    const dark = theme === "dark";
    const multiple = updatedAccountsValue.length > 1;
    const color = dark ? "white" : "black";
    const tip = { background: dark ? "#2b2b2b" : "#fff", color, borderRadius: 6, padding: "6px 10px", fontSize: 14, };
    const modal = `custom-modal ${dark ? "dark-theme-modal" : ""}`;
    const icon = { color, cursor: "pointer" };
    const accountMap = new Map(accountsAccess.map(a => [a.accountNumber, a]));

    const accountTip = (type) => (
        <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {updatedAccountsValue.map((id, i) => {
                const a = accountMap.get(id);
                return (
                    <div
                        key={`${id}-${i}`}
                        style={{ padding: "4px 6px", borderBottom: "1px solid #0001", fontSize: 12, color: dark ? "#ddd" : "#333" }}
                    >
                        {type === "tz" ?
                            `${id} - ${a?.timeZone ?? "-"}` :
                            <>
                                <div>{id}</div>
                                <div>{a?.accountName ?? "-"}</div>
                            </>
                        }
                    </div>
                );
            })}
        </div>
    );


    return (
        <Row
            className="header-row"
            style={{
                width: "100%", display: "flex", alignItems: "center", flexWrap: "nowrap",
                background: dark ? "#4d4d4d" : "white", padding: "2px 5px 2px 5px"
            }}
        >
            <Col style={{ flex: ".2 1 auto" }}>
                <Space align="center">
                    <div className="blinking-circle-1" />
                    <Text style={{ paddingLeft: 3, fontSize: 12, color }}>
                        {tab}
                    </Text>
                </Space>
            </Col>
            <Col style={{ flex: "1 1 auto" }}>
                {multiple ? (
                    <Tooltip
                        title={accountTip("id")}
                        styles={{
                            container: {
                                maxWidth: 320,
                                background: dark ? "#1f1f1f" : "#fff",
                                color
                            },
                        }}
                    >
                        <Badge count={updatedAccountsValue.length} size="small">
                            <NumberOutlined style={{ ...icon, color: dark ? "#9ad" : "grey" }} />
                        </Badge>
                    </Tooltip>
                ) : (
                    <Text style={{ color, fontSize: 12 }}>Id: {updatedAccountsValue[0] ?? "-"}</Text>
                )}
            </Col>

            <Col style={{ flex: "1 1 auto" }}>
                {!multiple && (
                    <Text style={{ color, fontSize: 12 }}>
                        Name: {accountMap.get(updatedAccountsValue[0])?.accountName ?? "-"}
                    </Text>
                )}
            </Col>

            <Col style={{ flex: "1 1 auto" }}>
                {multiple ? (
                    <Tooltip
                        title={accountTip("tz")}
                        styles={{
                            container: {
                                maxWidth: 320,
                                background: dark ? "#1f1f1f" : "#fff",
                                color
                            },
                        }}
                    >
                        <Badge count={updatedAccountsValue.length} size="small">
                            <GlobalOutlined style={{ ...icon, color: dark ? "#9ad" : "grey" }} />
                        </Badge>
                    </Tooltip>
                ) : (
                    <Text style={{ color, fontSize: 12 }}>
                        Time zone: {updatedTime ?? "-"}
                    </Text>
                )}
            </Col>
            {tab === "Live" &&
                <Col xs={24} sm={24} md={8} style={{ flex: '1 1 auto' }}>
                    <Text style={{ color: theme === "dark" && "white", fontSize: 12 }}>F/N Hour: {maxHour.current}:00 / {maxNetworkHour.current}:00</Text>
                </Col>}
            <Col>
                <Select
                    size="small"
                    value={selectedHour}
                    mode="multiple"
                    maxTagCount="responsive"
                    // options={hourOptions}
                    // onChange={(value) => setSelectedHour(value)}
                    onChange={(value) => {
                        setSelectedHour(value);
                        setTableLoading(true);
                    }}
                    style={{ width: '100px', border: '1px solid #4CAF50', borderRadius: '4px', marginRight: 10, height: "30px" }}
                    className={theme === 'dark' ? 'dark-theme' : 'light-theme'}

                >
                    {Array.from(
                        { length: latestHour + 1 },
                        (_, i) => (
                            <Select.Option key={i} value={i}>
                                {i}
                            </Select.Option>
                        )
                    )}
                </Select>
            </Col>
            <Col>
                <Input
                    placeholder="Search..."
                    value={insideInput}
                    onChange={e => setInsideInput(e.target.value)}
                    allowClear
                    className={`inputatInsideTable custom-input-${dark ? "dark" : "light"}`}
                    style={{
                        borderRadius: 8,
                        border: "1px solid #91C25F",
                        width: 120,
                        marginRight: 8,
                        height: 25,
                        fontSize: 12
                    }}
                />
            </Col>

            <Col>
                <Dropdown
                    trigger={["click"]}
                    menu={{
                        items: [
                            ["All", "purple"],
                            ["Active", "green"],
                            ["Paused", "red"],
                            ["Archived", "orange"]
                        ].map(([key, c]) => ({
                            key,
                            label: (
                                <span style={{ fontSize: 13 }}>
                                    <i
                                        style={{
                                            display: "inline-block",
                                            width: 6,
                                            height: 6,
                                            borderRadius: "50%",
                                            background: c,
                                            marginRight: 6
                                        }}
                                    />
                                    <span style={{ fontSize: 12 }}>{key}</span>
                                </span>
                            )
                        })),
                        selectedKeys: [campaignStatusFilter],
                        onClick: ({ key }) => setCampaignStatusFilter(key)
                    }}
                >
                    <Button
                        style={{
                            borderRadius: 8,
                            background: dark ? "#52c41a1f" : "#f6ffed",
                            border: "1px solid #4CAF50",
                            color: dark ? "#95de64" : "#389e0d",
                            fontWeight: 500,
                            height: 25,
                            fontSize: 12
                        }}
                    >
                        <FilterOutlined /> {campaignStatusFilter}
                        <DownOutlined style={{ fontSize: 10 }} />
                    </Button>
                </Dropdown>
            </Col>

            <Col style={{ marginLeft: "8px" }}>
                <Dropdown
                    trigger={["click"]}
                    menu={{
                        items: ["All", "Daily", "Lifetime"].map(key => ({
                            key,
                            label: <span style={{ fontSize: 11 }}>{key}</span>
                        })),
                        selectedKeys: [typeFilter],
                        onClick: ({ key }) => setTypeFilter(key)
                    }}
                >
                    <Button
                        style={{
                            borderRadius: 8,
                            background: dark ? "#1890ff0f" : "#e6f7ff",
                            border: "1px solid #91d5ff",
                            color: dark ? "#69c0ff" : "#1d39c4",
                            fontWeight: 500,
                            height: 25,
                            fontSize: 12
                        }}
                    >
                        {typeFilter} <DownOutlined />
                    </Button>
                </Dropdown>
            </Col>

            <Col style={{ margin: "0px 16px 0px 16px" }}>
                <Tooltip
                    title={
                        <div style={{ fontSize: 13 }}>
                            <div>Fb status: {fbCron.current?.toLowerCase()}</div>
                            <div>Rev status: {revenueCron.current?.toLowerCase()}</div>
                            <div>Cron status: {cronStatus.current?.toLowerCase()}</div>
                            {/* <div>
                                Account:
                                <b style={{
                                    marginLeft: 3,
                                    color: accountStatus.current === "Active"
                                        ? "#91C25F"
                                        : "#EC7117"
                                }}>
                                    {accountStatus.current}
                                </b>
                            </div> */}
                        </div>
                    }
                    styles={{
                        container: {
                            background: dark ? "#111" : "#fff",
                            color,
                            border: "1px solid #ccc",
                            borderRadius: 6
                        },
                    }}
                >
                    <InfoCircleOutlined
                        style={{
                            fontSize: 18,
                            cursor: "pointer",
                            color: "#91C25F"
                        }}
                    />
                </Tooltip>
            </Col>

            <Col>
                <Button
                    type="primary"
                    style={{
                        background: "#91C25F",
                        border: 0,
                        color: "black",
                        height: 25,
                        fontSize: 12
                    }}
                    icon={<DownloadOutlined />}
                    onClick={onBtExport}
                />
            </Col>
        </Row>
    );
}
export default TableConfigForDayOfHour;