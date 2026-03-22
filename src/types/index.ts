export type FestivalEdition = {
  id: string;
  totalShows: number;
  totalArticles: number;
  year: number;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  startDate: string;
  endDate: string;
  numberOfArticles: number;
  organizer?: string;
  logo?: string;
  organizingTeam?: DetailEntry[];
  juryList?: string[];
  awards?: DetailEntry[];
  extraDetails?: (string | DetailEntry)[];
};

/**
 * Generic detail entry type used for displaying structured information
 * in shows, festivals, and other detail views.
 *
 * @property text - The label or main text content
 * @property value - Optional value(s) associated with the text
 * @property children - Nested detail entries for hierarchical data
 * @property link - Optional URL to make the text a clickable link
 */
export type DetailEntry = {
  text: string;
  value?: string | string[];
  children?: DetailEntry[];
  link?: string;
};

/**
 * @deprecated Use DetailEntry instead. Kept for backward compatibility.
 */
export type ShowDetailEntry = DetailEntry;

export type Show = {
  id: string;
  slug: string;
  name: string;
  editionYear: number;
  festivalId?: string;
  festivalSlug?: string;
  festivalName?: string;
  director: string;
  author?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  cast?: DetailEntry[];
  crew?: DetailEntry[];
  notes?: DetailEntry[];
  castWord?: string | null;
  showDescription: string | string[];
  date: string;
  time: string;
  venueName: string;
  venueLocation?: string | null;
  poster?: string;
  bookingUrl?: string;
  reservedSeats?: number;
  allowedSeats?: number;
  allowedWaiting?: number;
  isOpenForReservation: string;
  openForComments: boolean | undefined;
};

export type ArticleType = "review" | "symposium_coverage" | "analysis" | "general";

export type Article = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  author: string;
  editionYear: number;
  type: ArticleType;
  showId?: string;
  festivalId?: string;
  createdAt: string;
  contentAr: string;
  contentEn?: string;
  sections?: string[];
  attachments?: string[];
};

export type CreativitySubmission = {
  id: string;
  slug: string;
  title: string;
  titleAr?: string;
  titleEn?: string;
  author: string;
  type: "story" | "essay" | "poem" | "other";
  editionYear?: number;
  showId?: string;
  festivalId?: string;
  createdAt: string;
  content: string;
  contentAr?: string;
  contentEn?: string;
  attachments?: string[];
};

export type Comment = {
  id: string;
  content: string;
  author?: string;
  createdAt: string;
  showId: string;
  isApproved?: boolean;
};

export type MyReservation = {
  id: number;
  reservationNumber: number;
  status: 'CONFIRMED' | 'WAITING_LIST' | 'CLOSED';
  createdAt: string;
  showId: number;
  showName: string;
  showPoster: string | null;
  showDate: string;
  showTime: string;
  venueName: string;
  festivalName: string;
  festivalId: number;
  seatNumber: string | null;
};

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
