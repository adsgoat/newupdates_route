// import Footer from "./Footer";
import Header from "./Topbar";
import Sidebar from "./Sidebar";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import dayjs from "dayjs";

export default async function MainLayout({ children }) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();

    const userRole = await client.get(`role_${email}`);
    const userProfileImage = await client.get(`profileImage_${email}`);
    const stickyNotes = await client.get(`stickyNotes_${email}`);
    const userPermissionsInfo = JSON.parse(await client.get(`permissions_${email}`));
    const userPermissions = {
        "permissions": {
            "dashboard": {
                "allowed": true,
                "project_report": true,
                "ad_accounts": ["profit", "loss", "top_5_spend", "top_5_revenue", "top_5_profit"],
                "top_campaigns":["spend", "revenue", "profit", "all_profit", "all_loss"],
                "domain_agency":["domain"]
            },
            "reports": {
                "allowed": true
            }
        }
    }

    return (
        <div style={{ display: "flex", height: "100vh", }}>
            {/* <Sidebar role={userRole}  /> */}
            <div className="sidebar-wrapper">
                <Sidebar role={userRole} userPermissions={userPermissionsInfo} />
            </div>
            {/* <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    // marginLeft: "10px",
                    // minHeight: "100vh",
                }}
            >
                <Header profileImage={userProfileImage} stickyNotes={stickyNotes} />
                <main style={{
                    margin: "8px", minHeight: 0,
                    overflow: "hidden", backgroundColor: "#ededed"
                }}>{children}</main>
            </div> */}
            <div
                style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    height: "100vh",
                    minHeight: 0,
                }}
            >
                <Header
                    profileImage={userProfileImage}
                    stickyNotes={stickyNotes}
                />

                <main
                    style={{
                        flex: 1,
                        minHeight: 0,
                        margin: "8px 8px 0px 8px",
                        backgroundColor: "#ededed",
                        overflow: "hidden",
                    }}
                >
                    {children}
                </main>
                <h5 style={{ fontWeight: "100", marginBottom: "2px", marginLeft:"10px", marginTop:"2px", fontSize:"10px" }}>
                    Copyright © {dayjs().format('YYYY')} All rights reserved | vyaktimetrics
                </h5>
            </div>
        </div>
    );
}
