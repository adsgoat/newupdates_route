"use client";

import { useEffect, useMemo, useState } from "react";
import { Form, message } from "antd";
import {
    PlusOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import axios from "axios";

import ReusableDrawer from "@/components/newuser/drawer";
import ReusableModal from "@/components/newuser/modal";
import SearchInput from "@/components/common/searchinput";
import ReusableSelect from "@/components/newuser/select";
import SubmitButton from "@/components/common/submitbutton";
import {
    TIMEZONES,
    TIMEZONE_FULL_NAMES,
} from "@/modules/newuser/constants/timezone";

export default function AddAccount({
    visible,
    onClose,
    AccountsData = [],
    theme,
    getaccounts
}) {
    const [form] = Form.useForm();
    const [submitLoading, setSubmitLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] =
        useState(false);
    const [bmModalOpen, setBmModalOpen] =
        useState(false);
    const [newBMName, setNewBMName] =
        useState("");
    const [timeZone, setTimeZone] =
        useState("UTC");
    const [status, setStatus] =
        useState("Active");
    const [spendPartner, setSpendPartner] =
        useState("Facebook");

    const [revenuePartner, setRevenuePartner] =
        useState("");

    const [bmName, setBMName] =
        useState("");

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

    const bmOptions = useMemo(() => {
        return [
            ...new Set(
                (AccountsData || [])
                    .map((item) => item?.BMName)
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
    }, [AccountsData]);

    const revenuePartnerOptions =
        useMemo(() => {
            return [
                ...new Set(
                    (AccountsData || [])
                        .map(
                            (item) =>
                                item?.revenuePartner
                        )
                        .filter(
                            (value) =>
                                value &&
                                String(
                                    value
                                ).trim() !== ""
                        )
                ),
            ].sort((a, b) =>
                String(a).localeCompare(
                    String(b)
                )
            );
        }, [AccountsData]);


    useEffect(() => {
        if (!visible) return;

        const firstBM =
            bmOptions[0] || "";

        const firstRevenue =
            revenuePartnerOptions[0] || "";

        setBMName(firstBM);
        setRevenuePartner(firstRevenue);
        setSpendPartner("Facebook");
        setStatus("Active");
        setTimeZone("UTC");

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

        form.resetFields();

        form.setFieldsValue({
            spendPartner: "Facebook",
            status: "Active",
            timeZone: "UTC",
            BMName: firstBM,
            revenuePartner: firstRevenue,
        });
    }, [
        visible,
        bmOptions,
        revenuePartnerOptions,
        form,
    ]);



    const inputStyle = {
        backgroundColor:
            theme === "dark"
                ? "#555"
                : "#fff",

        color:
            theme === "dark"
                ? "#fff"
                : "#000",

        border:
            "1px solid #91C25F",

        borderRadius: "8px",
    };

    const validateAccountBeforeSubmit =
        async () => {
            const accountNumber =
                form.getFieldValue(
                    "accountNumber"
                );

            const acc =
                accountNumber
                    ?.trim();

            if (!acc) {
                message.error(
                    "Account Number cannot be empty"
                );

                return false;
            }

            /*
             * Check current accounts
             */

            const localMatch =
                AccountsData?.find(
                    (item) =>
                        String(
                            item.accountNumber
                        ).trim() === acc
                );

            if (localMatch) {
                message.error(
                    `Account ${acc} already exists. Please check.`
                );

                return false;
            }

            /*
             * Check API
             */

            try {

                const response = await fetch(
                    "/api/newuser/accountsdata",
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const apiList =
                    response.data || [];

                const apiMatch =
                    apiList.find(
                        (item) =>
                            String(
                                item.accountNumber
                            ).trim() === acc
                    );

                if (apiMatch) {
                    message.error(
                        `Account ${acc} already exists but you don't have access. Please check.`
                    );

                    return false;
                }

                return true;
            } catch (error) {
                console.error(
                    "Account validation error:",
                    error
                );

                message.error(
                    "Error validating account. Please try again."
                );

                return false;
            }
        };
    const handlePixelChange = (
        index,
        field,
        value
    ) => {
        setPixels((previous) => {
            const updated = [
                ...previous,
            ];

            updated[index] = {
                ...updated[index],
                [field]: value,
            };

            return updated;
        });
    };

    const addPixelRow = () => {
        setPixels((previous) => [
            ...previous,
            {
                pixelName: "",
                pixelId: "",
            },
        ]);
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
            const updated = [
                ...previous,
            ];

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

    const handleAddBM = () => {
        const value =
            newBMName.trim();

        if (!value) {
            return;
        }

        setBMName(value);

        form.setFieldValue(
            "BMName",
            value
        );

        setNewBMName("");
        setBmModalOpen(false);
    };
    const handleSubmitClick =
        async () => {
            try {
                await form.validateFields();
            } catch {
                message.error(
                    "Please fill all required fields"
                );

                return;
            }

            const isValid =
                await validateAccountBeforeSubmit();

            if (!isValid) {
                return;
            }

            setConfirmOpen(true);
        };
    const handleSubmit =
        async () => {
            try {
                setSubmitLoading(true);
                const values =
                    await form.validateFields();

                const trimmedValues =
                    Object.fromEntries(
                        Object.entries(
                            values
                        ).map(
                            ([
                                key,
                                value,
                            ]) => [
                                    key,
                                    typeof value ===
                                        "string"
                                        ? value.trim()
                                        : value,
                                ]
                        )
                    );

                /*
                 * PIXELS
                 */

                let formattedPixels;

                if (
                    pixels.length === 1
                ) {
                    formattedPixels =
                        pixels[0].pixelId.trim();
                } else {
                    formattedPixels = {};

                    pixels.forEach(
                        (pixel) => {
                            if (
                                pixel.pixelName &&
                                pixel.pixelId
                            ) {
                                formattedPixels[
                                    pixel.pixelName.trim()
                                ] =
                                    pixel.pixelId.trim();
                            }
                        }
                    );
                }

                /*
                 * PAGES
                 */

                let formattedPages;
                let formattedPageName;

                if (
                    pages.length === 1
                ) {
                    formattedPages =
                        pages[0].pageId.trim();

                    formattedPageName =
                        pages[0].pageName.trim();
                } else {
                    formattedPages = {};

                    pages.forEach(
                        (page) => {
                            if (
                                page.pageName &&
                                page.pageId
                            ) {
                                formattedPages[
                                    page.pageName.trim()
                                ] =
                                    page.pageId.trim();
                            }
                        }
                    );
                }

                const newAccount = {
                    ...trimmedValues,

                    pixelID:
                        formattedPixels,

                    pageID:
                        formattedPages,

                    pageName:
                        formattedPageName,

                    timeZone:
                        TIMEZONE_FULL_NAMES[
                        values.timeZone
                        ],

                    pixelId:
                        undefined,
                };


                const response = await axios.post(
                    "/api/newuser/addaccount",
                    {
                        newAccount,
                    }
                );

                if (response.status === 200) {
                    message.success(
                        "Account created successfully"
                    );

                    resetForm();
                    setConfirmOpen(false);
                    getaccounts();
                    onClose("AccountNumber");
                } else {
                    message.error(
                        "Failed to create account"
                    );
                }
            } catch (error) {
                console.error(
                    "Error creating account:",
                    error
                );

                message.error(
                    "Failed to create account"
                );
            } finally {
                setSubmitLoading(false);
            }
        };

    const resetForm = () => {
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

        setBMName(
            bmOptions[0] || ""
        );

        setRevenuePartner(
            revenuePartnerOptions[0] ||
            ""
        );

        setSpendPartner("Facebook");
        setStatus("Active");
        setTimeZone("UTC");
        setNewBMName("");
    };
    return (
        <>
            <ReusableDrawer
                open={visible}
                onClose={() => {
                    resetForm();
                    onClose();
                }}
                title="Add New Account"
                theme={theme}
                width={400}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className={
                        theme === "dark"
                            ? "form-dark"
                            : "form-light"
                    }
                >
                    {/* SPEND PARTNER */}
                    <Form.Item
                        label="Spend Partner"
                        name="spendPartner"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please select Spend Partner",
                            },
                        ]}
                    >
                        <ReusableSelect
                            value={
                                spendPartner
                            }
                            onChange={(
                                value
                            ) => {
                                setSpendPartner(
                                    value
                                );

                                form.setFieldValue(
                                    "spendPartner",
                                    value
                                );
                            }}
                            options={[
                                "Facebook",
                                "Google",
                            ]}
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                            placeholder="Select Spend Partner"
                        />
                    </Form.Item>

                    {/* ACCOUNT ID */}

                    <Form.Item
                        label="Spend Account ID"
                        name="accountNumber"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please input the Spend Account ID!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                            style={
                                inputStyle
                            }
                            allowClear
                        />
                    </Form.Item>

                    {/* ACCOUNT NAME */}

                    <Form.Item
                        label="Spend Account Name"
                        name="accountName"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please input the Spend Account Name!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                            style={
                                inputStyle
                            }
                            allowClear
                        />
                    </Form.Item>

                    {/* PIXEL */}

                    <Form.Item
                        label="Pixel ID"
                        required
                    >
                        {pixels.map(
                            (
                                pixel,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        gap: 6,
                                        marginBottom:
                                            6,
                                    }}
                                >
                                    {pixels.length >
                                        1 && (
                                            <SearchInput
                                                width="100%"
                                                height={
                                                    27
                                                }
                                                placeholder="Pixel Name"
                                                value={
                                                    pixel.pixelName
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
                                                theme={
                                                    theme
                                                }
                                                style={
                                                    inputStyle
                                                }
                                            />
                                        )}

                                    <SearchInput
                                        width="100%"
                                        height={
                                            27
                                        }
                                        placeholder="Pixel ID"
                                        value={
                                            pixel.pixelId
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
                                        theme={
                                            theme
                                        }
                                        style={
                                            inputStyle
                                        }
                                    />

                                    {pixels.length >
                                        1 && (
                                            <SubmitButton
                                                type="text"
                                                icon={
                                                    <DeleteOutlined />
                                                }
                                                onClick={() =>
                                                    removePixelRow(
                                                        index
                                                    )
                                                }
                                                height={27}
                                            />
                                        )}

                                    {index ===
                                        pixels.length -
                                        1 && (
                                            <SubmitButton
                                                type="text"
                                                icon={
                                                    <PlusOutlined />
                                                }
                                                onClick={
                                                    addPixelRow
                                                }
                                                height={27}
                                            />
                                        )}
                                </div>
                            )
                        )}
                    </Form.Item>

                    {/* PAGE */}

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
                                        gap: 6,
                                    }}
                                >
                                    <SearchInput
                                        width="100%"
                                        height={
                                            27
                                        }
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
                                        theme={
                                            theme
                                        }
                                        style={
                                            inputStyle
                                        }
                                    />

                                    <SubmitButton
                                        type="text"
                                        icon={
                                            <PlusOutlined />
                                        }
                                        onClick={
                                            addPage
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
                                    width="100%"
                                    height={
                                        27
                                    }
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
                                    theme={
                                        theme
                                    }
                                    style={
                                        inputStyle
                                    }
                                />
                            </Form.Item>
                        </>
                    ) : (
                        <Form.Item label="Page IDs">
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
                                            gap: 6,
                                            marginBottom:
                                                6,
                                        }}
                                    >
                                        <SearchInput
                                            width="100%"
                                            height={
                                                27
                                            }
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
                                            theme={
                                                theme
                                            }
                                            style={
                                                inputStyle
                                            }
                                        />

                                        <SearchInput
                                            width="100%"
                                            height={
                                                27
                                            }
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
                                            theme={
                                                theme
                                            }
                                            style={
                                                inputStyle
                                            }
                                        />

                                        <SubmitButton
                                            type="text"
                                            icon={
                                                <DeleteOutlined />
                                            }
                                            onClick={() =>
                                                removePage(
                                                    index
                                                )
                                            }
                                            height={27}
                                        />

                                        {index ===
                                            pages.length -
                                            1 && (
                                                <SubmitButton
                                                    type="text"
                                                    icon={
                                                        <PlusOutlined />
                                                    }
                                                    onClick={
                                                        addPage
                                                    }
                                                    height={27}
                                                />
                                            )}
                                    </div>
                                )
                            )}
                        </Form.Item>
                    )}

                    {/* AGENCY */}

                    <Form.Item
                        label="Agency Name"
                        name="AgencyName"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please input the Agency Name!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                            style={
                                inputStyle
                            }
                        />
                    </Form.Item>

                    {/* BM NAME */}

                    <Form.Item
                        label="BM Name"
                        name="BMName"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please select BM Name!",
                            },
                        ]}
                    >
                        <div
                            style={{
                                display:
                                    "flex",
                                gap: 6,
                            }}
                        >
                            <ReusableSelect
                                value={
                                    bmName
                                }
                                onChange={(
                                    value
                                ) => {
                                    setBMName(
                                        value
                                    );

                                    form.setFieldValue(
                                        "BMName",
                                        value
                                    );
                                }}
                                options={
                                    bmOptions
                                }
                                theme={
                                    theme
                                }
                                width="100%"
                                height={27}
                                size="small"
                                placeholder="Select BM Name"
                            />

                            <SubmitButton
                                type="primary"
                                icon={
                                    <PlusOutlined />
                                }
                                onClick={() =>
                                    setBmModalOpen(
                                        true
                                    )
                                }
                                height={27}
                            />
                        </div>
                    </Form.Item>

                    {/* BM ID */}

                    {!bmOptions.includes(
                        bmName
                    ) && (
                            <Form.Item
                                label="BM ID"
                                name="BMId"
                                rules={[
                                    {
                                        required:
                                            true,
                                        message:
                                            "Please input the BM ID!",
                                    },
                                ]}
                            >
                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                    style={
                                        inputStyle
                                    }
                                />
                            </Form.Item>
                        )}

                    {/* TIMEZONE */}

                    <Form.Item
                        label="Time Zone"
                        name="timeZone"
                    >
                        <ReusableSelect
                            value={
                                timeZone
                            }
                            onChange={(
                                value
                            ) => {
                                setTimeZone(
                                    value
                                );

                                form.setFieldValue(
                                    "timeZone",
                                    value
                                );
                            }}
                            options={
                                TIMEZONES
                            }
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                            placeholder="Select Time Zone"
                        />
                    </Form.Item>

                    {/* STATUS */}

                    <Form.Item
                        label="Status"
                        name="status"
                    >
                        <ReusableSelect
                            value={
                                status
                            }
                            onChange={(
                                value
                            ) => {
                                setStatus(
                                    value
                                );

                                form.setFieldValue(
                                    "status",
                                    value
                                );
                            }}
                            options={[
                                "Active",
                                "InActive",
                            ]}
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                            placeholder="Select Status"
                        />
                    </Form.Item>

                    {/* REVENUE PARTNER */}

                    <Form.Item
                        label="Revenue Partner"
                        name="revenuePartner"
                    >
                        <ReusableSelect
                            value={
                                revenuePartner
                            }
                            onChange={(
                                value
                            ) => {
                                setRevenuePartner(
                                    value
                                );

                                form.setFieldValue(
                                    "revenuePartner",
                                    value
                                );
                            }}
                            options={
                                revenuePartnerOptions
                            }
                            theme={
                                theme
                            }
                            width="100%"
                            height={27}
                            size="small"
                            placeholder="Select Revenue Partner"
                        />
                    </Form.Item>

                    {/* BENEFICIARY */}

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
                            style={
                                inputStyle
                            }
                        />
                    </Form.Item>

                    {/* PAYER */}

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
                            style={
                                inputStyle
                            }
                        />
                    </Form.Item>

                    {/* MEDIA BUYER */}

                    <Form.Item
                        label="Media Buyer Name"
                        name="MediaBuyerName"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please input the Media Buyer Name!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                            style={
                                inputStyle
                            }
                        />
                    </Form.Item>

                    {/* HOLDER */}

                    <Form.Item
                        label="Holder"
                        name="Holder"
                        rules={[
                            {
                                required:
                                    true,
                                message:
                                    "Please input the Holder Name!",
                            },
                        ]}
                    >
                        <SearchInput
                            width="100%"
                            height={27}
                            theme={
                                theme
                            }
                            style={
                                inputStyle
                            }
                        />
                    </Form.Item>

                    {/* SUBMIT */}

                    <Form.Item>
                        <SubmitButton

                            onClick={
                                handleSubmitClick
                            }
                            width={80}
                            height={27}
                            text="Submit"

                        >

                        </SubmitButton>
                    </Form.Item>
                </Form>
            </ReusableDrawer>

            {/* ADD BM MODAL */}

            <ReusableModal
                open={bmModalOpen}
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        Add New BM Name
                    </span>
                }
                onCancel={() =>
                    setBmModalOpen(
                        false
                    )
                }
                onOk={
                    handleAddBM
                }
                theme={theme}
                okText="Add"
                cancelText="Cancel"
            >
                <SearchInput
                    value={
                        newBMName
                    }
                    onChange={(e) =>
                        setNewBMName(
                            e.target.value
                        )
                    }
                    placeholder="Enter BM Name"
                    width="100%"
                    height={27}
                    theme={
                        theme
                    }
                    style={
                        inputStyle
                    }
                />
            </ReusableModal>

            {/* CONFIRMATION */}

            <ReusableModal
                open={confirmOpen}
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        Confirmation
                    </span>
                }
                theme={theme}
                onCancel={() =>
                    setConfirmOpen(
                        false
                    )
                }
                onOk={
                    handleSubmit
                }
                okText="Yes"
                cancelText="No"
                confirmLoading={submitLoading}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 13,
                    }}
                >
                    Are you sure you want
                    to submit?
                </p>
            </ReusableModal>
        </>
    );
}