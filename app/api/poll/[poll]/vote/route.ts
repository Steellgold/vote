import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { nanoid } from "nanoid"

type Params = {
  params: { 
    pollId: string 
  }
}

export const POST = async (req: NextRequest, { params }: Params) => {
  try {
    const { optionIds } = await req.json()
    
    const poll = await prisma.poll.findFirst({
      where: { pollId: params.pollId },
      include: { options: true }
    })

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    if (optionIds.length > poll.maxVotes) {
      return NextResponse.json({ error: "Too many options selected" }, { status: 400 })
    }

    const options = await prisma.option.findMany({
      where: { optionId: { in: optionIds } }
    })

    if (options.length !== optionIds.length) {
      return NextResponse.json({ error: "Invalid options" }, { status: 400 })
    }

    const votes = await prisma.$transaction(
      options.map(option => 
        prisma.vote.create({
          data: {
            voteId: nanoid(10),
            optionId: option.id
          }
        })
      )
    )

    return NextResponse.json(votes)
  } catch (error) {
    console.error("Error creating votes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}