import React, { useState, useEffect } from 'react';
import { Form } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import ReusableDrawer from '@/components/newuser/drawer';
import SearchInput from '@/components/common/searchinput';
import SubmitButton from '@/components/common/submitbutton';
import ReusableModal from '@/components/newuser/modal';
import ReusableSelect from '@/components/newuser/select';

import "../../../styles/newuser.css"


const EditUrlBuilder = ({ editeddata, visible, onClose, theme }) => {
    const [form] = Form.useForm();

    const [channelList, setChannelList] = useState([]);
    const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
    const [selectedChannelIndex, setSelectedChannelIndex] = useState(null);
    const [objects, setObjects] = useState([]);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    const [dataList, setDataList] = useState([]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [campaigns, setCampaigns] = useState([]);

    // State for modal visibility and delete index
    const [modalVisible, setModalVisible] = useState(false);
    const [activeIndex, setActiveIndex] = useState(null);

    const generateNextChannelId = () => {
        const maxId = channelList.reduce((max, channel) => Math.max(max, channel.id), 0);
        return maxId + 1;
    };


    const updateChannelField = (index, key, value) => {
        setChannelList((prevChannels) =>
            prevChannels.map((channel, i) => (i === index ? { ...channel, [key]: value } : channel))
        );
    };

    const addNewChannel = () => {
        const newChannel = {
            id: generateNextChannelId(),
            name: "",
            source: "",
            value: "",
        };
        setChannelList([...channelList, newChannel]);
    };

    // Open the delete confirmation modal
    const openChannelDeleteModal = (index) => {
        setSelectedChannelIndex(index);
        setIsChannelModalOpen(true);
    };

    // Confirm deletion of a channel
    const confirmChannelDeletion = () => {
        setChannelList((prevChannels) => prevChannels.filter((_, i) => i !== selectedChannelIndex));
        setIsChannelModalOpen(false);
        setSelectedChannelIndex(null);
    };

    // Cancel deletion of a channel
    const cancelChannelDeletion = () => {
        setIsChannelModalOpen(false);
        setSelectedChannelIndex(null);
    };

    const getNextCampaignId = () => {
        const highestId = campaigns.reduce((maxId, campaign) => Math.max(maxId, campaign.id), 0);
        return highestId + 1;
    };

    // Function to handle input updates
    const updateField = (index, field, value) => {
        setCampaigns((prevCampaigns) =>
            prevCampaigns.map((campaign, i) =>
                i === index ? { ...campaign, [field]: value } : campaign
            )
        );
    };

    // Function to add a new campaign row
    const addNewCampaign = () => {
        const newCampaign = {
            id: getNextCampaignId(),
            name: "",
            code: "",
            campaignId: "",
            AdsetId: "",
        };
        setCampaigns([...campaigns, newCampaign]);
    };

    // Function to show the delete confirmation modal
    const showDeleteModal = (index) => {
        setActiveIndex(index);
        setModalVisible(true);
    };

    // Function to confirm deletion
    const deleteCampaign = () => {
        setCampaigns((prevCampaigns) => prevCampaigns.filter((_, i) => i !== activeIndex));
        setModalVisible(false);
        setActiveIndex(null);
    };

    // Function to cancel deletion
    const cancelDelete1 = () => {
        setModalVisible(false);
        setActiveIndex(null);
    };

    // Get the next available ID
    const getNextId = () => {
        const highestId = objects.reduce((maxId, obj) => Math.max(maxId, obj.id), 0);
        return highestId + 1;
    };

    // Handle input changes for existing objects
    const handleInputChange = (index, key, value) => {
        setObjects((prevObjects) =>
            prevObjects.map((obj, i) => (i === index ? { ...obj, [key]: value } : obj))
        );
    };

    // Handle adding a new object
    const handleAddObject = () => {
        const newObject = {
            id: getNextId(), // Automatically assign the next ID
            name: "",
            code: "",
            account: "",
            url: "",
        };
        setObjects([...objects, newObject]);
    };

    // Handle showing delete modal
    const handleDeleteClick = (index) => {
        setDeleteIndex(index); // Set the index of the object to delete
        setIsModalVisible(true); // Show the modal
    };

    // Handle confirming delete
    const handleConfirmDelete = () => {
        setObjects((prevObjects) => prevObjects.filter((_, i) => i !== deleteIndex)); // Remove object
        setIsModalVisible(false); // Close modal
        setDeleteIndex(null); // Reset index
    };

    // Handle cancel delete
    const handleCancelDelete = () => {
        setIsModalVisible(false); // Close modal
        setDeleteIndex(null); // Reset index
    };

    const generateNextId = () => {
        const highestId = dataList.reduce((maxId, item) => Math.max(maxId, item.id), 0);
        return highestId + 1;
    };

    // Function to handle input changes
    const updateInputValue = (index, key, value) => {
        setDataList((prevData) =>
            prevData.map((item, i) => (i === index ? { ...item, [key]: value } : item))
        );
    };

    // Function to add a new row
    const addNewRow = () => {
        const newRow = {
            id: generateNextId(),
            name: "",
            code: "",
            account: "",
            url: "",
        };
        setDataList([...dataList, newRow]);
    };

    // Function to open the delete modal
    const openDeleteModal = (index) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };

    // Function to confirm delete
    const confirmDelete = () => {
        setDataList((prevData) => prevData.filter((_, i) => i !== selectedIndex));
        setIsModalOpen(false);
        setSelectedIndex(null);
    };

    // Function to cancel delete
    const cancelDelete = () => {
        setIsModalOpen(false);
        setSelectedIndex(null);
    };

    useEffect(() => {
        if (visible) {
            setObjects([]);
            setDataList([]);
            setCampaigns([]);
            setChannelList([]);
        }
    }, [visible]);

    useEffect(() => {
        // console.log(editeddata?.businessData, "editeddata?.businessData"); // Logs the incoming data
        if (editeddata?.businessData) {
            setObjects(editeddata.businessData); // Update the state
        }
        if (editeddata?.Domains) {
            setDataList(editeddata?.Domains);
        }
        if (editeddata?.Source) {
            setCampaigns(editeddata?.Source);
        }
        if (editeddata?.channels) {
            setChannelList(editeddata?.channels)
        }
    }, [editeddata]);

    const onClose1 = () => {
        onClose(null);
    }

    const createDynamicObject = (network, channels = [], domains = [], source = [], businessData = []) => {
        // Initialize the dynamic object with the Network key (always present)
        const dynamicObject = { Network: network };

        // Add keys conditionally if their corresponding values are not empty arrays
        if (channels.length > 0) {
            dynamicObject.channels = channels;
        }

        if (domains.length > 0) {
            dynamicObject.Domains = domains;
        }

        if (source.length > 0) {
            dynamicObject.Source = source;
        }

        if (businessData.length > 0) {
            dynamicObject.businessData = businessData;
        }

        return dynamicObject;
    };
    const handleSubmitConfirm = async () => {
        try {
            const result = createDynamicObject(
                editeddata?.Network,
                channelList,
                dataList,
                campaigns,
                objects
            );

            console.log("API PAYLOAD:", result);

            const response = await fetch(
                "/api/newuser/updateurlbuilder",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        updatedData: result,
                    }),
                }
            );

            console.log("API RESPONSE STATUS:", response.status);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to update URL builder"
                );
            }

            console.log("API SUCCESS:", data);

            setIsSubmitModalOpen(false);
            onClose(result);

        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const submitForm = async (values) => {
        console.log("FORM SUBMITTED:", values);
        setIsSubmitModalOpen(true);
    };

    const initialValues = editeddata ? {
        Network: editeddata.Network,
    } : null;

    return (
        <ReusableDrawer
            title={`Edit the ${editeddata?.Network} Url Bulder`}
            width={700}
            open={visible} // Change visible to open
            onClose={onClose1}
            theme={theme}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={submitForm}
                initialValues={initialValues}
                key={initialValues?.Network}
                className={theme === 'dark' ? 'form-dark' : 'form-light'}
            >
                <Form.Item
                    label="Network"
                    name="Network"
                    rules={[
                        {
                            required: true,
                            message: 'Please input the username!',
                        }
                    ]}
                >
                    <SearchInput
                        disabled
                        width="100%"
                        height={27}
                        theme={theme}
                    />
                </Form.Item>

                {editeddata?.Source && (
                    <Form.Item
                        label="Source"
                        className="mobile-url-source"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the email!',
                            },
                        ]}
                    >
                        <div style={{ width: "100%" }}>
                            {/* Header Row */}
                            <div className="editeddata-source-fields" style={{ display: 'flex', marginBottom: '8px', gap: "5px", }}>
                                <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>ID</div>
                                <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Name</div>
                                <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Code</div>
                                <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Campaign ID</div>
                                <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Adset ID</div>
                                <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Action</div>
                            </div>

                            {/* Campaign Rows */}
                            {campaigns.map((campaign, index) => (
                                <div
                                    key={index}
                                    className="campaigns-container"
                                    style={{ display: 'flex', marginBottom: '8px', gap: "10px" }}
                                >
                                    <div style={{ flex: 1, textAlign: 'center' }}>
                                        <SearchInput
                                            type="text"
                                            value={campaign.id}
                                            readOnly
                                            width="100%"
                                            height={27}
                                            theme={theme}
                                        />
                                    </div>

                                    <div style={{ flex: 2, textAlign: 'center' }}>
                                        <SearchInput
                                            type="text"
                                            value={campaign.name}
                                            onChange={(e) => updateField(index, 'name', e.target.value)}
                                            width="100%"
                                            height={27}
                                            theme={theme}
                                        />
                                    </div>

                                    <div style={{ flex: 2, textAlign: 'center' }}>
                                        <SearchInput
                                            type="text"
                                            value={campaign.code}
                                            onChange={(e) => updateField(index, 'code', e.target.value)}
                                            width="100%"
                                            height={27}
                                            theme={theme}
                                        />
                                    </div>

                                    <div style={{ flex: 2, textAlign: 'center' }}>
                                        <SearchInput
                                            type="text"
                                            value={campaign.campaignId}
                                            onChange={(e) => updateField(index, 'campaignId', e.target.value)}
                                            width="100%"
                                            height={27}
                                            theme={theme}
                                        />
                                    </div>

                                    <div style={{ flex: 2, textAlign: 'center' }}>
                                        <SearchInput
                                            type="text"
                                            value={campaign.AdsetId}
                                            onChange={(e) => updateField(index, 'AdsetId', e.target.value)}
                                            width="100%"
                                            height={27}
                                            theme={theme}
                                        />
                                    </div>

                                    <div
                                        className="delete-button-container"
                                        style={{
                                            flex: 1,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '3px',
                                        }}
                                    >
                                        {/* Delete button for all rows */}
                                        <SubmitButton
                                            type="danger"
                                            icon={<DeleteOutlined className={theme === "dark" ? "delete-icon-dark" : "delete-icon-light"} />}
                                            onClick={() => showDeleteModal(index)}
                                            width={25}
                                            height={20}
                                        />

                                        {/* Add button only for the last row */}
                                        {index === campaigns.length - 1 && (
                                            <SubmitButton
                                                icon={<PlusOutlined className="black-icon" />}
                                                onClick={addNewCampaign}
                                                width={25}
                                                height={20}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Delete Confirmation Modal */}
                        <ReusableModal
                            title={
                                <span
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#333",
                                    }}
                                >
                                    Delete Confirmation
                                </span>
                            }
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            open={modalVisible}
                            onOk={deleteCampaign}
                            onCancel={cancelDelete1}
                            okText="OK"
                            cancelText="Cancel"
                            theme={theme}
                            footer={[
                                <div>
                                    <SubmitButton
                                        width={50}
                                        height={27}
                                        text="Cancel"
                                        key="cancel" onClick={cancelDelete1} style={{ marginLeft: "4px" }}>

                                    </SubmitButton>
                                    <SubmitButton width={50}
                                        text="Ok"
                                        height={27} key="ok" onClick={deleteCampaign} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>

                                    </SubmitButton>
                                </div>
                            ]}
                        >
                            <p>Are you sure you want to delete this campaign?</p>
                        </ReusableModal>
                    </Form.Item>
                )}
                {editeddata?.channels && (
                    <Form.Item
                        label="channels"
                        className="mobile-url-channels"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the email!',
                            },
                        ]}
                    >
                        {/* Header Row */}
                        <div className="editeddata-source-fields" style={{ display: 'flex', marginBottom: '8px' }}>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>ID</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Name</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Source</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Value</div>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Action</div>
                        </div>

                        {/* List of Channels */}
                        {channelList.map((channel, index) => (
                            <div
                                key={index}
                                className="campaigns-container"
                                style={{ display: 'flex', marginBottom: '10px', gap: "10px" }}
                            >
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={channel.id}
                                        readOnly
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={channel.name}
                                        onChange={(e) => updateChannelField(index, 'name', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={channel.source}
                                        onChange={(e) => updateChannelField(index, 'source', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={channel.value}
                                        onChange={(e) => updateChannelField(index, 'value', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div
                                    className="delete-button-container"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {/* Delete button for all rows */}
                                    <SubmitButton
                                        width={25}
                                        height={20}
                                        type="danger"
                                        icon={<DeleteOutlined />}
                                        onClick={() => openChannelDeleteModal(index)}
                                    />

                                    {/* Add button only for the last row */}
                                    {index === channelList.length - 1 && (
                                        <SubmitButton
                                            icon={<PlusOutlined />}
                                            onClick={addNewChannel}
                                            width={25}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}


                        {/* Delete Confirmation Modal */}
                        <ReusableModal
                            title={
                                <span
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#333",
                                    }}
                                >
                                    Delete Confirmation
                                </span>
                            }
                            theme={theme}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            open={isChannelModalOpen}
                            onOk={confirmChannelDeletion}
                            onCancel={cancelChannelDeletion}
                            okText="OK"
                            cancelText="Cancel"
                            footer={[
                                <div>
                                    <SubmitButton
                                        width={50}
                                        height={27}
                                        text="Cancel"
                                        key="cancel" onClick={cancelChannelDeletion} style={{ marginLeft: "4px" }}>

                                    </SubmitButton>
                                    <SubmitButton
                                        width={50}
                                        height={27}
                                        text="Ok"
                                        key="ok" onClick={confirmChannelDeletion} style={{ marginLeft: "4px" }}>

                                    </SubmitButton>
                                </div>
                            ]}
                        >
                            <p>Are you sure you want to delete this channel?</p>
                        </ReusableModal>
                    </Form.Item>
                )}
                {editeddata?.Domains && (
                    <Form.Item
                        label="Domains"
                        className="mobile-url-domains"

                        rules={[
                            {
                                required: true,
                                message: 'Please input the email!',
                            },
                        ]}
                    >
                        {/* Header Row */}
                        <div className="editeddata-source-fields" style={{ display: 'flex', marginBottom: '8px' }}>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>ID</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Name</div>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Code</div>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Account</div>
                            <div style={{ flex: 3, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>URL</div>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Action</div>
                        </div>

                        {/* Data Rows */}
                        {dataList.map((item, index) => (
                            <div
                                key={index}
                                className="campaigns-container"
                                style={{ display: 'flex', marginBottom: '10px', gap: "10px" }}
                            >
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={item.id}
                                        readOnly
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={item.name}
                                        onChange={(e) => updateInputValue(index, 'name', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={item.code}
                                        onChange={(e) => updateInputValue(index, 'code', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={item.account}
                                        onChange={(e) => updateInputValue(index, 'account', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div style={{ flex: 3, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={item.url}
                                        onChange={(e) => updateInputValue(index, 'url', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>

                                <div
                                    className="delete-button-container"
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    {/* Delete button for all rows */}
                                    <SubmitButton
                                        type="danger"
                                        icon={<DeleteOutlined style={{ fontSize: '15px' }} />}
                                        onClick={() => openDeleteModal(index)}
                                        width={25}
                                        height={20}
                                    />

                                    {/* Add button only for the last row */}
                                    {index === dataList.length - 1 && (
                                        <SubmitButton
                                            icon={<PlusOutlined style={{ fontSize: '15px' }} className="black-icon" />}
                                            onClick={addNewRow}
                                            width={25}
                                            height={20}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}


                        {/* Delete Confirmation Modal */}
                        <ReusableModal
                            title={
                                <span
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#333",
                                    }}
                                >
                                    Delete Confirmation
                                </span>
                            }
                            theme={theme}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            open={isModalOpen}
                            onOk={confirmDelete}
                            onCancel={cancelDelete}
                            okText="OK"
                            cancelText="Cancel"
                            footer={[
                                <div>
                                    <SubmitButton
                                        width={50}
                                        height={27} key="cancel" onClick={cancelDelete} style={{ marginLeft: "4px" }} text="Cancel">

                                    </SubmitButton>
                                    <SubmitButton text="Ok"
                                        width={50}
                                        height={27} key="ok" onClick={confirmDelete} style={{ marginLeft: "4px", backgroundColor: "#91C25F", color: 'black' }}>

                                    </SubmitButton>
                                </div>
                            ]}
                        >
                            <p>Are you sure you want to delete this object?</p>
                        </ReusableModal>
                    </Form.Item>
                )}
                {editeddata?.businessData && (
                    <Form.Item
                        label="Business Data"
                        className="mobile-url-business"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the email!',
                            },
                        ]}
                    >
                        {/* Header */}
                        <div className="editeddata-source-fields" style={{ display: 'flex' }}>
                            <div style={{ flex: 1, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>ID</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Name</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Code</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Account</div>
                            <div style={{ flex: 3, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>URL</div>
                            <div style={{ flex: 2, textAlign: 'center', color: theme === "dark" ? 'white' : "black" }}>Action</div>
                        </div>

                        {/* List of objects */}
                        {objects.map((obj, index) => (
                            <div
                                key={index}
                                className="campaigns-container"
                                style={{ display: 'flex', marginTop: '8px', gap: "10px" }}
                            >
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={obj.id}
                                        readOnly
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>
                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={obj.name}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>
                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={obj.code}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>
                                <div style={{ flex: 2, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={obj.account}
                                        onChange={(e) => handleInputChange(index, 'account', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>
                                <div style={{ flex: 3, textAlign: 'center' }}>
                                    <SearchInput
                                        type="text"
                                        value={obj.url}
                                        onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                                        width="100%"
                                        height={27}
                                        theme={theme}
                                    />
                                </div>
                                <div
                                    className="delete-button-container"
                                    style={{ flex: 2, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '5px' }}
                                >
                                    <SubmitButton
                                        width={25}
                                        height={20}
                                        type="danger"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteClick(index)}
                                    />
                                    {index === objects.length - 1 && (
                                        <SubmitButton
                                            width={25}
                                            height={20}
                                            icon={<PlusOutlined />}
                                            onClick={handleAddObject}
                                        />
                                    )}
                                </div>
                            </div>
                        ))}


                        {/* Delete Confirmation Modal */}
                        <ReusableModal
                            title={
                                <span
                                    style={{
                                        color: theme === "dark" ? "#fff" : "#333",
                                    }}
                                >
                                    Delete Confirmation
                                </span>
                            }
                            theme={theme}
                            className={`custom-modal ${theme === 'dark' ? 'dark-theme-modal' : ''}`}
                            open={isModalVisible}
                            onOk={handleConfirmDelete}
                            onCancel={handleCancelDelete}
                            okText="OK"
                            cancelText="Cancel"
                            footer={[
                                <div>
                                    <SubmitButton width={50}
                                        height={27} text="Cancel" key="cancel" onClick={handleCancelDelete} style={{ marginLeft: "4px" }}>

                                    </SubmitButton>
                                    <SubmitButton text="Ok" key="ok" onClick={handleConfirmDelete} style={{ marginLeft: "4px", backgroundColor: "#91C25F" }}>

                                    </SubmitButton>
                                </div>
                            ]}
                        >
                            <p>Are you sure you want to delete this object?</p>
                        </ReusableModal>
                    </Form.Item>
                )}

                <Form.Item>
                    <SubmitButton
                        text="Submit"
                        onClick={() => {
                            console.log("SUBMIT BUTTON CLICKED");
                            form.submit();
                        }}
                        style={{
                            backgroundColor: "#91C25F",
                            color: "black",
                            fontWeight: "600"
                        }}
                    />
                </Form.Item>
            </Form>
            <ReusableModal
                title={
                    <span
                        style={{
                            color: theme === "dark" ? "#fff" : "#333",
                        }}
                    >
                        Confirmation
                    </span>
                }
                open={isSubmitModalOpen}
                onCancel={() => setIsSubmitModalOpen(false)}
                theme={theme}
                className={`custom-modal ${theme === "dark" ? "dark-theme-modal" : ""
                    }`}
                footer={[
                    <div key="footer" style={{
                        display: "flex",
                        gap: "10px",
                    }}>
                        <SubmitButton
                            width={60}
                            height={27}
                            text="Cancel"
                            onClick={() => setIsSubmitModalOpen(false)}
                            style={{ marginRight: "4px" }}
                        />

                        <SubmitButton
                            width={50}
                            height={27}
                            text="OK"
                            onClick={handleSubmitConfirm}
                            style={{
                                marginLeft: "4px",
                                backgroundColor: "#91C25F",
                                color: "black",
                            }}
                        />
                    </div>
                ]}
            >
                <p>Are you sure you want to submit?</p>
            </ReusableModal>
        </ReusableDrawer>
    )
};

export default EditUrlBuilder;