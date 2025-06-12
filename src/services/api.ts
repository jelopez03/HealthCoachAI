import { supabase } from '../lib/supabase';
import type { ChatResponse, UserProfile, Conversation, Message } from '../types';

// External API Configuration
const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY || 'placeholder-tavus-key';
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY || 'placeholder-elevenlabs-key';

export class HealthCoachingAPI {
  static async sendChatMessage(
    conversationId: string,
    message: string,
    userProfile?: UserProfile
  ): Promise<ChatResponse> {
    try {
      // Save user message to database
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: message,
          message_type: 'text'
        });

      if (messageError) throw messageError;

      // Call our backend endpoint to process the message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          message,
          user_profile: userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiResponse: ChatResponse = await response.json();

      // Save AI response to database
      const { error: aiMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiResponse.message,
          message_type: aiResponse.message_type,
          metadata: {
            video_url: aiResponse.video_url,
            audio_url: aiResponse.audio_url,
            meal_plan: aiResponse.meal_plan,
            recipe: aiResponse.recipe
          }
        });

      if (aiMessageError) throw aiMessageError;

      return aiResponse;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  static async generateTavusVideo(prompt: string, context: string): Promise<string> {
    try {
      const response = await fetch('https://api.tavus.io/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TAVUS_API_KEY}`
        },
        body: JSON.stringify({
          prompt,
          context,
          avatar_id: 'health-coach-avatar', // Replace with actual avatar ID
          voice_settings: {
            tone: 'encouraging',
            pace: 'natural'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate Tavus video');
      }

      const data = await response.json();
      return data.video_url;
    } catch (error) {
      console.error('Error generating Tavus video:', error);
      // Return placeholder for development
      return 'https://example.com/placeholder-video.mp4';
    }
  }

  static async generateElevenLabsAudio(text: string, voice: string = 'coaching-voice'): Promise<string> {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate ElevenLabs audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      return audioUrl;
    } catch (error) {
      console.error('Error generating ElevenLabs audio:', error);
      // Return placeholder for development
      return 'https://example.com/placeholder-audio.mp3';
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  static async updateUserProfile(profile: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(profile);

    if (error) {
      throw error;
    }
  }

  static async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  static async createConversation(userId: string, title: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        title,
        message_count: 0
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  static async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }
}