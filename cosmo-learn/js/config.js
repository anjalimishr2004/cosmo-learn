// js/config.js

const CONFIG = {
  CACHE_PREFIX: "cosmolearn_topic_"
};


// Fallback content
// Used when Gemini is temporarily unavailable.

const FALLBACK_TOPIC = {
  title: "Astrophysics",
  category: "Astrophysics",

  summary:
    "The study of stars, galaxies, and the physical laws that govern the universe at the largest scales. Astrophysics helps us understand extreme objects such as black holes, neutron stars, and galaxies.",

  keyMechanics: [
    "Gravity curves spacetime according to General Relativity.",
    "Stars generate energy through nuclear fusion in their cores.",
    "The universe has been expanding since the Big Bang."
  ],

  latexFormula: "E = mc^2",

  formulaExplanation:
    "Mass and energy are equivalent — a small amount of mass can correspond to a huge amount of energy.",

  realWorldApplication:
    "Astrophysics helps scientists understand stars, galaxies, black holes, space missions, and the evolution of the universe.",

  quiz: [
    {
      question:
        "What force is responsible for the curvature of spacetime?",

      options: [
        "Gravity",
        "Magnetism",
        "Friction",
        "Tension"
      ],

      correctIndex: 0,

      explanation:
        "General Relativity describes gravity as the curvature of spacetime caused by mass and energy."
    },

    {
      question:
        "What powers most main-sequence stars?",

      options: [
        "Nuclear fusion",
        "Chemical combustion",
        "Friction",
        "Electricity"
      ],

      correctIndex: 0,

      explanation:
        "Main-sequence stars produce energy primarily through nuclear fusion in their cores."
    },

    {
      question:
        "What happens to the universe on large scales?",

      options: [
        "It is expanding",
        "It is completely static",
        "It is shrinking everywhere",
        "It has no measurable structure"
      ],

      correctIndex: 0,

      explanation:
        "Observations show that the universe has been expanding since the early universe."
    }
  ]
};