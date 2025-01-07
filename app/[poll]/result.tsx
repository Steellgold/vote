"use client";

import React, { useMemo, useState } from "react"
import { PieChart, Pie, Label, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Component } from "@/lib/types"
import { Option } from "@/lib/types/poll"
import { cn, COLORS } from "@/lib/utils";
import { useTranslations } from "next-intl";

export const PollResults: Component<{
  options: Option[];
  question: string;
  hasVoted: boolean;
  perVote: number;
}> = ({ options, question, hasVoted, perVote = 1 }) => {
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const t = useTranslations("Poll");

  const chartData = useMemo(() => {
    return options.map((option, index) => ({
      text: option.text,
      votes: option._count.votes,
      fill: COLORS[index % COLORS.length]
    }));
  }, [options]);

  const totalVotes = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.votes, 0)
  }, [chartData]);

  const handleClick = (index: number) => {
    setSelectedSegment(selectedSegment === index ? null : index);
  };

  if (!hasVoted) return <></>;

  return (
    <Card className="w-full max-w-2xl mx-auto mt-4">
      <CardHeader className="items-center flex flex-col -space-y-0.5">
        <CardTitle className="text-lg">
          {t("PieResults")}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">« {question} »</CardDescription>
      </CardHeader>
      <CardContent className="-mt-10">
        <div className="flex justify-center relative">
          <PieChart width={300} height={300}>
            <Pie
              data={chartData}
              dataKey="votes"
              nameKey="text"
              innerRadius={60}
              outerRadius={80}
              strokeWidth={2}
              onClick={(_, index) => handleClick(index)}
              isAnimationActive={true}
              animationDuration={300}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke={selectedSegment === index ? "#fff" : "transparent"}
                  strokeWidth={selectedSegment === index ? 2 : 0}
                />
              ))}
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                            {perVote === 1 ? totalVotes : totalVotes / perVote}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-sm">votes</tspan>
                        </text>
                      )
                    }
                  }}
                />
            </Pie>
          </PieChart>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex flex-col justify-between w-full gap-2">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className={cn(
                "flex items-center gap-2 p-2 rounded transition-colors",
                "hover:bg-neutral-200 dark:hover:bg-neutral-800", {
                  "bg-neutral-200/50 dark:bg-neutral-800/30": selectedSegment === index
                }
              )}
              onClick={() => handleClick(index)}
              style={{ cursor: "pointer" }}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
              <span className="text-sm">{item.text}</span>
              <span className="text-sm text-muted-foreground ml-auto">
                {((item.votes / totalVotes) * 100).toFixed(1)}% ({item.votes})
              </span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
};