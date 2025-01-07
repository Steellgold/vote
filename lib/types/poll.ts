type Option = {
  id: string;
  optionId: string;
  text: string;
  _count: {
    votes: number;
  }
}

type Poll = {
  id: string;
  pollId: string;
  question: string;
  description?: string | null;
  maxVotes: number;
  options: Option[];
  createdAt: Date;
  endAt?: Date | null;
}

export type { Poll, Option }