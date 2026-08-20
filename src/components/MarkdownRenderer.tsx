import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  return (
    <div className={`prose prose-slate max-w-none dark:prose-invert font-sans ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black text-foreground border-b border-border/80 pb-2 mt-6 mb-4 tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-extrabold text-primary mt-6 mb-3 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-bold text-foreground mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm sm:text-base text-foreground/90 leading-relaxed mb-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside pl-5 space-y-2 text-sm sm:text-base text-foreground/90 my-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside pl-5 space-y-2 text-sm sm:text-base text-foreground/90 my-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-foreground bg-primary/10 px-1.5 py-0.5 rounded text-primary">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90 font-medium">
              {children}
            </em>
          ),
          hr: () => (
            <hr className="my-6 border-t border-border/80" />
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/80 bg-primary/5 pl-4 py-2 my-4 text-foreground/90 italic rounded-r-xl">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
