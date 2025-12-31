import { Button } from "@repo/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";

export default function InfoTooltip({ children }: { children: React.ReactNode }) {
    return (
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                <Button
                variant={"outline"}
                className="w-5 h-5 p-0 ml-3 rounded-full text-xs border-gray-800 bg-gray-900 text-gray-100">
                    i
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {children}
            </TooltipContent>
        </Tooltip>
    )
}