import React from 'react';

export const FormattedText: React.FC<{ text: string, className?: string }> = ({ text, className }) => {
  if (!text) return null;

  // Split by newlines to handle blocks
  const lines = text.split('\n');

  return (
    <div className={className}>
      {lines.map((line, lineIdx) => {
        // Handle Lists
        if (line.trim().startsWith('- ')) {
            return (
                <div key={lineIdx} className="flex gap-2 ml-2">
                    <span className="text-gray-400">•</span>
                    <span><InlineText text={line.substring(2)} /></span>
                </div>
            )
        }
        
        // Handle Ordered Lists (simple 1. detection)
        if (/^\d+\.\s/.test(line.trim())) {
             return (
                <div key={lineIdx} className="flex gap-2 ml-2">
                    <span className="text-gray-400 font-mono text-xs pt-1">{line.trim().split(' ')[0]}</span>
                    <span><InlineText text={line.trim().substring(line.trim().indexOf(' ') + 1)} /></span>
                </div>
            )
        }
        
        // Handle Images ![alt](url) - Basic detection
        // Note: Base64 strings can be long, so regex needs to be careful or handle standard markdown image syntax
        const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
            return (
                <div key={lineIdx} className="my-2">
                    <img 
                        src={imgMatch[2]} 
                        alt={imgMatch[1]} 
                        className="max-w-full rounded-lg border border-zinc-700 max-h-48 object-cover cursor-pointer hover:opacity-90"
                        onClick={() => typeof window !== 'undefined' && window.open(imgMatch[2], '_blank')}
                    />
                </div>
            )
        }

        return (
            <div key={lineIdx} className={`min-h-[1.2em] ${lineIdx > 0 ? 'mt-0.5' : ''}`}>
                <InlineText text={line} />
            </div>
        );
      })}
    </div>
  );
};

const InlineText = ({ text }: { text: string }) => {
    // Regex for bold (**), italic (_), strikethrough (~~)
    // Capturing groups are included in split result
    const parts = text.split(/(\*\*.*?\*\*|__.*?__|~~.*?~~|_.*?_)/g);
    
    return (
        <>
            {parts.map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('~~') && part.endsWith('~~')) {
                    return <s key={i} className="opacity-70">{part.slice(2, -2)}</s>;
                }
                if (part.startsWith('_') && part.endsWith('_')) {
                    return <em key={i} className="italic">{part.slice(1, -1)}</em>;
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    )
}