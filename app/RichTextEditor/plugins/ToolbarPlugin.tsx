import {
  $isListNode,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isParentElementRTL } from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { Box, Divider, IconButton, Tooltip, useTheme } from "@mui/material";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import CodeIcon from "@mui/icons-material/Code";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import RedoIcon from "@mui/icons-material/Redo";
import StrikethroughSIcon from "@mui/icons-material/StrikethroughS";
import UndoIcon from "@mui/icons-material/Undo";

const LowPriority = 1;

export default function ToolbarPlugin() {
  const darkmode = useTheme().palette.mode === "dark";
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState(null);
  const [isRTL, setIsRTL] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type);
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const insertNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const handleFormat = (command: any, value?: any) => {
    editor.dispatchCommand(command, value);
  };

  return (
    <Box
      ref={toolbarRef}
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
      p={1}
    >
      {/* History buttons */}
      <Tooltip title="Undo">
        <span>
          <IconButton
            onClick={() => handleFormat(UNDO_COMMAND)}
            disabled={!canUndo}
          >
            <UndoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Redo">
        <span>
          <IconButton
            onClick={() => handleFormat(REDO_COMMAND)}
            disabled={!canRedo}
          >
            <RedoIcon />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem style={{ margin: "0 8px" }} />

      {/* Text Formatting buttons */}
      <Tooltip title="Bold">
        <IconButton
          onClick={() => handleFormat(FORMAT_TEXT_COMMAND, "bold")}
          sx={getActiveStyle(isBold, darkmode)}
        >
          <FormatBoldIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Italic">
        <IconButton
          onClick={() => handleFormat(FORMAT_TEXT_COMMAND, "italic")}
          sx={getActiveStyle(isItalic, darkmode)}
        >
          <FormatItalicIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Underline">
        <IconButton
          onClick={() => handleFormat(FORMAT_TEXT_COMMAND, "underline")}
          sx={getActiveStyle(isUnderline, darkmode)}
        >
          <FormatUnderlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Strikethrough">
        <IconButton
          onClick={() => handleFormat(FORMAT_TEXT_COMMAND, "strikethrough")}
          sx={getActiveStyle(isStrikethrough, darkmode)}
        >
          <StrikethroughSIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Code">
        <IconButton
          onClick={() => handleFormat(FORMAT_TEXT_COMMAND, "code")}
          sx={getActiveStyle(isCode, darkmode)}
        >
          <CodeIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Bulleted List">
        <IconButton onClick={insertBulletList}>
          <FormatListBulletedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Numbered List">
        <IconButton onClick={insertNumberedList}>
          <FormatListNumberedIcon />
        </IconButton>
      </Tooltip>

      {/* Alignment buttons */}
      <Divider orientation="vertical" flexItem style={{ margin: "0 8px" }} />

      <Tooltip title="Align Left">
        <IconButton
          onClick={() => handleFormat(FORMAT_ELEMENT_COMMAND, "left")}
        >
          <FormatAlignLeftIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Center Align">
        <IconButton
          onClick={() => handleFormat(FORMAT_ELEMENT_COMMAND, "center")}
        >
          <FormatAlignCenterIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Align Right">
        <IconButton
          onClick={() => handleFormat(FORMAT_ELEMENT_COMMAND, "right")}
        >
          <FormatAlignRightIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Justify Align">
        <IconButton
          onClick={() => handleFormat(FORMAT_ELEMENT_COMMAND, "justify")}
        >
          <FormatAlignJustifyIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

const getActiveStyle = (isActive: boolean, darkmode: boolean) => ({
  ...(isActive && {
    backgroundColor: darkmode
      ? "rgba(255, 255, 255, 0.08)"
      : "rgba(0, 0, 0, 0.04)",
    "&:hover": {
      backgroundColor: darkmode
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)",
    },
  }),
});
