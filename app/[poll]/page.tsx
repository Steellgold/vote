import { prisma } from "@/lib/prisma"
import { PollPage } from "./poll"
import NotFound from "../not-found"
import { AsyncComponent } from "@/lib/types"

type PageProps = {
  params: Promise<{
    poll: string
  }>
}

const Page: AsyncComponent<PageProps> = async ({ params }) => {
  const pollId = (await params).poll;

  const poll = await prisma.poll.findFirst({
    where: {
      pollId: pollId
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