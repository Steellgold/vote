"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTransition, useState, useEffect } from "react"
import { toast } from "sonner"
import { Check, CircleCheckBigIcon, Clock, Loader2, RefreshCcw, Vote } from "lucide-react"
import { useRouter } from "next/navigation"
import { Component } from "@/lib/types"
import { dayJS } from "@/lib/day-js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useLocale, useTranslations } from "next-intl"
import { TimeRemaining } from "@/components/time-remaining"
import { Poll } from "@/lib/types/poll"
import { PollResults } from "./result"

export const PollPage: Component<{ poll: Poll }> = ({ poll: initialPoll }) => {
  const [isPending, startTransition] = useTransition()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [votedOptions, setVotedOptions] = useState<string[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const locale = useLocale();

  const t = useTranslations("Poll")

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
    if (
      selectedOptions.length === 0 ||
      isPending ||
      isLoading ||
      hasVoted
    ) {
      console.log("Can\"t vote yet")
      return
    }

    if (selectedOptions.length === 0) {
      toast.error(t("Error"))
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
          toast.error(t("Error"))
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
  
  const getFormattedDate = (date: Date) => {
    if (locale === "fr") {
      const formattedDate = dayJS(date).locale("fr").format("D MMMM YYYY [à] HH:mm");

      const [day, month, ...rest] = formattedDate.split(" ");
      const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
      return [day, capitalizedMonth, ...rest].join(" ");
    }
    
    return dayJS(date).locale("en").format("MMMM D, YYYY [at] h:mm A");
  };

  const isOptionSelected = (optionId: string) => selectedOptions.includes(optionId)
  const hasVotedForOption = (optionId: string) => votedOptions.includes(optionId)
  const isVoteEnded = dayJS(initialPoll.endAt).isBefore(dayJS())

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          
          <CardTitle className="flex items-col sm:items-center justify-between">
            {initialPoll.question}
          </CardTitle>

          <span className="text-sm text-gray-500">
            {t("CreatedAt", {date: getFormattedDate(initialPoll.createdAt) })}
          </span>

          {initialPoll.description && <CardDescription>{initialPoll.description}</CardDescription>}

          {initialPoll.description && <div className="my-3" />}

          <Alert>
            {hasVoted ? <CircleCheckBigIcon className="h-4 w-4" /> : <Vote className="h-4 w-4" />}

            <AlertTitle>{hasVoted ? t("Voted") : t("VoteTime")}</AlertTitle>
            <AlertDescription>
              {hasVoted 
                ? t("VotedMessage")
                : t.rich("SelectOptions", {
                    count: initialPoll.maxVotes,
                    plural: initialPoll.maxVotes > 1 ? "s" : "",
                    bold: (chunks) => <span className="font-bold">{chunks}</span>
                  })
              }
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent className="space-y-2">
          {initialPoll.options.map((option) => (
            <div onClick={() => handleOptionSelect(option.optionId)} className={cn(
              "bg-neutral-200/40 dark:bg-neutral-800/30",
              "hover:bg-neutral-200 dark:hover:bg-neutral-800",
              "rounded-lg p-4 cursor-pointer transition-colors",
              "flex justify-between items-center", {
                "opacity-50 cursor-not-allowed": hasVoted,
              }
            )} key={option.optionId}>
              <div className="flex items-center space-x-2">
                {(
                  isOptionSelected(option.optionId)
                  ||
                  (hasVoted && hasVotedForOption(option.optionId))
                ) && <Check className="w-4 h-4 text-primary" />}
                <span className="text-sm">{option.text}</span>
              </div>
              <span className="text-sm text-muted-foreground select-none">
                {t("Votes", { count: option._count.votes })}
              </span>
            </div>
          ))}
        </CardContent>

        <CardFooter className={cn(
          "space-y-2",
          "flex flex-col sm:flex-row items-center justify-between",
        )}>
          {isVoteEnded ? (
            <Badge variant="destructive">
              {t("Ended")}
            </Badge>
          ) : (
            <Badge variant="default" className="space-x-2">
              <Clock className="w-3 h-3" />
              <TimeRemaining targetDate={dayJS(initialPoll.endAt)} />
            </Badge>
          )}

          <div className="flex w-full sm:w-auto space-x-2">
            <Button
              onClick={() => router.refresh()}
              variant="default"
              size="sm"
              className="w-full"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              {t("Refresh")}
            </Button>

            <Button
              onClick={handleVoteSubmit} 
              disabled={
                isPending ||
                selectedOptions.length === 0 ||
                isLoading ||
                hasVoted ||
                isVoteEnded
              }
              size="sm"
              className="w-full"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("Submit")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <PollResults hasVoted={hasVoted} options={initialPoll.options} question={initialPoll.question} />
    </>
  )
}