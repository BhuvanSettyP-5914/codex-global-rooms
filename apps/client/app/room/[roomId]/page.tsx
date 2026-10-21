/**
 * Room page component that provides collaborative coding environment.
 * Features:
 * - Real-time code synchronization
 * - Multi-cursor support
 * - Resizable panels for editor, terminal, preview
 * - Room-based collaboration
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

"use client";

import { CodeServiceMsg, RoomServiceMsg } from "@codex/types/message";
import type { ExecutionResult } from "@codex/types/terminal";
import type { User } from "@codex/types/user";
import type { Monaco } from "@monaco-editor/react";
import { Code2, Sparkles } from "lucide-react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useParams, useRouter } from "next/navigation";
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

import { AIChat } from "@/components/ai-chat";
import { CodeEditor } from "@/components/code-editor";
import { FollowUser } from "@/components/follow-user";
import { LeaveButton } from "@/components/leave-button";
import { LivePreview } from "@/components/live-preview";
import { Notepad } from "@/components/notepad";
import { RemotePointers } from "@/components/remote-pointers";
import { RunButton } from "@/components/run-button";
import { SettingsButton } from "@/components/settings-button";
import { ShareButton } from "@/components/share-button";
import { Spinner } from "@/components/spinner";
import {
  StatusBar,
  type StatusBarCursorPosition,
} from "@/components/status-bar";
import { Terminal } from "@/components/terminal";
import { Toolbar } from "@/components/toolbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { UserList } from "@/components/user-list";
import { WebcamStream } from "@/components/webcam-stream";
import { useThemeColor } from "@/hooks/use-theme-color";
import { initEditorTheme } from "@/lib/init-editor-theme";
import { storage } from "@/lib/services/storage";
import { userMap } from "@/lib/services/user-map";
import { getSocket } from "@/lib/socket";
import { cn, leaveRoom } from "@/lib/utils";

const MemoizedToolbar = memo(function MemoizedToolbar({
  monaco,
  editor,
  roomId,
  users,
  showNotepad,
  showTerminal,
  showWebcam,
  showLivePreview,
  showAiChat,
  setShowNotepad,
  setShowTerminal,
  setShowWebcam,
  setShowLivePreview,
  setShowAiChat,
  setOutput,
}: {
  monaco: Monaco;
  editor: MonacoEditor.IStandaloneCodeEditor;
  roomId: string;
  users: User[];
  showNotepad: boolean;
  showTerminal: boolean;
  showWebcam: boolean;
  showLivePreview: boolean;
  showAiChat: boolean;
  setShowNotepad: Dispatch<SetStateAction<boolean>>;
  setShowTerminal: Dispatch<SetStateAction<boolean>>;
  setShowWebcam: Dispatch<SetStateAction<boolean>>;
  setShowLivePreview: Dispatch<SetStateAction<boolean>>;
  setShowAiChat: Dispatch<SetStateAction<boolean>>;
  setOutput: Dispatch<SetStateAction<ExecutionResult[]>>;
}) {
  return (
    <div className="fixed z-20 flex w-full items-center justify-between gap-x-2 border-orange-400/15 border-b bg-[color:var(--toolbar-bg-secondary)]/95 px-2 py-1 text-orange-100 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl [&_button:hover]:bg-orange-500/15 [&_button>svg]:text-orange-200">
      <div className="hidden min-w-0 shrink-0 items-center gap-2 pl-1 min-[560px]:flex">
        <span className="flex size-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-300 ring-1 ring-orange-300/20">
          <Code2 aria-hidden="true" className="size-4" />
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="font-semibold text-[11px] text-[color:var(--toolbar-foreground)] tracking-wide">
            CODEX
          </span>
          <span className="max-w-24 truncate font-mono text-[10px] text-[color:var(--toolbar-foreground)]/55">
            {roomId}
          </span>
        </span>
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: grouping toolbar controls without form semantics */}
      <div
        aria-label="Editor Toolbar"
        className="flex min-w-0 animate-fade-in-top items-center gap-1"
        role="group"
      >
        <Toolbar
          editor={editor}
          monaco={monaco}
          setShowLivePreview={setShowLivePreview}
          setShowNotepad={setShowNotepad}
          setShowTerminal={setShowTerminal}
          setShowWebcam={setShowWebcam}
          showLivePreview={showLivePreview}
          showNotepad={showNotepad}
          showTerminal={showTerminal}
          showWebcam={showWebcam}
        />
        <RunButton
          editor={editor}
          monaco={monaco}
          setOutput={setOutput}
          setShowTerminal={setShowTerminal}
        />
      </div>
      <nav aria-label="Collaboration Tools">
        <div className="flex items-center gap-x-1 sm:gap-x-2">
          <Button
            aria-label="Toggle AI coding assistant"
            aria-pressed={showAiChat}
            className={cn(
              "h-8 gap-1.5 px-2 text-[color:var(--toolbar-foreground)]",
              showAiChat && "bg-orange-500/20 text-orange-100"
            )}
            onClick={() => setShowAiChat((visible) => !visible)}
            size="sm"
            variant="ghost"
          >
            <Sparkles aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">AI</span>
          </Button>
          <UserList users={users} />
          <ShareButton roomId={roomId} />
          <FollowUser users={users} />
          <SettingsButton editor={editor} monaco={monaco} />
          <LeaveButton />
        </div>
      </nav>
    </div>
  );
});

const MemoizedNotepad = memo(function MemoizedNotepad({
  markdown,
}: {
  markdown: string;
}) {
  return <Notepad markdown={markdown} />;
});

const MemoizedTerminal = memo(function MemoizedTerminal({
  results,
  setResults,
}: {
  results: ExecutionResult[];
  setResults: Dispatch<SetStateAction<ExecutionResult[]>>;
}) {
  return <Terminal results={results} setResults={setResults} />;
});

const MemoizedWebcamStream = memo(function MemoizedWebcamStream({
  users,
}: {
  users: User[];
}) {
  return <WebcamStream users={users} />;
});

const MemoizedLivePreview = memo(function MemoizedLivePreview({
  value,
}: {
  value: string;
}) {
  return <LivePreview value={value} />;
});

const MemoizedStatusBar = memo(function MemoizedStatusBar({
  monaco,
  editor,
  cursorPosition,
}: {
  monaco: Monaco;
  editor: MonacoEditor.IStandaloneCodeEditor;
  cursorPosition: StatusBarCursorPosition;
}) {
  return (
    <StatusBar
      cursorPosition={cursorPosition}
      editor={editor}
      monaco={monaco}
    />
  );
});

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: room page manages complex socket/editor state
export default function Room() {
  const params = useParams();
  const roomId = String(params.roomId);
  const router = useRouter();
  const socket = getSocket();
  useThemeColor();

  const [showNotepad, setShowNotepad] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showWebcam, setShowWebcam] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [showAiChat, setShowAiChat] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [debouncedCode] = useDebounce(code, 300);
  const [monaco, setMonaco] = useState<Monaco | null>(null);
  const [editor, setEditor] =
    useState<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [cursorPosition, setCursorPosition] = useState<StatusBarCursorPosition>(
    {
      line: 1,
      column: 1,
      selected: 0,
    }
  );

  const [users, setUsers] = useState<User[]>([]);
  const [mdContent, setMdContent] = useState<string>("");
  const [output, setOutput] = useState<ExecutionResult[]>([]);

  const disconnect = useCallback(() => {
    leaveRoom();
    socket.disconnect();
  }, [socket]);

  // Memoized socket event handlers
  const handleUsersUpdate = useCallback((usersDict: Record<string, string>) => {
    userMap.clear();
    userMap.addBulk(usersDict);
    setUsers(userMap.getAll());
  }, []);

  const handleMarkdownReceive = useCallback((md: string) => {
    setMdContent(md);
  }, []);

  const handleTerminalReceive = useCallback((result: ExecutionResult) => {
    setOutput((prev) => [...prev, result]);
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      router.replace(`/?room=${roomId}`);
    }

    const handleReconnect = () => {
      if (!socket.recovered) {
        socket.emit(RoomServiceMsg.SYNC_USERS);
        socket.emit(RoomServiceMsg.SYNC_MD);
      }
    };

    const handleTerminate = () => {
      toast.error("This room has been terminated by the host.");
      storage.clear();
      router.replace("/");
    };

    socket.on("connect", handleReconnect);
    socket.on(RoomServiceMsg.SYNC_USERS, handleUsersUpdate);
    socket.on(RoomServiceMsg.UPDATE_MD, handleMarkdownReceive);
    socket.on(CodeServiceMsg.UPDATE_TERM, handleTerminalReceive);
    socket.on(RoomServiceMsg.TERMINATE, handleTerminate);

    // Full state sync on initial page load. Register listeners before emitting
    // because the server may respond immediately with the current room note.
    socket.emit(RoomServiceMsg.SYNC_USERS);
    socket.emit(RoomServiceMsg.SYNC_MD);

    window.addEventListener("popstate", disconnect);

    initEditorTheme();

    return () => {
      window.removeEventListener("popstate", disconnect);
      socket.off("connect", handleReconnect);
      socket.off(RoomServiceMsg.SYNC_USERS);
      socket.off(CodeServiceMsg.UPDATE_LANG);
      socket.off(RoomServiceMsg.UPDATE_MD);
      socket.off(CodeServiceMsg.UPDATE_TERM);
      socket.off(RoomServiceMsg.TERMINATE);
      userMap.clear();
    };
  }, [
    disconnect,
    roomId,
    router,
    socket,
    handleUsersUpdate,
    handleMarkdownReceive,
    handleTerminalReceive,
  ]);

  const handleMonacoSetup = useCallback((monacoInstance: Monaco) => {
    setMonaco(monacoInstance);
  }, []);

  const handleEditorSetup = useCallback(
    (editorInstance: MonacoEditor.IStandaloneCodeEditor) => {
      setEditor(editorInstance);
    },
    []
  );

  return (
    <main
      aria-label="Code Editor Workspace"
      className="flex h-full min-w-[821px] flex-col bg-[color:var(--panel-background)]"
    >
      <RemotePointers />
      <div
        aria-label="Editor Controls"
        className="h-9 flex-shrink-0"
        role="toolbar"
      >
        {monaco && editor && (
          <MemoizedToolbar
            editor={editor}
            monaco={monaco}
            roomId={roomId || ""}
            setOutput={setOutput}
            setShowAiChat={setShowAiChat}
            setShowLivePreview={setShowLivePreview}
            setShowNotepad={setShowNotepad}
            setShowTerminal={setShowTerminal}
            setShowWebcam={setShowWebcam}
            showAiChat={showAiChat}
            showLivePreview={showLivePreview}
            showNotepad={showNotepad}
            showTerminal={showTerminal}
            showWebcam={showWebcam}
            users={users}
          />
        )}
      </div>
      {mdContent !== null ? (
        <ResizablePanelGroup
          className="!h-[calc(100%-54px)]"
          direction="horizontal"
        >
          <ResizablePanel
            aria-label="Notepad"
            className={cn(
              "animate-fade-in-left [&>div]:h-full",
              monaco && editor && "border-orange-500/15 border-t",
              !(monaco && editor) && "hidden",
              !showNotepad && "hidden"
            )}
            collapsible
            defaultSize={20}
            minSize={10}
            role="region"
          >
            <MemoizedNotepad markdown={mdContent} />
          </ResizablePanel>
          <ResizableHandle
            aria-label="Resize Handle"
            className={cn(
              "bg-orange-500/30 transition-colors hover:bg-orange-400",
              !(monaco && editor) && "hidden",
              !showNotepad && "hidden"
            )}
          />

          <ResizablePanel defaultSize={65} minSize={10}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                aria-label="Code Editor"
                className="z-[1] animate-fade-in"
                defaultSize={75}
                minSize={10}
                role="region"
              >
                <ResizablePanelGroup
                  className={cn(
                    monaco && editor && "border-orange-500/15 border-t"
                  )}
                  direction="horizontal"
                >
                  <ResizablePanel defaultSize={60} minSize={10}>
                    <CodeEditor
                      cursorPosition={setCursorPosition}
                      editorRef={handleEditorSetup}
                      monacoRef={handleMonacoSetup}
                      setCode={setCode}
                    />
                  </ResizablePanel>
                  <ResizableHandle
                    aria-label="Resize Handle"
                    className={cn(
                      "bg-orange-500/30 transition-colors hover:bg-orange-400",
                      !(monaco && editor) && "hidden",
                      !showLivePreview && "hidden"
                    )}
                  />
                  <ResizablePanel
                    className={cn(
                      "animate-fade-in-right",
                      !(monaco && editor) && "hidden",
                      !showLivePreview && "hidden"
                    )}
                    collapsible
                    defaultSize={40}
                    minSize={10}
                  >
                    {editor && (
                      <MemoizedLivePreview value={debouncedCode ?? ""} />
                    )}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
              <ResizableHandle
                aria-label="Resize Handle"
                className={cn(
                  "bg-orange-500/30 transition-colors hover:bg-orange-400",
                  !(monaco && editor) && "hidden",
                  !showTerminal && "hidden"
                )}
              />
              <ResizablePanel
                aria-label="Terminal"
                className={cn(
                  "animate-fade-in-bottom",
                  !(monaco && editor) && "hidden",
                  !showTerminal && "hidden"
                )}
                collapsible
                defaultSize={25}
                minSize={10}
                role="region"
              >
                <MemoizedTerminal results={output} setResults={setOutput} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          <ResizableHandle
            aria-label="Resize Handle"
            className={cn(
              "bg-orange-500/30 transition-colors hover:bg-orange-400",
              !(monaco && editor) && "hidden",
              !showWebcam && "hidden"
            )}
          />
          <ResizablePanel
            aria-label="Webcam Stream"
            className={cn(
              "animate-fade-in-right",
              monaco && editor && "border-orange-500/15 border-t",
              !(monaco && editor) && "hidden",
              !showWebcam && "hidden"
            )}
            collapsible
            defaultSize={15}
            minSize={10}
            role="region"
          >
            <MemoizedWebcamStream users={users} />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        // biome-ignore lint/a11y/useSemanticElements: status div for loading indicator
        <div
          aria-live="polite"
          className="fixed top-0 left-0 flex size-full items-center justify-center p-2"
          role="status"
        >
          <Alert className="flex max-w-md gap-x-2 bg-background/50 backdrop-blur">
            <Spinner className="size-6" />
            <div>
              <AlertTitle>Loading session</AlertTitle>
              <AlertDescription>
                Loading your coding session. Please wait...
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
      {monaco && editor && (
        <AIChat
          code={code ?? editor.getValue()}
          language={editor.getModel()?.getLanguageId() ?? "unknown"}
          onOpenChange={setShowAiChat}
          open={showAiChat}
        />
      )}
      {monaco && editor && (
        <MemoizedStatusBar
          cursorPosition={cursorPosition}
          editor={editor}
          monaco={monaco}
        />
      )}
    </main>
  );
}
