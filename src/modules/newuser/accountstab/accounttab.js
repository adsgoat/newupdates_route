"use client";

import {
    Row,
    Col,
    Result,
} from "antd";

import {
    EditOutlined
} from "@ant-design/icons";
import SearchInput from "@/components/common/searchinput";
import ReusableSelect from "@/components/newuser/select";
import ReloadButton from "@/components/common/reloadbuttion";
import SubmitButton from "@/components/common/submitbutton";
import EditAccount from "./editaccount"
import AddAccount from "./adaccount";
import ReusableTable from "@/components/newuser/table";
import ReusableSkeleton from "@/components/newuser/skeleton";
import ReusableSwitch from "@/components/newuser/swicth";

const AccountsTab = ({
    theme,
    newSearchInput,
    isSearchingAccount,
    handleaccountSearchChange,
    handleBlur1,
    revenuePartner,
    availableNetworks,
    status,
    onChangeNetwork,
    onChangeStatus,
    accountStatus,
    accFilteredData,
    AccountsData,
    loading2,
    paginationSize,
    refreshAccounts,
    handleStatusChange,
    handleEditAccount,
    editAccount,
    editDrawerOpen,
    handleCloseEditAccount,
    shownnewaccountdrawar,
    addAccountDrawerOpen,
    closeAddAccountDrawer,
    refreshLoading
}) => {

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

    const Accountscolumn = [
        {
            title: "Spend Account ID",
            dataIndex: "accountNumber",
            key: "accountNumber",
            width: 150,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Time Zone",
            dataIndex: "timeZone",
            key: "timeZone",
            width: 110,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Spend Partner",
            dataIndex: "spendPartner",
            key: "spendPartner",
            width: 125,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Revenue Partner",
            dataIndex: "revenuePartner",
            key: "revenuePartner",
            width: 130,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Media Buyer Name",
            dataIndex: "MediaBuyerName",
            key: "MediaBuyerName",
            width: 150,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 130,

            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,

            render: (text, record) => (
                <Row
                    gutter={3}
                    align="middle"
                    wrap={false}
                >
                    <Col>
                        <span
                            style={{
                                fontSize: "10px",
                                lineHeight: "12px",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {text || "---"}
                        </span>
                    </Col>

                    <Col>
                        <ReusableSwitch
                            checked={record.status === "Active"}
                            onChange={(checked) =>
                                handleStatusChange(
                                    record.accountNumber,
                                    checked
                                )
                            }
                        />
                    </Col>

                    <Col>
                        <EditOutlined
                            style={{ fontSize: '18px', cursor: 'pointer' }}
                            onClick={() =>
                                handleEditAccount(record)
                            }
                        />
                    </Col>
                </Row>
            ),
        },

        {
            title: "BM Name",
            dataIndex: "BMName",
            key: "BMName",
            width: 130,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },

        {
            title: "Holder",
            dataIndex: "Holder",
            key: "Holder",
            width: 130,
            onHeaderCell: tableHeaderCell,
            onCell: tableBodyCell,
        },
    ];

    return (
        <div
            style={{
                width: "100%",
            }}
        >
            <Row
                gutter={[12, 12]}
                align="bottom"
                justify="space-between"
                style={{
                    marginTop: "-15px",
                    width: "100%",
                    padding: "0px 10px 10px 10px",
                    fontSize: "12px"
                }}
            >
                {/* LEFT - FILTERS */}
                <Col xs={24} sm={24} md={18} lg={19} xl={20}>
                    <Row
                        gutter={[8, 8]}
                        align="bottom"
                    >
                        {/* SEARCH */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color:
                                        theme === "dark"
                                            ? "#aaa"
                                            : "#777",
                                    display: "block",
                                }}
                            >
                                Search
                            </span>

                            <SearchInput
                                type="text"
                                placeholder="Search..."
                                width="100%"
                                height={27}
                                theme={theme}
                                autoFocus={
                                    isSearchingAccount
                                }
                                value={newSearchInput}
                                onChange={
                                    handleaccountSearchChange
                                }
                                onBlur={handleBlur1}
                            />
                        </Col>

                        {/* NETWORK */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color:
                                        theme === "dark"
                                            ? "#aaa"
                                            : "#777",
                                    display: "block",
                                }}
                            >
                                Network
                            </span>

                            <ReusableSelect
                                value={revenuePartner}
                                onChange={onChangeNetwork}
                                options={
                                    availableNetworks
                                }
                                theme={theme}
                                width="100%"
                                size="small"
                                placeholder="Select Network"
                            />
                        </Col>

                        {/* STATUS */}
                        <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                            <span
                                style={{
                                    color:
                                        theme === "dark"
                                            ? "#aaa"
                                            : "#777",
                                    display: "block",
                                }}
                            >
                                Status
                            </span>

                            <ReusableSelect
                                defaultValue="All"
                                onChange={onChangeStatus}
                                width="100%"
                                options={
                                    accountStatus || []
                                }
                                theme={theme}
                                size="small"
                                placeholder="Select Status"
                            />
                        </Col>

                        {/* TOTAL */}
                        <Col
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                            xl={5}
                        >
                            <div
                                style={{
                                    height: "30px",
                                    display: "flex",
                                    alignItems: "center",
                                    color:
                                        theme === "dark"
                                            ? "#fff"
                                            : "#333",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                Total Records:&nbsp;
                                {accFilteredData?.length || 0}
                            </div>
                        </Col>
                    </Row>
                </Col>

                {/* RIGHT - ACTIONS */}
                <Col
                    xs={24}
                    sm={24}
                    md={6}
                    lg={5}
                    xl={4}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "flex-end",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                        }}
                    >
                        <ReloadButton
                            width={26}
                            height={25}
                            onClick={
                                refreshAccounts
                            }
                            loading={refreshLoading}
                        />

                        <SubmitButton
                            onClick={
                                shownnewaccountdrawar
                            }
                            width={130}
                            height={25}
                            text="Add new Account"
                        />
                    </div>
                </Col>
            </Row>
            <div style={{ padding: "10px", marginTop: "-10px" }}>
                {loading2 ? (
                    <div
                        style={{
                            padding:
                                "20px",
                        }}
                    >
                        <ReusableSkeleton
                            active
                            rows={10}
                        />
                    </div>
                ) : AccountsData?.length >
                    0 ? (
                    <ReusableTable
                        dataSource={accFilteredData || []}
                        columns={Accountscolumn}
                        paginationSize={paginationSize}
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
                        title="No Accounts Data Available"
                        subTitle="Sorry, this page contains no data."
                        extra={
                            <SubmitButton
                                text="Add New Account"
                                onClick={
                                    shownnewaccountdrawar
                                }
                            >

                            </SubmitButton>
                        }
                    />
                )}
                <AddAccount
                    visible={addAccountDrawerOpen}
                    onClose={closeAddAccountDrawer}
                    AccountsData={AccountsData}
                    getaccounts={refreshAccounts}
                    theme={theme}
                />
                <EditAccount
                    open={editDrawerOpen}
                    account={editAccount}
                    onClose={handleCloseEditAccount}
                    theme={theme}
                    AccountsData={AccountsData}
                    availableNetworks={availableNetworks}
                    onUpdated={refreshAccounts}
                />
            </div>
        </div>

    );
};

export default AccountsTab;