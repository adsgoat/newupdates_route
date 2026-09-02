import React, { useState, useEffect } from "react";
import { Select, Table, Modal, message, Flex } from "antd";
import axios from "axios";
import moment from "moment-timezone";

const timeZoneShortToFull = {
    EDT: "America/New_York",
    UTC: "Atlantic/Azores",
    EEST: "Europe/Athens",
    CST: "America/Mexico_City",
    PDT: "America/Los_Angeles",
    BST: "Europe/London",
    GMT: "Africa/Accra",
    IST: "Asia/Kolkata",
    MST: "America/Dawson",
    CDT: "America/Chicago",
    AST: "America/Puerto_Rico",
    DST: "Asia/Dubai",
    HST: "Pacific/Honolulu",
    EST: "America/Toronto",
    CEST: "Europe/Paris",
    CET: 'Europe/Berlin'
};

/* =========================
History Modal Component
========================= */
const CampaignHistoryModal = ({ open, onClose, campaignId, accountNumber, adAccounts, theme }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [storageData, setStorageData] = useState([]);
    const [newData, setNewData] = useState([]);
    const [changedByOptions, setChangedByOptions] = useState([{ label: "Anyone", value: "all" }]);
    const [activityTypeFilter, setActivityTypeFilter] = useState("All");
    const [changedByFilter, setChangedByFilter] = useState("all");

    const valuesOfAccountsList = Object.values(adAccounts).flat();
    const accountTimezone = timeZoneShortToFull[valuesOfAccountsList.find(item => item.accountNumber === accountNumber)?.timeZone];

    const convertToTimezoneAndFormat = (date, targetTz) => {
        const m = moment.tz(date, "DD-MM-YYYY hh:mm A", "Asia/Kolkata");

        return m.tz(targetTz).isSame(moment().tz(targetTz), "year")
            ? m.tz(targetTz).format("DD MMM [at] HH:mm")
            : m.tz(targetTz).format("MMM DD, YYYY [at] h:mm A");
    };

    useEffect(() => {
        if (!activityTypeFilter) return;
        // console.log(changedByFilter)
        let newDatatoUpdatetoState = []

        switch (activityTypeFilter) {
            case "all":
                newDatatoUpdatetoState = (storageData);
                break;
            case "campaigns":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "campaign")
                break;
            case "adsets":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "adset")
                break;
            case "ads":
                newDatatoUpdatetoState = storageData.filter(item => item.level === "ad")
                break;
            case "Comment":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Comment")
                break;
            case "Pin":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Pin")
                break;
            case "Bid":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Bid")
                break;
            case "Budget":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Budget")
                break;
            case "Category":
                newDatatoUpdatetoState = storageData.filter(item => item.editType === "Category")
                break;
            default:
                newDatatoUpdatetoState = (storageData);
        }
        if (changedByFilter === "all") {
            setData(newDatatoUpdatetoState)
        } else {
            setData(newDatatoUpdatetoState.filter(item => item.updatedBy === changedByFilter))
        }
        // setData(newDatatoUpdatetoState)
    }, [changedByFilter, activityTypeFilter, storageData]);


    useEffect(() => {
        if (!open || !campaignId || !accountNumber) return;


        const fetchHistory = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`api/reports/activity?account=${accountNumber}&campaign=${campaignId}`);
                const responseData = res.data.data;
                const newResponseData = [responseData.campaign, ...(responseData.adsets), ...(responseData.ads)]
                const objectsActivityHistory = newResponseData.reduce((acc, item) => {
                    if (Array.isArray(item?.ActivityHistory)) {
                        const updatedHistory = item.ActivityHistory.map(historyItem => ({
                            ...historyItem,
                            newupdateAt: historyItem.updateAt,
                            updateAt: convertToTimezoneAndFormat(historyItem.updateAt, "Asia/Kolkata"),
                            account: convertToTimezoneAndFormat(historyItem.updateAt, accountTimezone),
                            level: item.level
                        }));

                        acc.push(...updatedHistory);
                    }
                    return acc;
                }, []);

                const updatedByOptions = Array.from(
                    new Map(
                        objectsActivityHistory
                            .filter(item => item.updatedBy)
                            .map(item => {
                                const normalizedUpdatedBy = String(item.updatedBy)
                                    .trim()
                                    .toLowerCase(); // normalize key

                                return [
                                    normalizedUpdatedBy, // unique Map key
                                    {
                                        label: item.updatedBy.trim(), // display clean value
                                        value: item.updatedBy.trim(),
                                        level: item.level
                                    }
                                ];
                            })
                    ).values()
                );

                setChangedByOptions([{ label: "Anyone", value: "all" }, ...updatedByOptions])

                setNewData(newResponseData || []);
                setData(objectsActivityHistory)
                setStorageData(objectsActivityHistory)
            } catch (err) {
                message.error("Failed to load history");
            } finally {
                setLoading(false);
            }
        };


        fetchHistory();
    }, [open, campaignId, accountNumber]);

    const onChangeActivityType = (type) => {
        setActivityTypeFilter(type?.value);
    }

    const onChangeChangedBy = (type) => {
        setChangedByFilter(type?.value);
    }

    const columns = [
        { title: "Activity", dataIndex: "updateType", align: 'center', },
        { title: "Activity details", dataIndex: "updateDetail", width: 350, align: 'center' },
        {
            title: "Item changed", dataIndex: "campaignname", align: 'center',
            render: (text, record) => {
                const level = record.level;
                let name;
                let type;
                let id;
                if (level === "campaign") {
                    name = record.campaignname
                    type = "Campaign ID"
                    id = record.campaignid
                } else if (level === "adset") {
                    name = record.adsetname
                    type = "Ad set ID"
                    id = record.adsetid
                } else if (level === "ad") {
                    name = record.adname
                    type = "Ad ID"
                    id = record.ad_id
                }


                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "10px" }}>{name}</span>
                        <span style={{ fontSize: "12px" }}>
                            {type}: {id}
                        </span>
                    </div>
                );
            },
        },
        { title: "Changed by", dataIndex: "updatedBy", align: 'center' },
        {
            title: "Date and time", dataIndex: "updateAt", align: 'center',
            render: (text, record) => {
                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "column",
                            gap: "8px",
                        }}
                    >
                        <span style={{ fontSize: "10px" }}>IST: {record.updateAt}</span>
                        <span style={{ fontSize: "10px" }}>
                            Acc TZ: {record.account}
                        </span>
                    </div>
                );
            }
        }
    ];
    const tableData = [...data]
        .sort((a, b) => {
            const dateB = moment(
                b.newupdateAt,
                [
                    "DD-MM-YYYY hh:mm:ss A",
                    "DD-MM-YYYY hh:mm A",
                ],
                true
            );

            const dateA = moment(
                a.newupdateAt,
                [
                    "DD-MM-YYYY hh:mm:ss A",
                    "DD-MM-YYYY hh:mm A",
                ],
                true
            );

            return dateB.valueOf() - dateA.valueOf();
        })
        .map((item, index) => ({
            ...item,
            tableKey: index,
        }));

    return (
        // <Modal
        //     open={open}
        //     onCancel={onClose}
        //     footer={null}
        //     centered
        //     width="90%"
        //     styles={{
        //         body: {
        //             height: "80vh",
        //             display: "flex",
        //             flexDirection: "column",
        //         },
        //     }}
        //     className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""}`}
        //     dropdownClassName={theme === "dark" && "custom-dropdown"}
        //     title="Campaign Activity History"
        // >
        //     <div style={{ height: "100%", fontSize: 12 }}>


        //         {/* Filters */}
        //         <div className="flex justify-end gap-3 px-6" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "5px" }}>
        //             <Select
        //                 className="w-64"
        //                 // style={{ marginRight: "5px" }}
        //                 labelInValue
        //                 defaultValue={{ label: "All", value: "all" }}
        //                 labelRender={(option) => `Activity history: ${option.label}`}
        //                 options={[
        //                     { label: "All", value: "all" },
        //                     { label: "Ads", value: "ads" },
        //                     { label: "Ad Sets", value: "adsets" },
        //                     { label: "Bid", value: "Bid" },
        //                     { label: "Budget", value: "Budget" },
        //                     { label: "Campaigns", value: "campaigns" },
        //                     { label: "Comments", value: "Comment" },
        //                     { label: "Category", value: "Category" },
        //                     { label: "Pin", value: "Pin" },

        //                 ]}
        //                 onChange={onChangeActivityType}
        //                 // dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
        //                 classNames={{
        //                     popup: {
        //                         root: theme === 'dark' ? 'custom-dropdown' : ''
        //                     }
        //                 }}
        //                 style={{
        //                     width: '160px',
        //                     backgroundColor: theme === 'dark' ? '#333' : undefined,
        //                     color: theme === 'dark' ? '#fff' : undefined,
        //                     border: '1px solid #4CAF50',
        //                     borderRadius: '6px',
        //                     marginRight: "5px"
        //                 }}
        //             />


        //             <Select
        //                 className="w-64"
        //                 labelInValue
        //                 defaultValue={{ label: "Anyone", value: "all" }}
        //                 labelRender={(option) => `Changed by: ${option.label}`}
        //                 options={changedByOptions}
        //                 onChange={onChangeChangedBy}
        //                 // dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
        //                 classNames={{
        //                     popup: {
        //                         root: theme === 'dark' ? 'custom-dropdown' : ''
        //                     }
        //                 }}
        //                 style={{
        //                     // width: '180px',
        //                     backgroundColor: theme === 'dark' ? '#333' : undefined,
        //                     color: theme === 'dark' ? '#fff' : undefined,
        //                     border: '1px solid #4CAF50',
        //                     borderRadius: '6px'
        //                 }}
        //             />
        //             {/* <RangePicker suffixIcon={<CalendarOutlined />} /> */}
        //         </div>

        //         <Table
        //             size="small"
        //             style={{
        //                 width: "100%",
        //                 // height: "calc(100vh - 300px)",
        //                 // minHeight: '100%',
        //                 // tableLayout: "fixed",
        //             }}
        //             columns={columns}
        //             className={`custom-dark-table ${theme === "dark"
        //                 ? "dark-mode-pagination"
        //                 : "light-mode-pagination"
        //                 }`}
        //             dataSource={tableData}
        //             loading={loading}
        //             rowKey="tableKey"
        //             pagination={false}
        //             scroll={{
        //                 x: "auto",
        //                 y: "calc(68vh)",
        //             }}
        //             locale={{
        //                 emptyText: (
        //                     <div className="py-16 text-center text-slate-500">
        //                         No activity during selected date range
        //                     </div>
        //                 ),
        //             }}
        //             components={{
        //                 body: {
        //                     row: (props) => (
        //                         <tr
        //                             {...props}
        //                             style={{
        //                                 ...props.style,
        //                                 height: "30px",
        //                             }}
        //                         />
        //                     ),
        //                     cell: (props) => (
        //                         <td
        //                             {...props}
        //                             style={{
        //                                 ...props.style,
        //                                 paddingTop: "6px",
        //                                 paddingBottom: "6px",
        //                                 fontSize: "13px",
        //                             }}
        //                         />
        //                     ),
        //                 },
        //             }}
        //         />
        //     </div>
        // </Modal>
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            centered
            width="90%"
            styles={{
                body: {
                    height: "80vh",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                    overflow: "hidden",
                },
            }}
            className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                }`}
            title="Campaign Activity History"
        >
            <div
                style={{
                    height: "100%",
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                    fontSize: 12,
                }}
            >
                {/* Filters */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "8px",
                        flexShrink: 0,
                    }}
                >
                    <Select
                        labelInValue
                        defaultValue={{
                            label: "All",
                            value: "all",
                        }}
                        labelRender={option =>
                            `Activity history: ${option.label}`
                        }
                        options={[
                            { label: "All", value: "all" },
                            { label: "Ads", value: "ads" },
                            { label: "Ad Sets", value: "adsets" },
                            { label: "Bid", value: "Bid" },
                            { label: "Budget", value: "Budget" },
                            { label: "Campaigns", value: "campaigns" },
                            { label: "Comments", value: "Comment" },
                            { label: "Category", value: "Category" },
                            { label: "Pin", value: "Pin" },
                        ]}
                        onChange={onChangeActivityType}
                        classNames={{
                            popup: {
                                root:
                                    theme === "dark"
                                        ? "custom-dropdown"
                                        : "",
                            },
                        }}
                        style={{
                            width: "160px",
                            backgroundColor:
                                theme === "dark" ? "#333" : undefined,
                            color:
                                theme === "dark" ? "#fff" : undefined,
                            border: "1px solid #4CAF50",
                            borderRadius: "6px",
                        }}
                    />

                    <Select
                        labelInValue
                        defaultValue={{
                            label: "Anyone",
                            value: "all",
                        }}
                        labelRender={option =>
                            `Changed by: ${option.label}`
                        }
                        options={changedByOptions}
                        onChange={onChangeChangedBy}
                        classNames={{
                            popup: {
                                root:
                                    theme === "dark"
                                        ? "custom-dropdown"
                                        : "",
                            },
                        }}
                        style={{
                            width: "160px",
                            backgroundColor:
                                theme === "dark" ? "#333" : undefined,
                            color:
                                theme === "dark" ? "#fff" : undefined,
                            border: "1px solid #4CAF50",
                            borderRadius: "6px",
                        }}
                    />
                </div>

                {/* Table */}
                <div
                    style={{
                        flex: 1,
                        minHeight: 0,
                        overflow: "hidden",
                    }}
                >
                    <Table
                        size="small"
                        style={{
                            width: "100%",
                        }}
                        columns={columns}
                        className={`custom-dark-table ${theme === "dark"
                                ? "dark-mode-pagination"
                                : "light-mode-pagination"
                            }`}
                        dataSource={tableData}
                        loading={loading}
                        rowKey="tableKey"
                        pagination={false}
                        scroll={{
                            x: "auto",
                            y: "calc(80vh - 100px)",
                        }}
                        locale={{
                            emptyText: (
                                <div className="py-16 text-center text-slate-500">
                                    No activity during selected date range
                                </div>
                            ),
                        }}
                        components={{
                            body: {
                                row: props => (
                                    <tr
                                        {...props}
                                        style={{
                                            ...props.style,
                                            height: "30px",
                                        }}
                                    />
                                ),
                                cell: props => (
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
                </div>
            </div>
        </Modal>
    );
}

export default CampaignHistoryModal;
