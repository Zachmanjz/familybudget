
/**
 * Global type definitions for the application.
 */

declare global {
  /**
   * Augmenting the NodeJS ProcessEnv interface ensures that the compiler
   * recognizes process.env.API_KEY without conflicting with standard definitions.
   */
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY: string;
    }
  }

  /**
   * Providing a flexible IntrinsicElements definition allows for custom components
   * while relying on React's primary type definitions for standard elements.
   */
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Conflicting module declarations for 'react', 'react-dom/client', 'lucide-react', 
// 'recharts', and '@google/genai' have been removed as they are already 
// provided by the environment's type definitions.

export {};
