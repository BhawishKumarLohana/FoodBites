import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const body = await req.json();
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;
    const { foodId, status, specialInstruction } = body;

    // Check if food is already claimed
    const existingFood = await prisma.food.findUnique({
      where: { foodId: foodId },
      include: { foodclaim: true }
    });

    if (!existingFood) {
      return NextResponse.json({ error: "Food not found" }, { status: 404 });
    }

    if (existingFood.foodclaim && existingFood.foodclaim.length > 0) {
      return NextResponse.json({ error: "Food already claimed" }, { status: 400 });
    }

    // 1. Create claim
    const claim = await prisma.foodClaim.create({
      data: {
        foodId: foodId,
        claimedBy: userId,
        deliver: true,
        status: status,
        specialInstruction: specialInstruction,
        claimedAt: new Date(),
      },
    });

    // 2. Update Food with the new claimId (keeping this for backward compatibility)
    await prisma.food.update({
      where: { foodId: foodId },
      data: { claimId: claim.claimId },
    });

    console.log("Claim created successfully:", claim);

    return NextResponse.json({ message: "SUCCESS", claimId: claim.claimId });
  } catch (error) {
    console.error("Error claiming food:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
