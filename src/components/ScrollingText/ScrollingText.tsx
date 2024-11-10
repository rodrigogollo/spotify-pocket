import "./ScrollingText.css";
import { useRef, useState, useEffect } from "react";

type ScrollingTextProps = {
  text: string;
  className: string
}

const ScrollingText = ({ text, className='' }: ScrollingTextProps) => {
  const textRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (textRef.current) {
        const parent = textRef.current.parentElement;
        if (parent) {
          const textWidth = textRef.current.getBoundingClientRect().width;
          const containerWidth = parent.clientWidth;
          console.log(text, textWidth, containerWidth);
          setNeedsScroll(textWidth > containerWidth);
        }
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [text]);

  return (
    <div ref={textRef} className={`scrolling-text ${needsScroll ? "needs-scroll": ""} ${className}`}>
      {text}
      {needsScroll && <span className="scroll-separator">•</span>}
      {needsScroll && text}
    </div>
  );
}

export default ScrollingText;
