import axios from "axios";

const ShareDrafts = async (body, token) => {
    const response = await axios.post(
        `https://fblaunching.vyaktimetrics.com/open/templates/share`,
        body,
        {
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

export default ShareDrafts;