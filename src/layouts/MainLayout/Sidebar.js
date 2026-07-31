"use client"
import Link from "next/link";
import { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { ROUTES } from "../../config/routes";
import { Layout, Menu, Button, theme, message, Spin, Skeleton } from 'antd';
const { Content, Sider } = Layout;
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
    HomeOutlined,
    PieChartOutlined,
    DesktopOutlined,
    ContainerOutlined,
    SettingOutlined,
    LockOutlined,
    LogoutOutlined,
    DoubleRightOutlined,
    DoubleLeftOutlined,
    DatabaseOutlined,
    UserOutlined,
    LaptopOutlined,
    DashboardOutlined,
    BarChartOutlined,
    PictureOutlined,
    LineChartOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
const navItems = [
    ["Dashboard", ROUTES.dashboard],
    ["Reports", ROUTES.reports],
    ["Campaigns", ROUTES.campaigns],
    ["Creatives", ROUTES.creatives],
    ["User Role", ROUTES.userRole],
    ["User History", ROUTES.userHistory],
];

function getItem(label, key, icon, text) {
    return {
        key,
        icon,
        label,
        text
    };
}

export default function Sidebar({ role, userPermissions }) {
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const pathname = usePathname();
    const [usersDataForLogin, setusersDataForLogin] = [{ role: 'Admin', email: "praveen@adsoat.in" }]
    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    };
    const handleMenuItemClick = (key) => {
        router.push(key);
    };
    // const menuItems = [
    //     usersDataForLogin[0]?.role !== 'Network_Partner' && usersDataForLogin[0]?.email !== "careers@adsgoat.in" && getItem('Dashboard', '/Dashboard', <AppstoreOutlined className={pathname === '/Dashboard' && 'black-icon'} />, 'Dashboard'),
    //     usersDataForLogin[0]?.role !== 'Network_Partner' && usersDataForLogin[0]?.email !== "careers@adsgoat.in" && usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Reports', '/Reports', <BarChartOutlined className={pathname === '/Reports' && 'black-icon'} />, 'Reports'),
    //     usersDataForLogin[0]?.role !== 'Network_Partner' && usersDataForLogin[0]?.email !== "careers@adsgoat.in" && usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Creatives', '/Creatives', <PictureOutlined className={pathname === '/Creatives' && 'black-icon'} />, 'Creatives'),
    //     usersDataForLogin[0]?.role !== 'Revenue_Partner' && getItem('Campaigns', '/Campaigns', <LineChartOutlined className={pathname === '/Campaigns' && 'black-icon'} />, 'Campaigns'),
    //     // getItem('Users', '/Users', <ContainerOutlined />),
    //     usersDataForLogin[0]?.role !== 'Network_Partner' && usersDataForLogin[0]?.email !== "careers@adsgoat.in" && (usersDataForLogin[0]?.role === 'Admin' || usersDataForLogin[0]?.role === 'Special_User') && getItem('User Role', '/NewUser', <UserOutlined className={pathname === '/NewUser' && 'black-icon'} />, 'NewUser'),
    //     usersDataForLogin[0]?.role !== 'Network_Partner' && usersDataForLogin[0]?.email !== "careers@adsgoat.in" && usersDataForLogin[0]?.role === 'Admin' && getItem('User History', '/Activities', <LaptopOutlined className={pathname === '/Activities' && 'black-icon'} />, 'Activities'),
    // ].filter(Boolean);
    // const menuItems = [
    //     getItem('Dashboard', '/dashboard', <AppstoreOutlined style={{ fontSize: "12px" }} className={pathname === '/dashboard' && 'black-icon'} />, 'dashboard'),
    //     getItem('Reports', '/reports', <BarChartOutlined style={{ fontSize: "12px" }} className={pathname === '/reports' && 'black-icon'} />, 'reports'),
    //     getItem('Creatives', '/Creatives', <PictureOutlined style={{ fontSize: "12px" }} className={pathname === '/Creatives' && 'black-icon'} />, 'Creatives'),
    //     getItem('Campaigns', '/Campaigns', <LineChartOutlined style={{ fontSize: "12px" }} className={pathname === '/Campaigns' && 'black-icon'} />, 'Campaigns'),
    //     getItem('User Role', '/NewUser', <UserOutlined style={{ fontSize: "12px" }} className={pathname === '/NewUser' && 'black-icon'} />, 'NewUser'),
    //     getItem('User History', '/Activities', <LaptopOutlined style={{ fontSize: "12px" }} className={pathname === '/Activities' && 'black-icon'} />, 'Activities'),
    // ].filter(Boolean);
    // const menuItems = [
    //     role !== 'Network_Partner' && getItem('Dashboard', '/dashboard', <AppstoreOutlined className={pathname === '/dashboard' && 'black-icon'} style={{ fontSize: "12px" }} />, 'dashboard'),
    //     role !== 'Network_Partner' && role !== 'Revenue_Partner' && getItem('Reports', '/reports', <BarChartOutlined className={pathname === '/reports' && 'black-icon'} style={{ fontSize: "12px" }} />, 'reports'),
    //     role !== 'Network_Partner' && role !== 'Revenue_Partner' && getItem('Creatives', '/Creatives', <PictureOutlined className={pathname === '/creatives' && 'black-icon'} style={{ fontSize: "12px" }} />, 'creatives'),
    //     role !== 'Revenue_Partner' && getItem('Campaigns', '/Campaigns', <LineChartOutlined className={pathname === '/campaigns' && 'black-icon'} style={{ fontSize: "12px" }} />, 'campaigns'),
    //     // getItem('Users', '/Users', <ContainerOutlined />),
    //     role !== 'Network_Partner' && (role === 'Admin' || role === 'Special_User') && getItem('User Role', '/NewUser', <UserOutlined className={pathname === '/newuser' && 'black-icon'} style={{ fontSize: "12px" }} />, 'newuser'),
    //     role !== 'Network_Partner' && role === 'Admin' && getItem('User History', '/Activities', <LaptopOutlined className={pathname === '/activities' && 'black-icon'} style={{ fontSize: "12px" }} />, 'activities'),
    // ].filter(Boolean);
    const menuItems = [
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "dashboard"))?.dashboard?.allowed && getItem('Dashboard', '/dashboard', <AppstoreOutlined className={pathname === '/dashboard' && 'black-icon'} style={{ fontSize: "12px" }} />, 'dashboard'),
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "reports"))?.reports?.allowed && getItem('Reports', '/reports', <BarChartOutlined className={pathname === '/reports' && 'black-icon'} style={{ fontSize: "12px" }} />, 'reports'),
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "creatives"))?.creatives?.allowed && getItem('Creatives', '/Creatives', <PictureOutlined className={pathname === '/creatives' && 'black-icon'} style={{ fontSize: "12px" }} />, 'creatives'),
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "campaigns"))?.campaigns?.allowed && getItem('Campaigns', '/Campaigns', <LineChartOutlined className={pathname === '/campaigns' && 'black-icon'} style={{ fontSize: "12px" }} />, 'campaigns'),
        // getItem('Users', '/Users', <ContainerOutlined />),
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "userrole"))?.userrole?.allowed && getItem('User Role', '/NewUser', <UserOutlined className={pathname === '/newuser' && 'black-icon'} style={{ fontSize: "12px" }} />, 'newuser'),
        userPermissions?.permissions?.find(item => Object.hasOwn(item, "activities"))?.activities?.allowed && role === 'Admin' && getItem('User History', '/Activities', <LaptopOutlined className={pathname === '/activities' && 'black-icon'} style={{ fontSize: "12px" }} />, 'activities'),
    ].filter(Boolean);



    return (
        <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={150}
            collapsedWidth={60}
            style={{
                backgroundColor: darkMode ? '#3f3e3eff' : '#fff',
                color: darkMode ? '#fff' : '#000',
                borderRadius: '5px',
                overflow: 'hidden',
                height: '100vh',

            }}
            className="sider"
        >
            <div
                style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                    position: 'relative',
                    width: '100%',
                }}
            >
                <div style={{ marginTop: '1.6rem', position: "absolute", left: "auto", right: "20px", zIndex: "999 !important", }}>
                    <Button
                        type="primary"
                        icon={collapsed ? <DoubleRightOutlined className='black-icon' /> : <DoubleLeftOutlined className='black-icon' />}
                        onClick={toggleCollapsed}
                        style={{
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            background: '#91C25F',
                            color: "rgb(56 102 121)",
                            border: `solid 5px ${darkMode ? '#282628' : '#f1f1f1'}`,
                            position: "fixed",
                            zIndex: "999"
                        }}
                    />
                </div>
            </div>

            <>
                {collapsed ? (
                    <Image
                        src={darkMode ? "/Collapselogo.png" : "/light.png"}
                        width={60}
                        height={55}
                        priority={true}
                        alt="Collapsed Logo"
                        style={{
                            margin: "-10px 11px",
                            width: "60%",
                        }}
                    />
                ) : (
                    <Image
                        src={darkMode ? "/Expandlogo.png" : "/logolight.png"}
                        width={100}
                        height={50}
                        priority={true}
                        alt="Expanded Logo"
                        style={{
                            margin: "0px 20px",
                            objectFit: "cover"
                        }}
                    />
                )}

                <Menu
                    mode="inline"
                    selectedKeys={[pathname]}
                    style={{
                        backgroundColor: darkMode ? ' #3f3e3eff' : '#fff',
                        color: darkMode ? '#007BFF' : '#000',
                        fontSize: '16px',
                        borderRight: 'none',
                        marginTop: '10px',
                    }}
                    onClick={(e) => handleMenuItemClick(e.key)}
                    items={menuItems.map(item => ({
                        key: item.key,
                        icon: item.icon,
                        label: item.label,
                        title: "",
                        style: {
                            borderRadius: '8px',
                            margin: '5px 3px',
                            color: darkMode
                                ? item.label === pathname.split("/")[1]
                                    ? "#000"
                                    : '#ffffff'
                                : '#000',

                            backgroundColor:
                                item.text === pathname.split("/")[1]
                                    ? '#91C25F'
                                    : 'transparent',

                            fontWeight: "500",
                            fontSize: "12px"
                        }
                    }))}
                />
            </>

        </Sider>
    )
}
