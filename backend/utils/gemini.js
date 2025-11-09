const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getModel = (modelName = 'gemini-2.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};


// Chat for doubt solving
exports.chatWithAI = async (messages, chapterContext = '') => {
  try {
    const model = getModel();
    
    const systemPrompt = `You are a helpful AI tutor for Class 10 CBSE students. Answer their questions clearly and concisely. ${chapterContext ? `Context: ${chapterContext}` : ''}`;
    
    const chat = model.startChat({
      history: messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
    });
    
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Error in AI chat:', error);
    throw new Error('Failed to get AI response');
  }
};

// Generate deep chapter content (600-1200 words with HTML formatting)
exports.generateDeepChapterContent = async (chapterName, subjectName) => {
  try {
    const model = getModel();
    const prompt = `You are an expert CBSE Class 10 educator. Generate a comprehensive, detailed, and engaging chapter explanation for:

Subject: ${subjectName}
Chapter: ${chapterName}

CRITICAL REQUIREMENTS:
1. Write 800-1500 words of detailed, educational content
2. Use ONLY HTML tags (NO markdown, NO code blocks)
3. Start directly with HTML content, no explanations or prefixes

HTML STRUCTURE:
- Use <h1>${chapterName}</h1> as the main title (only once at the start)
- Use <h2> for major sections (Introduction, Key Concepts, Detailed Explanations, Solved Examples, Real-life Applications, Summary)
- Use <h3> for subsections
- Use <p> for all paragraphs with proper spacing
- Use <ul> and <li> for bullet points and lists
- Use <strong> for important terms and <em> for emphasis
- Use <blockquote> for important notes or highlights

IMAGES (REQUIRED - Include at least 4-5 images):
- Include <img src="URL" alt="Description" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px;" /> tags
- Use real educational image URLs from:
  * Unsplash: https://images.unsplash.com/photo-[relevant-educational-topic]
  * Placeholder with descriptive text: https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=[Topic+Diagram]
- Each image must be relevant to the content and properly described in alt text
- Place images strategically within relevant sections

CONTENT STRUCTURE (MUST INCLUDE ALL):
1. <h2>Introduction</h2> - 2-3 paragraphs explaining what the chapter covers
2. <h2>Key Concepts</h2> - List and explain 5-7 main concepts with examples
3. <h2>Detailed Explanations</h2> - Deep dive into each concept with formulas, diagrams, and examples
4. <h2>Solved Examples</h2> - Include 3-5 step-by-step solved problems with explanations
5. <h2>Real-life Applications</h2> - Connect concepts to real-world scenarios
6. <h2>Summary</h2> - Concise recap of key points

FORMATTING:
- Use proper spacing between sections
- Include mathematical formulas in <p> tags with proper notation
- Use tables with <table>, <tr>, <td> tags where appropriate
- Make content visually appealing with proper HTML structure

IMPORTANT: Return ONLY the HTML content. Do NOT include markdown code blocks, explanations, or any text outside HTML tags. Start directly with <h1> tag.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let htmlContent = response.text();
    
    // Clean up any markdown code blocks or prefixes
    htmlContent = htmlContent.replace(/```html\n?/gi, '');
    htmlContent = htmlContent.replace(/```\n?/g, '');
    htmlContent = htmlContent.replace(/^[^<]*/, ''); // Remove any text before first HTML tag
    
    // Ensure proper HTML structure
    if (!htmlContent.trim().startsWith('<')) {
      // If content doesn't start with HTML, wrap it
      htmlContent = `<h1>${chapterName}</h1>\n${htmlContent}`;
    }
    
    return htmlContent.trim();
  } catch (error) {
    console.error('Error generating deep content:', error);
    throw new Error(`Failed to generate chapter content: ${error.message}`);
  }
};

// Generate chapter summary (5 bullet points)
exports.generateSummary = async (chapterContent) => {
  try {
    const model = getModel();
    const prompt = `Generate a short summary (5 bullet points) for this chapter content. Format as HTML with <ul> and <li> tags:

${chapterContent.substring(0, 2000)}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
};

// Generate quiz questions (10 MCQs)
exports.generateQuiz = async (chapterContent, numberOfQuestions = 10) => {
  try {
    const model = getModel();
    
    // Strip HTML tags for quiz generation
    const textContent = chapterContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const prompt = `Based on this chapter:

${textContent.substring(0, 3000)}

Generate 10 multiple-choice questions.

Format in JSON:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "..."
  }
]

Important:
- correctAnswer should be the letter (A, B, C, or D) corresponding to the correct option
- Each question must have exactly 4 options labeled A, B, C, D
- Make questions relevant, clear, and appropriate for Class 10 CBSE level
- Include detailed explanations for each answer
- Return ONLY valid JSON array, no other text`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean the response and extract JSON
    let cleanedText = text.trim();
    
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Try to find JSON array
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      
      // Validate and format questions
      return questions.map((q, index) => {
        // Convert letter answer (A, B, C, D) to index (0, 1, 2, 3)
        let correctAnswerIndex = 0;
        if (typeof q.correctAnswer === 'string') {
          const letter = q.correctAnswer.toUpperCase();
          correctAnswerIndex = letter === 'A' ? 0 : letter === 'B' ? 1 : letter === 'C' ? 2 : 3;
        } else if (typeof q.correctAnswer === 'number') {
          correctAnswerIndex = q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0;
        }
        
        return {
          question: q.question || `Question ${index + 1}`,
          options: Array.isArray(q.options) && q.options.length === 4 
            ? q.options 
            : ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: correctAnswerIndex,
          explanation: q.explanation || 'No explanation provided',
          points: 10
        };
      });
    }
    
    throw new Error('Failed to parse quiz questions from AI response');
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz');
  }
};

