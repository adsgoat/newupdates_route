"use client";

import {
    Row,
    Col,
    Result,
    Space,
    Menu,
} from "antd";

import {
    DownOutlined,
    EditOutlined,
    ReloadOutlined,
} from "@ant-design/icons";

import SubMenu from "antd/es/menu/SubMenu";

import MnetUrlBuilder from "./networkurlbuilder/mnet";
import MnetBingUrlBuilder from "./networkurlbuilder/mnetbing";
import System1UrlBuilder from "./networkurlbuilder/system1";
import TonicUrlBuilder from "./networkurlbuilder/tonic";
import DActiveUrlBuilder from "./networkurlbuilder/dactive";
import AffinityUrlBuilder from "./networkurlbuilder/affinity";
import EditUrlBuilder from "./editurlbuilder";
import SearchInput from "@/components/common/searchinput";
import ReusableSelect from "@/components/newuser/select";
import ReloadButton from "@/components/common/reloadbuttion";
import SubmitButton from "@/components/common/submitbutton";
import ReusableSkeleton from "@/components/newuser/skeleton";
import ReusableTable from "@/components/newuser/table";
import ReusableModal from "@/components/newuser/modal";


const UrlBuilderTab = ({
    theme,

    // SEARCH
    newSearchInput,
    isSearchingAccount,
    handleSearchChange,
    handleBlur,

    // NETWORK
    revenuePartner,
    availableNetworks,
    onChangeNetwork,

    // DATA
    urlBuilderData,
    filteredUrlBuilderData,
    loading4,

    // TABLE
    paginationSize,

    // ACTIONS
    refreshUrlBuilder,

    // URL BUILDER
    isModalVisibleForURLBuilder,
    network,
    selectedIndex,
    selectedUrlBuilder,

    handleOpenURLBuilder,
    onClickOpenUrlBuilder,
    handleEditUrlBuilder,
    handleCancelForURLBuilder,
    editedUrlBuilder,
    visEditUrlBuilderVisible,
    handleCloseEditUrlBuilder,
    isEditUrlBuilderVisible
}) => {

    const renderDomains = (Domains) => {
        const newDomains = Array.isArray(Domains)
            ? Domains
            : [];

        if (newDomains.length > 0) {
            return (
                <ReusableSelect
                    defaultValue="Domains"
                    width="100%"
                    size="small"
                    theme={theme}
                    popupRender={() => (
                        <Menu
                            className={`custom-dropdown-menu urlbuilder-dropdown-menu ${theme === "dark" ? "dark-menu" : ""
                                }`}
                            style={{

                                maxHeight: "none",
                                overflowY: "auto",
                            }}
                            mode="inline"

                        >
                            {newDomains.map(
                                (item, index) => (
                                    <SubMenu
                                        key={
                                            item.key ||
                                            item.id ||
                                            `domain-${index}`
                                        }
                                        title={
                                            <span className="columns-submenu">
                                                {item.name ||
                                                    "Domain"}{" "}
                                              
                                                <DownOutlined />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div className="urlbuilder-submenu-container">

                                            <p>
                                                <strong>
                                                    ID:
                                                </strong>{" "}
                                                {item.id}
                                            </p>

                                            <p>
                                                <strong>
                                                    Name:
                                                </strong>{" "}
                                                {item.name}
                                            </p>

                                            <p>
                                                <strong>
                                                    Code:
                                                </strong>{" "}
                                                {item.code}
                                            </p>

                                            <p>
                                                <strong>
                                                    Account:
                                                </strong>{" "}
                                                {item.account}
                                            </p>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    marginRight:
                                                        "25px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        paddingRight:
                                                            "8px",
                                                        paddingTop:
                                                            "10px",
                                                    }}
                                                >
                                                    <strong>
                                                        URL:
                                                    </strong>
                                                </div>

                                                <div className="urlbuilder-submenu-container-item">
                                                    {
                                                        item.url
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                    </SubMenu>
                                )
                            )}
                        </Menu>
                    )}
                />
            );
        }

        return (
            <ReusableSelect
                defaultValue="No Data"
                width="100%"
                size="small"
                theme={theme}
                options={[
                    {
                        value: "",
                        label: "No Data",
                    },
                ]}
            />
        );
    };
    const renderSource = (Source) => {
        const newSource = Array.isArray(Source)
            ? Source
            : [];

        if (newSource.length > 0) {
            return (
                <ReusableSelect
                    defaultValue="Source"
                    width="100%"
                    size="small"
                    theme={theme}
                    popupRender={() => (
                        <Menu
                            className={`custom-dropdown-menu urlbuilder-dropdown-menu ${theme === "dark" ? "dark-menu" : ""
                                }`}
                            style={{

                                maxHeight: "none",
                                overflowY: "auto",
                            }}
                            mode="inline"

                        >
                            {newSource.map(
                                (item, index) => (
                                    <SubMenu
                                        key={
                                            item.key ||
                                            item.id ||
                                            `source-${index}`
                                        }
                                        title={
                                            <span className="columns-submenu">
                                                {item.name ||
                                                    "Source"}{" "}
                                               
                                                <DownOutlined />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div className="urlbuilder-submenu-container">

                                            <p>
                                                <strong>
                                                    ID:
                                                </strong>{" "}
                                                {item.id}
                                            </p>

                                            <p>
                                                <strong>
                                                    Name:
                                                </strong>{" "}
                                                {item.name}
                                            </p>

                                            <p>
                                                <strong>
                                                    Code:
                                                </strong>{" "}
                                                {item.code}
                                            </p>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    marginRight:
                                                        "25px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        paddingRight:
                                                            "10px",
                                                        paddingTop:
                                                            "10px",
                                                    }}
                                                >
                                                    <strong>
                                                        CampaignID:
                                                    </strong>
                                                </div>

                                                <div className="urlbuilder-submenu-container-item">
                                                    {
                                                        item.campaignId
                                                    }
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    marginRight:
                                                        "25px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        paddingRight:
                                                            "10px",
                                                        paddingTop:
                                                            "10px",
                                                    }}
                                                >
                                                    <strong>
                                                        AdsetID:
                                                    </strong>
                                                </div>

                                                <div className="urlbuilder-submenu-container-item">
                                                    {
                                                        item.AdsetId
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                    </SubMenu>
                                )
                            )}
                        </Menu>
                    )}
                />
            );
        }

        return (
            <ReusableSelect
                defaultValue="No Data"
                width="100%"
                size="small"
                theme={theme}
                options={[
                    {
                        value: "",
                        label: "No Data",
                    },
                ]}
            />
        );
    };
    const renderChannels = (channels) => {
        const newChannels = Array.isArray(channels)
            ? channels
            : [];

        if (newChannels.length > 0) {
            return (
                <ReusableSelect
                    defaultValue="channels"

                    width="100%"
                    size="small"
                    theme={theme}
                    popupRender={() => (
                        <Menu
                            className={`custom-dropdown-menu urlbuilder-dropdown-menu ${theme === "dark" ? "dark-menu" : ""
                                }`}
                            style={{

                                maxHeight: "300",
                                overflowY: "auto",
                            }}
                            mode="inline"

                        >
                            {newChannels.map(
                                (item, index) => (
                                    <SubMenu
                                        key={
                                            item.key ||
                                            item.id ||
                                            `channel-${index}`
                                        }
                                        title={
                                            <span className="columns-submenu">
                                                {item.name ||
                                                    "Channel"}{" "}
                                               
                                                <DownOutlined />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div className="urlbuilder-submenu-container">

                                            <p>
                                                <strong>
                                                    ID:
                                                </strong>{" "}
                                                {item.id}
                                            </p>

                                            <p>
                                                <strong>
                                                    Name:
                                                </strong>{" "}
                                                {item.name}
                                            </p>

                                            <p>
                                                <strong>
                                                    Source:
                                                </strong>{" "}
                                                {item.source}
                                            </p>

                                            <p>
                                                <strong>
                                                    Value:
                                                </strong>{" "}
                                                {item.value}
                                            </p>

                                        </div>
                                    </SubMenu>
                                )
                            )}
                        </Menu>
                    )}
                />
            );
        }

        return (
            <ReusableSelect
                defaultValue="No Data"
                width="100%"
                size="small"
                theme={theme}
                options={[
                    {
                        value: "",
                        label: "No Data",
                    },
                ]}
            />
        );
    };
    const renderBusinessData = (businessData) => {
        const newBusinessData = Array.isArray(
            businessData
        )
            ? businessData
            : [];

        if (newBusinessData.length > 0) {
            return (
                <ReusableSelect
                    defaultValue="BusinessData"
                    width="100%"
                    size="small"
                    theme={theme}
                    popupRender={() => (
                        <Menu
                            className={`custom-dropdown-menu urlbuilder-dropdown-menu ${theme === "dark" ? "dark-menu" : ""
                                }`}
                            style={{

                                maxHeight: "none",
                                overflowY: "auto",
                            }}
                            mode="inline"

                        >
                            {newBusinessData.map(
                                (item, index) => (
                                    <SubMenu
                                        key={
                                            item.key ||
                                            item.id ||
                                            `business-${index}`
                                        }
                                        title={
                                            <span className="columns-submenu">
                                                {item.name ||
                                                    "Business Data"}{" "}
                                               
                                                <DownOutlined />
                                            </span>
                                        }
                                        className="custom-submenu"
                                    >
                                        <div className="urlbuilder-submenu-container">

                                            <p>
                                                <strong>
                                                    ID:
                                                </strong>{" "}
                                                {item.id}
                                            </p>

                                            <p>
                                                <strong>
                                                    Name:
                                                </strong>{" "}
                                                {item.name}
                                            </p>

                                            <p>
                                                <strong>
                                                    Code:
                                                </strong>{" "}
                                                {item.code}
                                            </p>

                                            <p>
                                                <strong>
                                                    Account:
                                                </strong>{" "}
                                                {item.account}
                                            </p>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    marginRight:
                                                        "25px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        paddingRight:
                                                            "8px",
                                                        paddingTop:
                                                            "10px",
                                                    }}
                                                >
                                                    <strong>
                                                        URL:
                                                    </strong>
                                                </div>

                                                <div className="urlbuilder-submenu-container-item">
                                                    {
                                                        item.url
                                                    }
                                                </div>
                                            </div>

                                        </div>
                                    </SubMenu>
                                )
                            )}
                        </Menu>
                    )}
                />
            );
        }

        return (
            <ReusableSelect
                defaultValue="No Data"
                width="100%"
                size="small"
                theme={theme}
                options={[
                    {
                        value: "",
                        label: "No Data",
                    },
                ]}
            />
        );
    };

    const openEdit = (record, index) => {
        if (handleEditUrlBuilder) {
            handleEditUrlBuilder(
                record,
                index
            );
            return;
        }

        if (onClickOpenUrlBuilder) {
            onClickOpenUrlBuilder(
                record,
                index
            );
            return;
        }

        handleOpenURLBuilder(
            record?.revenuePartner ||
            record?.Network ||
            record?.network ||
            "",
            index,
            record
        );
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
    const urlbuilder = [
        // {
        //     title: "Network",
        //     dataIndex: "Network",
        //     key: "Network",
        //     onHeaderCell: tableHeaderCell,
        //     onCell: tableBodyCell,
        // },
        {
            title: "Network",
            key: "Network",
            render: (_, record) =>
                record?.revenuePartner ||
                record?.Network ||
                record?.network ||
                "-",
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
        {
            title: "Domains",
            dataIndex: "Domains",
            key: "Domains",
            render: renderDomains,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Source",
            dataIndex: "Source",
            key: "Source",
            render: renderSource,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Channels",
            dataIndex: "channels",
            key: "channels",
            render: renderChannels,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "BusinessData",
            dataIndex: "businessData",
            key: "businessData",
            render: renderBusinessData,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Action",
            key: "action",

            render: (text, record, index) => (
                <Space>

                    {/* THIS IS THE EDIT BUTTON */}
                    <SubmitButton
                        onClick={() =>
                            handleEditUrlBuilder(
                                record,
                                index
                            )
                        }
                        width={50}
                        height={27}
                        text="Edit"
                    >
                    </SubmitButton>

                    {/* THIS IS THE EDIT ICON */}
                    <EditOutlined
                        style={{
                            cursor: "pointer",
                            fontSize: "18px",
                        }}
                        onClick={() =>
                            onClickOpenUrlBuilder(
                                record,
                                index
                            )
                        }
                    />

                </Space>
            ),
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        }
    ];


    const getUrlBuilder = () => {
        const currentNetwork =
            selectedUrlBuilder?.revenuePartner ||
            selectedUrlBuilder?.Network ||
            selectedUrlBuilder?.network ||
            network ||
            "";

        switch (currentNetwork) {
            case "Mnet":
            case "FB_Mnet":
                return (
                    <MnetUrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );
            case "Affinity":
            case "FB_Affinity":
                return (
                    <AffinityUrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );

            case "MnetBing":
            case "FB_MnetBing":
                return (
                    <MnetBingUrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );

            case "Tonic":
            case "FB_Tonic":
            case "FB_Tonic1":
                return (
                    <TonicUrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );

            case "System1":
            case "FB_System1":
                return (
                    <System1UrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );

            case "DActive":
            case "FB_DActive":
            case "FB_DomainActive":
                return (
                    <DActiveUrlBuilder
                        accountis={
                            selectedUrlBuilder
                        }
                        showSubmitButton={true}
                        onReturnMessage={
                            handleCancelForURLBuilder
                        }
                        theme={theme}
                    />
                );

            default:
                return null;
        }
    };


    return (
        <div>
            <Row
                gutter={[12, 12]}
                align="bottom"
                justify="space-between"
                style={{
                    marginTop: "-15px",
                    width: "100%",
                    padding: "10px",
                    fontSize: "12px"
                }}
            >

                {/* LEFT */}
                <Col
                    xs={24} sm={24} md={18} lg={19} xl={20}
                >

                    {/* SEARCH */}
                    <Row gutter={[8, 8]}
                        align="bottom">
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color:
                                        "#B4B4B4",
                                    display:
                                        "block",
                                }}
                            >
                                Search
                            </span>

                            <div
                            >
                                <SearchInput
                                    placeholder="Search..."
                                    autoFocus={
                                        isSearchingAccount
                                    }
                                    value={
                                        newSearchInput
                                    }
                                    onChange={
                                        handleSearchChange
                                    }
                                    onBlur={
                                        handleBlur
                                    }
                                    width="100%"
                                    height={27}
                                    theme={theme}
                                />
                            </div>
                        </Col>

                        {/* NETWORK */}

                        <Col
                            xs={24} sm={12} md={8} lg={6} xl={5}
                        >
                            <span
                                style={{
                                    color:
                                        "#B4B4B4",
                                    display:
                                        "block",
                                }}
                            >
                                Network
                            </span>

                            <ReusableSelect
                                defaultValue="All"
                                value={
                                    revenuePartner
                                }
                                onChange={
                                    onChangeNetwork
                                }
                                options={
                                    availableNetworks.map(
                                        (
                                            item
                                        ) => ({
                                            value:
                                                item,
                                            label:
                                                item,
                                        })
                                    )
                                }
                                width="100%"
                                size="small"
                                theme={theme}
                            />
                        </Col>

                    </Row>
                    {/* REFRESH */}

                </Col>
                <Col
                    style={{ marginTop: "2%" }}
                >
                    <ReloadButton
                        width={26}
                        height={25}
                        onClick={
                            refreshUrlBuilder
                        }
                    />
                </Col>

            </Row>

            <div style={{ padding: "10px", marginTop: "-10px" }}>
                {loading4 ? (
                    <div
                        style={{
                            padding: "24px",
                        }}
                    >
                        <ReusableSkeleton
                            active
                            rows={10}
                        />
                    </div>
                ) : filteredUrlBuilderData.length >
                    0 ? (

                    <ReusableTable
                        dataSource={filteredUrlBuilderData.map(
                            (
                                item,
                                index
                            ) => ({
                                ...item,

                                key:
                                    item.id ||
                                    item._id ||
                                    item.key ||
                                    `urlbuilder-${index}`,
                            })
                        )}
                        columns={
                            urlbuilder
                        }
                        paginationSize={paginationSize}
                        rowClassName={() => "accounts-table-row"}
                        scroll={{
                            x: "max-content",
                            y: "calc(87vh - 200px)",
                        }}
                        theme={theme}
                    />

                ) : (

                    <Result
                        status="404"
                        className={
                            theme === "dark"
                                ? "dark-theme"
                                : "light-theme"
                        }
                        title="No URL Builder Data Available"
                        subTitle="Sorry, this page contains no data."
                    />
                )}

                <ReusableModal
                    title={
                        <span
                            style={{
                                color: theme === "dark" ? "#fff" : "#333",
                            }}
                        >
                            UrlBuilder
                        </span>
                    }
                    open={isModalVisibleForURLBuilder}
                    onCancel={handleCancelForURLBuilder}
                    footer={null}
                    theme={theme}
                    width={1000}
                >
                    {getUrlBuilder(network)}
                </ReusableModal>

                {
                    isEditUrlBuilderVisible && (
                        <EditUrlBuilder
                            editeddata={editedUrlBuilder}
                            visible={isEditUrlBuilderVisible}
                            onClose={handleCloseEditUrlBuilder}
                            theme={theme}
                        />
                    )
                }
            </div>
        </div>

    );
};

export default UrlBuilderTab;