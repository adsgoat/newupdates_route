
"use client";

import { Row, Col, Checkbox, Button } from "antd";
import { FolderFilled, ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import {
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS,
} from "@/modules/creatives/utils/constants";
import SearchInput from "@/components/common/searchinput";
import "../../../styles/creatives.css"


export default function CreativeLibrary({
    displayItems,
    handleFolderClick,
    handleBack,
    currentFolder,
    handleContextMenu,
    hoveredImage,
    setHoveredImage,
    handleViewImage,
    // checkbox props
    selectedImages,
    handleSelectImage,
    setPreviewItem,
    isTrashView,
    editingUid,
    inlineName,
    setInlineName,
    handleInlineRename,
    setEditingUid


}) {

    return (
        <div>
            {currentFolder && (
                <div style={{ marginTop: "20px" }}>
                    <span
                        onClick={handleBack}
                        style={{
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontWeight: 600,
                            fontSize: 14,
                        }}
                    >
                        <ArrowLeftOutlined />
                        {currentFolder
                            .split("/")
                            .filter(Boolean)
                            .slice(-1)[0]}
                    </span>
                </div>
            )}

            <div
                style={{
                    marginTop: 10,
                    // border: "2px solid #91C25F",
                    border: isTrashView
                        ? "2px solid #91d5ff"
                        : "2px solid #91C25F",

                    borderRadius: 8,
                    padding: 15,
                    minHeight: 500,
                }}
                onContextMenu={(e) => {
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                        handleContextMenu(e, null);
                    }
                }}
            >
                <Row gutter={[20, 25]}>
                    {displayItems.map((item) => {
                        const extension = item.name
                            .split(".")
                            .pop()
                            ?.toLowerCase();

                        const isImage =
                            IMAGE_EXTENSIONS.includes(extension);

                        const isVideo =
                            VIDEO_EXTENSIONS.includes(extension);

                        const isSelected = selectedImages?.some(
                            (image) => image.uid === item.uid
                        );

                        return (
                            <Col
                                xs={12}
                                sm={8}
                                md={6}
                                lg={4}
                                xl={3}
                                key={item.uid}
                            >
                                <div
                                    onClick={() => {
                                        // if (item.isFolder) {
                                        //     handleFolderClick(item.name);
                                        // }
                                        if (
                                            item.isFolder &&
                                            !isTrashView
                                        ) {
                                            handleFolderClick(item.name, currentFolder);
                                        }
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();
                                        handleContextMenu(e, item);
                                    }}
                                    style={{
                                        position: "relative",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        cursor: item.isFolder
                                            ? "pointer"
                                            : "default",
                                        padding: 6,
                                        borderRadius: 8,
                                        transition: "0.2s",
                                    }}
                                    // onMouseEnter={(e) => {
                                    //     e.currentTarget.style.background =
                                    //         "#f5f5f5";
                                    // }}
                                    // onMouseLeave={(e) => {
                                    //     e.currentTarget.style.background =
                                    //         "transparent";
                                    // }}
                                    onMouseEnter={() => setHoveredImage(item.uid)}
                                    onMouseLeave={() => setHoveredImage(null)}
                                >
                                    {!item.isFolder && hoveredImage === item.uid && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                // borderRadius: "8px",
                                            }}
                                        >
                                            <Button
                                                type="text"
                                                shape="circle"
                                                icon={<EyeOutlined />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewImage(item);
                                                }}
                                                style={{
                                                    color: "white",
                                                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                                                    border: "none",
                                                }}
                                            />
                                        </div>
                                    )}
                                    {/* Checkbox */}
                                    {!item.isFolder && (
                                        <Checkbox
                                            className="creative-checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                handleSelectImage(
                                                    item,
                                                    e.target.checked
                                                );
                                            }}
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 28,
                                                zIndex: 10,
                                                width:"5px"
                                            }}
                                        />
                                    )}

                                    {/* Preview */}
                                    {item.isFolder ? (
                                        <FolderFilled
                                            style={{
                                                fontSize: 40,
                                                color: "#fbd364",
                                            }}
                                        />
                                    ) : isImage ? (
                                        <img
                                            src={item.url.replace(
                                                "s3.us-east-1.amazonaws.com",
                                                "s3.ap-south-1.amazonaws.com"
                                            )}
                                            alt={item.name}

                                            style={{
                                                width: 75,
                                                height: 75,
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : isVideo ? (
                                        <video
                                            src={item.url.replace(
                                                "s3.us-east-1.amazonaws.com",
                                                "s3.ap-south-1.amazonaws.com"
                                            )}

                                            controls
                                            style={{
                                                width: 75,
                                                height: 75,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                            }}
                                        />
                                    ) : (
                                        <span style={{ fontSize: 40 }}>
                                            📄
                                        </span>
                                    )}

                                    {/* Name */}
                                    {/* <div
                                        style={{
                                            marginTop: 5,
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: 12,
                                            fontWeight: "bold",
                                            overflow: "hidden",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                        }}
                                        title={item.name}
                                    >
                                        {item.name}
                                    </div> */}
                                    <div
                                        style={{
                                            marginTop: 5,
                                            width: "100%",
                                            textAlign: "center",
                                            fontSize: 12,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {editingUid === item.uid ? (
                                            <SearchInput
                                                size="small"
                                                value={inlineName}
                                                autoFocus
                                                onChange={(e) =>
                                                    setInlineName(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleInlineRename(item);
                                                    }

                                                    if (e.key === "Escape") {
                                                        setEditingUid(null);
                                                        setInlineName("");
                                                    }
                                                }}
                                                onBlur={() => {
                                                    setEditingUid(null);
                                                    setInlineName("");
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            />
                                        ) : (
                                            <span
                                                style={{
                                                    display: "block",
                                                    overflow: "hidden",
                                                    whiteSpace: "nowrap",
                                                    textOverflow: "ellipsis",
                                                }}
                                                title={item.name}
                                            >
                                                {item.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
        </div>
    );
}