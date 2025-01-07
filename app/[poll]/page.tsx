import { prisma } from "@/lib/prisma"
import { PollPage } from "./poll"
import { AsyncComponent } from "@/lib/types"
import NotFound from "../not-found"

const Page: AsyncComponent<{
  params: { poll: string }
}> = async ({ params }) => {
  const poll = await prisma.poll.findFirst({
    where: {
      pollId: params.poll
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
    return <NotFound pollNotFound />
  }

  return <PollPage poll={poll} />
}

export default Page;