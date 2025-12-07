
import { GoogleGenAI, Type } from "@google/genai";
import { EbookStructure } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const textModel = "gemini-3-pro-preview";
const imageModel = "gemini-2.5-flash-image";

export async function generateEbookStructure(topic: string): Promise<EbookStructure> {
  const prompt = `Aja como um especialista em marketing digital e criação de infoprodutos. Preciso que você crie a estrutura de um e-book sobre o tema: "${topic}".
  Sua resposta deve ser um JSON bem-formado.
  O JSON deve conter:
  1. "title": Um título extremamente chamativo e vendedor para o e-book.
  2. "description": Uma descrição de venda persuasiva com 2-3 parágrafos, destacando os benefícios e o que o leitor aprenderá.
  3. "chapterTitles": Um array com exatamente 10 títulos de capítulos, cobrindo o tema de forma lógica e progressiva, do básico ao avançado.`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          chapterTitles: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["title", "description", "chapterTitles"]
      }
    }
  });

  try {
    if (response.text) {
        return JSON.parse(response.text);
    }
    throw new Error("A resposta da API está vazia ou malformada.");
  } catch (e) {
    console.error("Erro ao analisar JSON da estrutura do e-book:", e);
    console.error("Resposta recebida:", response.text);
    throw new Error("Não foi possível processar a estrutura do e-book. A resposta da API pode ter sido inválida.");
  }
}

export async function generateChapterContent(topic: string, ebookTitle: string, chapterTitle: string): Promise<string> {
  const prompt = `Você é um escritor especialista no tópico "${topic}".
  Escreva o conteúdo completo para o capítulo "${chapterTitle}" do e-book intitulado "${ebookTitle}".
  O conteúdo deve ser detalhado, bem explicado, prático e com pelo menos 500 palavras.
  Use uma linguagem clara e acessível para o público-alvo. Formate o texto usando parágrafos para facilitar a leitura. Não use markdown.`;

  const response = await ai.models.generateContent({
    model: textModel,
    contents: prompt
  });
  
  if (response.text) {
      return response.text;
  }
  throw new Error("Falha ao gerar o conteúdo do capítulo.");
}

export async function generateEbookCover(title: string, topic: string): Promise<string> {
  const prompt = `Crie uma capa de e-book profissional e minimalista para um livro com o título "${title}" sobre "${topic}". O design deve ser moderno, atraente e limpo. Foco em gráficos abstratos e tipografia elegante. Não inclua nenhum texto na imagem. A imagem deve ser visualmente impactante e adequada para um produto digital.`;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
        imageConfig: {
            aspectRatio: "3:4"
        }
    }
  });

  const firstPart = response.candidates?.[0]?.content?.parts?.[0];
  if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
    const base64Data = firstPart.inlineData.data;
    const mimeType = firstPart.inlineData.mimeType;
    return `data:${mimeType};base64,${base64Data}`;
  }
  
  throw new Error("Não foi possível gerar a imagem da capa do e-book.");
}
