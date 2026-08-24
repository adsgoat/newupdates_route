import { useState } from "react";
import dayjs from "dayjs";
import { message } from "antd";

export default function useUpload({
    uploadPrefix,
    currentFolder,
    userdetails,
    getUserFiles,
}) {
    const [uploadKey, setUploadKey] = useState(Date.now());
    const [uploadFileList, setUploadFileList] = useState([]);

    const [pendingFiles, setPendingFiles] = useState([]);
    const [previewFile, setPreviewFile] = useState(null);

    const [fileInputName, setFileInputName] = useState("");

    const [uploadingIndex, setUploadingIndex] = useState(0);
    const [totalFiles, setTotalFiles] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // ==========================================
    // FILE SELECT
    // ==========================================
    const handleFileChange = ({ fileList }) => {
        if (!fileList.length) return;

        setUploadFileList(fileList);

        const files = fileList
            .map((item) => item.originFileObj)
            .filter(Boolean);

        setPendingFiles(files);
        setUploadingIndex(0);
        setTotalFiles(files.length);

        const file = files[0];

        if (!file) return;

        setPreviewFile({
            uid: file.uid || file.name,
            name: file.name,
            url: URL.createObjectURL(file),
            file,
        });

        // Remove extension for input field
        setFileInputName(
            file.name.includes(".")
                ? file.name
                    .split(".")
                    .slice(0, -1)
                    .join(".")
                : file.name
        );

        setIsModalVisible(true);
    };

    // ==========================================
    // CANCEL
    // ==========================================
    const handleCancel = () => {
        setIsModalVisible(false);

        setPreviewFile(null);
        setPendingFiles([]);
        setUploadFileList([]);

        setUploadingIndex(0);
        setTotalFiles(0);

        setFileInputName("");

        setUploadKey(Date.now());
    };

    // ==========================================
    // UPLOAD
    // ==========================================
    const handleConfirmUpload = async () => {
        try {
            const fileToUpload =
                pendingFiles?.[uploadingIndex];

            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------
            if (!fileToUpload) {
                message.error("No file selected.");
                return;
            }

            if (!fileInputName.trim()) {
                message.error("File name cannot be empty.");
                return;
            }

          

            // ------------------------------------------
            // FILE EXTENSION
            // ------------------------------------------
            const extension =
                fileToUpload.name.includes(".")
                    ? fileToUpload.name
                        .split(".")
                        .pop()
                    : "";

            // ------------------------------------------
            // FILE NAME
            // ------------------------------------------
            const filename = extension
                ? `${fileInputName.trim()}.${extension}`
                : fileInputName.trim();

            // ------------------------------------------
            // UPLOAD DATE
            // ------------------------------------------
            const uploadDate =
                dayjs().format("YYYY-MM-DD");

            // ------------------------------------------
            // DESTINATION KEY
            // ------------------------------------------
            const destinationKey =
                `${uploadPrefix}${currentFolder || ""}${filename}`;

            console.log(
                "========== UPLOAD =========="
            );

            console.log(
                "File:",
                fileToUpload
            );

            console.log(
                "Upload date:",
                uploadDate
            );

            console.log(
                "Filename:",
                filename
            );

            console.log(
                "Destination:",
                destinationKey
            );

            console.log(
                "Folder:",
                currentFolder || ""
            );

          
            // ------------------------------------------
            // FORM DATA
            // ------------------------------------------
            const formData = new FormData();

            formData.append(
                "file",
                fileToUpload
            );

            formData.append(
                "uploadDate",
                uploadDate
            );

            formData.append(
                "filename",
                destinationKey
            );

            formData.append(
                "folder",
                currentFolder || ""
            );

            // ------------------------------------------
            // NEXT.JS API
            // ------------------------------------------
            const response = await fetch(
                "/api/creatives/upload",
                {
                    method: "POST",

                    headers: {
                        Authorization:
                            localStorage.getItem(
                                "token"
                            ),

                        username:
                            "Bhavani",
                    },

                    body: formData,
                }
            );

            // ------------------------------------------
            // ERROR RESPONSE
            // ------------------------------------------
            if (!response.ok) {
                const errorText =
                    await response.text();

                console.error(
                    "Upload API Error:",
                    response.status,
                    errorText
                );

                let errorMessage =
                    "Unable to upload the file. Please try again.";

                try {
                    const errorData =
                        JSON.parse(errorText);

                    if (errorData?.message) {
                        errorMessage =
                            errorData.message;
                    }
                } catch {
                    // Response was not JSON
                }

                throw new Error(
                    errorMessage
                );
            }

            // ------------------------------------------
            // RESPONSE DATA
            // ------------------------------------------
            const data =
                await response.json();

            console.log(
                "Upload response:",
                data
            );

            // ------------------------------------------
            // FILE URL
            // ------------------------------------------
            const newFileUrl =
                data?.imageUrl ||
                data?.url;

            if (!newFileUrl) {
                console.warn(
                    "No imageUrl returned:",
                    data
                );
            }

            // ------------------------------------------
            // NEW FILE OBJECT
            // ------------------------------------------
            const newFile = {
                uid: Date.now(),
                name: filename,
                status: "done",
                url: newFileUrl,
                uploadDate,
            };

            // ------------------------------------------
            // NEXT FILE
            // ------------------------------------------
            const nextIndex =
                uploadingIndex + 1;

            setUploadingIndex(nextIndex);

            message.success(
                `${filename} uploaded successfully`
            );

            // ------------------------------------------
            // REFRESH USER FILES
            // ------------------------------------------
            if (getUserFiles) {
                await getUserFiles();
            }

            // ------------------------------------------
            // MORE FILES
            // ------------------------------------------
            if (
                pendingFiles &&
                nextIndex < pendingFiles.length
            ) {
                const nextFile =
                    pendingFiles[nextIndex];

                setPreviewFile({
                    uid:
                        nextFile.uid ||
                        nextFile.name,

                    name: nextFile.name,

                    url: URL.createObjectURL(
                        nextFile
                    ),

                    file: nextFile,
                });

                setFileInputName(
                    nextFile.name.includes(".")
                        ? nextFile.name
                            .split(".")
                            .slice(0, -1)
                            .join(".")
                        : nextFile.name
                );
            }

            // ------------------------------------------
            // ALL FILES UPLOADED
            // ------------------------------------------
            else {
                setIsModalVisible(false);

                setUploadingIndex(0);
                setTotalFiles(0);

                setPendingFiles([]);
                setUploadFileList([]);

                setPreviewFile(null);
                setFileInputName("");

                setUploadKey(Date.now());
            }

            return {
                ok: true,
                file: newFile,
            };
        } catch (error) {
            console.error(
                "Upload Error:",
                error
            );

            message.error(
                error?.message ||
                "Failed to upload file."
            );

            return {
                ok: false,
                error,
            };
        }
    };

    // ==========================================
    // EDIT UPLOADED FILE
    // ==========================================
    const handleEditUploadedFile = () => {
        if (!previewFile) return;

        console.log(
            "Edit uploaded file:",
            previewFile
        );
    };

    // ==========================================
    // RETURN
    // ==========================================
    return {
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

        loading,
        setLoading,

        isModalVisible,
        setIsModalVisible,

        handleFileChange,
        handleCancel,
        handleConfirmUpload,
        handleEditUploadedFile,
    };
}