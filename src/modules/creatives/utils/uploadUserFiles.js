import { useState } from "react";
import dayjs from "dayjs";
import { message } from "antd";
import axios from "axios";
export default function useUpload({
    uploadPrefix,
    currentFolder,
    getUserFiles,
    username
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


    const handleConfirmUpload = async () => {
        try {
            const fileToUpload =
                pendingFiles?.[uploadingIndex];

       
            if (!fileToUpload) {
                message.error("No file selected.");
                return;
            }

            if (!fileInputName.trim()) {
                message.error("File name cannot be empty.");
                return;
            }



       
            const extension =
                fileToUpload.name.includes(".")
                    ? fileToUpload.name
                        .split(".")
                        .pop()
                    : "";

           
            const uploadDate =
                dayjs().format("YYYY-MM-DD");

         
            const filename = extension
                ? `${fileInputName.trim()}.${extension}`
                : fileInputName.trim();

            const destinationKey =
                `${uploadPrefix}${currentFolder || ""}${filename}`;

            const formData = new FormData();

            formData.append("file", fileToUpload);
            formData.append("uploadDate", uploadDate);
            formData.append("filename", destinationKey);
            formData.append("folder", currentFolder || "");


            const response = await axios.post(
                "/api/creatives/upload",
                formData,
                {
                    headers: {
                        username: username,
                    },
                }
            );

            if (response.status < 200 || response.status >= 300) {
                throw new Error(
                    response.data?.message ||
                    "Unable to upload the file. Please try again."
                );
            }

            const data = response.data;

            console.log(
                "Upload response:",
                data
            );

          
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

           
            const nextIndex =
                uploadingIndex + 1;

            setUploadingIndex(nextIndex);

            message.success(
                `${filename} uploaded successfully`
            );

            if (getUserFiles) {
                await getUserFiles();
            }

         
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

   
    const handleEditUploadedFile = () => {
        if (!previewFile) return;

        console.log(
            "Edit uploaded file:",
            previewFile
        );
    };

    
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