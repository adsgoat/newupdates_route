"use client";

import React from "react";
import { Skeleton } from "antd";

export default function ReusableSkeleton({
    active = true,
    rows = 10,
    loading = true,
}) {
    if (!loading) {
        return null;
    }

    return (
        <Skeleton
            active={active}
            paragraph={{
                rows: rows,
            }}
        />
    );
}