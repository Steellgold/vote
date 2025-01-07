"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTransition, useState, useEffect } from "react"
import { toast } from "sonner"

type Option = {
  id: string
  optionId: string
  text: string
  _count: {
    votes: number
  }
}

type Poll = {
  id: string
  pollId: string
  question: string
  description?: string | null
  maxVotes: number
  options: Option[]
}

export const PollPage = ({ poll: initialPoll }: { poll: Poll }) => {
  const [isPending, startTransition] = useTransition()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    const voted = localStorage.getItem(`poll_${initialPoll.pollId}`)
    if (voted) setHasVoted(true)
  }, [initialPoll.pollId])

  const handleOptionSelect = (optionId: string) => {
    if (hasVoted) return

    if (initialPoll.maxVotes === 1) {
      setSelectedOptions([optionId])
    } else {
      setSelectedOptions(prev => {
        if (prev.includes(optionId)) {
          return prev.filter(id => id !== optionId)
        }
        if (prev.length >= initialPoll.maxVotes) {
          return prev
        }
        return [...prev, optionId]
      })
    }
  }

  const handleVoteSubmit = async () => {
    if (selectedOptions.length === 0) {
      toast.error("Sélectionnez au moins une option")
      return
    }

    startTransition(async () => {
      const response = await fetch(`/api/poll/${initialPoll.pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionIds: selectedOptions })
      })

      if (!response.ok) {
        toast.error("Erreur lors du vote")
        return
      }

      localStorage.setItem(`poll_${initialPoll.pollId}`, "true")
      setHasVoted(true)
      toast.success("Vote enregistré !")
    })
  }

  const isOptionSelected = (optionId: string) => selectedOptions.includes(optionId)

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialPoll.question}</CardTitle>
        {initialPoll.description && <CardDescription>{initialPoll.description}</CardDescription>}
        <CardDescription>
          {hasVoted ? (
            "Vous avez déjà voté"
          ) : (
            `Vous pouvez sélectionner jusqu'à ${initialPoll.maxVotes} option${initialPoll.maxVotes > 1 ? 's' : ''}`
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        {initialPoll.options.map((option) => (
          <div
            onClick={() => handleOptionSelect(option.optionId)}
            className={cn(
              "bg-neutral-200/40 dark:bg-neutral-800/30",
              "hover:bg-neutral-200 dark:hover:bg-neutral-800",
              "rounded-lg p-4 cursor-pointer transition-colors",
              "flex justify-between items-center",
              {
                "opacity-50 cursor-not-allowed": hasVoted,
                "border-2 border-primary": isOptionSelected(option.optionId)
              }
            )}
            key={option.optionId}
          >
            <p>{option.text}</p>
            <span className="text-sm text-muted-foreground">
              {option._count.votes} votes
            </span>
          </div>
        ))}
      </CardContent>

      {!hasVoted && (
        <CardFooter>
          <Button 
            onClick={handleVoteSubmit} 
            disabled={isPending || selectedOptions.length === 0}
            className="w-full"
          >
            Voter
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}