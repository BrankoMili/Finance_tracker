import { NextResponse } from "next/server";
import cloudinary from "cloudinary";

// Configure
cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log("User ID:", userId); // Ispisuje User ID

    if (!userId) {
      return NextResponse.json(
        { message: "User ID je obavezan" },
        { status: 400 }
      );
    }

    // get all pictures
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: `finance-tracker/profile-pictures/${userId}`
    });
    console.log("Cloudinary resources:", result.resources);

    // Delete all pictures
    for (const resource of result.resources) {
      console.log("Deleting resource:", resource.public_id);
      await cloudinary.v2.uploader.destroy(resource.public_id);
    }

    return NextResponse.json(
      { success: true, message: "Slike su uspešno obrisane" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Greška u API rutu:", error);
    return NextResponse.json(
      { message: "Došlo je do greške pri brisanju slika" },
      { status: 500 }
    );
  }
}
