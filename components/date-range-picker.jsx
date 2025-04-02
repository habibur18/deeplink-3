"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function DateRangePicker() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [date, setDate] = useState({
    from: searchParams.get("from")
      ? new Date(searchParams.get("from"))
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: searchParams.get("to") ? new Date(searchParams.get("to")) : new Date(),
  })

  function onDateChange(newDate) {
    setDate(newDate)

    if (newDate.from && newDate.to) {
      const params = new URLSearchParams(searchParams)
      params.set("from", newDate.from.toISOString())
      params.set("to", newDate.to.toISOString())
      router.push(`?${params.toString()}`)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[300px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

