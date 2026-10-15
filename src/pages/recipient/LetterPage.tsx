import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";

import type { Surprise } from "../../lib/supabase";
import type { Theme } from "../../lib/effects";
import { LightHearts, SparkleField } from "../../lib/effects";
import "./LetterPage.css";

interface Props {
  s: Surprise;
  theme: Theme;
  onNext: () => void;
  isLast: boolean;
}

export default function LetterPage({ s, theme, onNext, isLast }: Props) {
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isLetterOut, setIsLetterOut] = useState(false);
  const [typedLetter, setTypedLetter] = useState("");
  const [typingComplete, setTypingComplete] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  const handleEnvelopeClick = () => {
    if (isFlapOpen) return;
    setIsFlapOpen(true);
    
    // After flap opens, slide letter out
    setTimeout(() => {
      setIsLetterOut(true);
    }, 800);
  };

  useEffect(() => {
    if (isLetterOut && letterRef.current) {
      setTimeout(() => {
        letterRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [isLetterOut]);

  useEffect(() => {
    if (!isLetterOut) return;

    const text = s.letter || "Happy Birthday! Wishing you a wonderful day filled with happiness.";
    let index = 0;

    const timer = setInterval(() => {
      index++;
      setTypedLetter(text.slice(0, index));

      if (index >= text.length) {
        setTypingComplete(true);
        clearInterval(timer);
      }
    }, 35); // slightly slower, more elegant typing

    return () => clearInterval(timer);
  }, [isLetterOut, s.letter]);

  const displayName = s.nickname || s.recipient_name;
  const accentColor = "#ff5e6c"; // Soft pink/red accent matching the new theme

  return (
    <div className={`letter-page-root ${isLetterOut ? "is-opened" : ""}`}>
      {/* Background Effects */}
      <LightHearts accent={accentColor} count={12} />
      {isLetterOut && <SparkleField count={25} />}

      <AnimatePresence>
        {!isLetterOut && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            style={{ zIndex: 10, textAlign: "center", width: "100%" }}
          >
            <h1 className="letter-title">A Letter For You</h1>
            
            <div 
              className={`envelope-container ${!isFlapOpen ? "envelope-idle" : ""}`}
              onClick={handleEnvelopeClick}
            >
              {/* Envelope Body */}
              <div className="envelope">
                {/* Envelope Front (flaps folded over) */}
                <div className="envelope-front"></div>
                
                {/* Top Flap */}
                <motion.div 
                  className="envelope-flap"
                  initial={{ rotateX: 0 }}
                  animate={{ rotateX: isFlapOpen ? 180 : 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  style={{
                    boxShadow: isFlapOpen ? "none" : "0 4px 10px rgba(0,0,0,0.05)"
                  }}
                />

                {/* Heart Seal */}
                <AnimatePresence>
                  {!isFlapOpen && (
                    <motion.div 
                      className="envelope-seal"
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart fill="white" size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Open Me Hint */}
              <AnimatePresence>
                {!isFlapOpen && (
                  <motion.div 
                    className="open-hint"
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    Open Me ❤️
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLetterOut && (
          <motion.div
            ref={letterRef}
            className="letter-paper-expanded"
            initial={{ y: 150, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <h2 className="letter-greeting">Dear {displayName},</h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="letter-body"
            >
              {typedLetter}
            </motion.div>

            {typingComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="letter-closing">With Love,</div>
                <div className="letter-signature">
                  {s.creator_name}
                  <Heart fill={accentColor} color={accentColor} size={18} style={{ marginLeft: 4 }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                  <button onClick={onNext} className="continue-btn">
                    <span>{isLast ? "Finish" : "Continue"}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
