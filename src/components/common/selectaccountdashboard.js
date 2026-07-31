import { Select } from 'antd';
export default function SelectAccountsDashboard({ handleSearchChange, renderInnerSelects, theme }) {
    return (
        <Select
            mode="multiple"
            size="small"
            // showSearch
            // onSearch={handleSearchChange}  // Update searchValue dynamically
            showSearch={{
                onSearch: handleSearchChange,
            }}
            style={{
                width: '100%', fontSize: '12px', minHeight: '23px',
                background: theme === "dark" ? "#333" : "#fff",
                color: theme === "dark" ? "#fff" : "#333",
            }}
            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select margin-bottom-items`}
            placeholder="Select Accounts"
            // dropdownClassName={theme === 'dark' && 'custom-dropdown'}
            classNames={{
                popup: {
                    root: theme === 'dark' ? 'custom-dropdown' : ''
                }
            }}
            value={[]} // This should be updated to reflect selectedItems based on the selected categories
            popupRender={() => (
                <div className={theme === "dark" ? "dark-scrollbar" : ""} style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px' }}>
                    {renderInnerSelects(theme)}
                </div>
            )}
        />
    )
}