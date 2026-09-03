import axios from "axios";

export default async function DeleteNote(
    email,
    id,
    token
) {
    const apiCall = await axios.delete(
        `http://test.app.vyaktimetrics.com/open/notes/${encodeURIComponent(
            email
        )}/${encodeURIComponent(id)}`,
        {
            headers: {
                Authorization: token,
                accept: "application/json",
            },
        }
    );

    return apiCall.data;
}