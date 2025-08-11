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
    const { foodId,status,specialInstruction } = body;

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

    // 2. Update Food with the new claimId
    await prisma.food.update({
      where: { foodId: foodId },
      data: { claimId: claim.claimId },
    });


    return NextResponse.json({ message:"SUCESS" });
  } catch (error) {
    console.error("Error claiming food:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
