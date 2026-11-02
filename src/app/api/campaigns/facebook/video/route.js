import CreateVideo from "@/services/campaigns/facebook/video";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountNumber = searchParams.get("account");

        const formData = await request.formData();

        const data = await CreateVideo(formData, accountNumber);

        return Response.json(data);
    } catch (error) {
        return Response.json(
            { error: error.message || "video upload failed" },
            { status: 500 }
        );
    }
}