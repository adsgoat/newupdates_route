"use client";


import dynamic from "next/dynamic";
import { useRef } from "react";

const UpdatesComponent = dynamic(
    () => import("./updateui"),
    {
        ssr: false,
        loading: () => <p></p>,
    }
);
const UpdatesTab = ({ theme,uploadRef ,email}) => {
    return (

        <UpdatesComponent theme={theme} ref={uploadRef} isLoading={false} email={email} />

    );
};

export default UpdatesTab;