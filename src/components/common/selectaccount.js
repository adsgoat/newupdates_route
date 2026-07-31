import { useState } from 'react';
import { Select, TreeSelect } from 'antd';
import { SettingOutlined, DownOutlined, FilterOutlined, WarningOutlined, DollarOutlined, EditOutlined, SearchOutlined, ReloadOutlined, CopyOutlined, CheckCircleFilled, CloseCircleFilled, PlusOutlined, ArrowRightOutlined, RightOutlined, HistoryOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { TiTickOutline, TiTimesOutline } from "react-icons/ti";
export default function SelectAccounts({ filteredAccounts, value, setValue, theme }) {
    const [searchValue, setSearchValue] = useState("");
    const isSearching = searchValue.trim().length > 0;
    // console.log(filteredAccounts);
    const treeData = [
        {
            title: (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        borderBottom: "1px solid #d9d9d9", // or any color you prefer
                    }}
                >
                    <span
                        onClick={(e) => e.stopPropagation()} // Prevent expanding/collapsing when clicking text
                    >
                        All Accounts
                    </span>

                    <div
                        style={{ display: "flex", gap: 8 }}
                        onClick={(e) => e.stopPropagation()} // Prevent TreeSelect node click
                    >
                        <TiTickOutline
                            style={{
                                fontSize: 20,
                                color: "#52c41a",
                                cursor: "pointer",
                            }}
                            title="Select All Active Accounts"
                            onClick={() =>
                                handleChange1(
                                    activeAccounts.map((acc) => String(acc.accountNumber))
                                )
                            }
                        />

                        <TiTimesOutline
                            style={{
                                fontSize: 20,
                                color: "#ff4d4f",
                                cursor: "pointer",
                            }}
                            title="Unselect All"
                            onClick={() => setValue([])}
                        />
                    </div>
                </div>
            ),
            value: "all",
            key: "all",
            children: filteredAccounts.map((item) => ({
                key: String(item.accountNumber),
                value: String(item.accountNumber),
                title: (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            borderBottom: "1px solid #d9d9d9", // or any color you prefer
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: "column" }}>
                            <span style={{ fontWeight: 600, fontSize: 12, lineHeight: "18px", }}>{item.accountNumber}</span>

                            <span
                                style={{
                                    fontSize: 11,
                                    color: "#777",
                                    lineHeight: "16px",
                                }}
                            >
                                {item.accountName}
                            </span>
                        </div>

                        {item.status === "Active" ? (
                            <CheckCircleFilled
                                style={{
                                    color: "#91C25F",
                                    fontSize: 14,
                                }}
                            />
                        ) : (
                            <CloseCircleFilled
                                style={{
                                    color: "#EC7117",
                                    fontSize: 14,
                                }}
                            />
                        )}
                    </div>
                ),
                accountNumber: String(item.accountNumber),
                accountName: item.accountName,
            })),
        },
    ];
    return (
        // <Select
        //     showSearch
        //     size='small'
        //     onSearch={setSearchText}
        //     searchValue={searchText}
        //     placeholder="Select Accounts"
        //     // Keep the visible state you already have
        //     open={isOpen}
        //     onOpenChange={handleDropdownVisibleChange}

        //     // 👇 Show first account + count
        //     value={
        //         account?.length === 0
        //             ? undefined
        //             : account?.length === 1
        //                 ? account[0] // just that account number
        //                 : `${account[0]}, +${account?.length - 1} more`
        //     }

        //     // dropdownClassName={theme === 'dark' ? "custom-dropdown" : ""}
        //     // classNames={{
        //     //     popup: {
        //     //         root: theme === 'dark' ? 'custom-dropdown' : ''
        //     //     }
        //     // }}
        //     // className={theme === 'dark' ? 'dark-theme' : 'light-theme'}
        //     style={{
        //         // width: '290px',
        //         whiteSpace: 'nowrap',
        //         color: theme === 'dark' ? 'white' : undefined,
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         border: '1px solid #4CAF50',
        //         borderRadius: '6px',
        //         minHeight: '23px',
        //     }}
        //     optionFilterProp="value"
        //     popupRender={() => (

        //         <div style={{ maxHeight: 300, overflowY: 'auto', padding: 8 }}>
        //             {renderAccountsCheckboxes(theme)}
        //         </div>
        //     )}
        // />
        // <Select
        //     size='small'
        //     open={isOpen}
        //     onOpenChange={handleDropdownVisibleChange}
        //     value={null}
        //     placeholder={
        //         account.length
        //             ? account.length === 1
        //                 ? account[0]
        //                 : `${account[0]}, +${account.length - 1} more`
        //             : "Select Accounts"
        //     }
        //     style={{ width: "100%", minHeight: "23px", fontSize: '12px', }}
        //     popupRender={() => (
        //         <div style={{ maxHeight: 300, overflowY: "auto" }}>
        //             {renderAccountsCheckboxes(theme)}
        //         </div>
        //     )}
        //     options={[]}
        // />
        // <TreeSelect
        //     treeData={treeData}
        //     treeCheckable
        //     showCheckedStrategy={TreeSelect.SHOW_CHILD}
        //     // value={value}
        //     // onChange={setValue}
        //     treeDefaultExpandAll
        //     switcherIcon={null}
        //     style={{ width: "100%" }}
        //     placeholder="Select Accounts"
        // />
        <TreeSelect
            size='small'
            treeData={treeData}
            showSearch
            filterTreeNode={(input, treeNode) => {
                const search = input.toLowerCase();

                return (
                    treeNode.accountNumber?.toLowerCase().includes(search) ||
                    treeNode.accountName?.toLowerCase().includes(search)
                );
            }}
            value={value}
            onChange={setValue}
            treeCheckable
            placeholder="Select Accounts"
            treeDefaultExpandAll
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            maxTagCount={0}
            maxTagPlaceholder={(omittedValues) => {
                if (!omittedValues.length) return null;

                const firstAccount = omittedValues[0].value; // or omittedValues[0] if labelInValue={false}
                const remainingCount = omittedValues.length - 1;

                return remainingCount > 0
                    ? `${firstAccount}, +${remainingCount} more`
                    : firstAccount;
            }}
            // className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select margin-bottom-items`}
            style={{ width: "100%", fontSize: "12px" }}
        />
    )
}