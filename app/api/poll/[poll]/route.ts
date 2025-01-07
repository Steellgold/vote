import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type Params = {
  params: { 
    pollId: string 
  }
}

export const GET = async (req: NextRequest, { params }: Params) => {
  try {
    const poll = await prisma.poll.findFirst({
      where: {
        pollId: params.pollId
      },
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true }
            }
          }
        }
      }
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}