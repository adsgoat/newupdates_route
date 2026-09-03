import axios from "axios";

export default async function SaveNotes(
    email,
    notes,
    token
) {
    const apiCall = await axios.post(
        "http://test.app.vyaktimetrics.com/open/notes",
        {
            email,
            notes,
        },
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}