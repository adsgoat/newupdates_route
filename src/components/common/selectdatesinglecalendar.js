// "use client"
import { ConfigProvider, DatePicker, Button } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
const { RangePicker } = DatePicker;
import locale from 'antd/es/date-picker/locale/en_US';
export default function SelectDateSingleCalendarDashboard({ rangePresets, selectedDates, handleChangeDates, isPickerOpen, handleOpenChange, setIsPickerOpen, disabledDate, onClickCloseButton, handleSubmit, theme }) {
    return (
        <ConfigProvider
            locale={locale}
            theme={{
                token: {
                    colorPrimary: '#C7F39A',
                    colorTextLightSolid: '#000',
                },
            }}
        >
            <RangePicker
                size="small"
                presets={rangePresets}
                value={selectedDates}
                onCalendarChange={handleChangeDates}
                open={isPickerOpen} // Control the open/close state
                onOpenChange={handleOpenChange} // Handle outside click
                onClick={() => setIsPickerOpen(true)} // Open the picker when clicked
                disabledDate={disabledDate}
                format="YYYY-MM-DD"
                // dropdownClassName={`custom-single-month-picker Dashboard-Details-2 ${theme === 'dark' ? 'dark-theme-dropdown' : ''}`}
                classNames={{
                    popup: {
                        root: `custom-single-month-picker Dashboard-Details-2 ${theme === 'dark' ? 'dark-theme-dropdown' : ''}`
                    }
                }}
                style={{
                    width: '100%',
                    backgroundColor: theme === 'dark' ? '#555' : undefined,
                    color: theme === 'dark' ? 'white' : undefined,
                    fontSize: '12px',
                    minHeight: '23px',
                }}
                renderExtraFooter={() => (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px' }}>
                        <Button
                            className='custom-button'
                            style={{ height: "22px", fontSize: "10px", marginRight: '8px', border: ' 1px solid #4caf50', backgroundColor: 'transparent', color: theme === "dark" ? "#fff" : "#333" }} // Adds spacing between buttons
                            onClick={onClickCloseButton} // Close the picker
                        >
                            Close
                        </Button>
                        <Button
                            className='custom-button1'
                            style={{ height: "22px", fontSize: "10px", backgroundColor: '#91C25F', border: ' 1px solid #4caf50' }}
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </div>
                )}
            />
        </ConfigProvider>
    )
}
