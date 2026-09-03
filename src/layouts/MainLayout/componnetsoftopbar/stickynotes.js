import React, { useState, useEffect } from "react";
import axios from "axios";
import Draggable from "react-draggable";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { PictureOutlined, DeleteOutlined, PlusOutlined, CopyOutlined } from "@ant-design/icons";
import {  Checkbox, message } from "antd";
import moment from "moment";
import { useRef } from "react";
import ReusableButton from "@/components/topbar/reusablebutton";


// 🌈 Light pastel color palette
const colorOptions = [
    "#fff9c4", // light yellow
    "#c8facc", // light green
    "#ffd6ec", // light pink
    "#e0ccff", // light purple
    "#d0f0fd", // light blue ✅
    "#f5f5f5", // light gray
    "#e0e0e0"  // soft gray
];

const defaultColor = "#fff9c4";
const StickyNotes = ({

    email,
    userdetails,
    theme,
    open = false,
    setOpen,
}) => {
    const textAreaRef = useRef(null);
    const sidebarRef = useRef(null);
    const noteRef = useRef(null);

    const [notes, setNotes] = useState([]);
    const [openNote, setOpenNote] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [colorMenuVisible, setColorMenuVisible] = useState(false);
    const [selectedNotes, setSelectedNotes] = useState([]);

    // ALL useEffect hooks also stay here
    const darkMode =
        theme === "dark";
    // --------------------------------------------------
    // Load Sticky Notes
    // --------------------------------------------------

    const parsedUserDetails =
        typeof userdetails === "string"
            ? (() => {
                try {
                    return JSON.parse(userdetails);
                } catch {
                    return {};
                }
            })()
            : userdetails || {};
    useEffect(() => {
        if (!email) {
            setNotes([]);
            return;
        }

        const getStickyNotes = async () => {
            try {
                const response = await fetch(
                    `/api/topbar/userdata?email=${encodeURIComponent(email)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch user data: ${response.status}`
                    );
                }

                const result = await response.json();

                const stickyNotes = Array.isArray(
                    result?.data?.stickyNotes
                )
                    ? result.data.stickyNotes
                    : [];

                setNotes(stickyNotes);
            } catch (error) {
                console.error(
                    "Failed to fetch sticky notes:",
                    error
                );

                setNotes([]);
            }
        };

        getStickyNotes();
    }, [email]);

    // --------------------------------------------------
    // Auto Resize Textarea
    // --------------------------------------------------

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height =
                `${textAreaRef.current.scrollHeight}px`;
        }
    }, [openNote]);

    // --------------------------------------------------
    // Close Color Menu On Outside Click
    // --------------------------------------------------

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                !event.target.closest(".floating-color-menu") &&
                !event.target.closest(".floating-color-btn")
            ) {
                setColorMenuVisible(false);
            }
        };

        document.addEventListener(
            "click",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "click",
                handleClickOutside
            );
        };
    }, []);

    // --------------------------------------------------
    // Select / Unselect Note
    // --------------------------------------------------

    const toggleSelect = (id) => {
        setSelectedNotes((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    // --------------------------------------------------
    // Save Notes
    // --------------------------------------------------
    const saveToDB = async (updated) => {
        setNotes(updated);

        if (!email) {
            return;
        }

        try {
            const response = await fetch(
                "/api/topbar/savenote",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        notes: updated,
                    }),
                }
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => ({}));

                throw new Error(
                    errorData?.error ||
                    "Failed to save sticky notes"
                );
            }
        } catch (error) {
            console.error(
                "Failed to save sticky notes:",
                error
            );
        }
    };

    // --------------------------------------------------
    // Bulk Delete
    // --------------------------------------------------

    const deleteMultipleNotes = async () => {
        if (!selectedNotes.length) {
            return;
        }

        try {
            const response = await fetch(
                "/api/topbar/deletenote",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ids: selectedNotes,
                    }),
                }
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => ({}));

                throw new Error(
                    errorData?.error ||
                    "Failed to delete sticky notes"
                );
            }

            const updated = notes.filter(
                (note) =>
                    !selectedNotes.includes(note.id)
            );

            setNotes(updated);
            setSelectedNotes([]);
            setOpenNote(null);

            await saveToDB(updated);
        } catch (error) {
            console.error(
                "Bulk delete failed:",
                error
            );
        }
    };

    // --------------------------------------------------
    // Upload Multiple Files
    // --------------------------------------------------

    const handleMultipleFileUpload = async (
        files,
        details
    ) => {
        if (!files?.length) {
            message.error("No files selected!");
            return [];
        }

        const username =
            parsedUserDetails?.username ||
            parsedUserDetails?.username ||
            "user";

        const uploadDate =
            moment().format("YYYY-MM-DD");

        const uploadedUrls = [];

        for (const file of Array.from(files)) {
            const extension =
                file.name.split(".").pop();

            const uniqueFilename =
                `${uuidv4()}.${extension}`;

            const finalKey =
                `StickyNotes/${username}/${uniqueFilename}`;

            const formData = new FormData();

            formData.append("file", file);
            formData.append(
                "filename",
                finalKey
            );
            formData.append(
                "uploadDate",
                uploadDate
            );

            try {
                const response = await axios.post(
                    "/api/topbar/uploadnotefile",
                    formData,
                    {
                        headers: {
                            Authorization:
                                typeof window !== "undefined"
                                    ? localStorage.getItem(
                                        "token"
                                    )
                                    : "",
                            "X-Username": parsedUserDetails?.username || "",
                        },
                    }
                );

                const imageUrl =
                    response?.data?.imageUrl;

                if (imageUrl) {
                    uploadedUrls.push(imageUrl);
                } else {
                    message.error(
                        `No URL returned for ${file.name}`
                    );
                }
            } catch (error) {
                console.error(
                    `Upload failed for ${file.name}:`,
                    error?.response?.data ||
                    error?.message
                );

                message.error(
                    `Failed to upload ${file.name}`
                );
            }
        }

        return uploadedUrls;
    };

    // --------------------------------------------------
    // Add New Note
    // --------------------------------------------------
    if (!open) {
        return null;
    }
    const addNote = () => {
        const newNote = {
            id: uuidv4(),
            text: "",
            images: [],
            timestamp:
                dayjs().format(
                    "YYYY-MM-DD HH:mm"
                ),
            color: defaultColor,
        };

        const newNotes = [
            ...notes,
            newNote,
        ];

        setNotes(newNotes);
        setOpenNote(newNote);

        saveToDB(newNotes);
    };

    // --------------------------------------------------
    // Update Note Text
    // --------------------------------------------------

    const updateText = (
        id,
        newText
    ) => {
        setOpenNote((prev) => {
            if (!prev || prev.id !== id) {
                return prev;
            }

            return {
                ...prev,
                text: newText,
            };
        });

        const updated = notes.map(
            (note) =>
                note.id === id
                    ? {
                        ...note,
                        text: newText,
                    }
                    : note
        );

        saveToDB(updated);
    };

    // --------------------------------------------------
    // Update Note Color
    // --------------------------------------------------

    const updateColor = (
        id,
        newColor
    ) => {
        setOpenNote((prev) => {
            if (!prev || prev.id !== id) {
                return prev;
            }

            return {
                ...prev,
                color: newColor,
            };
        });

        const updated = notes.map(
            (note) =>
                note.id === id
                    ? {
                        ...note,
                        color: newColor,
                    }
                    : note
        );

        saveToDB(updated);
    };

    // --------------------------------------------------
    // Add Images To Note
    // --------------------------------------------------

    const updateImage = async (
        id,
        files
    ) => {
        const uploadedUrls =
            await handleMultipleFileUpload(
                files,
                parsedUserDetails?.username
            );

        if (!uploadedUrls.length) {
            return;
        }

        setOpenNote((prev) => {
            if (!prev || prev.id !== id) {
                return prev;
            }

            return {
                ...prev,
                images: [
                    ...(prev.images || []),
                    ...uploadedUrls,
                ],
            };
        });

        const updated = notes.map(
            (note) =>
                note.id === id
                    ? {
                        ...note,
                        images: [
                            ...(note.images || []),
                            ...uploadedUrls,
                        ],
                    }
                    : note
        );

        saveToDB(updated);
    };

    // --------------------------------------------------
    // Delete Image
    // --------------------------------------------------

    const deleteImage = (
        noteId,
        imgIndex
    ) => {
        setOpenNote((prev) => {
            if (!prev || prev.id !== noteId) {
                return prev;
            }

            const images = [
                ...(prev.images || []),
            ];

            images.splice(
                imgIndex,
                1
            );

            return {
                ...prev,
                images,
            };
        });

        const updated = notes.map(
            (note) => {
                if (
                    note.id !== noteId
                ) {
                    return note;
                }

                const images = [
                    ...(note.images || []),
                ];

                images.splice(
                    imgIndex,
                    1
                );

                return {
                    ...note,
                    images,
                };
            }
        );

        saveToDB(updated);
    };

    // --------------------------------------------------
    // Delete Note
    // --------------------------------------------------

    const deleteNote = async (id) => {
        try {
            const response = await fetch(
                "/api/topbar/singlenotedelete",
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id,
                    }),
                }
            );

            if (!response.ok) {
                const errorData =
                    await response.json().catch(() => ({}));

                throw new Error(
                    errorData?.error ||
                    "Failed to delete sticky note"
                );
            }

            const updated = notes.filter(
                (note) => note.id !== id
            );

            setNotes(updated);

            if (openNote?.id === id) {
                setOpenNote(null);
            }

            await saveToDB(updated);
        } catch (error) {
            console.error(
                "Delete failed:",
                error
            );
        }
    };

    // --------------------------------------------------
    // Open / Close Note
    // --------------------------------------------------

    const openItem = (note) => {
        console.log("Opening sticky note:", note);

        setOpenNote({
            ...note,
        });

        setColorMenuVisible(false);
    };

    const closeCurrentNote = () => {
        setOpenNote(null);
        setColorMenuVisible(false);
    };

    // --------------------------------------------------
    // Copy Text
    // --------------------------------------------------

    const copyToClipboard = (
        text
    ) => {
        navigator.clipboard
            .writeText(text)
            .then(() => {
                message.open({
                    type: "success",
                    content:
                        "Content copied to clipboard!",
                    className:
                        theme === "dark"
                            ? "dark-message"
                            : "",
                });
            })
            .catch((error) => {
                console.error(
                    "Failed to copy text:",
                    error
                );

                message.open({
                    type: "error",
                    content:
                        `Failed to copy content: ${error?.message ||
                        "Clipboard error"
                        }`,
                    className:
                        theme === "dark"
                            ? "dark-message1"
                            : "",
                });
            });
    };

    // --------------------------------------------------
    // Convert Image To PNG
    // --------------------------------------------------

    const convertToPng = (
        url
    ) => {
        return new Promise(
            (resolve, reject) => {
                const img =
                    new Image();

                img.crossOrigin =
                    "anonymous";

                img.onload = () => {
                    const canvas =
                        document.createElement(
                            "canvas"
                        );

                    canvas.width =
                        img.width;

                    canvas.height =
                        img.height;

                    const context =
                        canvas.getContext(
                            "2d"
                        );

                    context.drawImage(
                        img,
                        0,
                        0
                    );

                    resolve(
                        canvas.toDataURL(
                            "image/png"
                        )
                    );
                };

                img.onerror = () =>
                    reject(
                        new Error(
                            "Load Error"
                        )
                    );

                img.src = url;
            }
        );
    };

    // --------------------------------------------------
    // Copy Note Content
    // --------------------------------------------------

    const copyNoteContent = async (
        note
    ) => {
        try {
            let html =
                `<div>${(
                    note?.text || ""
                ).replace(
                    /\n/g,
                    "<br>"
                )}</div>`;

            if (
                note?.images?.length
            ) {
                for (
                    const url of note.images
                ) {
                    const png =
                        await convertToPng(
                            url
                        );

                    html +=
                        `<img src="${png}" style="max-width:100%; margin-top:8px;" />`;
                }
            }

            await navigator.clipboard.write(
                [
                    new ClipboardItem({
                        "text/html":
                            new Blob(
                                [html],
                                {
                                    type:
                                        "text/html",
                                }
                            ),

                        "text/plain":
                            new Blob(
                                [
                                    note?.text ||
                                    "",
                                ],
                                {
                                    type:
                                        "text/plain",
                                }
                            ),
                    }),
                ]
            );

            message.success(
                "Copied!"
            );
        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );

            message.error(
                "Copy failed!"
            );
        }
    };

    // --------------------------------------------------
    // Filter Notes
    // --------------------------------------------------

    const filteredNotes =
        notes.filter((note) =>
            String(
                note?.text || ""
            )
                .toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );

    // --------------------------------------------------
    // Close Sticky Notes
    // --------------------------------------------------

    const handleCloseStickyNotes = () => {
        setColorMenuVisible(false);
        setOpenNote(null);

        if (typeof setOpen === "function") {
            setOpen(false);
        }
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------


    return (
        <>
            {/* Fullscreen Image Viewer */}
            {selectedImage && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center",
                    justifyContent: "center", zIndex: 100000
                }}>
                    <img src={selectedImage} alt="fullscreen-img" style={{
                        maxWidth: "90%", maxHeight: "90%", borderRadius: "8px"
                    }} />
                    <button onClick={() => setSelectedImage(null)} style={{
                        position: "absolute", top: "20px", right: "20px",
                        background: "none", border: "2px solid #fff", color: "#fff",
                        cursor: "pointer", borderRadius: "4px", fontSize: "18px", padding: "5px 10px"
                    }}>✖</button>
                </div>
            )}

            {/* Sidebar */}
            <Draggable nodeRef={sidebarRef} handle=".sticky-notes-drag-handle">
                <div ref={sidebarRef}
                    className="sticky-notes-sidebar"
                    style={{
                        position: "fixed",
                        right: "50px",
                        top: "100px",
                        width: "350px",
                        minHeight: "340px",
                        maxHeight: "calc(100vh - 120px)",
                        zIndex: 9999,
                        padding: "10px",
                        borderRadius: "8px",
                        background: theme === "dark" ? "#333" : "#fff",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        zIndex: selectedImage ? -1 : 9999,
                        boxSizing: "border-box",
                    }}
                >


                    <div className="sticky-notes-drag-handle" style={{ cursor: "grab", marginBottom: "10px", display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <button onClick={addNote} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}><PlusOutlined style={{
                                color: darkMode ? "#fff" : "#333",
                                cursor: "pointer",
                            }} /></button>
                            <button
                                onClick={deleteMultipleNotes}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    padding: 0
                                }}
                            >
                                <div className={`icon-wrapper ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
                                    <DeleteOutlined className="copy-icon1" />
                                </div>
                            </button>

                        </div>
                        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: theme === 'dark' ? '#fff' : '#000' }}>✖</button>
                    </div>
                    <h3 style={{
                        margin: "0 0 10px 0",
                        color: darkMode ? "#fff" : "#333",

                    }} >Sticky Notes</h3>
                    <input
                        type="text"
                        placeholder="Search..."
                        style={{
                            width: "100%", marginBottom: "10px", padding: "5px",
                            borderRadius: "5px", border: "green", backgroundColor: theme === 'dark' ? '#555' : '#F0F0F0', color: theme === 'dark' ? '#fff' : '#000'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div style={{ overflowY: "auto", maxHeight: "60vh" }}>
                        {notes
                            .filter((n) =>
                                String(n?.text || "")
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase())
                            )
                            .map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => openItem(note)}
                                    style={{
                                        background: note.color || defaultColor,
                                        marginBottom: "5px",
                                        padding: "5px",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        color: "#333",
                                        display: "flex",
                                        alignItems: "center"
                                    }}
                                >
                                    <Checkbox
                                        className="green-checkbox"
                                        checked={selectedNotes?.includes(note.id)}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={() => toggleSelect(note.id)}
                                        style={{ marginRight: "10px" }}
                                    />

                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            width: "100%"
                                        }}
                                    >
                                        <span>
                                            {note?.text?.substring(0, 20) || "New Note"}
                                        </span>

                                        <span
                                            style={{
                                                fontSize: "12px",
                                                color: "gray"
                                            }}
                                        >
                                            {note.timestamp}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </Draggable>

            {/* Floating Note */}
            {openNote && (
                <Draggable
                    nodeRef={noteRef}
                    handle=".sticky-note-drag-handle"
                    cancel=".no-drag"
                    defaultPosition={{ x: 0, y: 0 }}
                >
                    <div ref={noteRef}
                        className="sticky-note-window"
                        style={{
                            position: "fixed",
                            left: "calc(50% - 175px)",
                            top: "120px",
                            width: "350px",
                            minHeight: "250px",
                            maxHeight: "calc(100vh - 140px)",
                            backgroundColor: openNote?.color || defaultColor,
                            borderRadius: "8px",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            zIndex: 10000,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            boxSizing: "border-box",
                        }}
                    >
                        {/* Note Header */}
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", padding: "10px", borderBottom: "1px solid rgba(0,0,0,0.1)", position: "relative"
                        }}>
                            <span style={{ fontSize: "12px", color: "#555" }}>{openNote.timestamp}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div>
                                    <ReusableButton theme={theme} onClick={(e) => {
                                        e.stopPropagation();
                                        // copyToClipboard(openNote.text);
                                        copyNoteContent(openNote);
                                    }}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            marginLeft: '10px'
                                        }}>
                                        <div className={`icon-wrapper ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
                                            <CopyOutlined className="copy-icon" />
                                        </div>

                                    </ReusableButton>
                                </div>
                                <div
                                    className="floating-color-btn"
                                    style={{ cursor: "pointer", fontSize: "18px", color: '#333' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setColorMenuVisible(!colorMenuVisible);
                                    }}
                                >⋯</div>
                                <button onClick={closeCurrentNote} style={{
                                    background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: '#000'
                                }}>✖</button>
                            </div>

                            {colorMenuVisible && (
                                <div className="floating-color-menu" style={{
                                    position: "absolute", top: "38px", right: "35px",
                                    background: "#fff", border: "1px solid #ccc", borderRadius: "6px",
                                    display: "flex", gap: "4px", padding: "6px", zIndex: 9999
                                }}>
                                    {colorOptions.map((clr, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => {
                                                updateColor(openNote.id, clr);
                                                setColorMenuVisible(false);
                                            }}
                                            style={{
                                                width: "20px", height: "20px", borderRadius: "4px",
                                                backgroundColor: clr,
                                                border: clr === openNote.color ? "2px solid black" : "1px solid #ccc",
                                                cursor: "pointer"
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Note Body */}
                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "10px",
                        }}>
                            <textarea
                                className="no-drag"
                                ref={textAreaRef}
                                value={openNote.text}
                                onChange={(e) => updateText(openNote.id, e.target.value)}
                                placeholder="Take a note..."
                                onInput={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = `${e.target.scrollHeight}px`;
                                }}
                                style={{
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    resize: "none",
                                    fontSize: "14px",
                                    color: "#000",
                                    overflow: "hidden", // ⬅️ Important: disables inner scroll
                                }}
                            />
                            {openNote.images?.map((imgSrc, idx) => (
                                <div key={idx} style={{ position: "relative", marginBottom: "6px" }}>
                                    <img
                                        src={imgSrc}
                                        alt={`note-img-${idx}`}
                                        onClick={() => setSelectedImage(imgSrc)}
                                        style={{
                                            width: "100%", maxHeight: "80px", objectFit: "cover",
                                            borderRadius: "4px", cursor: "pointer"
                                        }}
                                    />
                                    <button
                                        onClick={() => deleteImage(openNote.id, idx)}
                                        style={{
                                            position: "absolute", top: "4px", right: "4px",
                                            background: "rgba(255,0,0,0.7)", border: "none", color: "#fff",
                                            cursor: "pointer", borderRadius: "50%", width: "20px", height: "20px",
                                            fontSize: "12px", lineHeight: "20px", textAlign: "center"
                                        }}
                                    >×</button>
                                </div>
                            ))}
                        </div>

                        {/* Note Footer */}
                        <div style={{
                            display: "flex", justifyContent: "flex-end", alignItems: "center",
                            padding: "10px", borderTop: "1px solid rgba(0,0,0,0.1)"
                        }}>
                            <label title="Insert image" style={{ background: "none", border: "none", cursor: "pointer" }}>

                                <div className={`icon-wrapper ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
                                    <PictureOutlined className="copy-icon" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        style={{ display: "none" }}
                                        onChange={(e) => updateImage(openNote.id, e.target.files)}
                                    />
                                </div>
                            </label>
                            <button
                                title="Delete Note"
                                style={{
                                    background: "none", border: "none", cursor: "pointer",
                                    color: "red", marginLeft: "10px"

                                }}
                                onClick={() => deleteNote(openNote.id)}
                            >
                                <div className={`icon-wrapper ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
                                    <DeleteOutlined className="copy-icon1" />
                                </div>
                            </button>
                        </div>
                    </div>
                </Draggable>

            )}
        </>
    );
};

export default StickyNotes;