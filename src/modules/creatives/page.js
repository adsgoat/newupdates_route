"use client";

import { Grid, Row, Col, Upload, message } from "antd";
import { useState, useEffect, useRef, useMemo } from "react";


import { DeleteOutlined, UploadOutlined, FolderFilled, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import RouteDescription from "@/components/common/routedescription";
import SelectProjects from "@/components/common/selectprojects";
import SelectAccountSingle from "@/components/creatives/selectaccount";
import SelectDateDashboard from "@/components/common/selectdatedashboard";
import SelectDateSingleCalendarDashboard from "@/components/common/selectdatesinglecalendar";
import { rangePresets } from "../commonfunctionsforroutes";
import SearchInput from "@/components/common/searchinput";
import SubmitButton from "@/components/common/submitbutton";
import ReloadButton from "@/components/common/reloadbuttion";
import CreativeLibrary from "@/modules/creatives/utils/creativelibrarymain";
import useSearch from "@/modules/creatives/utils/search";
import CreativeContextMenu from "@/modules/creatives/utils/creativecontextmenu";
import useUpload from "@/modules/creatives/utils/uploadUserFiles";
import useTrash from "@/modules/creatives/utils/userTrashfiles";
import useImageUrl from "@/modules/creatives/utils/userimagesurl";
import CreativeModal from "@/components/creatives/creativesmodal";
import useEditFile from "@/modules/creatives/apicalls/editfile";
import useRenameFile from "@/modules/creatives/apicalls/rename";
import useDuplicateFile from "@/modules/creatives/apicalls/duplicate";
import useMoveToBin from "@/modules/creatives/apicalls/movetobin";
import useCopyFile from "@/modules/creatives/apicalls/copyfile";
import useAddToCampaign from "@/modules/creatives/apicalls/addtocampign";
import usePasteFile from "@/modules/creatives/apicalls/pastefile";
import "../../styles/creatives.css";
import "../../styles/global.css";

const { useBreakpoint } = Grid;

export default function CreativesPage({ email, userData, userPermissions, auth, username }) {

  // theme states
  const [theme] = useState("light");
  const screens = useBreakpoint();

  // Project & Account Selection
  const [firstSelectValues, setFirstSelectValues] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  //date states
  const [selectedDates, setSelectedDates] = useState([dayjs().subtract(1, "day"), dayjs().subtract(1, "day"),]);
  const [startDate, setStartDate] = useState(dayjs().subtract(1, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().subtract(1, "day").format("YYYY-MM-DD"));
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  //get networks with status state
  const [networksWithStatus, setNetworksWithStatus] = useState([]);

  const [userFiles, setUserFiles] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");

  const [urlInput, setUrlInput] = useState("");
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [isEditorVisible, setIsEditorVisible] =
    useState(false);
  const [editingUid, setEditingUid] =
    useState(null);
  const [
    highlightedFolders,
    setHighlightedFolders
  ] = useState([]);
  const [inlineName, setInlineName] =
    useState("");
  const selectedImagesRef = useRef([]);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    target: null,
    isFolder: false,
    selectedList: null,
  });

  const menuRef = useRef(null);

  const [isHoveredEdit, setIsHoveredEdit] = useState(false);
  const [isHoveredRename, setIsHoveredRename] = useState(false);
  const [isHoveredDuplicate, setIsHoveredDuplicate] = useState(false);
  const [isHoveredCopy, setIsHoveredCopy] = useState(false);
  const [isHoveredCut, setIsHoveredCut] = useState(false);
  const [isHoveredDelete, setIsHoveredDelete] = useState(false);
  const [isHoveredRestore, setIsHoveredRestore] = useState(false);
  const [hoveredImage, setHoveredImage] = useState(null);

  const [clipboardFile, setClipboardFile] = useState([]);
  const [editedFile, setEditedFile] = useState(null);
  const [urlPreviewFile, setUrlPreviewFile] = useState(null);
  const [urlPendingFiles, setUrlPendingFiles] = useState([]);
  const [urlUploadingIndex, setUrlUploadingIndex] = useState(0);
  const [urlUploadFileList, setUrlUploadFileList] = useState([]);
  const [urlFileInputName, setUrlFileInputName] = useState("");
  const [urlTotalFiles, setUrlTotalFiles] = useState(0);
  const [urlModalVisible, setUrlModalVisible] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const handleViewImage = (item) => {
    setPreviewItem(item);
    setPreviewOpen(true);
  };
  const uploadPrefix = `${firstSelectValues}/${selectedAccount}/`;
  const handleContextMenu = (e, image) => {
    e.preventDefault();
    e.stopPropagation();

    const isMultiSelected =
      selectedImages.length > 1 &&
      image &&
      selectedImages.some(
        (img) => img.uid === image.uid
      );

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      target: image,
      isFolder: image?.isFolder || false,
      selectedList: isMultiSelected
        ? selectedImages
        : null,
    });
  };

  // get user files 
  const getUserFiles = async () => {
    try {
      const folder =
        `${firstSelectValues}/${selectedAccount}/`;

      const params = new URLSearchParams({
        username: username,
        folder,
      });

      const response = await fetch(
        `/api/creatives/userfiles?${params.toString()}`
      );

      const data = await response.json();

      console.log(data, "userfiles");

      setUserFiles(data.images || []);
      setImages(data.images || []);
      setFilteredImages(data.images || []);
      // Important:
      // Apply current date filter after new files arrive
      if (startDate && endDate) {
        const filtered = (data.images || []).filter(
          (img) =>
            img.uploadDate >= startDate &&
            img.uploadDate <= endDate
        );

        setFilteredImages(filtered);
      } else {
        setFilteredImages(data.images || []);
      }
    } catch (error) {
      console.error(
        "Error fetching user files:",
        error
      );
    }
  };
  const handleChange = (dates) => {
    if (!dates || dates.length === 0) {
      setFilteredImages(images);
      setStartDate(null);
      setEndDate(null);
      return;
    }

    const [start, end] = dates;

    const formattedStart =
      start.format("YYYY-MM-DD");

    const formattedEnd =
      end.format("YYYY-MM-DD");

    setStartDate(formattedStart);
    setEndDate(formattedEnd);

    setFilteredImages(
      images.filter(
        (img) =>
          img.uploadDate >= formattedStart &&
          img.uploadDate <= formattedEnd
      )
    );
  };
  const {
    uploadKey,
    uploadFileList,
    setUploadFileList,
    pendingFiles,
    setPendingFiles,
    previewFile,
    setPreviewFile,
    fileInputName,
    setFileInputName,
    uploadingIndex,
    setUploadingIndex,
    totalFiles,
    setTotalFiles,
    isModalVisible,
    setIsModalVisible,
    loading,
    setLoading,
    handleFileChange,
    handleCancel,
    handleConfirmUpload,
    handleEditUploadedFile,
  } = useUpload({
    uploadPrefix,
    currentFolder,
    username: username,
    getUserFiles,

  });
  const { pasteFile } = usePasteFile({
    username: username,
    currentFolder,
    uploadPrefix,
    images,
    clipboardFile,
    setClipboardFile,
    getUserFiles,
    message,
  });
  const {
    isTrashView,
    trashItems,
    trashLoading,
    fetchTrashFiles,
    toggleTrashView,
    closeTrashView,
    permanentlyDeleteItems,
    restoreItems,
    removeTrashItemsLocally,
  } = useTrash({
    // apiClient,
    userName: username,
    selectedKey: firstSelectValues,
    selectedAccountNumber: selectedAccount,

    setSelectedImages,
    selectedImagesRef,

    fetchUserImages: getUserFiles,
  });
  const {
    handleEditFile,
  } = useEditFile({
    setSelectedImage,
    setIsEditorVisible,
  });
  const {
    startRename,
    handleInlineRename,
  } = useRenameFile({
    inlineName,
    setInlineName,
    setEditingUid,

    setContextMenu,
    setSelectedImages,
    selectedImagesRef,

    images,
    message,

    getUserFiles,

  });
  const {
    addToCampaign,
  } = useAddToCampaign({
    userdetails: auth,
    // setCheckboxSelected,
    selectedImagesRef,
    setHighlightedFolders,
    // getFileType,
    message,
  });
  const {
    duplicateFile,
  } = useDuplicateFile({
    // userdetails,
    currentFolder,
    uploadPrefix,
    images,
    getUserFiles,
    message,
  });
  const { handleUploadURL } = useImageUrl({
    urlInput,
    setUrlInput,
    loading,
    setLoading,
    setPreviewFile,
    setPendingFiles,
    setUploadingIndex,
    setUploadFileList,
    setFileInputName,
    setTotalFiles,
    setIsModalVisible,
    username: username
  });
  const { moveToBin } = useMoveToBin({
    getUserFiles,
    message,
    username: username
  });
  const { copyFile } = useCopyFile({
    currentFolder,
    uploadPrefix,
    getUserFiles,
    message,
    username: username
  });
  // const displayItems = useMemo(() => {
  //   return [
  //     ...userFiles.filter((item) => !item.isFolder),
  //     ...userFiles.filter((item) => item.isFolder),
  //   ];
  // }, [userFiles]);
  const displayItems = useMemo(() => {
    const sourceItems = isTrashView
      ? trashItems
      : userFiles;

    return [
      ...sourceItems.filter(
        (item) => !item.isFolder
      ),
      ...sourceItems.filter(
        (item) => item.isFolder
      ),
    ];
  }, [
    isTrashView,
    trashItems,
    userFiles,
  ]);
  // const displayItems = useMemo(() => {
  //   const sourceItems = isTrashView
  //     ? trashItems
  //     : filteredImages;

  //   return [
  //     ...sourceItems.filter((item) => !item.isFolder),
  //     ...sourceItems.filter((item) => item.isFolder),
  //   ];
  // }, [
  //   isTrashView,
  //   trashItems,
  //   filteredImages,
  // ]);
  const {
    searchQuery,
    filteredItems,
    handleSearch,
    clearSearch,
  } = useSearch(displayItems);
  // userdata formating function to convert array of objects to array of accountNumbers
  const transformData = (data) => {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          return [key, value.map(obj => ({ accountNumber: obj.accountNumber, accountName: obj.accountName, status: obj.status, }))];
        }
        return [key, value];
      })
    );
  };
  const transformedData = transformData(userData);

  //  project selection change handler
  const handleFirstSelectChange = (project) => {
    setFirstSelectValues(project);
    setFilteredAccounts(transformedData[project] || []);
    setSelectedAccount("");
  };

  //date selection handlers
  const handleChangeDates = (dates) => {
    setSelectedDates(dates);

    if (!dates || dates.length === 0) {
      setStartDate(null);
      setEndDate(null);
      setFilteredImages(images);
      return;
    }

    const [start, end] = dates;

    const formattedStart =
      start.format("YYYY-MM-DD");

    const formattedEnd =
      end.format("YYYY-MM-DD");

    setStartDate(formattedStart);
    setEndDate(formattedEnd);

    const filtered = (images || []).filter(
      (img) =>
        img.uploadDate >= formattedStart &&
        img.uploadDate <= formattedEnd
    );

    console.log("Date filter:", {
      start: formattedStart,
      end: formattedEnd,
      total: images.length,
      filtered: filtered.length,
    });

    setFilteredImages(filtered);
  };

  const handleOpenChange = (open) => {
    setIsPickerOpen(open);
  };

  const disabledDate = (current) => {
    return current && current > dayjs().endOf("day");
  };

  const onClickCloseButton = () => {
    setIsPickerOpen(false);
  };
  const handleSubmit = () => {
    if (selectedDates?.length === 2) {
      setStartDate(selectedDates[0].format("YYYY-MM-DD"));
      setEndDate(selectedDates[1].format("YYYY-MM-DD"));
    }
    setIsPickerOpen(false);

    // Call your creatives API here if needed
    // fetchCreativeLibrary();
  };

  // Fetch networks with status from the API
  const getNetworks = async () => {
    const data = await fetch("/api/creatives/data");
    return await data.json();
  }

  // Fetch networks data on component mount
  useEffect(() => {
    const networksData = async () => {
      const data = await getNetworks();
      console.log(data, "networksData");
      setNetworksWithStatus(data);
    }
    networksData();
  }, [])



  // get folder files
  const getFolderFiles = async (folderName) => {
    try {
      const folder = `${firstSelectValues}/${selectedAccount}/${folderName}`;

      const params = new URLSearchParams({
        username: username,
        folder,
      });

      const response = await fetch(
        `/api/creatives/userfiles?${params.toString()}`
      );

      const data = await response.json();

      setUserFiles(data.images);

    } catch (error) {
      console.error("Error fetching folder files:", error);
    }
  };

  useEffect(() => {
    if (!firstSelectValues) return;
    if (!selectedAccount) return;

    setCurrentFolder("");
    getUserFiles();

  }, [firstSelectValues, selectedAccount]);


  const handleSelectImage = (item, checked) => {
    setSelectedImages((prev) => {
      if (checked) {
        return [...prev, item];
      }

      return prev.filter(
        (image) => image.uid !== item.uid
      );
    });
  };

  const handleFolderClick = (folderName) => {
    const newFolder = `${currentFolder}${folderName}/`;

    setCurrentFolder(newFolder);

    getFolderFiles(newFolder);
  };


  const handleBack = () => {
    const folders = currentFolder.split("/").filter(Boolean);

    folders.pop();

    const previousFolder =
      folders.length > 0
        ? `${folders.join("/")}/`
        : "";

    setCurrentFolder(previousFolder);

    if (previousFolder === "") {
      getUserFiles();
    } else {
      getFolderFiles(previousFolder);
    }
  };


  return (
    <div
      style={{
        padding: "10px",
        height: "100%",
        overflowY: "auto",
      }}
      className={`creative-library ${theme === "dark" ? "dark-theme" : "light-theme"}`}
    >
      {screens.md ? (
        <>
          <Row justify="space-between" align="middle">
            <Col flex="auto">
              <RouteDescription
                Title="Creative Library"
                Description="Access all your creatives quickly and use them across your campaigns."
                theme={theme}
              />
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={5} style={{ marginTop: 5 }}>
            <Col xs={24} sm={24} md={6} lg={4}>
              <SelectProjects
                firstSelectValues={firstSelectValues}
                handleFirstSelectChange={handleFirstSelectChange}
                transformedData={transformedData}
                networksWithStatus={networksWithStatus}
                theme={theme}
                route="creatives"
              />
            </Col>

            <Col xs={24} sm={24} md={8} lg={5}>
              <SelectAccountSingle
                accounts={filteredAccounts}
                value={selectedAccount}
                onChange={setSelectedAccount}
                disabled={!firstSelectValues}
                theme={theme}
              />
            </Col>

            <Col xs={24} sm={24} md={8} lg={5}>
              {screens.md ? (
                <SelectDateDashboard
                  rangePresets={rangePresets}
                  selectedDates={selectedDates}
                  handleChangeDates={handleChangeDates}
                  isPickerOpen={isPickerOpen}
                  handleOpenChange={handleOpenChange}
                  setIsPickerOpen={setIsPickerOpen}
                  disabledDate={disabledDate}
                  onClickCloseButton={onClickCloseButton}
                  handleSubmit={handleSubmit}
                  theme={theme}
                  route="creatives"
                />
              ) : (
                <SelectDateSingleCalendarDashboard
                  rangePresets={rangePresets}
                  selectedDates={selectedDates}
                  handleChangeDates={handleChangeDates}
                  isPickerOpen={isPickerOpen}
                  handleOpenChange={handleOpenChange}
                  setIsPickerOpen={setIsPickerOpen}
                  disabledDate={disabledDate}
                  onClickCloseButton={onClickCloseButton}
                  handleSubmit={handleSubmit}
                  theme={theme}
                />
              )}
            </Col>
          </Row>

          {/* Search and Action Buttons */}
          <Row
            gutter={3}
            justify="space-between"
            align="middle"

          >
            {/* Left Side */}
            <Col>
              <Row gutter={3}>
                <Col>
                  <SearchInput
                    placeholder="Image URl"
                    theme={theme}
                    width={220}
                    height={24}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUploadURL();
                      }
                    }}
                  />
                </Col>

                <Col>
                  <Upload
                    key={uploadKey}
                    fileList={uploadFileList}
                    multiple
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={handleFileChange}
                    accept="image/*, video/*"
                  >
                    <SubmitButton
                      text="Upload"
                      width={90}
                      height={24}
                      textSize={13}
                      icon={
                        <UploadOutlined
                          style={{
                            color:
                              theme === "dark"
                                ? "#fff"
                                : undefined,
                          }}
                        />
                      }

                    />
                  </Upload>
                </Col>
              </Row>
            </Col>

            {/* Right Side */}
            <Col>
              <Row gutter={3}>
                <Col>
                  <SearchInput
                    placeholder="Search..."
                    theme={theme}
                    width={220}
                    height={24}
                    value={searchQuery}
                    onClear={clearSearch}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </Col>

                <Col>
                  <SubmitButton

                    width={110}
                    height={24}
                    textSize={13}
                    padding="2px"
                    icon={<DeleteOutlined />}
                    text={
                      isTrashView
                        ? "Back to files"
                        : "Trash"
                    }

                    onClick={toggleTrashView}

                  />
                </Col>

                <Col>
                  <ReloadButton
                    refreshUsers={getUserFiles}
                    width={32}
                    height={24}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </>
      ) : (
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {/* Title */}
          <RouteDescription
            Title="Creative Library"
            Description="Access all your creatives quickly and use them across your campaigns."
            theme={theme}
          />

          {/* Project */}
          <SelectProjects
            firstSelectValues={firstSelectValues}
            handleFirstSelectChange={handleFirstSelectChange}
            transformedData={transformedData}
            networksWithStatus={networksWithStatus}
            theme={theme}
            route="creatives"
          />

          {/* Account */}
          <SelectAccountSingle
            accounts={filteredAccounts}
            value={selectedAccount}
            onChange={setSelectedAccount}
            disabled={!firstSelectValues}
            theme={theme}
          />

          {/* Date */}
          <SelectDateSingleCalendarDashboard
            rangePresets={rangePresets}
            selectedDates={selectedDates}
            handleChangeDates={handleChangeDates}
            isPickerOpen={isPickerOpen}
            handleOpenChange={handleOpenChange}
            setIsPickerOpen={setIsPickerOpen}
            disabledDate={disabledDate}
            onClickCloseButton={onClickCloseButton}
            handleSubmit={handleSubmit}
            theme={theme}
          />

          {/* Image URL + Upload */}
          <div
            style={{
              display: "flex",
              gap: 5,
              width: "100%",
            }}
          >
            <div style={{ flex: 1 }}>
              <SearchInput
                placeholder="Image URL"
                theme={theme}
                width="100%"
                height={30}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUploadURL();
                  }
                }}
              />
            </div>

            <Upload
              key={uploadKey}
              fileList={uploadFileList}
              multiple
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleFileChange}
              accept="image/*, video/*"
            >
              <SubmitButton
                text="Upload"
                width={75}
                height={30}
                textSize={13}
                icon={<UploadOutlined />}
              />
            </Upload>
          </div>

          {/* Search */}
          <SearchInput
            placeholder="Search..."
            theme={theme}
            width="100%"
            height={30}
            value={searchQuery}
            onClear={clearSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />

          {/* Trash + Reload */}
          <div
            style={{
              display: "flex",
              gap: 5,
              width: "100%",
            }}
          >
            <div style={{ flex: 1 }}>
              <SubmitButton
                width="100%"
                height={30}
                textSize={13}
                padding="2px"
                icon={<DeleteOutlined />}
                text={isTrashView ? "Back to files" : "Trash"}
                onClick={toggleTrashView}
              />
            </div>

            <ReloadButton
              refreshUsers={getUserFiles}
              width={32}
              height={30}
            />
          </div>
        </div>
      )}
      <CreativeLibrary
        displayItems={filteredItems}
        handleFolderClick={handleFolderClick}
        handleBack={handleBack}
        currentFolder={currentFolder}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        selectedImagesRef={selectedImagesRef}
        handleContextMenu={handleContextMenu}
        handleSelectImage={handleSelectImage}
        isTrashView={isTrashView}
        handleViewImage={handleViewImage}
        editingUid={editingUid}
        inlineName={inlineName}
        setInlineName={setInlineName}
        handleInlineRename={handleInlineRename}
        setEditingUid={setEditingUid}
        hoveredImage={hoveredImage}
        setHoveredImage={setHoveredImage}
        setPreviewItem={setPreviewItem}

      />
      <CreativeContextMenu
        contextMenu={contextMenu}
        setContextMenu={setContextMenu}
        menuRef={menuRef}
        message={message}
        theme={theme}

        isTrashView={isTrashView}

        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        selectedImagesRef={selectedImagesRef}
        clipboardFile={clipboardFile}
        setClipboardFile={setClipboardFile}
        copyFile={copyFile}
        handleEditFile={handleEditFile}
        addToCampaign={addToCampaign}
        // handleCloneFile={handleCloneFile}
        // downloadFile={downloadFile}
        moveToBin={moveToBin}
        // setEditingUid={setEditingUid}
        // setInlineName={setInlineName}
        // extractDisplayName={extractDisplayName}

        // showDeleteModal={showDeleteModal}
        // setDeleteFolderModal={setDeleteFolderModal}
        // setNewFolderModal={setNewFolderModal}

        handleFolderClick={handleFolderClick}
        startRename={startRename}
        handleInlineRename={handleInlineRename}
        duplicateFile={duplicateFile}
        images={images}

        // handleAddToCampaign={handleAddToCampaign}

        // handlePermanentDelete={handlePermanentDelete}
        // handleRestore={handleRestore}

        // handleMultiCopy={handleMultiCopy}
        // handleMultiCut={handleMultiCut}
        // handleMultiDelete={handleMultiDelete}
        // handleMultiRename={handleMultiRename}

        // handlePaste={handlePaste}

        onPaste={pasteFile}
        isHoveredEdit={isHoveredEdit}
        setIsHoveredEdit={setIsHoveredEdit}

        isHoveredRename={isHoveredRename}
        setIsHoveredRename={setIsHoveredRename}

        isHoveredDuplicate={isHoveredDuplicate}
        setIsHoveredDuplicate={setIsHoveredDuplicate}

        isHoveredCopy={isHoveredCopy}
        setIsHoveredCopy={setIsHoveredCopy}

        isHoveredCut={isHoveredCut}
        setIsHoveredCut={setIsHoveredCut}

        isHoveredDelete={isHoveredDelete}
        setIsHoveredDelete={setIsHoveredDelete}

        isHoveredRestore={isHoveredRestore}
        setIsHoveredRestore={setIsHoveredRestore}
      />
      <CreativeModal
        title={`Confirm Upload (${uploadingIndex + 1}/${totalFiles})`}
        open={isModalVisible}
        onCancel={handleCancel}
        width={400}
        centered={true}
        footer={[
          <SubmitButton
            key="edit"
            type="primary"
            text="Edit"
            icon={<EditOutlined />}
            onClick={handleEditUploadedFile}
            disabled={
              previewFile &&
              /\.(mp4|mov)$/i.test(previewFile.name)
            }
          />,

          <SubmitButton
            key="confirm"
            type="default"
            text="Confirm"
            onClick={handleConfirmUpload}
          />,
        ]}
      >
        {previewFile && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/\.(mp4|mov)$/i.test(previewFile.name) ? (
              <video
                src={previewFile.url}
                controls
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: "500px",
                  maxHeight: "420px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <img
                src={previewFile.url}
                alt="Uploaded Preview"
                style={{
                  display: "block",
                  width: "auto",
                  maxWidth: "100%",
                  maxHeight: "420px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            )}

            <div
              style={{
                width: "100%",
                marginTop: "15px",
              }}
            >
              <SearchInput
                placeholder="Enter file name"
                value={fileInputName}
                onChange={(e) =>
                  setFileInputName(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirmUpload();
                  }
                }}
              />
            </div>
          </div>
        )}
      </CreativeModal>
      <CreativeModal
        open={previewOpen}
        title={previewItem?.name}
        onCancel={() => {
          setPreviewOpen(false);
          setPreviewItem(null);
        }}
        width={500}
      >
        {previewItem?.url && (
          /\.(mp4|webm|mov|m4v|avi)$/i.test(previewItem.name) ? (
            <video
              src={previewItem.url.replace(
                "s3.us-east-1.amazonaws.com",
                "s3.ap-south-1.amazonaws.com"
              )}
              controls
              autoPlay
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          ) : (
            <img
              src={previewItem.url.replace(
                "s3.us-east-1.amazonaws.com",
                "s3.ap-south-1.amazonaws.com"
              )}
              alt={previewItem.name}
              style={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )
        )}
      </CreativeModal>
    </div>
  );
}