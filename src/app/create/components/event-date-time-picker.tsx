import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

interface EventDateTimePickerProps {
  startDate: Date;
  startTime: string;
  // endDate: Date;
  // endTime: string;
  onDateChange: (date: Date | undefined, type: 'start' | 'end') => void;
  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EventDateTimePicker({
  startDate,
  startTime,
  onDateChange,
  onTimeChange,
}: EventDateTimePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="flex flex-col gap-2 w-full">
          <Label>Start Date</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="h-12" variant="outline">
                  {format(startDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => onDateChange(date, 'start')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Input
              className="max-w-[110px]"
              type="time"
              name="startTime"
              value={startTime}
              onChange={onTimeChange}
              placeholder="Start Time"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
