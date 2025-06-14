import { GoogleGenerativeAI } from '@google/generative-ai';
import type { UserProfile } from '../types';

const GEMINI_API_KEY = 'AIzaSyBuYPySliLs9zeZ_F3Wj-4b2mCQvFgT_hQ';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  async generateResponse(
    message: string, 
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
    userProfile?: UserProfile
  ): Promise<string> {
    try {
      // Build context from user profile
      let systemContext = `You are HealthCoach AI, a friendly and knowledgeable health and nutrition coach. You provide personalized advice, meal planning, recipe suggestions, and motivation to help users achieve their health goals.

Key guidelines:
- Be encouraging and supportive
- Provide practical, actionable advice
- Ask clarifying questions when needed
- Focus on sustainable, healthy habits
- Avoid medical diagnosis - recommend consulting healthcare professionals for medical concerns
- Keep responses conversational and engaging
- Use emojis occasionally to make responses more friendly`;

      if (userProfile) {
        systemContext += `

User Profile:
- Name: ${userProfile.name || 'User'}
- Age: ${userProfile.age || 'Not specified'}
- Gender: ${userProfile.gender || 'Not specified'}
- Height: ${userProfile.height_feet || 0}' ${userProfile.height_inches || 0}"
- Weight: ${userProfile.weight || 'Not specified'} lbs
- Activity Level: ${userProfile.activity_level || 'Not specified'}
- Health Goals: ${userProfile.health_goals?.join(', ') || 'Not specified'}
- Dietary Restrictions: ${userProfile.dietary_restrictions?.join(', ') || 'None'}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Current Habits: ${userProfile.current_habits || 'Not specified'}

Use this information to provide personalized recommendations and advice.`;
      }

      // Build conversation history for context
      const conversationContext = conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'HealthCoach AI'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemContext}

${conversationContext ? `Previous conversation:\n${conversationContext}\n` : ''}

User: ${message}

HealthCoach AI:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating Gemini response:', error);
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  async generateMealPlan(
    preferences: {
      calories?: number;
      days?: number;
      dietaryRestrictions?: string[];
      allergies?: string[];
      goals?: string[];
    },
    userProfile?: UserProfile
  ): Promise<any> {
    try {
      const prompt = `Create a detailed ${preferences.days || 7}-day meal plan with approximately ${preferences.calories || 1800} calories per day.

User preferences:
- Dietary restrictions: ${preferences.dietaryRestrictions?.join(', ') || 'None'}
- Allergies: ${preferences.allergies?.join(', ') || 'None'}
- Health goals: ${preferences.goals?.join(', ') || 'General health'}

${userProfile ? `
User profile:
- Activity level: ${userProfile.activity_level}
- Current habits: ${userProfile.current_habits}
` : ''}

Format the response as a structured meal plan with:
- Day name
- Breakfast, lunch, dinner, and snacks
- Estimated calories per meal
- Brief preparation instructions
- Ingredient lists

Make it practical and achievable for someone with a busy lifestyle.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw new Error('Failed to generate meal plan. Please try again.');
    }
  }

  async generateRecipe(
    request: string,
    dietaryRestrictions?: string[],
    allergies?: string[]
  ): Promise<any> {
    try {
      const prompt = `Create a detailed recipe based on this request: "${request}"

Consider these dietary restrictions: ${dietaryRestrictions?.join(', ') || 'None'}
Avoid these allergens: ${allergies?.join(', ') || 'None'}

Format the response with:
- Recipe name
- Prep time and cook time
- Servings
- Ingredients list with measurements
- Step-by-step instructions
- Estimated calories per serving
- Nutritional highlights
- Tips for success

Make it clear, easy to follow, and delicious!`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw new Error('Failed to generate recipe. Please try again.');
    }
  }
}

export const geminiService = new GeminiService();