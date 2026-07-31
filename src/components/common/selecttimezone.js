// "use client"
import { Select } from 'antd';
export default function SelectTimezone({ onChangeTime, timezones, time, theme }) {
    return (
        <Select
            showSearch
            size="small"
            onChange={onChangeTime}
            style={{
                width: '100%',
                minHeight: '23px',
                // height:"100%",
                fontSize: '12px',
                background: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
            }}
            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select`}
            placeholder="Select timezone"
            // dropdownClassName={theme === 'dark' && "custom-dropdown"}
            classNames={{
                popup: {
                    // root: theme === 'dark' ? 'custom-dropdown' : ''
                    root: `${theme === 'dark' ? 'custom-dropdown' : ''} compact-dropdown`
                }
            }}
            optionFilterProp="label"
            // showSearch={{
            //     optionFilterProp: "label",
            //     // onSearch: handleSearchChange,
            // }}
            value={time}
            options={timezones.map((item) => ({
                value: item,
                label: item,
                title: ''
            }))}
        />
    )
}