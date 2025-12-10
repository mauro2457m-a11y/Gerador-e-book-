
import React, { useState } from 'react';
import { Ebook, Chapter, EbookStructure } from './types';
import { generateEbookStructure, generateChapterContent, generateEbookCover } from './services/geminiService';
import Header from './components/Header';
import EbookDisplay from './components/EbookDisplay';
import LoadingIndicator from './components/LoadingIndicator';

const App: React.FC = () => {
  const [topic, setTopic] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateEbook = async () => {
    if (!apiKey.trim()) {
      setError("Por favor, insira sua chave de API do Gemini.");
      return;
    }
    if (!topic.trim()) {
      setError("Por favor, insira um tema para o e-book.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setEbook(null);

    try {
      setLoadingMessage("Planejando a estrutura do seu e-book...");
      // Pass apiKey explicitly
      const structure: EbookStructure = await generateEbookStructure(topic, apiKey);

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
        // Pass apiKey explicitly
        const chapterContent = await generateChapterContent(topic, structure.title, chapterTitle, apiKey);
        generatedChapters.push({ title: chapterTitle, content: chapterContent });
        
        setEbook(prev => prev ? { ...prev, chapters: [...generatedChapters] } : null);
      }
      
      setLoadingMessage("Criando uma capa incrível...");
      // Pass apiKey explicitly
      const imageUrl = await generateEbookCover(structure.title, topic, apiKey);
      setEbook(prev => prev ? { ...prev, coverImageUrl: imageUrl } : null);

      setLoadingMessage("Seu e-book está pronto!");

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
      setError(`Falha na geração do e-book: ${errorMessage}`);
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
            Insira sua chave API e um tema lucrativo. Nossa IA criará um e-book completo com 10 capítulos, pronto para venda.
          </p>
          
          <div className="flex flex-col gap-4 justify-center items-center bg-neutral-800/50 p-6 rounded-xl border border-neutral-700 shadow-xl">
            <div className="w-full text-left">
                <label className="block text-sm font-medium text-neutral-400 mb-1 ml-1">Chave de API do Gemini</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Cole sua API Key aqui (começa com AIza...)"
                        className="w-full pl-10 bg-neutral-900 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition duration-200"
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="w-full text-left">
                <label className="block text-sm font-medium text-neutral-400 mb-1 ml-1">Tema do E-book</label>
                <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: 'Marketing Digital para Iniciantes' ou 'Receitas Low Carb'"
                className="w-full bg-neutral-900 border border-neutral-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none transition duration-200"
                disabled={isLoading}
                />
            </div>

            <button
              onClick={handleGenerateEbook}
              disabled={isLoading || !topic.trim() || !apiKey.trim()}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Gerando E-book...' : 'Criar E-book Agora'}
            </button>
          </div>

          {error && <p className="mt-4 text-red-400 bg-red-900/20 border border-red-900 p-3 rounded-lg text-sm">{error}</p>}
        </div>

        {isLoading && <LoadingIndicator message={loadingMessage} />}
        
        {ebook && !isLoading && <EbookDisplay ebook={ebook} />}

      </main>
    </div>
  );
};

export default App;
