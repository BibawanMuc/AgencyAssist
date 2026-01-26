import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Or any other style you prefer

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="markdown-body text-sm leading-relaxed overflow-hidden">
            <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                    // Headers
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mb-4 mt-6 text-slate-100" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mb-3 mt-5 text-slate-200" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mb-2 mt-4 text-slate-300" {...props} />,

                    // Lists
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-4 space-y-1" {...props} />,
                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,

                    // Links
                    a: ({ node, ...props }) => (
                        <a
                            className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        />
                    ),

                    // Code Blocks
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-700/50 bg-[#0d1117]">
                                <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                                    <span className="text-xs font-mono text-slate-400 lowercase">{match[1]}</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <code className={`${className} !bg-transparent !p-0 font-mono text-sm`} {...props}>
                                        {children}
                                    </code>
                                </div>
                            </div>
                        ) : (
                            <code className="bg-slate-700/50 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-xs" {...props}>
                                {children}
                            </code>
                        );
                    },

                    // Blockquotes
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-indigo-500/50 pl-4 py-1 my-4 bg-indigo-500/5 rounded-r-xl italic text-slate-400" {...props} />
                    ),

                    // Paragraphs
                    p: ({ node, ...props }) => <p className="mb-4 last:mb-0" {...props} />,

                    // Tables
                    table: ({ node, ...props }) => <div className="overflow-x-auto my-4 rounded-xl border border-slate-700"><table className="w-full text-left border-collapse" {...props} /></div>,
                    thead: ({ node, ...props }) => <thead className="bg-slate-800 text-slate-200" {...props} />,
                    tbody: ({ node, ...props }) => <tbody className="divide-y divide-slate-700" {...props} />,
                    tr: ({ node, ...props }) => <tr className="hover:bg-slate-800/30 transition-colors" {...props} />,
                    th: ({ node, ...props }) => <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider" {...props} />,
                    td: ({ node, ...props }) => <td className="px-4 py-3 text-sm border-t border-slate-700/50" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
