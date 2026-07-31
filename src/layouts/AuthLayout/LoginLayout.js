"use client";

import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import Image from "next/image";
import { Layout, Avatar, Dropdown, Button, Switch, Spin, Form, Input, Divider, Modal, Badge, Card, Upload, notification, Drawer, Menu, Typography } from "antd";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    BellFilled, EyeOutlined, GoogleOutlined, LockOutlined, PlusOutlined, UserOutlined, UploadOutlined, CalculatorOutlined,
    DoubleRightOutlined,
    DoubleLeftOutlined,
    BellOutlined, SoundOutlined, AudioMutedOutlined
} from '@ant-design/icons';
import ContactForm from "../../services/emailService"
const LoginPage = ({
    callbackUrl,
    isValidUser
}) => {
    const [loginError, setLoginError] = useState(false);
    // const [isInvalidUser, setInvalidUser] = useState(false);
    const [open, setOpen] = useState(false);
    // const { data: session, status } = useSession();

    // console.log(session);
    // console.log(status);

    // useEffect(() => {
    //     if (isValidUser) {
    //         setInvalidUser(isValidUser)
    //     }
    // }, [isValidUser])

    // useEffect(() => {
    //     const channel = new BroadcastChannel("auth");

    //     channel.onmessage = (event) => {
    //         if (event.data.type === "INVALID_USER") {
    //             window.location.reload();
    //         }
    //     };

    //     return () => {
    //         channel.close();
    //     };
    // }, []);
    // const handleGoogleSignIn = () => {
    //     signIn('google'); // Use Next-auth for Google sign-in
    // };
    const handleGoogleSignIn = async () => {
        // signIn('google', {
        //     callbackUrl
        // });
        signIn('keycloak', {
            callbackUrl
        });
        // const result = await signIn("google", {
        //     callbackUrl,
        //     redirect: false,
        // });

        // console.log(result);
    };
    // const handleGoogleSignIn = async () => {
    //     console.log("Before signIn");

    //     const result = await signIn("google", {
    //         callbackUrl,
    //         redirect: false,
    //     });

    //     console.log("After signIn");
    //     console.log(result);
    // };
    return (
        <div
            style={{
                background: "#edfaf3",
                height: "100vh",
                overflow: "hidden",
                position: "relative",
                display: 'flex',
                padding: '20px',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <img
                    src="/robot.png"
                    alt="Robot"
                    style={{
                        width: '100%',
                        height: '100%',
                        marginTop: '80px',
                        marginLeft: '40px',
                        objectFit: 'contain',
                    }}
                />
            </div>
            {isValidUser ?
                (
                    // <div >
                    //     <Button
                    //         onClick={handleGoogleSignIn}
                    //         style={{
                    //             width: '100%',
                    //             backgroundColor: '#FFFFFF',
                    //             border: '1px solid #E0E0E0',
                    //             marginTop: '15px',
                    //             height: '36px',
                    //             fontWeight: 500,
                    //             fontSize: '14px',
                    //             display: 'flex',
                    //             alignItems: 'center',
                    //             justifyContent: 'center',
                    //             gap: '8px',
                    //         }}
                    //     >
                    //         <img src="/google-logo.png" alt="Google" style={{ width: '18px', height: '18px' }} />
                    //         Continue with Google
                    //     </Button>
                    //     <h3 style={{ fontSize: '14px', color: 'red' }}>You are not Authorized</h3>
                    //     <ContactForm />

                    // </div>

                    <div
                        style={{
                            maxWidth: '320px',
                            margin: '40px auto',
                            padding: '32px',
                        }}
                    >
                        <Button
                            onClick={handleGoogleSignIn}
                            style={{
                                width: '100%',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E0E0E0',
                                height: '48px',
                                fontWeight: 500,
                                fontSize: '15px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                            }}
                        >
                            <img
                                src="/google-logo.png"
                                alt="Google"
                                style={{ width: '18px', height: '18px' }}
                            />
                            Continue with Google
                        </Button>
                        <p style={{textAlign:"center"}}>or</p>
                        <Card
                            style={{
                                marginTop: '24px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                            }}
                        >
                            <div style={{ fontSize: '30px' }}>🔒</div>

                            <Typography.Title level={5}>
                                Access Request Required
                            </Typography.Title>

                            <Typography.Text type="secondary" style={{fontSize:"13px"}}>
                                Your Google account is authenticated but not authorized
                                to access AdsGoat.
                            </Typography.Text>

                            <div style={{ marginTop: '24px' }}>
                                <Button
                                    type="primary"
                                    style={{backgroundColor:"#5aa47f", fontSize:"12px", height:"32px"}}
                                    size="large"
                                    onClick={() => setOpen(true)}
                                >
                                    Request Access
                                </Button>
                            </div>
                        </Card>

                        <Modal
                            open={open}
                            footer={null}
                            centered
                            onCancel={() => setOpen(false)}
                            width={360}
                            // width={700}
                        >
                            <ContactForm />
                        </Modal>
                    </div>
                )
                :
                (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxWidth: '500px',
                            height: '100%',
                        }}
                    >
                        <div
                            style={{
                                width: '100%',
                                maxWidth: '340px',
                                padding: '16px',
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                                boxSizing: 'border-box',
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                <h2 style={{ margin: '10px', color: '#1B1F23', fontSize: '18px' }}>Welcome Back</h2>
                                <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '10px' }}>
                                    Sign in to your Vyaktimetrics dashboard
                                </p>
                            </div>
                            <Button
                                onClick={handleGoogleSignIn}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#FFFFFF',
                                    border: '1px solid #E0E0E0',
                                    marginTop: '15px',
                                    height: '36px',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                }}
                            >
                                <img src="/google-logo.png" alt="Google" style={{ width: '18px', height: '18px' }} />
                                Continue with Google
                            </Button>

                            <Divider style={{ margin: '12px 0', color: '#9CA3AF' }}>or</Divider>

                            <Form name="login_form"
                                // onFinish={onFinish}
                                layout="vertical" requiredMark={false}>
                                <Form.Item
                                    label="Email"
                                    name="username"
                                    style={{ marginBottom: '12px' }}
                                    rules={[{ required: true, message: 'Please input your email!' }]}
                                >
                                    <Input
                                        prefix={<UserOutlined />}
                                        placeholder="Enter your email"
                                        style={{ padding: '8px', fontSize: '14px', borderColor: '#E0E0E0' }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Password"
                                    name="password"
                                    style={{ marginBottom: '10px' }}
                                    rules={[{ required: true, message: 'Please input your password!' }]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined />}
                                        placeholder="Enter your password"
                                        style={{ padding: '8px', fontSize: '14px', borderColor: '#E0E0E0' }}
                                    />
                                </Form.Item>

                                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                                    <a style={{ color: '#4CAF50', fontSize: '12px', cursor: 'text', }}>
                                        Forgot password?
                                    </a>
                                </div>

                                <Form.Item style={{ marginBottom: '0' }}>
                                    <Button
                                        htmlType="submit"
                                        onClick={() => setLoginError(true)}
                                        style={{
                                            width: '100%',
                                            backgroundColor: '#4CAF50',
                                            borderColor: '#4CAF50',
                                            height: '36px',
                                            fontWeight: 'bold',
                                            //  cursor: 'not-allowed',
                                            transition: 'none',
                                            // pointerEvents: 'none',
                                        }}

                                    >
                                        Sign In
                                    </Button>
                                </Form.Item>
                                {loginError && (
                                    <div
                                        style={{
                                            marginTop: 6,
                                            color: "#ff4d4f",
                                            fontSize: 12,
                                            textAlign: "center",
                                        }}
                                    >
                                        Login with Google if permitted. Otherwise, contact your admin.
                                    </div>
                                )}

                            </Form>

                            <div style={{ textAlign: 'center', fontSize: '13px', marginTop: '18px' }}>
                                Don’t have an account?{' '}
                                <a style={{ color: '#4CAF50', cursor: 'text' }}>
                                    Contact your administrator
                                </a>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: '10px',
                                textAlign: 'center',
                                fontSize: '13px',
                                color: '#1B1F23',
                            }}
                        >
                            Secure enterprise-grade authentication
                        </div>
                    </div>
                )
            }

            <img
                src="/logolight.png"
                alt="Logo"
                style={{
                    position: 'absolute',
                    top: '-50px',
                    left: '10px',
                    width: '180px',
                    height: 'auto',
                }}
            />
        </div>
    )
}
export default LoginPage;