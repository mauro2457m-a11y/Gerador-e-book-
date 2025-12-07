
import React, { useState } from 'react';
import { Ebook, Chapter, EbookStructure } from './types';
import { generateEbookStructure, generateChapterContent, generateEbookCover } from './services/geminiService';
import Header from './components/Header';
import EbookDisplay from './components/EbookDisplay';
import LoadingIndicator from './components/LoadingIndicator';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateEbook = async () => {
    if (!topic.trim()) {
      setError("Por favor, insira um tema para o e-book.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEbook(null);

    try {
      setLoadingMessage("Planejando a estrutura do seu e-book...");
      const structure: EbookStructure = await generateEbookStructure(topic);

      const initialEbook: Ebook = {
        title: structure.title,
        description: structure.description,
        coverImageUrl: '',
        chapters: [],
      };
      setEbook(initialEbook);

      const generatedChapters: Chapter[] = [];
      for (let i = 0; i < structure.chapterTitles.length; i++) {
        const chapterTitle = structure.chapterTitles[i];
        setLoadingMessage(`Escrevendo Capítulo ${i + 1} de ${structure.chapterTitles.length}: "${chapterTitle}"`);
        const chapterContent = await generateChapterContent(topic, structure.title, chapterTitle);
        generatedChapters.push({ title: chapterTitle, content: chapterContent });
        
        setEbook(prev => prev ? { ...prev, chapters: [...generatedChapters] } : null);
      }
      
      setLoadingMessage("Criando uma capa incrível...");
      const imageUrl = await generateEbookCover(structure.title, topic);
      setEbook(prev => prev ? { ...prev, coverImageUrl: imageUrl } : null);

      setLoadingMessage("Seu e-book está pronto!");

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(`Falha na geração do e-book: ${errorMessage}. Por favor, verifique sua chave de API e tente novamente.`);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">
            Transforme sua Ideia em um Best-Seller Digital
          </h2>
          <p className="text-neutral-400 mb-8">
            Insira um tema lucrativo e nossa IA criará um e-book completo, com capa, título, descrição e 10 capítulos, pronto para você vender.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: 'Investimentos para iniciantes'"
              className="w-full flex-grow bg-neutral-800 border border-neutral-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition duration-200"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerateEbook}
              disabled={isLoading || !topic.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Gerando...' : 'Criar E-book'}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
        </div>

        {isLoading && <LoadingIndicator message={loadingMessage} />}
        
        {ebook && !isLoading && <EbookDisplay ebook={ebook} />}

      </main>
    </div>
  );
};

export default App;