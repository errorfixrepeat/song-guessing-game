import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import stringSimilarity from "string-similarity";
import WaveSurfer from "wavesurfer.js";

export default function SongGuessGame() {
  const songs = [
    {
      title: "Last Nite",
      artist: "The Strokes",
      fullAnswer: "Last Nite by The Strokes",
      clue: "Closing already? It only opened yesterday.",
      fact: "This song has been called a rip-off of Tom Petty and the Heartbreakers' American Girl.",
      audioUrl: "https://files.catbox.moe/lj72u9.mp3",
      variations: ["last night"]
    },
    {
      title: "Call Me",
      artist: "Blondie",
      fullAnswer: "Call Me by Blondie",
      clue: "The hotline is open 24/7.",
      fact: "Originally written as the theme song for the 1980 film American Gigolo.",
      audioUrl: "https://files.catbox.moe/3tl3ih.mp3",
      variations: []
    },
    {
      title: "Stick Season",
      artist: "Noah Kahan",
      fullAnswer: "Stick Season by Noah Kahan",
      clue: "Just add salt and pepper.",
      fact: "The song refers to the period between autumn foliage and the first snow in New England",
      audioUrl: "https://files.catbox.moe/im70kr.mp3",
      variations: ["Noah Kahan Stick Season"]
    },
    {
      title: "Espresso",
      artist: "Sabrina Carpenter",
      fullAnswer: "Espresso by Sabrina Carpenter",
      clue: "It might keep you up all night.",
      fact: "On August 7, 2024, the single surpassed 1 billion streams on Spotify.",
      audioUrl: "https://files.catbox.moe/65ob4d.mp3",
      variations: ["expresso", "sabrina carpenter espresso"]
    },
  ];

  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [clue, setClue] = useState(null);
  const [fact, setFact] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  const song = songs[currentSongIndex];

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.destroy();
    }

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#14b8a6",
      progressColor: "#ec4899",
      barWidth: 2,
      height: 80,
      responsive: true,
    });

    wavesurfer.current.load(song.audioUrl);
    setIsPlaying(false);

    return () => wavesurfer.current.destroy();
  }, [currentSongIndex]);

  useEffect(() => {
    const waveformNode = waveformRef.current;
    if (waveformNode) {
      waveformNode.addEventListener("click", handlePlayPause);
    }
    return () => {
      if (waveformNode) {
        waveformNode.removeEventListener("click", handlePlayPause);
      }
    };
  }, [isPlaying]);

  const handleNextSong = () => {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) {
      nextIndex = 0;
    }
    setCurrentSongIndex(nextIndex);
    setGuess("");
    setClue(null);
    setFact(null);
    setAnswer(null);
    setFeedback(null);
  };

  const handleCheckAnswer = () => {
    const guessLower = guess.trim().toLowerCase();
    const titleLower = song.title.toLowerCase();
    const artistLower = song.artist.toLowerCase();
    const fullLower = song.fullAnswer.toLowerCase();
    const variationsLower = (song.variations || []).map(v => v.toLowerCase());

    const isCloseTo = (target) =>
      stringSimilarity.compareTwoStrings(guessLower, target) > 0.8;

    const matchesFull = isCloseTo(fullLower) || isCloseTo(titleLower);
    const matchesVariation = variationsLower.some(v => isCloseTo(v));

    if (matchesFull) {
      setFeedback("🎉 Correct!");
    } else if (matchesVariation) {
      setFeedback("🔎 That's close — check your spelling!");
    } else if (isCloseTo(artistLower)) {
      setFeedback("✅ That's the correct artist, but we're looking for the song title.");
    } else {
      setFeedback("❌ Not quite. Try again!");
    }
  };

  const handlePlayPause = () => {
    if (wavesurfer.current.isPlaying()) {
      wavesurfer.current.pause();
      setIsPlaying(false);
    } else {
      wavesurfer.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-200 via-yellow-100 to-teal-200 text-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full p-6 rounded-2xl shadow-2xl bg-white">
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-center text-pink-600">🎵 Guess the Song!</h1>
          <div className="w-full cursor-pointer" ref={waveformRef}></div>

          <input
            type="text"
            placeholder="Enter your guess here"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="w-full p-2 bg-yellow-100 border border-yellow-300 rounded-md text-gray-800 placeholder-pink-400 focus:ring-2 focus:ring-pink-400"
          />

          <button
            className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md"
            onClick={handleCheckAnswer}
          >
            Submit Guess
          </button>

          {feedback && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-lg font-medium">
              {feedback}
            </motion.div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <button
              className="py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-md"
              onClick={() => setClue(song.clue)}
            >
              Clue
            </button>
            <button
              className="py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-md"
              onClick={() => setFact(song.fact)}
            >
              Fact
            </button>
            <button
              className="py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md"
              onClick={() => setAnswer(song.fullAnswer)}
            >
              Reveal
            </button>
          </div>

          {clue && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-pink-600">
              💡 Clue: {clue}
            </motion.div>
          )}

          {fact && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-purple-600">
              📘 Fact: {fact}
            </motion.div>
          )}

          {answer && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xl font-bold">
              ✅ Answer: {answer}
            </motion.div>
          )}

          <button
            className="w-full py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-md"
            onClick={handleNextSong}
          >
            Next Song
          </button>
        </div>
      </div>
    </main>
  );
}
