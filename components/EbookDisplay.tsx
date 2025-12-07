import React, { useState } from 'react';
import { Ebook } from '../types';

declare const jspdf: any;
declare const html2canvas: any;

interface EbookDisplayProps {
  ebook: Ebook;
}

const ChapterItem: React.FC<{ title: string; content: string; index: number }> = ({ title, content, index }) => {
  const [isOpen, setIsOpen] = useState(index === 0);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 bg-gray-800 hover:bg-gray-700 transition duration-200 flex justify-between items-center"
      >
        <span className="font-semibold text-lg text-purple-300">Capítulo {index + 1}: {title}</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 bg-gray-800/50 text-gray-300 whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
};

const EbookDisplay: React.FC<EbookDisplayProps> = ({ ebook }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const handleDownload = async () => {
    if (!ebook.coverImageUrl) return;

    setIsDownloading(true);
    const printableElement = document.getElementById('printable-ebook');
    if (!printableElement) {
      console.error("Elemento para impressão não encontrado.");
      setIsDownloading(false);
      return;
    }
    
    try {
        const canvas = await html2canvas(printableElement, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            windowWidth: printableElement.scrollWidth,
            windowHeight: printableElement.scrollHeight,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position -= pdfHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        const safeFilename = ebook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        pdf.save(`${safeFilename || 'ebook'}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
    } finally {
        setIsDownloading(false);
    }
};

  return (
    <>
      <div className="mt-12 max-w-4xl mx-auto animate-fade-in">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="relative shadow-lg rounded-lg overflow-hidden aspect-[3/4] bg-gray-700 flex items-center justify-center">
                {ebook.coverImageUrl ? (
                  <img src={ebook.coverImageUrl} alt={`Capa do e-book ${ebook.title}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="animate-pulse w-full h-full bg-gray-600"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h2 className="absolute bottom-0 left-0 right-0 p-4 text-center text-xl font-bold text-white drop-shadow-lg">{ebook.title}</h2>
              </div>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 mb-4">{ebook.title}</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{ebook.description}</p>
            </div>
          </div>
          
          <div className="mt-12">
             <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h3 className="text-2xl font-bold text-gray-200">Conteúdo do E-book</h3>
                {ebook.coverImageUrl && (
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      {isDownloading ? 'Gerando PDF...' : 'Baixar E-book'}
                    </button>
                )}
            </div>
            <div className="space-y-4">
              {ebook.chapters.length > 0 ? (
                ebook.chapters.map((chapter, index) => (
                  <ChapterItem key={index} title={chapter.title} content={chapter.content} index={index} />
                ))
              ) : (
                // Skeletons for chapters while loading
                Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg p-4 bg-gray-800 animate-pulse h-[68px]">
                     <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden printable version of the ebook */}
      <div id="printable-ebook" style={{ position: 'absolute', left: '-9999px', width: '794px', color: 'black', backgroundColor: 'white', fontFamily: 'Georgia, serif' }}>
          <div className="page" style={{ width: '794px', height: '1123px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', pageBreakAfter: 'always' }}>
              {ebook.coverImageUrl && <img src={ebook.coverImageUrl} style={{ maxWidth: '80%', maxHeight: '60%', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }} crossOrigin="anonymous" />}
              <h1 style={{ fontSize: '2.5rem', textAlign: 'center', marginTop: '40px', lineHeight: '1.2' }}>{ebook.title}</h1>
          </div>

          <div className="page" style={{ width: '794px', height: '1123px', boxSizing: 'border-box', padding: '60px', pageBreakAfter: 'always' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Descrição</h2>
              <div style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{ebook.description}</div>
          </div>
          
          {ebook.chapters.map((chapter, index) => {
              const contentWithBreaks = chapter.content.replace(/\n\s*\n/g, '</p><p style="margin-bottom: 1em; text-indent: 1.5em;">').replace(/\n/g, '<br/>');
              return (
                  <div style={{ padding: '60px', boxSizing: 'border-box', pageBreakBefore: 'always' }} key={`print-${index}`}>
                      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.5rem' }}>Capítulo {index + 1}: {chapter.title}</h2>
                      <div style={{ fontSize: '1rem', lineHeight: '1.7', whiteSpace: 'normal', textAlign: 'justify' }}>
                        <p style={{marginBottom: '1em', textIndent: '1.5em'}} dangerouslySetInnerHTML={{ __html: contentWithBreaks }} />
                      </div>
                  </div>
              )
          })}
      </div>
    </>
  );
};

export default EbookDisplay;