"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Fragment } from "react";

type Props = {
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  // Stagger per word, in seconds. Brief defaults to 0.04s.
  stagger?: number;
  once?: boolean;
};

// Splits a string into words and animates each one with a mask reveal from the
// bottom. The mask is achieved by a parent with `overflow: hidden` and a child
// translated up from translateY(110%).
export function RevealText({
  children,
  as = "span",
  className,
  delay = 0,
  stagger = 0.04,
  once = true,
}: Props) {
  const reduce = useReducedMotion();
  const Tag = as as keyof React.JSX.IntrinsicElements;
  const words = children.split(" ");

  if (reduce) {
    const Static = Tag as keyof React.JSX.IntrinsicElements;
    return <Static className={className}>{children}</Static>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once, amount: 0.6 }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
                delay: delay + i * stagger,
              }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
