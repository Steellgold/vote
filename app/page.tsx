"use client"

import { useState } from "react"
import { Loader2, PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { calculateEndDate } from "@/lib/day-js"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

const NewVote = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [maxChoices, setMaxChoices] = useState("1")
  const [duration, setDuration] = useState("1")
  const [isLoading, setIsLoading] = useState(false)

  const t = useTranslations("New")
  const router = useRouter();

  const addOption = () => setOptions([...options, ""])
  const removeOption = (index: number) => setOptions(options.filter((_, i) => i !== index))

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
  
    const response = await fetch("/api/poll/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: title,
        description: description || null,
        max_votes: parseInt(maxChoices),
        end_at: calculateEndDate(duration),
        options
      })
    })
  
    if (!response.ok) {
      setIsLoading(false)
      toast.error(t("Messages.Error"))
      return
    }

    toast.success(t("Messages.Success"))
    router.push(`/${(await response.json()).pollId}`)
  }

  const formatDurationLabel = (days: number): string => {
    if (days < 1) {
      const hours = Math.round(days * 24)
      return t(hours > 1 ? "Form.Duration.Hours" : "Form.Duration.Hour", { number: hours })
    }
    return t(days > 1 ? "Form.Duration.Days" : "Form.Duration.Day", { number: days })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("Card.Title")}</CardTitle>
        <CardDescription>{t("Card.Description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">
              {t("Form.Title.Label")}<span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Form.Title.Placeholder")}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">{t("Form.Description.Label")}</Label>
            <Textarea
              id="description"
              placeholder={t("Form.Description.Placeholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label>
              {t("Form.Options.Label")}<span className="text-red-500">*</span>
            </Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={t("Form.Options.Placeholder", { number: index + 1 })}
                  required
                  disabled={isLoading}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={isLoading}
                    aria-label={t("Form.Options.Remove")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              onClick={addOption} 
              className="mt-2" 
              disabled={isLoading}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              {t("Form.Options.Add")}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="maxChoices">{t("Form.MaxChoices.Label")}</Label>
              <Select value={maxChoices} onValueChange={setMaxChoices} disabled={isLoading}>
                <SelectTrigger id="maxChoices">
                  <SelectValue placeholder="Select max choices" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="duration">
                {t("Form.Duration.Label")}<span className="text-red-500">*</span>
              </Label>
              <Select value={duration} onValueChange={setDuration} disabled={isLoading}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[0.1, 0.2, 0.5, 0.8, 1, 3, 5, 7, 14, 30].map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {formatDurationLabel(days)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : t("Form.Submit")}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default NewVote