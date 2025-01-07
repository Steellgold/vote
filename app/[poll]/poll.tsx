"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTransition, useState, useEffect } from "react"
import { toast } from "sonner"
import { Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

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

  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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
        setHasVoted(true)
        router.refresh()
        setIsLoading(false)
      })()
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
            "Vous avez déjà voté pour ce sondage, merci !"
          ) : (
            `Vous pouvez sélectionner jusqu'à ${initialPoll.maxVotes} option${initialPoll.maxVotes > 1 ? "s" : ""}`
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
              }
            )}
            key={option.optionId}
          >
            <div className="flex items-center space-x-2">
              {isOptionSelected(option.optionId) && <Check className="w-4 h-4 text-primary-500" />}
              <p>{option.text}</p>
            </div>
            <span className="text-sm text-muted-foreground select-none">
              {option._count.votes} votes
            </span>
          </div>
        ))}
      </CardContent>

      {!hasVoted && (
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