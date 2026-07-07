import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_CHAPTERS, PARTS_SUMMARY } from '../data/bookIndex';
import { 
  BookOpen, Bookmark, Search, ArrowLeft, ArrowRight, 
  Menu, ChevronRight, CheckCircle2, Sliders, Printer, ZoomIn, ZoomOut
} from 'lucide-react';

export default function BookReader() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [readChapters, setReadChapters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showToc, setShowToc] = useState(true);
  const [fontSize, setFontSize] = useState<number>(15); // px
  const [viewMode, setViewMode] = useState<'A4' | 'free'>('A4');
  const [isMobile, setIsMobile] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);

  // Load state from local storage & listen to responsive sizing
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('emagrecer_saude_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedRead = localStorage.getItem('emagrecer_saude_read');
    if (savedRead) {
      setReadChapters(JSON.parse(savedRead));
    } else {
      // Mark first chapter as read
      setReadChapters([ALL_CHAPTERS[0].id]);
    }

    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync bookmarks and reading progress to local storage
  const toggleBookmark = (chapterId: string) => {
    let updated: string[];
    if (bookmarks.includes(chapterId)) {
      updated = bookmarks.filter(id => id !== chapterId);
    } else {
      updated = [...bookmarks, chapterId];
    }
    setBookmarks(updated);
    localStorage.setItem('emagrecer_saude_bookmarks', JSON.stringify(updated));
  };

  const markAsRead = (chapterId: string) => {
    if (!readChapters.includes(chapterId)) {
      const updated = [...readChapters, chapterId];
      setReadChapters(updated);
      localStorage.setItem('emagrecer_saude_read', JSON.stringify(updated));
    }
  };

  const handleNextPage = () => {
    if (currentIdx < ALL_CHAPTERS.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      markAsRead(ALL_CHAPTERS[nextIdx].id);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      markAsRead(ALL_CHAPTERS[prevIdx].id);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleJumpToChapter = (id: string) => {
    const idx = ALL_CHAPTERS.findIndex(c => c.id === id);
    if (idx !== -1) {
      setCurrentIdx(idx);
      markAsRead(id);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.innerWidth < 1024) {
        setShowToc(false);
      }
    }
  };

  // Filter chapters based on search
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : ALL_CHAPTERS.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.content.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const activeChapter = ALL_CHAPTERS[currentIdx];
  const progressPercent = Math.round((readChapters.length / ALL_CHAPTERS.length) * 100);

  // Parse markdown-like content to simple HTML with neat styling
  const renderFormattedContent = (text: string) => {
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('# ')) {
        return (
          <h1 key={index} className="font-serif font-black text-neutral-900 mt-6 mb-4 tracking-tight border-b border-neutral-100 pb-2 leading-tight" style={{ fontSize: '1.65em' }}>
            {trimmed.replace('# ', '')}
          </h1>
        );
      }
      if (trimmed.startsWith('## ')) {
        return (
          <h2 key={index} className="font-serif font-bold text-neutral-800 mt-5 mb-3 leading-tight" style={{ fontSize: '1.3em' }}>
            {trimmed.replace('## ', '')}
          </h2>
        );
      }
      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={index} className="font-sans uppercase tracking-wider font-bold text-brand-emerald mb-2" style={{ fontSize: '0.85em' }}>
            {trimmed.replace('### ', '')}
          </h3>
        );
      }
      if (trimmed.startsWith('> *')) {
        return (
          <blockquote key={index} className="border-l-4 border-brand-emerald bg-brand-cream/50 p-4 rounded-r-xl my-4 italic text-brand-forest/80 leading-relaxed font-serif">
            {trimmed.replace('> *', '').replace('*', '')}
          </blockquote>
        );
      }
      if (trimmed.startsWith('* **') || trimmed.startsWith('- **')) {
        // Bullet with bold key term
        const parts = trimmed.split('**');
        return (
          <li key={index} className="ml-4 list-none text-neutral-700 leading-relaxed my-2 pl-2 border-l border-neutral-250">
            <span className="font-bold text-neutral-900">{parts[1]}</span>
            <span>{parts.slice(2).join('')}</span>
          </li>
        );
      }
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 list-disc text-neutral-700 leading-relaxed my-1.5 pl-1">
            {trimmed.substring(2)}
          </li>
        );
      }
      if (trimmed.startsWith('|')) {
        // Simple table parser
        const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
        if (trimmed.includes('---')) return null; // table separator
        const isHeader = index === 0 || (ALL_CHAPTERS[currentIdx].content.split('\n')[index - 1]?.trim().startsWith('|') === false);
        
        return (
          <div key={index} className="overflow-x-auto my-3">
            <table className="w-full border-collapse border border-neutral-200 font-sans" style={{ fontSize: '0.85em' }}>
              <tbody>
                <tr className={isHeader ? 'bg-neutral-50 font-bold border-b border-neutral-200' : 'border-b border-neutral-100'}>
                  {cells.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 border border-neutral-200">
                      {cell}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      }
      if (trimmed === '---') {
        return <hr key={index} className="my-6 border-neutral-150" />;
      }
      if (trimmed === '') return null;

      // Regular paragraph
      return (
        <p key={index} className="text-neutral-700 leading-relaxed mb-4 text-left">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-[78vh] lg:h-[75vh] min-h-[500px] lg:min-h-[550px] bg-neutral-100 border border-neutral-200 rounded-2xl overflow-hidden" id="book-reader-container">
      {/* Search and Table of Contents Sidebar */}
      <AnimatePresence initial={false}>
        {showToc && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? '100%' : '310px', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`${isMobile ? 'w-full' : 'w-[310px]'} bg-white border-r border-neutral-200 flex flex-col h-full shrink-0 relative z-20`}
          >
            {/* Search Box */}
            <div className="p-4 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Pesquisar no livro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-brand-cream/55 border border-brand-emerald/15 rounded-xl text-xs outline-none focus:border-brand-emerald transition-all text-brand-forest"
                />
              </div>
            </div>

            {/* Toc Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {searchQuery.trim() !== '' ? (
                // Search Results
                <div>
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-2 flex justify-between">
                    <span>Resultados da Pesquisa</span>
                    <span className="font-mono text-brand-emerald font-bold">{searchResults.length}</span>
                  </h4>
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic py-4 text-center">Nenhum resultado para "{searchQuery}"</p>
                  ) : (
                    <div className="space-y-1.5">
                      {searchResults.map((res) => (
                        <button
                          key={res.id}
                          onClick={() => {
                            handleJumpToChapter(res.id);
                            setSearchQuery('');
                          }}
                          className="w-full text-left p-2 hover:bg-brand-emerald/10 rounded-lg border border-transparent hover:border-brand-emerald/20 transition-all cursor-pointer block"
                        >
                          <span className="text-xs font-bold text-brand-forest block line-clamp-1">{res.title}</span>
                          <span className="text-[9px] text-neutral-400 block mt-0.5 font-semibold uppercase">{res.part}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Table of Contents
                <div className="space-y-4">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 mb-2">Estrutura do Guia</h4>
                    
                    {/* Progress indicator */}
                    <div className="mb-4 bg-brand-emerald/10 border border-brand-emerald/20 p-3 rounded-xl">
                      <div className="flex justify-between text-xs font-bold text-brand-forest mb-1">
                        <span>Leitura do Guia</span>
                        <span className="font-mono">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-brand-emerald/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-brand-emerald h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <span className="text-[9px] text-brand-emerald mt-1.5 block leading-tight font-semibold">
                        Você leu {readChapters.length} de {ALL_CHAPTERS.length} seções totais.
                      </span>
                    </div>
                  </div>

                  {/* Parts List */}
                  <div className="space-y-4">
                    {PARTS_SUMMARY.map((part) => {
                      const chaptersInPart = ALL_CHAPTERS.filter(c => c.part === part.name);
                      return (
                        <div key={part.id} className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400 block px-1.5">
                            {part.name}
                          </span>
                          <div className="space-y-0.5">
                            {chaptersInPart.map((chap) => {
                              const isCurrent = chap.id === activeChapter.id;
                              const isRead = readChapters.includes(chap.id);
                              const isBookmarked = bookmarks.includes(chap.id);

                              return (
                                <button
                                  key={chap.id}
                                  onClick={() => handleJumpToChapter(chap.id)}
                                  className={`w-full text-left py-2 px-2.5 rounded-lg text-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                                    isCurrent
                                      ? 'bg-brand-cream text-brand-forest font-bold border-l-4 border-brand-emerald pl-2 shadow-sm'
                                      : 'text-brand-forest/80 hover:bg-brand-cream/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {isRead && <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />}
                                    <span className="truncate">{chap.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {isBookmarked && <Bookmark className="w-3 h-3 text-brand-sunset fill-brand-sunset shrink-0" />}
                                    <span className="text-[9px] font-mono text-neutral-400 font-semibold shrink-0">
                                      p. {chap.pageNumber}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Main Window */}
      {(!isMobile || !showToc) && (
        <div className="flex-1 flex flex-col h-full bg-brand-cream/30 relative z-10 w-full overflow-hidden">
          
          {/* Reader Top Toolbar */}
          <div className="h-14 bg-white border-b border-neutral-200 flex justify-between items-center px-3 sm:px-4 relative z-20">
            <div className="flex items-center gap-2 sm:gap-3">
              {isMobile ? (
                <button
                  onClick={() => setShowToc(true)}
                  className="flex items-center gap-1 text-[11px] sm:text-xs font-black bg-brand-emerald text-white px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm hover:bg-brand-emerald/90 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Sumário
                </button>
              ) : (
                <button
                  onClick={() => setShowToc(!showToc)}
                  className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer"
                  title="Sumário"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}

              {!isMobile && <span className="text-xs font-semibold text-neutral-400">/</span>}
              <div className="text-[11px] sm:text-xs font-sans font-extrabold text-brand-forest leading-tight truncate max-w-[100px] xs:max-w-[150px] sm:max-w-xs" title={activeChapter.title}>
                {activeChapter.title}
              </div>
            </div>

            {/* Settings: font size, bookmark, print */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Font Adjust */}
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 px-1 py-0.5 shrink-0">
                <button 
                  onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                  className="p-1 hover:bg-white text-neutral-500 hover:text-neutral-800 rounded-md transition-all cursor-pointer"
                  title="Diminuir fonte"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-500 px-1 select-none">{fontSize}px</span>
                <button 
                  onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                  className="p-1 hover:bg-white text-neutral-500 hover:text-neutral-800 rounded-md transition-all cursor-pointer"
                  title="Aumentar fonte"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Mode Toggle (A4 bounds vs fluid) */}
              <button
                onClick={() => setViewMode(viewMode === 'A4' ? 'free' : 'A4')}
                className={`p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer shrink-0 ${viewMode === 'A4' ? 'bg-neutral-100 text-brand-emerald' : ''}`}
                title="Alternar estilo de visualização (Com/Sem Margens de Livro)"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Bookmark Trigger */}
              <button
                onClick={() => toggleBookmark(activeChapter.id)}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer shrink-0"
                title="Favoritar esta página"
              >
                <Bookmark className={`w-4 h-4 ${bookmarks.includes(activeChapter.id) ? 'text-brand-sunset fill-brand-sunset' : 'text-neutral-400'}`} />
              </button>

              {/* Print Trigger */}
              {!isMobile && (
                <button
                  onClick={() => window.print()}
                  className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-all cursor-pointer shrink-0"
                  title="Imprimir página (A4)"
                >
                  <Printer className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Reader Book Pages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center" ref={contentRef}>
            <div 
              className={`w-full transition-all duration-300 ${
                viewMode === 'A4' 
                  ? 'max-w-[700px] min-h-[850px] bg-[#FAF8F5] border border-brand-emerald/10 shadow-md rounded-xl px-8 py-10 sm:px-14 sm:py-16 text-neutral-800 relative' 
                  : 'max-w-2xl text-neutral-800 px-4'
              }`}
            >
              {/* Page Header (A4 visual borders only) */}
              {viewMode === 'A4' && (
                <div className="border-b border-neutral-200/60 pb-3 mb-8 flex justify-between text-[10px] font-semibold text-neutral-400 uppercase tracking-widest select-none">
                  <span>Emagrecer Saúde</span>
                  <span>{activeChapter.title}</span>
                </div>
              )}

              {/* Active Page Content */}
              <div 
                className={`space-y-4 font-serif text-neutral-800 ${viewMode === 'A4' ? 'pb-20' : 'pb-6'}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {renderFormattedContent(activeChapter.content)}
              </div>

              {/* Page Footer (A4 style) */}
              {viewMode === 'A4' && (
                <div className="absolute bottom-8 left-8 right-8 border-t border-neutral-200/40 pt-4 flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest select-none">
                  <span>Aviso: Consulte um profissional de saúde</span>
                  <span className="font-mono text-xs">Pág. {activeChapter.pageNumber} / 79</span>
                </div>
              )}
            </div>
          </div>

          {/* Reader Bottom Navigation Bar */}
          <div className="h-14 bg-white border-t border-neutral-200 flex justify-between items-center px-6 relative z-20">
            <button
              onClick={handlePrevPage}
              disabled={currentIdx === 0}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentIdx === 0 
                  ? 'text-neutral-300 bg-neutral-50' 
                  : 'text-brand-forest bg-brand-cream hover:bg-brand-emerald/15 border border-brand-emerald/10'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </button>

            <span className="text-xs font-mono font-bold text-neutral-400 select-none">
              Seção {currentIdx + 1} de {ALL_CHAPTERS.length}
            </span>

            <button
              onClick={handleNextPage}
              disabled={currentIdx === ALL_CHAPTERS.length - 1}
              className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                currentIdx === ALL_CHAPTERS.length - 1 
                  ? 'text-neutral-300 bg-neutral-50' 
                  : 'bg-brand-emerald text-white hover:bg-brand-emerald/90 shadow-sm'
              }`}
            >
              Próximo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
