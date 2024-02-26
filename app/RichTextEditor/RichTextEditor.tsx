"use client";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { Box, Typography } from "@mui/material";
import { EditorState, LexicalEditor } from "lexical";
import PlaygroundAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import mainTheme from "./themes/MainTheme";

const editorConfig = {
  theme: mainTheme,
  onError(error: any) {
    throw error;
  },

  namespace: "editor",
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

interface RichTextEditorProps {
  /** The markdown string the editor should use. */
  value?: string;

  /** A callback that is called when the editor's content changes. */
  onChange?: (markdown: string) => void;

  /** The placeholder text to display when the editor is empty. */
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = "",
  onChange = () => {},
  placeholder = "Enter some text...",
}) => {
  const handleChange = (editorState: EditorState, _editor: LexicalEditor) => {
    editorState.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      onChange(markdown);
    });
  };

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: () => $convertFromMarkdownString(value, TRANSFORMERS),
      }}
    >
      <Box sx={{ position: "relative" }}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={
            <Typography className="editor-placeholder" color="gray">
              {placeholder}
            </Typography>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <PlaygroundAutoLinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={handleChange} />
      </Box>
    </LexicalComposer>
  );
};

export default RichTextEditor;
