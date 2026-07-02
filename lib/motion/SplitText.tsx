import React from "react";

interface SplitTextProps {
  children: string;
  className?: string;
  wordClassName?: string;
  charClassName?: string;
}

export function SplitText({ children, className, wordClassName, charClassName }: SplitTextProps) {
  const words = children.split(" ");

  return (
    <span className={className} style={{ display: "inline-block" }}>
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className={wordClassName}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {word.split("").map((char, charIndex) => (
            <span
              key={charIndex}
              className={`split-char ${charClassName || ""}`}
              style={{ display: "inline-block", opacity: 0, filter: "blur(10px)", transform: "translateY(20px)" }}
            >
              {char}
            </span>
          ))}
          {wordIndex !== words.length - 1 && <span> </span>}
        </span>
      ))}
    </span>
  );
}
