"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTransition, useState, useEffect } from "react"
import { toast } from "sonner"
import { Check, CircleCheckBigIcon, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Component } from "@/lib/types"
import { dayJS } from "@/lib/day-js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

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
  endAt?: Date | null
}

export const PollPage: Component<{ poll: Poll }> = ({ poll: initialPoll }) => {
  const [isPending, startTransition] = useTransition()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [votedOptions, setVotedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const voted = localStorage.getItem(`poll_${initialPoll.pollId}`)
    if (voted) {
      setHasVoted(true)
      const savedVotes = localStorage.getItem(`poll_${initialPoll.pollId}_options`)
      if (savedVotes) {
        setVotedOptions(JSON.parse(savedVotes))
      }
    }
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

    setIsLoading(true)

    startTransition(() => {
      (async () => {
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
        localStorage.setItem(`poll_${initialPoll.pollId}_options`, JSON.stringify(selectedOptions))
        setVotedOptions(selectedOptions)
        setHasVoted(true)
        router.refresh()
        setIsLoading(false)
      })()
    })
  }

  const isOptionSelected = (optionId: string) => selectedOptions.includes(optionId)
  const hasVotedForOption = (optionId: string) => votedOptions.includes(optionId)
  const isVoteEnded = dayJS(initialPoll.endAt).isBefore(dayJS())

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {initialPoll.question}
          {isVoteEnded && (
            <Badge variant="destructive" className="ml-2">
              Terminé
            </Badge>
          )}
        </CardTitle>

        {initialPoll.description && <CardDescription>{initialPoll.description}</CardDescription>}

        {initialPoll.description && <div className="my-3" />}

        <Alert>
          {hasVoted && <CircleCheckBigIcon className="h-4 w-4" />}

          <AlertTitle>{hasVoted ? "Vote enregistré" : "C'est l'heure de voter !"}</AlertTitle>
          <AlertDescription>
            {hasVoted
              ? "Vous avez déjà voté pour ce sondage, merci !"
              : <>Vous pouvez sélectionner jusqu'à <span className="font-bold">{initialPoll.maxVotes}</span> option{initialPoll.maxVotes > 1 ? "s" : ""}</>
            }
          </AlertDescription>
        </Alert>
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
              }
            )}
            key={option.optionId}
          >
            <div className="flex items-center space-x-2">
              {(
                isOptionSelected(option.optionId)
                || (hasVoted && hasVotedForOption(option.optionId))
              ) && <Check className="w-4 h-4 text-primary" />}
              <p>{option.text}</p>
            </div>
            <span className="text-sm text-muted-foreground select-none">
              {option._count.votes} votes
            </span>
          </div>
        ))}
      </CardContent>

      {!hasVoted && !isVoteEnded && (
        <CardFooter>
          <Button
            onClick={handleVoteSubmit} 
            disabled={isPending || selectedOptions.length === 0 || isLoading}
            className="w-full"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Soumettre votre vote"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}