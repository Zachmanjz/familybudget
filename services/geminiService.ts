
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, MonthlyBudget, CategoryType } from "../types";

// The GoogleGenAI client is initialized using the API key from process.env.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes budget data and provides actionable insights.
 * Uses gemini-3-pro-preview for advanced financial reasoning.
 */
export const getBudgetInsights = async (
  transactions: Transaction[],
  monthlyBudgets: MonthlyBudget[],
  currentMonth: string
) => {
  const currentMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
  const currentMonthBudget = monthlyBudgets.find(b => b.month === currentMonth);

  const prompt = `
    Analyze my family budget for ${currentMonth}.
    
    Budget Plan:
    ${JSON.stringify(currentMonthBudget?.budgets || [])}
    
    Actual Transactions:
    ${JSON.stringify(currentMonthTransactions.map(t => ({ 
      category: t.category, 
      amount: t.amount, 
      type: t.type, 
      desc: t.description 
    })))}
    
    Provide 3 concise, actionable financial tips based on this data. Focus on overspending and potential savings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex Text Task: Advanced reasoning
      contents: prompt,
      config: {
        systemInstruction: "You are a professional financial advisor specializing in family budgeting. Keep advice practical, encouraging, and brief.",
      }
    });
    // response.text is a getter, do not call as a function.
    return response.text || "No insights available at the moment.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Failed to generate AI insights. Please check your connection.";
  }
};

/**
 * Suggests a category for a given transaction description.
 * Uses gemini-3-flash-preview for efficiency in simple classification.
 */
export const categorizeDescription = async (description: string, allCategories: string[]): Promise<CategoryType> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Basic Text Task: Simple classification
      contents: `Categorize this transaction description into one of these: ${allCategories.join(', ')}. Description: "${description}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING }
          },
          required: ["category"]
        }
      }
    });
    // Extract and trim text before parsing JSON.
    const text = response.text?.trim() || '{"category": "Other"}';
    const result = JSON.parse(text);
    return result.category as CategoryType;
  } catch (error) {
    return "Other";
  }
};

/**
 * Parses raw bank CSV text into structured transaction objects.
 * Uses gemini-3-pro-preview for complex data extraction and mapping.
 */
export const parseCsvWithAi = async (csvText: string, allCategories: string[]): Promise<Omit<Transaction, 'id'>[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Complex Text Task: Reasoning and data extraction
      contents: `
        The following is a raw text from a bank CSV file. Parse it accurately into structured transactions.
        
        STRICT RULES:
        1. Date: Convert to YYYY-MM-DD. If format is ambiguous (e.g. 01/02/2024), assume MM/DD/YYYY.
        2. Amount: Must be a positive decimal. 
        3. Type: 'expense' for money out, 'income' for money in.
        4. Category: Map to one of: ${allCategories.join(', ')}.
        5. Smart Mapping:
           - Look for 'Description', 'Payee', or 'Memo' for the description.
           - Look for 'Amount', 'Debit', 'Credit', 'Value' for the price.
           - If there's a 'Debit' and 'Credit' column, use whichever has a value.
        6. Filtering: Ignore pending transactions or those with zero value.
        
        CSV Data Snippet:
        ${csvText.substring(0, 8000)}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING, description: "YYYY-MM-DD format" },
              description: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['expense', 'income'] },
              category: { type: Type.STRING }
            },
            required: ["date", "description", "amount", "type", "category"]
          }
        }
      }
    });

    // Extract and trim text before parsing JSON.
    const text = response.text?.trim() || '[]';
    return JSON.parse(text);
  } catch (error) {
    console.error("CSV AI Parse Error:", error);
    throw new Error("Failed to parse CSV file. Ensure it contains date, description and amount columns.");
  }
};
