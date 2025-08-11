import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const unclaimedFood = await prisma.food.findMany({
      where: {
        claimId: null,
      },
      include: {
        user: true
      },
    });

    return NextResponse.json(unclaimedFood);
  } catch (error) {
    console.error("Error fetching unclaimed food:", error);
    return NextResponse.json(
      { error: "Failed to fetch unclaimed food." },
      { status: 500 }
    );
  }
}
