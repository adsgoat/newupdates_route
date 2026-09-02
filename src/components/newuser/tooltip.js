import { Tooltip } from "antd";

export default function ReusableTooltip({
    title,
    children,
    theme
}) {
    return (
        <Tooltip title={title} overlayInnerStyle={{
            backgroundColor: theme === 'dark' ? '#111' : '#fff',
            color: theme === 'dark' ? '#fff' : '#000',
            border: '1px solid #ccc',
            borderRadius: 6,
            // fontWeight: 500,
        }}>
            {children}
        </Tooltip>
    );
}