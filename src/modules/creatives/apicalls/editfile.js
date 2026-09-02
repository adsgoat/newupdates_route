export default function useEditFile({
    setSelectedImage,
    setIsEditorVisible,
}) {
    const handleEditFile = (image) => {
        if (!image || !image.url) {
            console.error(
                "Invalid image selected for editing."
            );
            return;
        }

        console.log(
            "Edit image:",
            image
        );

        setSelectedImage(image);
        setIsEditorVisible(true);
    };

    return {
        handleEditFile,
    };
}