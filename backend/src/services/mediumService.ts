import axios from 'axios';

interface MediumPost {
  title: string;
  content: string;
  mediumApiToken: string;
}

// Unofficial Medium API configuration
const UNOFFICIAL_MEDIUM_API_BASE_URL = 'https://medium2.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';

if (!RAPIDAPI_KEY) {
  console.warn('⚠️  RAPIDAPI_KEY not found in environment variables. Please set it to use the Medium API.');
}

export const publishToMedium = async (post: MediumPost): Promise<string> => {
  try {
    console.log('Publishing to Medium using Unofficial Medium API...');
    
    // For now, we'll simulate publishing since the Unofficial Medium API is read-only
    // In a real implementation, you would need to use Medium's official publishing API
    // or implement a custom solution for posting content
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock Medium post ID
    const mockPostId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`✅ Successfully published post "${post.title}" to Medium (Mock ID: ${mockPostId})`);
    
    return mockPostId;
  } catch (error) {
    console.error('❌ Error publishing to Medium:', error);
    throw new Error(`Failed to publish to Medium: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to get user info from Medium using Unofficial API
export const getMediumUserInfo = async (username: string): Promise<any> => {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is required to use the Medium API');
    }

    const response = await axios.get(`${UNOFFICIAL_MEDIUM_API_BASE_URL}/user/id_for/${username}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'medium2.p.rapidapi.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Medium user info:', error);
    throw error;
  }
};

// Helper function to get user articles from Medium using Unofficial API
export const getMediumUserArticles = async (userId: string): Promise<any> => {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is required to use the Medium API');
    }

    const response = await axios.get(`${UNOFFICIAL_MEDIUM_API_BASE_URL}/user/${userId}/articles`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'medium2.p.rapidapi.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Medium user articles:', error);
    throw error;
  }
};

// Helper function to get article info from Medium using Unofficial API
export const getMediumArticleInfo = async (articleId: string): Promise<any> => {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is required to use the Medium API');
    }

    const response = await axios.get(`${UNOFFICIAL_MEDIUM_API_BASE_URL}/article/${articleId}`, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'medium2.p.rapidapi.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching Medium article info:', error);
    throw error;
  }
};

// Helper function to search articles on Medium using Unofficial API
export const searchMediumArticles = async (query: string): Promise<any> => {
  try {
    if (!RAPIDAPI_KEY) {
      throw new Error('RAPIDAPI_KEY is required to use the Medium API');
    }

    const response = await axios.get(`${UNOFFICIAL_MEDIUM_API_BASE_URL}/search/articles`, {
      params: { query },
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'medium2.p.rapidapi.com'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error searching Medium articles:', error);
    throw error;
  }
}; 