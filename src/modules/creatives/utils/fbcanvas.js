// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import {
//     TABS,
//     TOOLS,
// } from "react-filerobot-image-editor";

// const DynamicFilerobotImageEditor = dynamic(
//     () => import("react-filerobot-image-editor"),
//     {
//         ssr: false,
//     }
// );

// export default function FabricCanvas({
//     fileId,
//     initialImage = "",
//     closeCanvasModal,
//     onSaveEditedImage,
// }) {
//     const [isImgEditorShown, setIsImgEditorShown] = useState(false);
//     const [imageSource, setImageSource] =
//         useState(initialImage);

//     useEffect(() => {
//         setImageSource(initialImage);
//     }, [initialImage]);

//     useEffect(() => {
//         setIsImgEditorShown(Boolean(imageSource));
//     }, [imageSource]);

//     const closeImgEditor = () => {
//         setIsImgEditorShown(false);
//         setImageSource("");
//         closeCanvasModal?.();
//     };

//     const handleSave = (editedImageObject) => {
//         onSaveEditedImage?.(
//             fileId,
//             editedImageObject
//         );

//         closeImgEditor();
//     };

//     return (
//         <>
//             {isImgEditorShown && imageSource && (
//                 <div
//                     style={{
//                         width: "80vw",
//                         height: "90vh",
//                         position: "fixed",
//                         top: "5vh",
//                         left: "5vw",
//                         zIndex: 1000,
//                     }}
//                 >
//                     <DynamicFilerobotImageEditor
//                         source={imageSource}
//                         onSave={handleSave}
//                         onClose={closeImgEditor}
//                         annotationsCommon={{
//                             fill: "#ff0000",
//                         }}
//                         tabsIds={[
//                             TABS.ADJUST,
//                             TABS.FINETUNE,
//                             TABS.FILTERS,
//                             TABS.WATERMARK,
//                             TABS.ANNOTATE,
//                             TABS.RESIZE,
//                         ]}
//                         defaultTabId={TABS.ADJUST}
//                         toolsIds={[
//                             TOOLS.RESIZE,
//                             TOOLS.CROP,
//                             TOOLS.DRAW,
//                             TOOLS.FILTERS,
//                             TOOLS.TEXT,
//                             TOOLS.WATERMARK,
//                         ]}
//                     />
//                 </div>
//             )}
//         </>
//     );
// }

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
    TABS,
    TOOLS,
} from "react-filerobot-image-editor";

const DynamicFilerobotImageEditor = dynamic(
    () => import("react-filerobot-image-editor"),
    {
        ssr: false,
    }
);

export default function FabricCanvas({
    fileId,
    initialImage = "",
    closeCanvasModal,
    onSaveEditedImage,
    theme
}) {
    const [isImgEditorShown, setIsImgEditorShown] = useState(false);
    const [imageSource, setImageSource] =
        useState(initialImage);

    useEffect(() => {
        setImageSource(initialImage);
    }, [initialImage]);

    useEffect(() => {
        setIsImgEditorShown(Boolean(imageSource));
    }, [imageSource]);

    const closeImgEditor = () => {
        setIsImgEditorShown(false);
        setImageSource("");
        closeCanvasModal?.();
    };

    const handleSave = (editedImageObject) => {
        onSaveEditedImage?.(
            fileId,
            editedImageObject
        );

        closeImgEditor();
    };
    

    const editorTheme = {
        palette: {
            "bg-secondary": theme
                ? "#ff0000"
                : "#ffffff",

            "bg-primary": theme
                ? "#00ff00"
                : "#f5f5f5",

            "bg-primary-active": theme
                ? "#0000ff"
                : "#e8eaf0",

            "accent-primary": "#91c25f",
            "accent-primary-active": "#91c25f",

            "icons-primary": theme
                ? "#ffffff"
                : "#252525",

            "icons-secondary": theme
                ? "#ffffff"
                : "#666666",

            "borders-secondary": theme
                ? "#ff00ff"
                : "#dedede",

            "borders-primary": theme
                ? "#00ffff"
                : "#cccccc",

            "borders-strong": theme
                ? "#ffff00"
                : "#aaaaaa",

            "light-shadow": "rgba(0, 0, 0, 0.4)",

            "warning": "#f59e0b",
        },

        typography: {
            fontFamily: "Inter, Arial, sans-serif",
        },
    };
    return (
        <>
            {isImgEditorShown && imageSource && (
                <div
                    style={{
                        width: "70vw",
                        height: "82vh",
                        position: "fixed",
                        top: "9vh",
                        left: "15vw",
                        zIndex: 1000,
                    }}

                >
                    <DynamicFilerobotImageEditor
                        source={imageSource}
                        onSave={handleSave}
                        onClose={closeImgEditor}
                        annotationsCommon={{
                            fill: "#ff0000",
                        }}
                        theme={{ editorTheme }}

                        tabsIds={[
                            TABS.ADJUST,
                            TABS.FINETUNE,
                            TABS.FILTERS,
                            TABS.WATERMARK,
                            TABS.ANNOTATE,
                            TABS.RESIZE,
                        ]}
                        defaultTabId={TABS.ADJUST}
                        toolsIds={[
                            TOOLS.RESIZE,
                            TOOLS.CROP,
                            TOOLS.DRAW,
                            TOOLS.FILTERS,
                            TOOLS.TEXT,
                            TOOLS.WATERMARK,
                        ]}
                    />
                </div>
            )}
        </>
    );
}