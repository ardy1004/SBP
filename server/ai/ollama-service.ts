// AI Content Generation Service using Ollama (Local AI Models)
// This service provides safe, local AI capabilities without external API dependencies

export interface PropertyData {
  kodeListing?: string;
  judulProperti?: string;
  jenisProperti?: string;
  kabupaten?: string;
  provinsi?: string;
  hargaProperti?: string;
  kamarTidur?: number;
  kamarMandi?: number;
  luasTanah?: number;
  luasBangunan?: number;
  legalitas?: string;
}

export interface AIGenerationResult {
  success: boolean;
  content?: string;
  error?: string;
  model?: string;
  processingTime?: number;
}

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;

  constructor(options: {
    baseUrl?: string;
    defaultModel?: string;
    timeout?: number;
  } = {}) {
    this.baseUrl = options.baseUrl || 'http://localhost:11434';
    this.defaultModel = options.defaultModel || 'mistral';
    this.timeout = options.timeout || 30000; // 30 seconds
  }

  /**
   * Check if Ollama service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Ollama service not available:', error);
      return false;
    }
  }

  /**
   * Generate property description using AI
   */
  async generatePropertyDescription(propertyData: PropertyData): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      // Check if service is available
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: 'AI service is not available. Please ensure Ollama is running.',
        };
      }

      const prompt = this.buildDescriptionPrompt(propertyData);

      const response = await this.callOllama(prompt, {
        temperature: 0.7,
        max_tokens: 800,
      });

      const processingTime = Date.now() - startTime;

      if (response.success && response.content) {
        return {
          success: true,
          content: this.cleanAndFormatDescription(response.content),
          model: this.defaultModel,
          processingTime,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to generate description',
          processingTime,
        };
      }
    } catch (error) {
      console.error('Error generating property description:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while generating the description',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Optimize content for SEO
   */
  async optimizeForSEO(content: string, contentType: 'title' | 'description' | 'social_post'): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: 'AI service is not available.',
        };
      }

      const prompt = this.buildSEOPrompt(content, contentType);

      const response = await this.callOllama(prompt, {
        temperature: 0.6,
        max_tokens: contentType === 'title' ? 100 : 300,
      });

      const processingTime = Date.now() - startTime;

      if (response.success && response.content) {
        return {
          success: true,
          content: response.content.trim(),
          model: this.defaultModel,
          processingTime,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to optimize content',
          processingTime,
        };
      }
    } catch (error) {
      console.error('Error optimizing content for SEO:', error);
      return {
        success: false,
        error: 'An unexpected error occurred during SEO optimization',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Generate social media post for property
   */
  async generateSocialPost(propertyData: PropertyData, platform: string): Promise<AIGenerationResult> {
    const startTime = Date.now();

    try {
      if (!(await this.isAvailable())) {
        return {
          success: false,
          error: 'AI service is not available.',
        };
      }

      const prompt = this.buildSocialPostPrompt(propertyData, platform);

      const response = await this.callOllama(prompt, {
        temperature: 0.8,
        max_tokens: 200,
      });

      const processingTime = Date.now() - startTime;

      if (response.success && response.content) {
        return {
          success: true,
          content: this.formatSocialPost(response.content, platform),
          model: this.defaultModel,
          processingTime,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Failed to generate social post',
          processingTime,
        };
      }
    } catch (error) {
      console.error('Error generating social post:', error);
      return {
        success: false,
        error: 'An unexpected error occurred while generating social post',
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Private method to call Ollama API
   */
  private async callOllama(prompt: string, options: {
    temperature?: number;
    max_tokens?: number;
  } = {}): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.defaultModel,
          prompt: prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: options.max_tokens || 500,
            top_p: 0.9,
            top_k: 40,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        return {
          success: false,
          error: `Ollama API error: ${response.status} - ${errorText}`,
        };
      }

      const result = await response.json();

      if (result.response) {
        return {
          success: true,
          content: result.response,
        };
      } else {
        return {
          success: false,
          error: 'No response content from Ollama',
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout - AI service took too long to respond',
        };
      }

      return {
        success: false,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Build prompt for property description generation
   */
  private buildDescriptionPrompt(data: PropertyData): string {
    return `Buat deskripsi properti yang menarik dan SEO-friendly dalam bahasa Indonesia.

Data Properti:
- Kode: ${data.kodeListing || 'N/A'}
- Judul: ${data.judulProperti || 'N/A'}
- Tipe: ${data.jenisProperti || 'N/A'}
- Lokasi: ${data.kabupaten || 'N/A'}, ${data.provinsi || 'N/A'}
- Harga: ${data.hargaProperti || 'N/A'}
- Kamar Tidur: ${data.kamarTidur || 'N/A'}
- Kamar Mandi: ${data.kamarMandi || 'N/A'}
- Luas Tanah: ${data.luasTanah ? `${data.luasTanah} m²` : 'N/A'}
- Luas Bangunan: ${data.luasBangunan ? `${data.luasBangunan} m²` : 'N/A'}
- Legalitas: ${data.legalitas || 'N/A'}

Instruksi:
- Buat deskripsi 200-400 kata yang persuasif
- Sertakan keyword SEO: ${data.kabupaten}, ${data.jenisProperti}, dijual, ${data.provinsi}
- Gunakan bahasa yang mengalir dan profesional
- Sebutkan keunggulan properti
- Akhiri dengan call-to-action untuk menghubungi
- Format: plain text dengan paragraf yang jelas
- Jangan gunakan bullet points atau formatting khusus

Deskripsi:`;
  }

  /**
   * Build prompt for SEO optimization
   */
  private buildSEOPrompt(content: string, type: string): string {
    const typeInstructions = {
      title: 'Buat judul yang clickbait tapi tetap profesional, maksimal 60 karakter',
      description: 'Optimasi untuk meta description, maksimal 160 karakter, sertakan keyword utama',
      social_post: 'Buat postingan yang engaging untuk social media dengan emoji dan hashtag'
    };

    return `Optimasi konten berikut untuk SEO dan engagement:

Konten asli: "${content}"
Tipe konten: ${type}

Instruksi:
${typeInstructions[type as keyof typeof typeInstructions]}

Hasil optimasi:`;
  }

  /**
   * Build prompt for social media post generation
   */
  private buildSocialPostPrompt(data: PropertyData, platform: string): string {
    const platformGuidelines = {
      facebook: 'Postingan informatif dengan detail lengkap, emoji, dan call-to-action',
      instagram: 'Caption menarik dengan emoji, hashtag, dan tone yang friendly',
      twitter: 'Tweet singkat, impactful, dengan hashtag dan link',
      tiktok: 'Script untuk video 15-30 detik yang engaging dan informative'
    };

    return `Buat postingan ${platform} untuk properti ini:

Data Properti:
- ${data.judulProperti || 'Properti menarik'}
- Lokasi: ${data.kabupaten}, ${data.provinsi}
- Harga: ${data.hargaProperti}
- Tipe: ${data.jenisProperti}

Panduan untuk ${platform}:
${platformGuidelines[platform as keyof typeof platformGuidelines]}

Postingan:`;
  }

  /**
   * Clean and format generated description
   */
  private cleanAndFormatDescription(content: string): string {
    return content
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/^\s*[-•*]\s*/gm, '') // Remove bullet points
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  /**
   * Format social media post
   */
  private formatSocialPost(content: string, platform: string): string {
    let formatted = content.trim();

    // Add platform-specific elements
    if (platform === 'instagram' || platform === 'facebook') {
      // Ensure has emojis and hashtags
      if (!formatted.includes('#')) {
        formatted += '\n\n#Property #RealEstate #' + platform;
      }
    }

    return formatted;
  }
}

// Export singleton instance
export const ollamaService = new OllamaService();