"use client";
import { useState } from "react";
import { questions } from "./utils/questions";
import QuestionCard from "./components/QuestionCard";
import { useRouter } from "next/navigation";

export default function Home() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const router = useRouter();

  const handleAnswer = (selectedOption: any) => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      router.push(`/results?score=${score + 1}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {questions && (
        <QuestionCard
          question={questions[currentQuestion].question}
          options={questions[currentQuestion].options}
          image={questions[currentQuestion].image}
          handleAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
