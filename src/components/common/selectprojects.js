// "use client"
import { Select } from 'antd';
import { CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
export default function SelectProjects({ firstSelectValues, handleFirstSelectChange, transformedData, networksWithStatus, theme, route }) {
    return (
        <Select
            mode={ route === "dashboard" ? "tags" : undefined }
            size="small"
            showSearch
            style={{ width: '100%', minHeight: '23px', fontSize: '12px', background: theme === "dark" ? "#333" : "#fff", color: theme === "dark" ? "#fff" : "#333", }}
            className={`${theme === 'dark' ? 'dark-theme' : 'light-theme'} green-border-select margin-bottom-items`}
            placeholder="Select Projects"
            value={firstSelectValues}
            onChange={handleFirstSelectChange}
            maxTagCount="responsive"
            classNames={{
                popup: {
                    root: `${theme === 'dark' ? 'custom-dropdown' : ''} compact-dropdown`
                }
            }}
            popupRender={(menu) => (
                <div
                    style={{ width: '100%', maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {menu}
                </div>
            )}
            optionRender={(option) => {
                const category = option.data.value;

                const isActive = networksWithStatus.find((n) => n.Network === category)?.Status === 'Active';

                return (
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px', }}
                    >
                        {isActive ?
                            (<CheckCircleFilled style={{ color: '#91C25F', fontSize: 12, }} className="black-icon-active-1" />)
                            :
                            (<CloseCircleFilled style={{ color: '#EC7117', fontSize: 12, }} className="black-icon-pause-1" />)
                        }
                        <span style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px', }}>
                            {category}
                        </span>
                    </div>
                );
            }}
            options={Object.keys(transformedData || {})
                .sort((a, b) => {
                    const aActive = networksWithStatus.find(n => n.Network === a)?.Status === 'Active' ? 1 : 0;
                    const bActive = networksWithStatus.find(n => n.Network === b)?.Status === 'Active' ? 1 : 0;
                    return bActive - aActive; // Active first
                })
                .map(category => {
                    const isActive = networksWithStatus.find(n => n.Network === category)?.Status === 'Active';
                    return {
                        value: category,
                        label: (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: '15px', fontSize: '12px', lineHeight: 1 }}>
                                {isActive ?
                                    (<CheckCircleFilled style={{ color: '#91C25F', fontSize: 12 }} className="black-icon-active-1" />)
                                    :
                                    (<CloseCircleFilled style={{ color: '#EC7117', fontSize: 12 }} className="black-icon-pause-1" />)
                                }

                                <span style={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px' }}>
                                    {category}
                                </span>
                            </div>
                        )
                    };
                })
            }
        />
    )
}