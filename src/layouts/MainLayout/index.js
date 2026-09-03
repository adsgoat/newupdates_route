import Header from "./Topbar";
import Sidebar from "./Sidebar";
import getSessionEmailByAuth from "@/lib/sessionemailbyauth";
import getRedisClient from "@/lib/redis";
import dayjs from "dayjs";

export default async function MainLayout({ children }) {
    const client = await getRedisClient();
    const email = await getSessionEmailByAuth();
    const isAuthenticated = !!email;
    const userRole = await client.get(`role_${email}`);
    const userProfileImage = await client.get(`profileImage_${email}`);
    const stickyNotes = await client.get(`stickyNotes_${email}`);
    const stringuserData = await client.get(`userData_${email}`);
    const userData = JSON.parse(stringuserData);
    const userPermissionsInfo = JSON.parse(
        await client.get(`permissions_${email}`)
    );
    const userdetails = await client.get(
        `userdetails_${email}`
    );
    const themeRaw = await client.get(`theme_${email}`);
    const theme = themeRaw === "dark" ? "dark" : "light";

    return (
        <div
            style={{
                display: "flex",
                height: "100vh",
            }}
        >
            <div className="sidebar-wrapper">
                <Sidebar
                    role={userRole}
                    userPermissions={userPermissionsInfo}
                />
            </div>

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
                    userdetails={userdetails}
                    theme={theme}
                    isAuthenticated={isAuthenticated}
                    email={email}
                    userdata={userData}
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

                <h5
                    style={{
                        fontWeight: "100",
                        marginBottom: "2px",
                        marginLeft: "10px",
                        marginTop: "2px",
                        fontSize: "10px",
                    }}
                >
                    Copyright © {dayjs().format("YYYY")} All
                    rights reserved | vyaktimetrics
                </h5>
            </div>
        </div>
    );
}