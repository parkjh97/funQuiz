import React from "react";

type QuestionCardProps = {
  question: string;
  options: string[];
  image: string;
  handleAnswer: (option: string) => void;
};

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  options,
  image,
  handleAnswer,
}) => {
  return (
    <div className="bg-white shadow-md p-6 rounded-md">
      <img
        src={image}
        alt="question"
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h2 className="text-lg font-bold mb-4">{question}</h2>
      <div className="space-y-2">
        {options.map((option, index) => (
          <button
            key={index}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            onClick={() => handleAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
