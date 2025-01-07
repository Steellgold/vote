import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { nanoid } from "nanoid"

const voteSchema = z.object({
  question: z.string().min(1),
  description: z.string().nullable(),
  max_votes: z.number().min(1).max(5),
  end_at: z.string().transform((date) => new Date(date)),
  options: z.array(z.string().min(1)).min(2)
})

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const body = await req.json()
    const validatedData = voteSchema.parse(body)

    const poll = await prisma.$transaction(async (tx) => {
      const pollUniqueId = Math.random().toString(36).substring(2, 6)

      const poll = await tx.poll.create({
        data: {
          pollId: pollUniqueId,
          question: validatedData.question,
          description: validatedData.description,
          endAt: validatedData.end_at,
          maxVotes: validatedData.max_votes
        },
      })

      await tx.option.createMany({
        data: validatedData.options.map(text => ({
          optionId: nanoid(10),
          text,
          pollId: poll.id
        }))
      })

      return poll
    })

    return NextResponse.json(poll, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    console.error("Error creating poll:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}