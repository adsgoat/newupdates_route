// "use client"
import { Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
export default function ReloadButton({ refreshUsers, height, width, loading ,onClick}) {
    return (
        <Button
            type="default"
            icon={<ReloadOutlined className='black-icon' />}
            style={{ float: "right", marginLeft: "10px", backgroundColor: '#91C25F', ...(height ? { height: height } : {}), ...(width ? { width: width } : {}) }}
            // onClick={refreshUsers}  // Call refresh function when clicked
            onClick={onClick}
            loading={loading}
        >
        </Button>
    )
}