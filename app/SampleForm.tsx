"use client";

import { useState } from "react";
import RichTextEditor from "./RichTextEditor/RichTextEditor";

export default function SampleForm() {
  const [markdown, setMarkdown] = useState("Here is sample **text**.");

  const handleChange = (markdown: string) => {
    setMarkdown(markdown);
  };

  return (
    <form>
      <RichTextEditor value={markdown} onChange={handleChange} />
    </form>
  );
}
