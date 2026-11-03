import axios from "axios";

export default async function DeleteMultipleNotes(
    email,
    ids,
    token
) {
    const apiCall = await axios.delete(
        "https://app.vyaktimetrics.com/open/notes/bulk",
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
            data: {
                email,
                ids,
            },
        }
    );

    return apiCall.data;
}