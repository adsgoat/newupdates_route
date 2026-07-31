import { Skeleton } from "antd";

export default function GridLoading({ theme }) {
    return (
        <div
            style={{
                height: "100%",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: theme === "dark" ? "#000" : "#e6e6e6",
            }}
        >
            <Skeleton
                className={theme === "dark" ? "dark-skeleton" : ""}
                active
                // style={{ width: "95%" }}
                paragraph={{
                    rows: 7,
                }}
            />
        </div>
    );
}