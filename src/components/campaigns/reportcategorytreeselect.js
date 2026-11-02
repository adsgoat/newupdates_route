
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    TreeSelect,
    Input,
    Button,
    Modal,
    message,
} from "antd";
import {
    PlusOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
    FaPenToSquare,
    FaTrashCan,
    FaFolder,
} from "react-icons/fa6";
import axios from "axios";

const ReportCategoryTreeSelect = ({
    reportCategories = [],
    value,
    onChange,
    theme = "light",
    error = "",
    placeholder = "Select report category",
    width = 200,
    maxDropdownHeight = 320,
    disabled = false,
    allowClear = true,
    className = "",
    dropdownClassName,
    valueKey = "categoryId",
    returnObject = false,
}) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [categories, setCategories] = useState([]);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [editedName, setEditedName] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Normalize category fields while retaining all original properties.
    const normalizeCategory = (category) => ({
        ...category,
        accountNumber:
            category?.accountNumber ??
            category?.account_number ??
            category?.Account_Number ??
            category?.accountNo ??
            category?.account ??
            "Unknown Account",
        name:
            category?.name ??
            category?.categoryName ??
            category?.category_name ??
            "",
    });

    // Always accept the latest categories supplied by the parent.
    useEffect(() => {
        setCategories(
            Array.isArray(reportCategories)
                ? reportCategories.map(normalizeCategory)
                : []
        );
    }, [reportCategories]);

    const getCategoryId = (category, index) =>
        `${String(category?.accountNumber ?? "unknown")}:${String(
            category?.[valueKey] ?? category?.categoryId ?? category?.id ??
            `${category?.name ?? ""}:${index}`
        )}`;

    const accountKeys = useMemo(
        () => [
            ...new Set(
                categories.map(
                    (category) =>
                        `account:${String(
                            category.accountNumber || "Unknown Account"
                        )}`
                )
            ),
        ],
        [categories]
    );

    // Expand account nodes whenever the category list changes.
    useEffect(() => {
        setExpandedKeys(accountKeys);
    }, [accountKeys]);

    const { treeData, categoryByValue, selectedValue } = useMemo(() => {
        const accounts = new Map();
        const categoryByValue = new Map();

        const entries = categories.map((category, index) => ({
            category,
            index,
            categoryValue: `category:${getCategoryId(category, index)}`,
            account: String(
                category.accountNumber || "Unknown Account"
            ),
        }));

        entries.forEach(({ category, categoryValue, account }) => {
            const accountKey = `account:${account}`;

            if (!accounts.has(accountKey)) {
                accounts.set(accountKey, {
                    title: (
                        <div className="rcts-account">
                            <FaFolder className="rcts-folder-icon" />
                            <span>{account}</span>
                        </div>
                    ),
                    value: accountKey,
                    key: accountKey,
                    selectable: false,
                    searchText: account,
                    children: [],
                });
            }

            categoryByValue.set(categoryValue, category);

            accounts.get(accountKey).children.push({
                title: (
                    <div className="rcts-option">
                        <span
                            className="rcts-name"
                            title={`${category.name} - ${account}`}
                        >
                            {category.name}
                        </span>

                        <span className="rcts-actions">
                            <FaPenToSquare
                                title="Edit category"
                                className="rcts-edit"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    openEdit(category);
                                }}
                            />

                            <FaTrashCan
                                title="Delete category"
                                className="rcts-delete"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    openDelete(category);
                                }}
                            />
                        </span>
                    </div>
                ),
                value: categoryValue,
                key: categoryValue,
                categoryName: String(category.name || ""),
                searchText: `${category.name || ""} ${account}`,
                isLeaf: true,
            });
        });

        let selectedValue;

        if (value != null && value !== "") {
            const incoming = String(
                typeof value === "object"
                    ? value?.[valueKey]
                    : value
            );

            if (categoryByValue.has(incoming)) {
                selectedValue = incoming;
            } else {
                const matches = entries.filter(
                    ({ category }) =>
                        category?.[valueKey] != null &&
                        String(category[valueKey]) === incoming
                );

                if (matches.length === 1) {
                    selectedValue = `category:${getCategoryId(
                        matches[0].category,
                        matches[0].index
                    )}`;
                } else if (matches.length === 0) {
                    const nameMatches = entries.filter(
                        ({ category }) =>
                            String(category.name) === incoming
                    );

                    if (nameMatches.length === 1) {
                        selectedValue = `category:${getCategoryId(
                            nameMatches[0].category,
                            nameMatches[0].index
                        )}`;
                    }
                }
            }
        }

        return {
            treeData: Array.from(accounts.values()),
            categoryByValue,
            selectedValue,
        };
    }, [categories, value, valueKey]);

    function openEdit(category) {
        if (disabled) return;

        setCurrentCategory(category);
        setEditedName(category.name || "");
        setEditModalOpen(true);
    }

    function openDelete(category) {
        if (disabled) return;

        setCurrentCategory(category);
        setDeleteModalOpen(true);
    }

    async function handleAdd() {
        const name = newCategory.trim();

        if (!name) {
            messageApi.warning("Enter a category name.");
            return;
        }

        const accounts = [
            ...new Set(
                categories
                    .map((category) => String(category.accountNumber || ""))
                    .filter(
                        (account) =>
                            account && account !== "Unknown Account"
                    )
            ),
        ];

        if (!accounts.length) {
            messageApi.warning("No accounts available.");
            return;
        }

        const duplicateAccounts = accounts.filter((accountNumber) =>
            categories.some(
                (category) =>
                    String(category.accountNumber) === accountNumber &&
                    String(category.name || "").trim().toLowerCase() ===
                    name.toLowerCase()
            )
        );

        if (duplicateAccounts.length) {
            messageApi.warning(
                "This category already exists for: " +
                duplicateAccounts.join(", ")
            );
            return;
        }

        setSaving(true);

        try {
            const resp = await axios.post(
                "/api/campaigns/category/create",
                { accounts, name }
            );

            if (!resp.data?.ok) {
                throw new Error(
                    resp.data?.message || "Category creation failed."
                );
            }

            const createdCategories = resp.data.categories;

            if (
                !Array.isArray(createdCategories) ||
                createdCategories.length === 0 ||
                createdCategories.some(
                    (category) =>
                        !category?.categoryId ||
                        !category?.accountNumber
                )
            ) {
                throw new Error(
                    "Category creation response is missing valid category IDs. Please check the create API response."
                );
            }

            const normalizedCategories = createdCategories.map((category) => ({
                ...category,
                categoryId: String(category.categoryId),
                accountNumber: String(category.accountNumber),
                name: String(category.name || name),
            }));

            setCategories((previous) => [
                ...previous,
                ...normalizedCategories.filter(
                    (created) =>
                        !previous.some(
                            (existing) =>
                                String(existing.categoryId) ===
                                created.categoryId &&
                                String(existing.accountNumber) ===
                                created.accountNumber
                        )
                ),
            ]);

            setNewCategory("");
            messageApi.success("Report category created successfully.");
        } catch (error) {
            console.error("Category creation failed:", error);

            messageApi.error(
                error.response?.data?.message ||
                error.message ||
                "Category creation failed."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleEdit() {
        console.log("Edit handler triggered");

        const name = editedName.trim();

        if (!name || !currentCategory) {
            messageApi.warning("Enter a category name.");
            return;
        }

        const accountNumber = currentCategory.accountNumber;
        const catId = currentCategory.categoryId;

        console.log("Edit payload:", { accountNumber, catId, name });

        if (!accountNumber || !catId) {
            messageApi.error("Invalid account number or category ID.");
            return;
        }

        setSaving(true);

        try {
            console.log("Sending PATCH request...");

            const resp = await axios.patch(
                "/api/campaigns/category/edit",
                { name },
                {
                    params: {
                        id: catId,
                        account: accountNumber,
                    },
                }
            );

            console.log("PATCH response:", resp.status, resp.data);

            if (!resp.data?.ok) {
                throw new Error(resp.data?.message || "Category update failed.");
            }

            setCategories((previous) =>
                previous.map((category) =>
                    String(category.categoryId) === String(catId) &&
                        String(category.accountNumber) === String(accountNumber)
                        ? { ...category, name }
                        : category
                )
            );

            setCurrentCategory((previous) =>
                previous ? { ...previous, name } : previous
            );

            setEditModalOpen(false);
            messageApi.success("Report category updated successfully.");
        } catch (error) {
            console.error("Category edit request failed:", error);
            messageApi.error(
                error.response?.data?.message ||
                error.message ||
                "Category update failed."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete() {
        if (!currentCategory || deleteLoading) return;

        const accountNumber = currentCategory.accountNumber;
        const catId = currentCategory.categoryId;

        if (!accountNumber || !catId) {
            messageApi.error("Invalid account number or category ID");
            return;
        }

        setDeleteLoading(true);

        try {
            const resp = await axios.delete("/api/campaigns/category/delete", {
                params: {
                    id: currentCategory.categoryId,
                    account: currentCategory.accountNumber,
                },
            });

            const json = resp.data || {};

            if (resp.status < 200 || resp.status >= 300 || !json.ok) {
                throw new Error(json.message || "Delete failed");
            }

            const deletedIndex = categories.indexOf(currentCategory);

            const deletedValue =
                deletedIndex >= 0
                    ? `category:${getCategoryId(currentCategory, deletedIndex)}`
                    : null;

            const selectedCategory = categoryByValue.get(selectedValue);

            setCategories((previous) =>
                previous.filter(
                    (category) =>
                        !(
                            String(category.categoryId) === String(catId) &&
                            String(category.accountNumber) === String(accountNumber)
                        )
                )
            );

            if (
                deletedValue === selectedValue ||
                (selectedCategory &&
                    String(selectedCategory.categoryId) === String(catId) &&
                    String(selectedCategory.accountNumber) === String(accountNumber))
            ) {
                onChange?.(undefined, undefined);
            }

            setDeleteModalOpen(false);
            setCurrentCategory(null);

            messageApi.success("Report category deleted");
        } catch (error) {
            messageApi.error(
                error.response?.data?.message || error.message || "Delete failed"
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    const popupClass = [
        "rcts-popup",
        theme === "dark" ? "rcts-popup-dark" : "rcts-popup-light",
        dropdownClassName || "",
    ]
        .filter(Boolean)
        .join(" ");

    return (

        <div className={`rcts-wrapper ${className}`}>
            {contextHolder}
            <TreeSelect
                placeholder={placeholder}
                value={selectedValue}
                onChange={(nextValue, _label, extra) => {
                    if (extra?.clear || nextValue == null) {
                        onChange?.(undefined, undefined);
                        return;
                    }

                    const category = categoryByValue.get(nextValue);

                    if (!category) return;

                    onChange?.(
                        returnObject
                            ? category
                            : category[valueKey] ?? nextValue,
                        category
                    );
                }}
                treeData={treeData}
                treeExpandedKeys={expandedKeys}
                onTreeExpand={setExpandedKeys}
                treeNodeLabelProp="categoryName"
                showSearch={{
                    filterTreeNode: (input, node) =>
                        String(node.searchText || "")
                            .toLowerCase()
                            .includes(input.toLowerCase()),
                }}
                allowClear={allowClear}
                disabled={disabled}
                style={{ width, height: 24 }}
                className={`rcts-select ${theme === "dark" ? "rcts-dark" : "rcts-light"
                    }`}
                classNames={{
                    popup: { root: popupClass },
                }}
                styles={{
                    popup: {
                        root: {
                            maxHeight: maxDropdownHeight,
                            overflowY: "auto",
                        },
                    },
                }}
                notFoundContent="No report categories found"
                popupRender={(menu) => (
                    <div className="rcts-dropdown-content">
                        {menu}

                        {!disabled && (
                            <div className="rcts-add">
                                <Input
                                    size="small"
                                    placeholder="New report category"
                                    value={newCategory}
                                    onChange={(event) =>
                                        setNewCategory(event.target.value)
                                    }
                                    onPressEnter={handleAdd}
                                    maxLength={100}
                                />

                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    disabled={!newCategory.trim()}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                    onClick={handleAdd}
                                    aria-label="Add category"
                                />
                            </div>
                        )}
                    </div>
                )}
            />

            {error && <div className="rcts-error">{error}</div>}

            <Modal
                title="Edit Report Category"
                open={editModalOpen}
                onCancel={() => setEditModalOpen(false)}
                onOk={handleEdit}
                confirmLoading={saving}
                okText="Save"
                cancelText="Cancel"
                destroyOnHidden
                mask={{ closable: false }}
                styles={getModalStyles(theme)}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => setEditModalOpen(false)}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            {/* <Button
                                key="ok"
                                onClick={handleEdit}
                                style={{ backgroundColor: "#91C25F", fontSize: 12, height: 24, width: 50, color: "white" }}>
                                Save
                            </Button> */}
                            <Button
                                key="ok"
                                onClick={handleEdit}
                                loading={saving}
                                disabled={saving}
                                style={{
                                    backgroundColor: "#91C25F",
                                    fontSize: 12,
                                    height: 24,
                                    width: 50,
                                    color: "white",
                                }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                ]}
            >
                <div
                    className="rcts-modal-account"
                    style={{ marginBottom: 5 }}
                >
                    Account:{" "}
                    {currentCategory?.accountNumber || "Unknown Account"}
                </div>

                <Input
                    placeholder="Enter category name"
                    value={editedName}
                    onChange={(event) =>
                        setEditedName(event.target.value)
                    }
                    onPressEnter={handleEdit}
                    maxLength={100}
                    autoFocus
                />
            </Modal>

            <Modal
                title={
                    <span className="rcts-delete-title">
                        <ExclamationCircleOutlined />
                        Delete Report Category
                    </span>
                }
                open={deleteModalOpen}
                onCancel={() => setDeleteModalOpen(false)}
                onOk={handleDelete}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                destroyOnHidden
                mask={{ closable: false }}
                styles={getModalStyles(theme)}
                footer={[
                    <div key="footer" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Button
                                key="cancel"
                                onClick={() => setDeleteModalOpen(false)}
                                style={{ fontSize: 12, height: 24, width: 60, backgroundColor: "transparent", color: "#91C25F", border: "1px solid #91C25F" }}>
                                Cancel
                            </Button>
                            <Button
                                key="ok"
                                onClick={handleDelete}
                                style={{ border: "1px solid #ff4d4f", fontSize: 12, height: 24, width: 50, color: "red" }}>
                                Delete
                            </Button>
                        </div>
                    </div>
                ]}
            >
                <p>
                    Are you sure you want to delete the category{" "}
                    <strong>{currentCategory?.name}</strong>?
                </p>

                <div className="rcts-modal-account">
                    Account:{" "}
                    {currentCategory?.accountNumber || "Unknown Account"}
                </div>
            </Modal>

            <style jsx global>{`
                .rcts-select {
                    font-size: 13px !important;
                }

                .rcts-select .ant-select-selector {
                    min-height: 36px !important;
                    padding: 0 10px !important;
                    border-radius: 7px !important;
                    border: 1px solid #91c25f !important;
                    box-shadow: none !important;
                    display: flex;
                    align-items: center;
                }

                .rcts-select.ant-select-focused .ant-select-selector {
                    border-color: #91c25f !important;
                    box-shadow: 0 0 0 2px rgb(145 194 95 / 15%) !important;
                }

                .rcts-select .ant-select-selection-item {
                    font-weight: 500 !important;
                    opacity: 1 !important;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .rcts-light .ant-select-selection-item {
                    color: #222 !important;
                }

                .rcts-dark .ant-select-selection-item {
                    color: #f5f5f5 !important;
                }

                .rcts-select .ant-select-selection-placeholder {
                    opacity: 1 !important;
                }

                .rcts-popup.ant-select-dropdown {
                    padding: 8px !important;
                    border-radius: 10px !important;
                    box-shadow: 0 5px 20px rgb(0 0 0 / 12%) !important;
                }

                .rcts-popup .ant-select-tree {
                    font-size: 13px;
                }

                .rcts-popup .ant-select-tree-treenode {
                    width: 100%;
                    padding: 2px 0 !important;
                    align-items: center;
                }

                .rcts-popup .ant-select-tree-switcher {
                    width: 22px !important;
                    min-width: 22px !important;
                }

                .rcts-popup .ant-select-tree-node-content-wrapper {
                    flex: 1;
                    min-width: 0;
                    padding: 0 5px !important;
                    border-radius: 5px !important;
                }

                .rcts-popup .ant-select-tree-title {
                    display: inline-block;
                    width: 100%;
                    min-width: 0;
                }

                .rcts-account {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    min-height: 34px;
                    font-weight: 600;
                    font-size: 13px;
                }

                .rcts-folder-icon {
                    color: #91c25f;
                    font-size: 13px;
                    flex-shrink: 0;
                }

                .rcts-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    width: 100%;
                    min-width: 0;
                    min-height: 24px;
                }

                .rcts-name {
                    flex: 1;
                    min-width: 0;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .rcts-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-shrink: 0;
                    padding-right: 3px;
                }

                .rcts-edit {
                    font-size: 13px;
                    cursor: pointer;
                    color: inherit;
                }

                .rcts-delete {
                    font-size: 13px;
                    color: #ec7117;
                    cursor: pointer;
                }

                .rcts-popup-light .ant-select-tree {
                    background: #fff;
                    color: #222;
                }

                .rcts-popup-light
                    .ant-select-tree-node-content-wrapper:hover {
                    background: #f2f7eb !important;
                }

                .rcts-popup-light
                    .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected {
                    background: #e5f1d7 !important;
                }

                .rcts-popup-dark {
                    background: #1f1f1f !important;
                    border: 1px solid #383838;
                }

                .rcts-popup-dark .ant-select-tree {
                    background: transparent !important;
                    color: #f5f5f5 !important;
                }

                .rcts-popup-dark
                    .ant-select-tree-node-content-wrapper:hover {
                    background: #333 !important;
                }

                .rcts-popup-dark
                    .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected {
                    background: #35432b !important;
                }

                .rcts-add {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding-top: 8px;
                    margin-top: 6px;
                    border-top: 1px solid #e8e8e8;
                }

                .rcts-add .ant-input {
                    height: 28px;
                    border-radius: 7px;
                    font-size: 12px;
                }

                .rcts-add .ant-btn {
                    width: 28px;
                    height: 28px;
                    flex-shrink: 0;
                    border-radius: 7px;
                    background: #91c25f;
                    border-color: #91c25f;
                }

                .rcts-popup-dark .rcts-add {
                    border-top-color: #383838;
                }

                .rcts-popup-dark .rcts-add .ant-input {
                    background: #292929;
                    color: #f5f5f5;
                    border-color: #484848;
                }

                .rcts-error {
                    margin-top: 4px;
                    color: #ff4d4f;
                    font-size: 12px;
                }

                .rcts-modal-account {
                    color: #888;
                    font-size: 12px;
                }

                .rcts-delete-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .rcts-delete-title .anticon {
                    color: #ff4d4f;
                }
            `}</style>
        </div>
    );
};

function getModalStyles(theme) {
    const backgroundColor = theme === "dark" ? "#333" : "#fff";
    const color = theme === "dark" ? "#fff" : "#000";

    return {
        container: { backgroundColor, color },
        content: { backgroundColor, color },
        header: { backgroundColor, color },
        body: { backgroundColor, color },
        footer: { backgroundColor },
        close: { color },
    };
}

export default ReportCategoryTreeSelect;
