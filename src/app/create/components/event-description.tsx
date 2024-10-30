import { Textarea } from '@/components/ui/textarea';

interface EventDescriptionProps {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  limit?: number;
}

export function EventDescription({
  description,
  onChange,
  limit = 240,
}: EventDescriptionProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-muted-foreground text-sm font-bold">
        About this event
      </h2>
      <Textarea
        name="description"
        value={description}
        onChange={(e) => {
          if (e.target.value.length <= limit && description.length <= limit) {
            onChange(e);
          }
        }}
        placeholder="Event Description"
        rows={6}
      />
      <p className="text-end text-sm text-muted-foreground">
        {description.length}/{limit} characters
      </p>
    </div>
  );
}
