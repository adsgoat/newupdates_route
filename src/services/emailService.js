import { Modal, Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import emailjs from 'emailjs-com';
// import { Height } from '@mui/icons-material';

// Initialize EmailJS outside the component
emailjs.init('YuvB6pBrVHNld_VA2');

const ContactForm = () => {
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const params = {
                form_name: values.name,
                email_id: values.email,
                phoneInput: values.phone,
                subjectInput: values.subject,
                message: values.message,
            };
            await emailjs.send('service_d2zvko7', 'template_u3yhnqf', params);
            message.success('Email sent successfully!');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Failed to send email:', error);
            message.error('Failed to send email. Please try again later.');
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <>
            {/* <Button style={{backgroundColor:'#4caf50',color:'#000',border:'2px solid #4caf50',fontSize:'13px',width:'60%',fontWeight:'600'}} onClick={showModal}>
                Contact Administration
            </Button> */}
            {/* <Modal
                title="Add details"
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={450} 
            > */}

            <div
                style=
                {{
                    backgroundColor: '#FFFFFF',
                    padding: '15px',
                    // width: '320px',
                    width:"100%",
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                    marginRight:'50px'

                }}>
                   <div>
                     <h4 style={{fontSize:'16px',textAlign:'center',marginBottom:"15px"}}>Add Details</h4>
                   </div>
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                        style={{ marginTop: '-20px' }}
                    >

                        <Input style={{ marginTop: '-17px',height:'30%' }}  placeholder="Enter your name" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' },
                        ]}
                        style={{ marginTop: '-20px' }}
                    >
                        <Input style={{ marginTop: '-17px' ,height:'30%'}}  placeholder="Enter your email" />
                    </Form.Item>

                    <Form.Item
                        label="Phone Num"
                        name="phone"
                        rules={[{ required: true, message: 'Please enter your phone number' }]}
                        style={{ marginTop: '-20px' }}
                    >
                        <Input style={{ marginTop: '-17px',height:'30%' }}  type="number" placeholder="Enter your phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Subject"
                        name="subject"
                        rules={[{ required: true, message: 'Please enter the subject' }]}
                        style={{ marginTop: '-20px' }}
                    >
                        <Input style={{ marginTop: '-17px',height:'30%' }}  placeholder="Enter the subject" />
                    </Form.Item>

                    <Form.Item
                        label="Message"
                        name="message"
                        rules={[{ required: true, message: 'Please enter your message' }]}
                        style={{ marginTop: '-20px' }}
                    >
                        <Input.TextArea rows={2} style={{ marginTop: '-15x' }}  placeholder="Enter your message" />
                    </Form.Item>
                    <div style={{display:'flex',justifyContent:'flex-end',marginTop:'-15px'}} 
                    >
                        <div style={{marginRight:'10px'}}  onClick={handleCancel}><Button>Cancel</Button></div>
                        <div ><Button style={{backgroundColor:'#91C25F',border:'1px solid #4caf50'}}  onClick={handleOk}>Ok</Button></div>
                    </div>
                </Form>
            </div>
            {/* </Modal> */}
        </>
    );
};
// 


export default ContactForm;