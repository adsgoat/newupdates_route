import { Button } from 'antd';
export default function SubmitButton({ height, width, text, textSize, onClick, icon, confirmLoading ,type}) {
    return (
        <Button
            type="default"
            icon={icon}
            // icon={<ReloadOutlined className='black-icon' />}
            style={{ type: "default", fontSize: textSize, backgroundColor: '#91C25F', ...(height ? { height: height } : {}), ...(width ? { width: width } : {}) }}
            // onClick={refreshUsers}  // Call refresh function when clicked
            onClick={onClick}
            loading={confirmLoading}
           
        >
            {text}
        </Button>
    )
}