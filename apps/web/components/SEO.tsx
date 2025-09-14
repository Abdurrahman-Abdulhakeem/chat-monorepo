import type { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  noIndex?: boolean;
}

export function generateSEOMetadata({
  title,
  description = "A modern, scalable real-time chat application with instant messaging, voice notes, voice-to-text transcription, and secure authentication.",
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Abdurrahman Abdulhakeem',
  section,
  noIndex = false,
}: SEOProps): Metadata {
  const baseUrl = 'https://chat-monorepo.vercel.app';
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
  
  const fullTitle = title 
    ? `${title} | Chat Monorepo` 
    : 'Chat Monorepo - Modern Real-Time Chat Application';

  const allKeywords = [
    'real-time chat',
    'instant messaging', 
    'voice notes',
    'chat application',
    'Socket.io',
    'React',
    'Next.js',
    ...keywords
  ];

  return {
    title: fullTitle,
    description,
    keywords: allKeywords,
    
    robots: noIndex ? {
      index: false,
      follow: false,
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      title: fullTitle,
      description,
      siteName: 'Chat Monorepo',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title || 'Chat Monorepo',
        }
      ],
      ...(type === 'article' && publishedTime && {
        publishedTime,
        modifiedTime: modifiedTime || publishedTime,
        authors: [author],
        section,
      }),
    },
    
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      creator: '@rammyscript',
      site: '@rammyscript',
      images: [fullImageUrl],
    },
    
    alternates: {
      canonical: fullUrl,
    },
    
    authors: [
      {
        name: author,
        url: 'https://abdurrahman.ng',
      }
    ],
  };
}

// Predefined SEO configurations for common pages
export const SEOConfigs = {
  home: {
    title: 'Home',
    description: 'Experience seamless real-time communication with Chat Monorepo. Modern chat application with voice notes, instant messaging, and advanced features built with React, Next.js, and Socket.io.',
    keywords: ['home', 'dashboard', 'chat rooms', 'messaging platform'],
    url: '/',
  },
  
  login: {
    title: 'Login',
    description: 'Sign in to Chat Monorepo and start chatting with friends. Secure authentication with JWT tokens and persistent sessions.',
    keywords: ['login', 'sign in', 'authentication', 'secure login'],
    url: '/login',
  },
  
  register: {
    title: 'Create Account',
    description: 'Join Chat Monorepo today! Create your account and start connecting with people through our modern real-time chat platform.',
    keywords: ['register', 'sign up', 'create account', 'join chat'],
    url: '/register',
  },
  
  chat: {
    title: 'Chat',
    description: 'Real-time messaging with voice notes, file sharing, and instant notifications. Experience seamless communication with Socket.io powered chat.',
    keywords: ['chat', 'messaging', 'real-time', 'voice notes', 'instant messaging'],
    url: '/chat',
    noIndex: true, // Private area
  },
  
  
} as const;

// Helper function to get predefined SEO config
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSEOConfig(page: keyof typeof SEOConfigs): any {
  return SEOConfigs[page];
}

// Usage:
// export const metadata = generateSEOMetadata(getSEOConfig('login'));