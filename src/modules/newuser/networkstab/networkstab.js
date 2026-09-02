"use client";

import {
    Row,
    Col,
    Result,
} from "antd";

import { EditOutlined, EyeInvisibleOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import EditNetwork from "./editnetwork";
import SearchInput from "@/components/common/searchinput";
import ReusableSelect from "@/components/newuser/select";
import ReloadButton from "@/components/common/reloadbuttion";
import SubmitButton from "@/components/common/submitbutton";
import ReusableSkeleton from "@/components/newuser/skeleton";
import ReusableTable from "@/components/newuser/table";
import ReusableSwitch from "@/components/newuser/swicth";
import ReusableTooltip from "@/components/newuser/tooltip";

const NetworksTab = ({
    theme,

    // Search
    netSearchInput,
    isSearchingNetwork,
    handleNetworkSearchChange,
    handleBlur2,

    // Filters
    revenuePartner,
    availableNetworks,
    onChangeNetwork,
    onChangeStatus,
    networkStatus,
    status,

    // Data
    networkFilteredData,
    networksData,
    loading3,

    paginationSize,
    refreshNetworks,

    // Network actions
    handleNetworkStatusChange,
    handleEditNetwork,

    // Edit drawer
    networkAccessDrawerOpen,
    networkAccessData,
    closeNetworkDrawer,
    fetchNetworksData
}) => {
    const [passwordVisibility, setPasswordVisibility] = useState(
        Array(networkFilteredData.length).fill(false)
    );
    const toggleVisibility = (index) => {
        setPasswordVisibility((prevState) => {
            const newVisibility = [...prevState];
            newVisibility[index] = !newVisibility[index];
            return newVisibility;
        });
    };
    const tableHeaderCell = () => ({
        style: {
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 8px",
            lineHeight: "16px",
            whiteSpace: "nowrap",
        },
    });

    const tableBodyCell = () => ({
        style: {
            fontSize: "12px",
            lineHeight: "30px",
            padding: "4px 8px",
        },
    });
    const networksColumn = [
        {
            title: 'CronStaus',
            dataIndex: 'cronStatus',
            key: 'cronStatus',
            render: (text) => (text ? text : '---'),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
            width: 180
        },
        {
            title: 'Message',
            dataIndex: 'Message',
            key: 'Message',
            render: (text) => (text ? text : '---'),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
            width: 100
        },
        {
            title: 'Status',
            dataIndex: 'Status',
            key: 'Status',
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
            render: (text, record) => (
                <Row
                    gutter={[8, 8]}
                    align="middle"
                    wrap
                    className='networks-status-column'
                >
                    <Col flex="1 1 auto">
                        <span>{text}</span>
                    </Col>
                    <Col flex="1 1 auto">
                        <ReusableSwitch
                            checked={record.Status === 'Active'}
                            onChange={(checked) => handleNetworkStatusChange(record.revenuePartner, checked)}
                        />
                    </Col>
                    <Col flex="1 1 auto">
                        <EditOutlined style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => handleEditNetwork(record)} />
                    </Col>
                </Row>
            ),
        },
        {
            title: 'RevenuePartner',
            dataIndex: 'revenuePartner',
            key: 'revenuePartner',
            render: (text) => (text ? text : '---'),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
            wdith: 80
        },
        {
            title: 'TimeZone',
            dataIndex: 'timeZone',
            key: 'timeZone',
            render: (text) => (text ? text : '---'),
            width: 60,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
            render: (text) => (text ? text : '---'),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Password',
            dataIndex: 'Password',
            key: 'Password',
            render: (text, record, index) => {
                if (!text) {
                    return '---';
                }

                const isVisible = passwordVisibility[index];

                return (
                    <Row gutter={[8, 8]} align="middle" wrap>
                        <Col flex="1 1 auto">
                            <span>{isVisible ? text : '*****'.repeat(Math.ceil(text.length / 5))}</span>
                        </Col>
                        <Col flex="1 1 auto">
                            <ReusableTooltip   theme={theme} title={isVisible ? 'Hide Password' : 'Show Password'}>
                                {isVisible ? (
                                    <EyeInvisibleOutlined
                                        onClick={() => toggleVisibility(index)}
                                        style={{ fontSize: '20px', cursor: 'pointer' }}
                                    />
                                ) : (
                                    <EyeOutlined
                                        onClick={() => toggleVisibility(index)}
                                        style={{ fontSize: '20px', cursor: 'pointer' }}
                                    />
                                )}
                            </ReusableTooltip>
                        </Col>
                    </Row>
                );
            },
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Key',
            dataIndex: 'key',
            key: 'displayKey',
            render: (text) => {
                const str = text !== undefined && text !== null ? String(text) : '';
                return str ? `****${str.slice(-5)}` : '---';
            },
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Consumer_Key',
            dataIndex: 'consumer_key',
            key: 'consumer_key',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            width: 130,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Consumer_Secret',
            dataIndex: 'consumer_secret',
            key: 'consumer_secret',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            width: 150,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Client_ID',
            dataIndex: 'client_id',
            key: 'client_id',
            render: (text) => (text ? text : '---'),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Secret',
            dataIndex: 'Secret',
            key: 'Secret',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Service',
            dataIndex: 'Service',
            key: 'Service',
            render: (text) => (text ? text : '---'),
            width: 80,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Market',
            dataIndex: 'Market',
            key: 'Market',
            render: (text) => (text ? text : '---'),
            width: 80,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Config_ID',
            dataIndex: 'config_id',
            key: 'config_id',
            render: (text) => (text ? text : '---'),
            width: 100,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: 'Token',
            dataIndex: 'Token',
            Key: 'Token',
            render: (text) => {
                if (text) {
                    return `****${text.slice(-5)}`;
                }
                return '---';
            },
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
    ];

    return (
        <div style={{ width: "100%" }}>


            <Row
                gutter={[12, 12]}
                align="bottom"
                justify="space-between"
                style={{
                    marginTop: "-5px",
                    width: "100%",
                    padding: "10px",
                    fontSize: "12px"
                }}
            >

                {/* LEFT FILTERS */}
                <Col
                    xs={24} sm={24} md={18} lg={19} xl={20}
                >
                    <Row gutter={[8, 8]}
                        align="bottom">
                        {/* SEARCH */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5} >
                            <span
                                style={{
                                    color: "#B4B4B4",
                                    display: "block",
                                }}
                            >
                                Search
                            </span>


                            <SearchInput
                                placeholder="Search..."
                                autoFocus={
                                    isSearchingNetwork
                                }
                                value={netSearchInput}
                                onChange={
                                    handleNetworkSearchChange
                                }
                                onBlur={handleBlur2}
                                width="100%"
                                height={27}
                                 theme={theme}
                            />

                        </Col>

                        {/* NETWORK */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color: "#B4B4B4",
                                    display: "block",
                                }}
                            >
                                Network
                            </span>

                            <ReusableSelect
                                onChange={onChangeNetwork}
                                value={revenuePartner}
                                defaultValue="All"
                                options={availableNetworks?.map(
                                    (item) => ({
                                        value: item,
                                        label: item,
                                    })
                                )}
                                width="100%"
                                size="small"
                                theme={theme}

                            />
                        </Col>

                        {/* STATUS */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color: "#B4B4B4",
                                    display: "block",
                                }}
                            >
                                Status
                            </span>

                            <ReusableSelect
                                onChange={onChangeStatus}
                                defaultValue="All"
                                options={networkStatus.map(
                                    (item) => ({
                                        value: item,
                                        label: item,
                                    })
                                )}
                                theme={theme}
                                size="small"
                                placeholder="Select Status"
                                width="100%"
                            />
                        </Col>

                        {/* TOTAL RECORDS */}
                        <Col xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={5}>
                            <div
                                style={{
                                    marginLeft: "0px",
                                    color:
                                        theme === "dark"
                                            ? "#fff"
                                            : "#333",
                                }}
                            >
                                Total.no Of records{" "}
                                {networkFilteredData.length}
                            </div>
                        </Col>
                    </Row>
                </Col>

                {/* RIGHT SIDE */}
                <Col style={{ marginTop: "2%" }}>
                    <ReloadButton
                        width={26}
                        height={25}
                        onClick={refreshNetworks}
                    />
                </Col>

            </Row>

            <div style={{ padding: "10px", marginTop: "-10px" }}>
                {/* LOADING */}
                {loading3 ? (
                    <div style={{ padding: "24px" }}>
                        <ReusableSkeleton
                            active
                            rows={10}
                        />
                    </div>

                ) : networksData.length > 0 ? (

                    /* TABLE */
                    <ReusableTable
                        dataSource={networkFilteredData.map(
                            (item, index) => ({
                                ...item,
                                key: item.key || index,
                                id: index,
                            })
                        )}
                        columns={networksColumn}
                        paginationSize={paginationSize}
                        rowClassName={() => "accounts-table-row"}
                        scroll={{
                            x: "max-content",
                            y: "calc(87vh - 200px)",
                        }}
                        theme={theme}
                    />

                ) : (

                    /* EMPTY STATE */
                    <Result
                        status="404"
                        title="No Networks Data Available"
                        subTitle="Sorry, this page contains no data."
                        extra={
                            <SubmitButton
                                text="Add New Network"
                                onClick={showNetworkDrawer}
                            >

                            </SubmitButton>
                        }
                    />
                )}
            </div>
            <EditNetwork
                visible={networkAccessDrawerOpen}
                editeddata={networkAccessData}
                onClose={closeNetworkDrawer}
                fetchNetworksData={fetchNetworksData}
                theme={theme}
            />

        </div >

    );

};

export default NetworksTab;