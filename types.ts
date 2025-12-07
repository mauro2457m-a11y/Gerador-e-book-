
export interface Chapter {
  title: string;
  content: string;
}

export interface Ebook {
  title: string;
  description: string;
  coverImageUrl: string;
  chapters: Chapter[];
}

export interface EbookStructure {
  title: string;
  description: string;
  chapterTitles: string[];
}
