"use client";

import { useEffect, useRef, useState } from "react";
import { Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { FaTrashCan } from "react-icons/fa6";
import ReusableDrawer from "@/components/newuser/drawer";
import ReusableModal from "@/components/newuser/modal";
import ReusableSelect from "@/components/newuser/select";
import SearchInput from "@/components/common/searchinput";
import SubmitButton from "@/components/common/submitbutton";
import "../../../styles/newuser.css"
import {
    TIMEZONES,
    TIMEZONE_FULL_NAMES,
    TIMEZONE_SHORT_NAMES
} from "@/modules/newuser/constants/timezone";


const EditAccount = ({
    open,
    account,
    onClose,
    theme,
    availableNetworks = [],
    AccountsData = [],
    onUpdated,
}) => {
    const [form] = Form.useForm();
    const [confirmOpen, setConfirmOpen] =
        useState(false);

    const [saving, setSaving] =
        useState(false);
    const [bmModalOpen, setBmModalOpen] =
        useState(false);
    const [newValue, setNewValue] =
        useState("");
    const [BMName, setBMName] =
        useState("");
    const [modalPosition, setModalPosition] =
        useState({
            top: 0,
            left: 0,
        });
    const containerRef = useRef(null);
    const [options, setOptions] =
        useState([]);

    const [newOptions, setNewOptions] =
        useState([]);

    const [uniquePartners, setUniquePartners] =
        useState([]);
    const [pixels, setPixels] = useState([
        {
            pixelName: "",
            pixelId: "",
        },
    ]);
    const [pages, setPages] = useState([
        {
            pageName: "",
            pageId: "",
        },
    ]);
    const addPixelRow = () => {
        setPixels((previous) => [
            ...previous,
            {
                pixelName: "",
                pixelId: "",
            },
        ]);
    };

    const handlePixelChange = (
        index,
        field,
        value
    ) => {
        setPixels((previous) => {
            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    };

    const removePixelRow = (index) => {
        setPixels((previous) =>
            previous.filter(
                (_, i) => i !== index
            )
        );
    };
    const handlePageChange = (
        index,
        field,
        value
    ) => {
        setPages((previous) => {
            const updated = [...previous];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    };

    const addPage = () => {
        setPages((previous) => [
            ...previous,
            {
                pageName: "",
                pageId: "",
            },
        ]);
    };

    const removePage = (index) => {
        setPages((previous) =>
            previous.filter(
                (_, i) => i !== index
            )
        );
    };

    useEffect(() => {
        if (!open) return;

        const uniqueBMNames = [
            ...new Set(
                (AccountsData || [])
                    .map(
                        (item) =>
                            item?.BMName
                    )
                    .filter(
                        (value) =>
                            value &&
                            String(value).trim() !== ""
                    )
            ),
        ].sort((a, b) =>
            String(a).localeCompare(
                String(b)
            )
        );

        const uniqueRevenuePartners = [
            ...new Set(
                (AccountsData || [])
                    .map(
                        (item) =>
                            item?.revenuePartner
                    )
                    .filter(
                        (value) =>
                            value &&
                            String(value).trim() !== ""
                    )
            ),
        ].sort((a, b) =>
            String(a).localeCompare(
                String(b)
            )
        );

        setOptions(uniqueBMNames);
        setNewOptions(uniqueBMNames);

        setUniquePartners(
            uniqueRevenuePartners
        );
    }, [open, AccountsData]);
    useEffect(() => {
        if (!open || !account) return;

        const timezoneValue =
            TIMEZONE_SHORT_NAMES[
            account.timeZone
            ] ||
            account.timeZone ||
            "";

        form.setFieldsValue({
            ...account,

            accountNumber:
                account.accountNumber || "",

            accountName:
                account.accountName || "",

            spendPartner:
                account.spendPartner || "",

            AgencyName:
                account.AgencyName || "",

            BMName:
                account.BMName || "",

            BMId:
                account.BMId || "",

            timeZone:
                timezoneValue,

            status:
                account.status ||
                "Active",

            revenuePartner:
                account.revenuePartner || "",

            Beneficiary:
                account.Beneficiary || "",

            Payer:
                account.Payer || "",

            MediaBuyerName:
                account.MediaBuyerName || "",

            Holder:
                account.Holder || "",
        });

        if (
            typeof account.pixelID ===
            "string"
        ) {
            setPixels([
                {
                    pixelName: "",
                    pixelId:
                        account.pixelID,
                },
            ]);
        } else if (
            account.pixelID &&
            typeof account.pixelID ===
            "object"
        ) {
            const pixelRows =
                Object.entries(
                    account.pixelID
                ).map(
                    ([name, id]) => ({
                        pixelName: name,
                        pixelId: id,
                    })
                );

            setPixels(
                pixelRows.length
                    ? pixelRows
                    : [
                        {
                            pixelName:
                                "",
                            pixelId:
                                "",
                        },
                    ]
            );
        } else {
            setPixels([
                {
                    pixelName: "",
                    pixelId: "",
                },
            ]);
        }

        if (
            typeof account.pageID ===
            "string"
        ) {
            setPages([
                {
                    pageName:
                        account.pageName ||
                        "",
                    pageId:
                        account.pageID,
                },
            ]);
        } else if (
            account.pageID &&
            typeof account.pageID ===
            "object"
        ) {
            const pageRows =
                Object.entries(
                    account.pageID
                ).map(
                    ([name, id]) => ({
                        pageName: name,
                        pageId: id,
                    })
                );

            setPages(
                pageRows.length
                    ? pageRows
                    : [
                        {
                            pageName:
                                "",
                            pageId:
                                "",
                        },
                    ]
            );
        } else {
            setPages([
                {
                    pageName:
                        account.pageName ||
                        "",
                    pageId: "",
                },
            ]);
        }

        setBMName(
            account.BMName || ""
        );
    }, [
        open,
        account,
        form,
    ]);

    useEffect(() => {
        if (
            bmModalOpen &&
            containerRef.current
        ) {
            const rect =
                containerRef.current.getBoundingClientRect();

            setModalPosition({
                top: rect.top,
                left: rect.left,
            });
        }
    }, [bmModalOpen]);



    const handleAddNewValue = () => {
        const value =
            newValue.trim();

        if (!value) return;

        if (!options.includes(value)) {
            setOptions((previous) => [
                ...previous,
                value,
            ]);
        }

        setBMName(value);

        form.setFieldsValue({
            BMName: value,
            BMId: "",
        });

        setNewValue("");
        setBmModalOpen(false);
    };



    const handleDrawerClose = () => {
        if (saving) return;

        setConfirmOpen(false);
        setBmModalOpen(false);

        setNewValue("");
        setBMName("");

        form.resetFields();

        setPixels([
            {
                pixelName: "",
                pixelId: "",
            },
        ]);

        setPages([
            {
                pageName: "",
                pageId: "",
            },
        ]);

        onClose?.();
    };

    const formatPixels = () => {
        if (pixels.length === 1) {
            return (
                pixels[0]?.pixelId
                    ?.trim() || ""
            );
        }

        const formattedPixels = {};

        pixels.forEach((pixel) => {
            if (
                pixel.pixelName &&
                pixel.pixelId
            ) {
                formattedPixels[
                    pixel.pixelName.trim()
                ] =
                    pixel.pixelId.trim();
            }
        });

        return formattedPixels;
    };
    const formatPages = () => {
        if (pages.length === 1) {
            return {
                pageID:
                    pages[0]?.pageId
                        ?.trim() || "",

                pageName:
                    pages[0]?.pageName
                        ?.trim() || "",
            };
        }

        const formattedPages = {};

        pages.forEach((page) => {
            if (
                page.pageName &&
                page.pageId
            ) {
                formattedPages[
                    page.pageName.trim()
                ] =
                    page.pageId.trim();
            }
        });

        return {
            pageID: formattedPages,
            pageName: "",
        };
    };
    const handleSubmit = async () => {
        try {
            await form.validateFields();

            setConfirmOpen(true);
        } catch (error) {
            console.error(
                "Edit account validation error:",
                error
            );
        }
    };
    const handleConfirmUpdate =
        async () => {
            try {
                setSaving(true);

                const values =
                    await form.validateFields();

                const formattedPages =
                    formatPages();

                const newValues = {
                    ...account,
                    ...values,
                    accountNumber:
                        account?.accountNumber,

                    pixelID:
                        formatPixels(),

                    pageID:
                        formattedPages.pageID,

                    pageName:
                        formattedPages.pageName,

                    BMName:
                        BMName ||
                        values.BMName ||
                        "",

                    BMId:
                        values.BMId ||
                        account?.BMId ||
                        "",

                    timeZone:
                        TIMEZONE_FULL_NAMES[
                        values.timeZone
                        ] ||
                        values.timeZone ||
                        "",
                };

                console.log(
                    "========== UPDATE ACCOUNT =========="
                );

                console.log(
                    newValues
                );

                const response =
                    await fetch(
                        "/api/newuser/updateaccount",
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",
                            },

                            body: JSON.stringify({
                                newAccount: newValues,
                            }),
                        }
                    );

                if (!response.ok) {
                    let errorMessage =
                        "Failed to update account";

                    try {
                        const errorData =
                            await response.json();

                        errorMessage =
                            errorData?.message ||
                            errorMessage;
                    } catch {
                        // Ignore JSON parsing error
                    }

                    throw new Error(
                        errorMessage
                    );
                }

                setConfirmOpen(false);

                onUpdated?.(
                    newValues
                );

                handleDrawerClose();
            } catch (error) {
                console.error(
                    "Update account error:",
                    error
                );
            } finally {
                setSaving(false);
            }
        };
    const selectPopupClass =
        theme === "dark"
            ? "custom-dropdown"
            : "";
    return (
        <>
            <ReusableDrawer
                open={open}
                onClose={
                    handleDrawerClose
                }
                title="Edit Account"
                width={400}
                theme={theme}
            >
                <Form
                    form={form}
                    layout="vertical"
                    size="small"
                    style={{
                        width: "100%",
                    }}
                    className={
                        theme === "dark"
                            ? "form-dark"
                            : "form-light"
                    }
                >
                    {/* ==================================
                        SPEND PARTNER
                    ================================== */}

                    <Form.Item
                        label="Spend Partner"
                        name="spendPartner"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a Spend partner!",
                            },
                        ]}
                    >
                        <ReusableSelect
                            disabled
                            placeholder="Select a partner"
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                            options={[
                                {
                                    value: "Facebook",
                                    label: "Facebook",
                                },
                                {
                                    value: "Google",
                                    label: "Google",
                                },
                            ]}
                        />
                    </Form.Item>

                    {/* ==================================
                        SPEND ACCOUNT ID
                    ================================== */}

                    <Form.Item
                        label="Spend Account ID"
                        name="accountNumber"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please input the spend account ID!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        ACCOUNT NAME
                    ================================== */}

                    <Form.Item
                        label="Account Name"
                        name="accountName"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        PIXEL ID
                    ================================== */}

                    <Form.Item label="Pixel ID">
                        {pixels.map(
                            (
                                row,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        gap: 8,
                                        marginBottom:
                                            8,
                                        alignItems:
                                            "center",
                                    }}
                                >
                                    {pixels.length >
                                        1 && (
                                            <SearchInput
                                                placeholder="Pixel Name"
                                                value={
                                                    row.pixelName
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    handlePixelChange(
                                                        index,
                                                        "pixelName",
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                width="100%"
                                                height={27}
                                                theme={
                                                    theme
                                                }
                                            />
                                        )}

                                    <SearchInput
                                        placeholder="Pixel ID"
                                        value={
                                            row.pixelId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handlePixelChange(
                                                index,
                                                "pixelId",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        width="100%"
                                        theme={
                                            theme
                                        }
                                        height={27}
                                    />

                                    {pixels.length >
                                        1 && (
                                            <SubmitButton
                                                type="text"
                                                onClick={() =>
                                                    removePixelRow(
                                                        index
                                                    )
                                                }
                                                icon={
                                                    <FaTrashCan
                                                        color="#EC7117"
                                                    />
                                                }

                                                height={27}
                                            />
                                        )}

                                    {index ===
                                        pixels.length -
                                        1 && (
                                            <SubmitButton
                                                type="text"
                                                onClick={
                                                    addPixelRow
                                                }
                                                icon={
                                                    <PlusOutlined />
                                                }

                                                height={27}
                                            />
                                        )}
                                </div>
                            )
                        )}
                    </Form.Item>

                    {/* ==================================
                        PAGE
                    ================================== */}

                    {pages.length ===
                        1 ? (
                        <>
                            <Form.Item
                                label="Page ID"
                                required
                            >
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        gap: 8,
                                    }}
                                >
                                    <SearchInput
                                        placeholder="Page ID"
                                        value={
                                            pages[0]
                                                .pageId
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handlePageChange(
                                                0,
                                                "pageId",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }

                                        width="100%"
                                        height={27}
                                        theme={
                                            theme
                                        }
                                    />

                                    <SubmitButton
                                        type="text"
                                        onClick={
                                            addPage
                                        }
                                        icon={
                                            <PlusOutlined />
                                        }

                                        height={27}
                                    />
                                </div>
                            </Form.Item>

                            <Form.Item
                                label="Page Name"
                                required
                            >
                                <SearchInput
                                    placeholder="Page Name"
                                    value={
                                        pages[0]
                                            .pageName
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        handlePageChange(
                                            0,
                                            "pageName",
                                            e
                                                .target
                                                .value
                                        )
                                    }
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item label="Page ID">
                            {pages.map(
                                (
                                    page,
                                    index
                                ) => (
                                    <div
                                        key={
                                            index
                                        }
                                        style={{
                                            display:
                                                "flex",
                                            gap: 8,
                                            marginBottom:
                                                8,
                                            alignItems:
                                                "center",
                                        }}
                                    >
                                        <SearchInput
                                            placeholder="Page Name"
                                            value={
                                                page.pageName
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                handlePageChange(
                                                    index,
                                                    "pageName",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            width="100%"
                                            height={27}
                                            theme={
                                                theme
                                            }
                                        />

                                        <SearchInput
                                            placeholder="Page ID"
                                            value={
                                                page.pageId
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                handlePageChange(
                                                    index,
                                                    "pageId",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            width="100%"
                                            height={27}
                                            theme={
                                                theme
                                            }
                                        />

                                        <SubmitButton
                                            type="text"
                                            onClick={() =>
                                                removePage(
                                                    index
                                                )
                                            }
                                            icon={
                                                <FaTrashCan
                                                    color="#EC7117"
                                                />
                                            }

                                            height={27}
                                        />

                                        {index ===
                                            pages.length -
                                            1 && (
                                                <SubmitButton
                                                    type="text"
                                                    onClick={
                                                        addPage
                                                    }
                                                    icon={
                                                        <PlusOutlined />
                                                    }

                                                    height={27}
                                                />
                                            )}
                                    </div>
                                )
                            )}
                        </Form.Item>
                    )}

                    {/* ==================================
                        AGENCY NAME
                    ================================== */}

                    <Form.Item
                        label="Agency Name"
                        name="AgencyName"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        BM NAME
                    ================================== */}

                    <Form.Item
                        label="BM Name"
                        name="BMName"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a BM Name!",
                            },
                        ]}
                    >
                        <div
                            ref={containerRef}
                            style={{
                                display: "flex",
                                gap: 5,
                            }}
                        >
                            <ReusableSelect
                                showSearch
                                value={BMName}
                                placeholder="Select or add a value"
                                options={options.map(
                                    (
                                        item
                                    ) => ({
                                        value: item,
                                        label: item,
                                    })
                                )}
                                onChange={(
                                    value
                                ) => {
                                    setBMName(
                                        value
                                    );

                                    form.setFieldsValue(
                                        {
                                            BMName:
                                                value,

                                            BMId:
                                                newOptions.includes(
                                                    value
                                                )
                                                    ? undefined
                                                    : "",
                                        }
                                    );
                                }}
                                theme={
                                    theme
                                }
                                width="100%"
                                height={27}
                                size="small"
                                popupClassName={
                                    selectPopupClass
                                }
                            />

                            <SubmitButton
                                type="text"
                                onClick={() =>
                                    setBmModalOpen(
                                        true
                                    )
                                }
                                height={27}
                                icon={<PlusOutlined />}
                            >

                            </SubmitButton>
                        </div>
                    </Form.Item>

                    {/* ==================================
                        ADD NEW BM
                    ================================== */}

                    <ReusableModal
                        open={
                            bmModalOpen
                        }
                        title={
                            <span
                                style={{
                                    color: theme === "dark" ? "#fff" : "#333",
                                }}
                            >
                                Add New Value
                            </span>
                        }
                        onCancel={() => {
                            setBmModalOpen(
                                false
                            );
                            setNewValue("");
                        }}
                        theme={theme}
                        onOk={
                            handleAddNewValue
                        }
                    >
                        <SearchInput
                            placeholder="Enter new value"
                            value={
                                newValue
                            }
                            onChange={(
                                e
                            ) =>
                                setNewValue(
                                    e
                                        .target
                                        .value
                                )
                            }
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </ReusableModal>

                    {/* ==================================
                        BM ID
                    ================================== */}

                    {!newOptions.includes(
                        BMName
                    ) && (
                            <Form.Item
                                label="BM ID"
                                name="BMId"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please input the BM ID!",
                                    },
                                ]}
                            >
                                <SearchInput
                                    autoComplete="off"
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />
                            </Form.Item>
                        )}

                    {/* ==================================
                        TIME ZONE
                    ================================== */}

                    <Form.Item
                        label="Time Zone"
                        name="timeZone"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a Time Zone!",
                            },
                        ]}
                    >
                        <ReusableSelect
                            showSearch
                            placeholder="Select Timezone"
                            options={TIMEZONES.map(
                                (
                                    item
                                ) => ({
                                    value: item,
                                    label: item,
                                })
                            )}
                            popupClassName={
                                selectPopupClass
                            }
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                        />
                    </Form.Item>

                    {/* ==================================
                        STATUS
                    ================================== */}

                    <Form.Item
                        label="Status"
                        name="status"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a Status!",
                            },
                        ]}
                    >
                        <ReusableSelect
                            placeholder="Select a status"
                            options={[
                                {
                                    value: "Active",
                                    label: "Active",
                                },
                                {
                                    value: "InActive",
                                    label: "InActive",
                                },
                            ]}
                            popupClassName={
                                selectPopupClass
                            }
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                        />
                    </Form.Item>

                    {/* ==================================
                        REVENUE PARTNER
                    ================================== */}

                    <Form.Item
                        label="Revenue Partner"
                        name="revenuePartner"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please select a Revenue Partner!",
                            },
                        ]}
                    >
                        <ReusableSelect
                            showSearch
                            placeholder="Select Revenue Partner"
                            options={
                                (
                                    uniquePartners.length
                                        ? uniquePartners
                                        : availableNetworks
                                ).map(
                                    (
                                        item
                                    ) => ({
                                        value: item,
                                        label: item,
                                    })
                                )
                            }
                            popupClassName={
                                selectPopupClass
                            }
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                        />
                    </Form.Item>

                    {/* ==================================
                        BENEFICIARY
                    ================================== */}

                    <Form.Item
                        label="Beneficiary"
                        name="Beneficiary"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        PAYER
                    ================================== */}

                    <Form.Item
                        label="Payer"
                        name="Payer"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        MEDIA BUYER
                    ================================== */}

                    <Form.Item
                        label="Media Buyer"
                        name="MediaBuyerName"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        HOLDER
                    ================================== */}

                    <Form.Item
                        label="Holder"
                        name="Holder"
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                        />
                    </Form.Item>

                    {/* ==================================
                        SUBMIT
                    ================================== */}

                    <Form.Item>
                        <SubmitButton
                            width={80}
                            height={27}
                            onClick={
                                handleSubmit
                            }
                            text="Submit"
                            loading={
                                saving
                            }
                        />
                    </Form.Item>
                </Form>
            </ReusableDrawer>

            {/* ==========================================
                UPDATE CONFIRMATION
            ========================================== */}

            <ReusableModal
                open={confirmOpen}
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        Confirm Update
                    </span>
                }
                onCancel={() =>
                    setConfirmOpen(
                        false
                    )
                }
                onOk={
                    handleConfirmUpdate
                }
                theme={theme}
                confirmLoading={
                    saving
                }
            >
                <p>
                    Are you sure you want
                    to update this account?
                </p>
            </ReusableModal>
        </>
    );
};

export default EditAccount;