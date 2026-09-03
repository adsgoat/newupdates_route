"use client";

import { useState, useEffect } from "react";
import { Form, message } from "antd";
import axios from "axios";

// Change these paths if required
import ReusableDrawer from "../../../components/newuser/drawer";
import ReusableModal from "../../../components/newuser/modal";

import {
    TIMEZONES,
    TIMEZONE_FULL_NAMES,
    TIMEZONE_SHORT_NAMES
} from "@/modules/newuser/constants/timezone";
import SearchInput from "@/components/common/searchinput";
import SubmitButton from "@/components/common/submitbutton";
import ReusableSelect from "@/components/newuser/select";


const availableNetworks = [
    "MEDIA_DOT_NET",
    "MEDIA_DOT_NET_BING",
    "ENKI",
    "TONIC",
    "System1",
    "Bodies",
    "Bodies1",
    "Rsoc",
    "Domain Active",
];


const EditNetworkAccess = ({
    editeddata,
    visible,
    onClose,
    theme,
    fetchNetworksData
}) => {

    const [form] = Form.useForm();

    const [isModalVisible, setIsModalVisible] =
        useState(false);

    const [passwordVisible, setPasswordVisible] =
        useState(false);

    useEffect(() => {

        if (visible && editeddata) {

            form.setFieldsValue({
                ...editeddata,

                timeZone:
                    TIMEZONE_SHORT_NAMES[
                    editeddata.timeZone
                    ] || editeddata.timeZone,
            });
        }

    }, [visible, editeddata, form]);

    const onFinish = async (values) => {
        try {
            const newValues = {
                ...editeddata,
                ...values,

                timeZone:
                    TIMEZONE_FULL_NAMES[
                    values.timeZone
                    ] || values.timeZone,
            };

            console.log(
                "Updating Network:",
                newValues
            );

            const response = await axios.put(
                "/api/newuser/updatenetwork",
                {
                    updatedNetwork: newValues,
                }
            );

            if (response.status === 200) {
                message.success(
                    "Network updated successfully"
                );

                form.resetFields();

                setIsModalVisible(false);

                onClose(newValues);
                fetchNetworksData();
            }
        } catch (error) {
            console.error(
                "Error updating network:",
                error.response?.data || error.message
            );

            message.error(
                error.response?.data?.message ||
                "Failed to update Network"
            );
        }
    };
    const handleCancel = () => {

        setIsModalVisible(false);

    };

    const showModal = () => {

        setIsModalVisible(true);

    };
    const isFieldVsible = (fieldValue) => {

        return (
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== ""
        );
    };

    const togglePasswordVisibility = () => {

        setPasswordVisible(
            !passwordVisible
        );

    };

    return (
        <>
            <ReusableDrawer
                open={visible}
                title="Edit Network"
                onClose={() => {
                    form.resetFields();
                    onClose();
                }}
                width={400}
                theme={theme}
            >

                <Form
                    form={form}
                    onFinish={onFinish}
                    layout="vertical"
                    style={{
                        width: "80%",
                    }}
                    className={
                        theme === "dark"
                            ? "form-dark"
                            : "form-light"
                    }
                >
                    {isFieldVsible(
                        editeddata?.Message
                    ) && (

                            <Form.Item
                                label="Message"
                                name="Message"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.cronStatus
                    ) && (

                            <Form.Item
                                label="CronStatus"
                                name="cronStatus"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.timeZone
                    ) && (

                            <Form.Item
                                label="Timezone"
                                name="timeZone"
                            >

                                <ReusableSelect
                                    showSearch
                                    placeholder={
                                        <span
                                            style={{
                                                color: theme === "dark" ? "#fff" : "#333",
                                            }}
                                        >
                                            Select TimeZones
                                        </span>
                                    }
                                    options={TIMEZONES.map(
                                        (timezone) => ({
                                            value: timezone,
                                            label: timezone,
                                        })
                                    )}
                                    theme={
                                        theme
                                    }
                                    width="100%"
                                    height={27}
                                    size="small"
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.Email
                    ) && (

                            <Form.Item
                                label="Email"
                                name="Email"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.Password
                    ) && (

                            <Form.Item
                                label="Password"
                                name="Password"
                            >

                                <SearchInput
                                    type="password"
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }

                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.key
                    ) && (

                            <Form.Item
                                label="Key"
                                name="key"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}
                    {isFieldVsible(
                        editeddata?.Token
                    ) && (

                            <Form.Item
                                label="Token"
                                name="Token"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}


                    {isFieldVsible(
                        editeddata?.consumer_key
                    ) && (

                            <Form.Item
                                label="ConsumerKey"
                                name="consumer_key"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}


                    {isFieldVsible(
                        editeddata?.consumer_secret
                    ) && (

                            <Form.Item
                                label="ConsumerSecret"
                                name="consumer_secret"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.client_id
                    ) && (

                            <Form.Item
                                label="ClientID"
                                name="client_id"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}
                    {isFieldVsible(
                        editeddata?.Secret
                    ) && (

                            <Form.Item
                                label="Secret"
                                name="Secret"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.Service
                    ) && (

                            <Form.Item
                                label="Service"
                                name="Service"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}


                    {isFieldVsible(
                        editeddata?.Market
                    ) && (

                            <Form.Item
                                label="Market"
                                name="Market"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }

                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.config_id
                    ) && (

                            <Form.Item
                                label="ConfigID"
                                name="config_id"
                            >

                                <SearchInput
                                    width="100%"
                                    height={27}
                                    theme={
                                        theme
                                    }
                                />

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.Status
                    ) && (

                            <Form.Item
                                label="Status"
                                name="Status"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please select a Status!",
                                    },
                                ]}
                            >

                                <ReusableSelect
                                    placeholder={
                                        <span
                                            style={{
                                                color: theme === "dark" ? "#fff" : "#333",
                                            }}
                                        >
                                            Select a Status
                                        </span>
                                    }
                                    theme={
                                        theme
                                    }
                                    width="100%"
                                    height={27}
                                    size="small"
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
                                >

                                </ReusableSelect>

                            </Form.Item>
                        )}

                    {isFieldVsible(
                        editeddata?.revenuePartner
                    ) && (

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
                                    theme={
                                        theme
                                    }
                                    width="100%"
                                    height={27}
                                    size="small"
                                    placeholder={
                                        <span
                                            style={{
                                                color: theme === "dark" ? "#fff" : "#333",
                                            }}
                                        >
                                            Select a RevenuePartner
                                        </span>
                                    }
                                    options={availableNetworks.map(
                                        (item) => ({
                                            value: item,
                                            label: item,
                                        })
                                    )}

                                />

                            </Form.Item>
                        )}

                    <Form.Item>

                        <SubmitButton
                            text="Submit"
                            onClick={showModal}
                            width={80}
                            height={27}
                        >

                        </SubmitButton>

                    </Form.Item>

                </Form>

            </ReusableDrawer>


            <ReusableModal
                open={isModalVisible}
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        Confirmation
                    </span>
                }
                onOk={() => {
                    form.submit();
                }}
                onCancel={handleCancel}
                okText="Yes"
                cancelText="No"
                theme={theme}
            >

                <p>
                    Are you sure you want to submit?
                </p>

            </ReusableModal>

        </>
    );
};


export default EditNetworkAccess;