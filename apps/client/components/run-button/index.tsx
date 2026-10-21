/**
 * Run button component for code execution control.
 * Features:
 * - Code execution triggering
 * - Execution cancellation
 * - Args/stdin input handling
 * - Status indication
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

import { CodeServiceMsg } from "@codex/types/message";
import type { ExecutionResult } from "@codex/types/terminal";
import type { Monaco } from "@monaco-editor/react";
import { Play, Square } from "lucide-react";
import type * as monaco from "monaco-editor";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";

import { AboutPopover } from "./components/about-popover";
import { ArgsInputPopover } from "./components/args-stdin-popover";
import { cancelExecution, executeCode } from "./utils";

interface RunButtonProps {
  className?: string;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  monaco: Monaco | null;
  setOutput: Dispatch<SetStateAction<ExecutionResult[]>>;
  setShowTerminal: Dispatch<SetStateAction<boolean>>;
}

const RunButton = ({
  editor,
  monaco,
  className,
  setOutput,
  setShowTerminal,
}: RunButtonProps) => {
  const socket = getSocket();
  const [isRunning, setIsRunning] = useState(false);
  const [args, setArgs] = useState<string[]>([]);
  const [stdin, setStdin] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    socket.on(CodeServiceMsg.EXEC, (isExecuting: boolean) =>
      setIsRunning(isExecuting)
    );

    return () => {
      socket.off(CodeServiceMsg.EXEC);
    };
  }, [socket]);

  const handleRun = async () => {
    if (!(editor && monaco) || isRunning) {
      return;
    }
    setShowTerminal(true);
    await executeCode(
      monaco,
      editor,
      setOutput,
      setIsRunning,
      abortControllerRef,
      args,
      stdin
    );
  };

  const handleStop = () => {
    cancelExecution(abortControllerRef, setIsRunning, setOutput);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        aria-label={isRunning ? "Stop code execution" : "Run code"}
        className="size-7 bg-orange-500 text-white hover:bg-orange-600"
        disabled={!(editor && monaco)}
        onClick={isRunning ? handleStop : handleRun}
        size="icon"
        variant="ghost"
      >
        {isRunning ? (
          <Square aria-hidden="true" className="size-3.5 fill-current" />
        ) : (
          <Play aria-hidden="true" className="size-4 fill-current" />
        )}
      </Button>
      <div className="animate-fade-in-top">
        <ArgsInputPopover
          disabled={isRunning || !(editor && monaco)}
          onArgsChange={setArgs}
          onStdinChange={setStdin}
        />
      </div>

      <AboutPopover />
    </div>
  );
};

export { RunButton };
