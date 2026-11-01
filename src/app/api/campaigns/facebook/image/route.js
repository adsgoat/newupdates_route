import CreateImageHash from "@/services/campaigns/facebook/image";

export async function POST(request) {
    try {
        const { searchParams } = new URL(request.url);
        const accountNumber = searchParams.get("account");

        const formData = await request.formData();

        const data = await CreateImageHash(formData, accountNumber);

        return Response.json(data);
    } catch (error) {
        return Response.json(
            { error: error.message || "Image upload failed" },
            { status: 500 }
        );
    }
}