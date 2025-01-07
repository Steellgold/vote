"use client"

import { useState } from "react"
import { PlusCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { calculateEndDate } from "@/lib/day-js"

const NewVote = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState(["", ""])
  const [maxChoices, setMaxChoices] = useState("1")
  const [duration, setDuration] = useState("1")

  const addOption = () => {
    setOptions([...options, ""])
  }

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  
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
      toast.error("Erreur lors de la création du vote")
      return
    }
    
    console.log("Vote créé avec succès", await response.json())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Créer un nouveau vote</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Titre du vote<span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entrez le titre du vote"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="title">Description du vote</Label>
            <Textarea
              id="description"
              placeholder="Entrez la description du vote (optionnel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label>Options de vote<span className="text-red-500">*</span></Label>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="mt-2">
              <PlusCircle className="h-4 w-4 mr-2" />
              Ajouter une option
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="maxChoices">Nombre maximum de choix</Label>
              <Select value={maxChoices} onValueChange={setMaxChoices}>
                <SelectTrigger id="maxChoices">
                  <SelectValue placeholder="Sélectionnez le max" />
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
              <Label htmlFor="duration">Durée du vote (en jours)<span className="text-red-500">*</span></Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Sélectionnez la durée" />
                </SelectTrigger>
                <SelectContent>
                  {[0.1, 0.2, 0.5, 0.8, 1, 3, 5, 7, 14, 30].map((days) => (
                    <SelectItem key={days} value={days.toString()}>
                      {days.toString().startsWith("0.")
                        ? `${days.toString().slice(2)} heure` + (days === 0.8 ? "s" : "")
                        : `${days} jour` + (days > 1 ? "s" : "")
                      }
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        {/* @ts-ignore */}
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Créer le vote
        </Button>
      </CardFooter>
    </Card>
  )
}

export default NewVote