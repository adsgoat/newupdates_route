import axios from "axios";

const EditDrafts = async (body, token) => {
    const response = await axios.patch(
        `https://fblaunching.vyaktimetrics.com/open/templates/update-smart`,
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

export default EditDrafts;