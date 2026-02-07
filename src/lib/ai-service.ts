// For now, we'll use direct API calls since TanStack AI is still in alpha
// This provides more control and reliability for the hackathon

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'grok' | 'deepseek'

interface AIJobMatchResponse {
  score: number
  reasoning: string
  strengths: string[]
  gaps: string[]
  recommendations: string[]
}

interface OpenAIMessage {
  role: string
  content: string
}

interface OpenAIChoice {
  message: OpenAIMessage
}

interface OpenAIResponse {
  choices: OpenAIChoice[]
}

interface AnthropicContent {
  type: string
  text: string
}



interface AnthropicResponse {
  content: AnthropicContent[]
}

interface GeminiCandidate {
  content: {
    parts: Array<{
      text: string
    }>
  }
}

interface GeminiResponse {
  candidates: GeminiCandidate[]
}

// Grading prompt template
const GRADING_PROMPT = `
You are an expert technical interviewer grading a candidate's submission for a skill challenge.

CHALLENGE INFORMATION:
- Title: {challengeTitle}
- Type: {challengeType}
- Description: {challengeDescription}

TASKS AND RESPONSES:
{tasksAndResponses}

INSTRUCTIONS:
1. Grade each task on a scale of 0-100 based on:
   - Correctness (does it solve the problem?)
   - Code quality (if applicable): readability, best practices, structure
   - Completeness (are all requirements met?)
   - Edge case handling

2. Detect skills demonstrated in the responses (e.g., React, JavaScript, Python, SQL, CSS, etc.)

3. Check for potential plagiarism indicators:
   - Generic responses that don't address the specific task
   - Inconsistent quality across tasks
   - Responses that seem copied from documentation

4. Provide constructive feedback (2-3 sentences)

Return a JSON object with this structure:
{
  "taskScores": [score1, score2, ...],
  "overallScore": number (0-100),
  "skills": ["skill1", "skill2", ...],
  "feedback": "string",
  "plagiarism": boolean
}
`
const JOB_MATCHING_PROMPT = `
Analyze the compatibility between a job candidate and an internship position.

CANDIDATE PROFILE:
- Skills: {candidateSkills}
- Experience Level: {candidateLevel}
- JSS Score: {candidateJSS}/100
- Bio: {candidateBio}

JOB REQUIREMENTS:
- Title: {jobTitle}
- Required Skills: {jobSkills}
- Experience Level: {jobLevel}
- Location Type: {jobLocation}
- Duration: {jobDuration} months
- Compensation: {jobCompensation}
- Company Description: {jobDescription}

TASK:
1. Calculate a compatibility score from 0-100
2. Identify key matching factors
3. Note any skill gaps or concerns
4. Provide specific recommendations

Return a JSON object with this structure:
{
  "score": number (0-100),
  "reasoning": "brief explanation of the score",
  "strengths": ["array of matching strengths"],
  "gaps": ["array of skill or experience gaps"],
  "recommendations": ["specific suggestions for improvement"]
}
`

// Enhanced job matching function using direct API calls
export async function matchCandidateToJob(
  candidate: {
    skills: string
    experienceLevel: string
    jss: number
    bio?: string
  },
  job: {
    title: string
    skills: string
    experienceLevel: string
    locationType: string
    duration?: number
    isPaid: boolean
    description?: string
  },
  provider: AIProvider = 'openai'
) {
  try {
    const prompt = JOB_MATCHING_PROMPT
      .replace('{candidateSkills}', candidate.skills ?? 'Not specified')
      .replace('{candidateLevel}', candidate.experienceLevel ?? 'Not specified')
      .replace('{candidateJSS}', candidate.jss?.toString() ?? '0')
      .replace('{candidateBio}', candidate.bio ?? 'Not provided')
      .replace('{jobTitle}', job.title ?? 'Not specified')
      .replace('{jobSkills}', job.skills ?? 'Not specified')
      .replace('{jobLevel}', job.experienceLevel ?? 'Not specified')
      .replace('{jobLocation}', job.locationType ?? 'Not specified')
      .replace('{jobDuration}', job.duration?.toString() ?? 'Not specified')
      .replace('{jobCompensation}', job.isPaid ? 'Paid' : 'Unpaid')
      .replace('{jobDescription}', job.description ?? 'Not provided')

    // Use direct API call
    const response = await callAIProvider(provider, prompt)

    // Parse the JSON response
    const jsonRegex = /\{[\s\S]*\}/;
    const jsonMatch = jsonRegex.exec(response);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    const analysis = JSON.parse(jsonMatch[0]) as AIJobMatchResponse

    return {
      score: Math.max(0, Math.min(100, analysis.score ?? 0)),
      reasoning: analysis.reasoning ?? 'No reasoning provided',
      strengths: Array.isArray(analysis.strengths) ? analysis.strengths : [],
      gaps: Array.isArray(analysis.gaps) ? analysis.gaps : [],
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      provider,
      model: getModelForProvider(provider)
    }

  } catch (error) {
    console.error('AI matching failed:', error)

    // Fallback to rule-based matching if AI fails
    return fallbackRuleBasedMatching(candidate, job)
  }
}

// Direct API call function - exported for use in routers
export async function callAIProvider(provider: AIProvider, prompt: string): Promise<string> {
  const systemMessage = 'You are an expert HR recruiter specializing in internship matching. Provide objective, data-driven compatibility analysis. Always respond with valid JSON.';

  switch (provider) {
    case 'deepseek':
    case 'openai':
      return await callOpenAICompatible(provider, systemMessage, prompt);

    case 'anthropic':
      return await callAnthropic(systemMessage, prompt);

    case 'google':
      return await callGoogle(systemMessage, prompt);

    case 'grok':
      return await callGrok(systemMessage, prompt);

    default:
      throw new Error(`Unsupported provider: ${provider as string}`);
  }
}

// OpenAI-compatible API (works for OpenAI and DeepSeek)
async function callOpenAICompatible(provider: 'openai' | 'deepseek', systemMessage: string, prompt: string): Promise<string> {
  const apiKey = provider === 'deepseek' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
  const baseURL = provider === 'deepseek' ? 'https://api.deepseek.com/v1' : undefined;
  const model = provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini';

  if (!apiKey) {
    throw new Error(`${provider} API key not configured`);
  }

  const response = await fetch(`${baseURL ?? 'https://api.openai.com/v1'}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  const data = await response.json() as OpenAIResponse;
  return data.choices[0]?.message?.content ?? "";
}

// Anthropic Claude API
async function callAnthropic(systemMessage: string, prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Anthropic API key not configured');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: systemMessage,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Anthropic API call failed: ${response.status}`);
  }

  const data = await response.json() as AnthropicResponse;
  const textContent = data.content.find(c => c.type === 'text');
  return textContent?.text ?? '';
}

// Google Gemini API
async function callGoogle(systemMessage: string, prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error('Google AI API key not configured');

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${systemMessage}\n\n${prompt}` }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1000,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Google API call failed: ${response.status}`);
  }

  const data = await response.json() as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Grok API
async function callGrok(systemMessage: string, prompt: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('Grok API key not configured');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error(`Grok API call failed: ${response.status}`);
  }

  const data = await response.json() as OpenAIResponse;
  return data.choices[0]?.message?.content ?? "";
}

// Get appropriate model for each provider
function getModelForProvider(provider: AIProvider): string {
  switch (provider) {
    case 'deepseek':
    case 'openai':
      return provider === 'deepseek' ? 'deepseek-chat' : 'gpt-4o-mini'
    case 'anthropic':
      return 'claude-3-haiku-20240307'
    case 'google':
      return 'gemini-1.5-flash'
    case 'grok':
      return 'grok-beta'
    default:
      return 'deepseek-chat'
  }
}

// Fallback rule-based matching (our original algorithm)
function fallbackRuleBasedMatching(
  candidate: {
    skills: string
    experienceLevel: string
    jss: number
    bio?: string
  },
  job: {
    title: string
    skills: string
    experienceLevel: string
    locationType: string
    duration?: number
    isPaid: boolean
    description?: string
  }
) {
  let score = 50; // Base compatibility score

  // Skills matching (most important factor - 40% weight)
  const candidateSkills = candidate.skills?.toLowerCase().split(',').map((s: string) => s.trim()) || [];
  const jobSkills = job.skills ? job.skills.toLowerCase().split(',').map((s: string) => s.trim()) : [];
  const matchingSkills = candidateSkills.filter((skill: string) =>
    jobSkills.some((jobSkill: string) => jobSkill.includes(skill) || skill.includes(jobSkill))
  ).length;

  if (jobSkills.length > 0) {
    const skillMatchRatio = matchingSkills / jobSkills.length;
    score += skillMatchRatio * 40;
  }

  // Experience level compatibility (20% weight)
  const candidateLevel = candidate.experienceLevel ?? 'beginner';
  if (candidateLevel === job.experienceLevel) {
    score += 20;
  } else if (Math.abs(["beginner", "intermediate", "advanced"].indexOf(candidateLevel) -
    ["beginner", "intermediate", "advanced"].indexOf(job.experienceLevel ?? "intermediate")) === 1) {
    score += 10;
  }

  // Location preference compatibility (15% weight)
  if (job.locationType === "remote") {
    score += 15;
  } else if (job.locationType === "hybrid") {
    score += 10;
  }

  // JSS/Reputation factor (15% weight)
  const jssBonus = (candidate.jss / 100) * 15;
  score += jssBonus;

  // Duration compatibility (5% weight)
  if (job.duration && job.duration <= 3) {
    score += 5;
  } else if (job.duration && job.duration <= 6) {
    score += 3;
  }

  // Paid vs unpaid factor (5% weight)
  if (job.isPaid) {
    score += 5;
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    reasoning: "Fallback rule-based matching due to AI service unavailability",
    strengths: ["Rule-based compatibility analysis"],
    gaps: [],
    recommendations: ["Complete profile for better AI matching"],
    provider: 'fallback',
    model: 'rule-based'
  }
}

// Real AI grading function
export async function gradeSubmissionWithAI(
  challenge: {
    title: string
    type: string
    description: string
  },
  taskResponses: Array<{
    taskTitle: string
    taskDescription: string
    response: string
  }>,
  provider: AIProvider = 'openai'
) {
  try {
    // Format tasks and responses
    const tasksAndResponses = taskResponses.map((tr, idx) => `
Task ${idx + 1}: ${tr.taskTitle}
Description: ${tr.taskDescription}
Candidate Response:
${tr.response}
---
`).join('\n')

    const prompt = GRADING_PROMPT
      .replace('{challengeTitle}', challenge.title)
      .replace('{challengeType}', challenge.type)
      .replace('{challengeDescription}', challenge.description)
      .replace('{tasksAndResponses}', tasksAndResponses)

    // Call AI provider
    const response = await callAIProvider(provider, prompt)

    // Parse JSON response
    const jsonRegex = /\{[\s\S]*\}/
    const jsonMatch = jsonRegex.exec(response)
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from AI')
    }

    const grading = JSON.parse(jsonMatch[0]) as {
      taskScores: number[]
      overallScore: number
      skills: string[]
      feedback: string
      plagiarism: boolean
    }

    return {
      taskScores: grading.taskScores || taskResponses.map(() => 70),
      overallScore: Math.max(0, Math.min(100, grading.overallScore ?? 70)),
      skills: Array.isArray(grading.skills) ? grading.skills : [],
      feedback: grading.feedback || 'No feedback provided',
      plagiarism: !!grading.plagiarism,
      provider,
      model: getModelForProvider(provider)
    }
  } catch (error) {
    console.error('AI grading failed:', error)

    // Fallback to database-stored rubric or manual grading
    throw new Error('AI grading failed - please grade manually')
  }
}
export async function batchMatchCandidates(
  candidates: Array<{
    id: string
    skills: string
    experienceLevel: string
    jss: number
    bio?: string
  }>,
  job: {
    title: string
    skills: string
    experienceLevel: string
    locationType: string
    duration?: number
    isPaid: boolean
    description?: string
  },
  provider: AIProvider = 'openai'
) {
  const results = await Promise.all(
    candidates.map(candidate =>
      matchCandidateToJob(candidate, job, provider)
    )
  )

  return results.map((result, index) => ({
    candidateId: candidates[index]?.id ?? "unknown",
    ...result
  }))
}