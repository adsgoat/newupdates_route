import axios from "axios";

const CreateDrafts = async (body, token) => {
    const response = await axios.post(
        `https://fblaunching.vyaktimetrics.com/open/templates/submit`,
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

export default CreateDrafts;