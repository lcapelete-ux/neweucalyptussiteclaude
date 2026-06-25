import { motion, AnimatePresence } from "motion/react";
import {
  Leaf,
  ShieldCheck,
  TreePine,
  Droplets,
  Ruler,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronRight,
  Lock,
  Fence,
  Hammer,
  Sprout,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import AdminDashboard from "./components/AdminDashboard";
import AdminLoginModal from "./components/AdminLoginModal";
import CatalogModal from "./components/CatalogModal";
import { supabase } from "./supabase";

import { Toaster, toast } from "react-hot-toast";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

export function handleSupabaseError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: SupabaseErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
    },
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface GalleryItem {
  id: string;
  url: string;
  category: string;
  order: number;
  createdAt: Date;
}

export interface SiteImages {
  hero: string;
  about: string;
  sust1: string;
  medicao: string;
  promotion?: {
    id?: string;
    url: string;
    active: boolean;
    link?: string;
  };
  _allSiteContent?: {
    id: string;
    url: string;
    type: string;
    createdAt: Date;
    active?: boolean;
  }[];
  gallery: {
    rural: GalleryItem[];
    civil: GalleryItem[];
    paisagismo: GalleryItem[];
    ideias: GalleryItem[];
  };
}

const initialImages: SiteImages = {
  hero: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop",
  about: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2026&auto=format&fit=crop",
  sust1: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1964&auto=format&fit=crop",
  medicao: "https://images.unsplash.com/photo-1503387762-592dee58c160?q=80&w=2070&auto=format&fit=crop",
  gallery: {
    rural: [],
    civil: [],
    paisagismo: [],
    ideias: []
  }
};

const Logo = ({ className = "" }: { className?: string }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex flex-col justify-between h-[28px] w-[32px]">
      <div className="h-[6px] w-full bg-[#A1C913]"></div>
      <div className="h-[6px] w-full bg-[#A1C913]"></div>
      <div className="h-[6px] w-full bg-[#A1C913]"></div>
    </div>
    <div className="flex flex-col justify-center">
      <span className="text-[#FDF8E7] font-black text-[22px] leading-[0.85] tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>EUCALYPTUS</span>
      <span className="text-[#A07855] text-[10px] font-normal tracking-[0.45em] leading-none ml-[2px] mt-[3px]" style={{ fontFamily: 'Arial, sans-serif' }}>TRATADOS</span>
    </div>
  </div>
);

const LoadingScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
    className="fixed inset-0 z-[100] bg-[#183e26] flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        duration: 0.8,
        repeat: Infinity,
        repeatType: "reverse"
      }}
      className="mb-8"
    >
      <Logo className="scale-150" />
    </motion.div>
    
    <div className="w-48 h-1 bg-stone-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-full h-full bg-[#A1C913]"
      />
    </div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-4 text-stone-400 font-medium tracking-widest text-[10px] uppercase"
    >
      Carregando Qualidade...
    </motion.p>
  </motion.div>
);

const PromotionModal = ({ promo, onClose }: { promo: NonNullable<SiteImages['promotion']>, onClose: () => void }) => {
  if (!promo.active || !promo.url) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="relative aspect-[4/5] w-full">
          <img
            src={promo.url}
            alt="Promoção"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#e9c46a] text-[#183e26] text-[10px] font-bold uppercase rounded">Destaque</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Confira nossa oferta especial!</h3>
            <div className="flex gap-3">
              <a
                href="https://wa.me/5518996354444"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#A1C913] hover:bg-[#8eb111] text-[#183e26] py-3 rounded-xl font-bold text-center transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Aproveitar Agora
              </a>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors backdrop-blur-md"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [siteImages, setSiteImages] = useState<SiteImages>(initialImages);
  const [activeGalleryTab, setActiveGalleryTab] = useState<"rural" | "civil" | "paisagismo" | "ideias">("rural");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState({ site: false, gallery: false });

  // Visit Tracking
  useEffect(() => {
    const trackVisit = async () => {
      // Only track once per session to avoid noise
      const hasVisited = sessionStorage.getItem('site_visited');
      if (hasVisited) return;

      try {
        let regionData = { region: 'Desconhecido', city: 'Desconhecido', country: 'Desconhecido' };
        try {
          // Using a free geolocation API with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

          const response = await fetch('https://ipapi.co/json/', { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const data = await response.json();
            regionData = {
              region: data.region || 'Desconhecido',
              city: data.city || 'Desconhecido',
              country: data.country_name || 'Desconhecido'
            };
          }
        } catch (e) {
          console.warn('Could not fetch geolocation or timeout reached', e);
        }

        if (supabase) {
          await supabase.from('visits').insert([{
            user_agent: navigator.userAgent,
            ...regionData
          }]);
        }
        sessionStorage.setItem('site_visited', 'true');
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (user && user.email !== 'fazendajt@gmail.com') {
        supabase.auth.signOut();
        setIsAdminLoggedIn(false);
        setUserEmail(undefined);
        toast.error("Acesso negado. Apenas o administrador autorizado pode acessar esta área.", {
          id: "auth-denied"
        });
      } else {
        setIsAdminLoggedIn(!!user);
        setUserEmail(user?.email);
      }
      setIsAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchSiteContent = async () => {
    try {
      console.log("Fetching site content from Supabase...");
      let docs: any[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from('site_content')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        docs = data.map(d => ({
          ...d,
          createdAt: new Date(d.created_at)
        }));
      } else {
        console.warn("Supabase client not initialized, cannot fetch site content.");
        setIsDataLoaded(prev => ({ ...prev, site: true }));
        return;
      }
      
      let latestImages: Partial<SiteImages> = {};
      const foundTypes = new Set();
      const foundActive = new Set();
      
      const allContent = docs.map((data: any) => {
        const type = data.type as keyof SiteImages;
        const item = {
          ...data,
          active: data.active || false
        };

        if (type === 'promotion') {
          if (data.active) {
            latestImages.promotion = {
              id: data.id,
              url: data.url,
              active: true,
              link: data.link
            };
          }
        } else if (type) {
          if (data.active) {
            if (!latestImages[type] || !foundActive.has(type)) {
              (latestImages as any)[type] = data.url;
              foundActive.add(type);
            }
          } else if (!foundActive.has(type) && !foundTypes.has(type)) {
            (latestImages as any)[type] = data.url;
            foundTypes.add(type);
          }
        }
        return item;
      });
      
      setSiteImages(prev => ({
        ...prev,
        ...latestImages,
        _allSiteContent: allContent
      }));
      setIsDataLoaded(prev => ({ ...prev, site: true }));
    } catch (error: any) {
      console.error("Error loading site content from Supabase:", error);
      setIsDataLoaded(prev => ({ ...prev, site: true }));
    }
  };

  const fetchGallery = async () => {
    try {
      console.log("Fetching gallery from Supabase...");
      let allItems: GalleryItem[] = [];

      if (supabase) {
        const { data, error } = await supabase
          .from('gallery')
          .select('*');
        
        if (error) throw error;
        allItems = data.map(d => ({
          ...d,
          createdAt: new Date(d.created_at),
          order: d.order ?? 999999
        }));
      } else {
        console.warn("Supabase client not initialized, cannot fetch gallery.");
        setIsDataLoaded(prev => ({ ...prev, gallery: true }));
        return;
      }
      
      const newGallery = {
        rural: [] as GalleryItem[],
        civil: [] as GalleryItem[],
        paisagismo: [] as GalleryItem[],
        ideias: [] as GalleryItem[],
      };
      
      allItems.sort((a: any, b: any) => {
        if (a.order !== b.order) return a.order - b.order;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      allItems.forEach(item => {
        if (item.category in newGallery) {
          (newGallery as any)[item.category].push(item);
        }
      });

      setSiteImages(prev => ({
        ...prev,
        gallery: newGallery
      }));
      setIsDataLoaded(prev => ({ ...prev, gallery: true }));
    } catch (error: any) {
      console.error("Error loading gallery:", error);
      if (error?.message?.includes("Quota exceeded")) {
        toast.error("Limite de visualizações da galeria atingido por hoje.", {
          duration: 10000,
          id: "quota-error-gallery"
        });
      }
      setIsDataLoaded(prev => ({ ...prev, gallery: true }));
    }
  };

  useEffect(() => {
    fetchSiteContent();
    fetchGallery();
  }, []);

  const [isPromoOpen, setIsPromoOpen] = useState(false);

  useEffect(() => {
    if (isDataLoaded.site && siteImages.promotion?.active) {
      const hasSeenPromo = sessionStorage.getItem('promo_seen');
      if (!hasSeenPromo) {
        const timer = setTimeout(() => {
          setIsPromoOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isDataLoaded.site, siteImages.promotion]);

  const handleClosePromo = () => {
    setIsPromoOpen(false);
    sessionStorage.setItem('promo_seen', 'true');
  };

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      setIsAdminLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isAdminLoggedIn && isAuthReady) {
    return (
      <>
        <Toaster position="top-right" />
        <AdminDashboard
          onLogout={handleLogout}
          siteImages={siteImages}
          setSiteImages={setSiteImages}
          refreshSiteContent={fetchSiteContent}
          refreshGallery={fetchGallery}
          userEmail={userEmail}
        />
      </>
    );
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 },
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <AnimatePresence>
        {!isDataLoaded.site && <LoadingScreen />}
      </AnimatePresence>

      <AnimatePresence>
        {isPromoOpen && siteImages.promotion && (
          <PromotionModal promo={siteImages.promotion} onClose={handleClosePromo} />
        )}
      </AnimatePresence>
      
      <Toaster position="top-right" />
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#183e26]/95 backdrop-blur-md border-b border-[#183e26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>

            <div className="hidden md:flex space-x-8 items-center">
              <a
                href="#sobre"
                className="text-stone-200 hover:text-white font-medium transition-colors"
              >
                Sobre
              </a>
              <a
                href="#citriodora"
                className="text-stone-200 hover:text-white font-medium transition-colors"
              >
                Citriodora
              </a>
              <a
                href="#processo"
                className="text-stone-200 hover:text-white font-medium transition-colors"
              >
                Processo
              </a>
              <a
                href="#normas"
                className="text-stone-200 hover:text-white font-medium transition-colors"
              >
                Normas
              </a>
              <a
                href="#contato"
                className="bg-[#A1C913] text-[#183e26] px-5 py-2 rounded-full font-bold hover:bg-[#8eb311] transition-colors"
              >
                Orçamento
              </a>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-stone-200"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#183e26] border-b border-[#183e26] px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <a
              href="#sobre"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-stone-200 hover:text-white font-medium"
            >
              Sobre
            </a>
            <a
              href="#citriodora"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-stone-200 hover:text-white font-medium"
            >
              Citriodora
            </a>
            <a
              href="#processo"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-stone-200 hover:text-white font-medium"
            >
              Processo
            </a>
            <a
              href="#normas"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-stone-200 hover:text-white font-medium"
            >
              Normas
            </a>
            <a
              href="#contato"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-[#A1C913] font-bold"
            >
              Orçamento
            </a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={siteImages.hero}
            alt="Plantação de Eucalipto"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-brand-500/20 text-brand-100 border border-brand-400/30 text-sm font-semibold tracking-wider mb-6 backdrop-blur-sm">
              QUALIDADE E CONFIABILIDADE DESDE 1992
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Eucalyptus{" "}
              <span className="text-brand-400">Tratados</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-200 mb-10 leading-relaxed">
              O seu destino definitivo para madeira de eucalipto tratado de alta
              qualidade, com foco na espécie Citriodora. Soluções duráveis e
              sustentáveis, com tratamento CCA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contato"
                className="bg-brand-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brand-400 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Solicite um Orçamento <ChevronRight className="h-5 w-5" />
              </a>
              <button
                onClick={() => setIsCatalogModalOpen(true)}
                className="bg-white/10 text-white border-2 border-white/20 backdrop-blur-sm px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center"
              >
                Ver Catálogo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-[#183e26] text-brand-50 relative z-20 -mt-8 mx-4 md:mx-auto max-w-6xl rounded-2xl shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8">
          <motion.div className="text-center" {...fadeIn}>
            <div className="text-4xl font-black mb-2">30+ Anos</div>
            <div className="text-brand-200 font-medium">
              de experiência no mercado
            </div>
          </motion.div>
          <motion.div className="text-center" {...fadeIn}>
            <div className="text-4xl font-black mb-2">10 Anos</div>
            <div className="text-brand-200 font-medium">
              de garantia nos produtos
            </div>
          </motion.div>
          <motion.div className="text-center" {...fadeIn}>
            <div className="text-4xl font-black mb-2">100%</div>
            <div className="text-brand-200 font-medium">
              madeira de reflorestamento
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us / Citriodora */}
      <section id="citriodora" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Por que trabalhamos com{" "}
                <span className="text-brand-600">Eucalyptus Citriodora</span>?
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                O Eucalyptus Citriodora é reconhecido como a espécie mais
                resistente e durável do mercado brasileiro. Suas características
                únicas o tornam a escolha ideal para tratamento em autoclave.
              </p>

              <ul className="space-y-4">
                {[
                  "Fibras retorcidas que aumentam a resistência estrutural",
                  "Maior resistência a trincas e rachaduras",
                  "Melhor absorção do tratamento preservativo CCA",
                  "Durabilidade superior a 20-30 anos, em contato com solo (Padrão ABNT, NBR 9480)",
                  "Laudos de tratamento aprovado pelo IPT (Instituto de Pesquisas Tecnológicas)",
                  "Densidade e resistência mecânica superiores",
                  "Ideal para uso em ambientes externos e rurais",
                ].map((item, index) => (
                  <motion.li
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-brand-100 hover:bg-brand-50/50 transition-colors cursor-default"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0, 
                      transition: { type: "spring", stiffness: 100, damping: 15, delay: 0.1 }
                    }}
                    viewport={{ once: true, margin: "-20px" }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <motion.div 
                      className="bg-brand-100 p-2 rounded-full flex-shrink-0"
                      whileHover={{ rotate: 15, scale: 1.1 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-brand-600" />
                    </motion.div>
                    <span className="text-stone-700 font-medium text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={siteImages.about}
                alt="Eucalipto Citriodora"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent flex items-end p-8">
                <div>
                  <div className="text-brand-400 font-bold tracking-wider uppercase text-sm mb-1">
                    A ESPÉCIE MAIS RESISTENTE DO BRASIL
                  </div>
                  <div className="text-white text-2xl font-bold">
                    Eucalipto Citriodora
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Treatment Process */}
      <section id="processo" className="py-24 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            {...fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Processo de Tratamento em Autoclave
            </h2>
            <p className="text-lg text-stone-600">
              Nosso processo de imunização segue rigorosamente as normas ABNT e
              NBR 9480, garantindo máxima proteção contra cupins, fungos e
              umidade.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <TreePine className="h-8 w-8 text-brand-600" />,
                title: "Seleção e Preparo",
                desc: "Eucalipto Citriodora selecionado de áreas certificadas. Madeira cortada sob medida e descascada artesanalmente.",
              },
              {
                icon: <Droplets className="h-8 w-8 text-brand-600" />,
                title: "Secagem",
                desc: "30 a 60 dias de secagem controlada ao ar livre para atingir o nível ideal de umidade antes do tratamento.",
              },
              {
                icon: <ShieldCheck className="h-8 w-8 text-brand-600" />,
                title: "Autoclave (Célula Cheia)",
                desc: "Remoção do ar e umidade das células. Alta pressão de até 18 kg/cm² para injeção do preservativo CCA.",
              },
              {
                icon: <CheckCircle2 className="h-8 w-8 text-brand-600" />,
                title: "Fixação e Garantia",
                desc: "20 dias de repouso para fixação completa. Eucalipto tratado com 10 anos de garantia, pronto para uso.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 hover:shadow-lg transition-shadow relative"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ type: "spring", stiffness: 80, damping: 15, delay: index * 0.15 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="absolute -top-5 -left-5 w-10 h-10 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-lg border-4 border-stone-100">
                  {index + 1}
                </div>
                <div className="bg-brand-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-stone-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Measurement Standards */}
      <section id="normas" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#183e26] rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-12 lg:p-16 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <Ruler className="h-8 w-8 text-brand-400" />
                  <h2 className="text-3xl font-bold text-white">
                    Padrão ABNT NBR 9480
                  </h2>
                </div>
                <p className="text-brand-100 text-lg mb-8 leading-relaxed">
                  Todas as nossas medidas seguem rigorosamente a norma ABNT NBR
                  9480 para medição de postes de madeira.
                </p>
                <div className="space-y-6">
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <h4 className="text-white font-bold mb-2">
                      Medição pelo Topo
                    </h4>
                    <p className="text-brand-200 text-sm">
                      Esta é a medida de venda. Sempre medimos pelo diâmetro da
                      ponta mais fina do poste (topo), seguindo a NBR 9480.
                    </p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <h4 className="text-white font-bold mb-2">
                      Variação da Base
                    </h4>
                    <p className="text-brand-200 text-sm">
                      A base é naturalmente mais grossa e varia conforme o
                      crescimento da árvore. Não é usada como medida padrão.
                    </p>
                  </div>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/10">
                    <h4 className="text-white font-bold mb-2">
                      Laudos IPT
                    </h4>
                    <p className="text-brand-200 text-sm">
                      Nossos laudos de tratamento são aprovados pelo IPT (Instituto de Pesquisas Tecnológicas), garantindo a eficácia da imunização.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-stone-100 p-12 flex items-center justify-center relative">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage:
                      "radial-gradient(#047857 2px, transparent 2px)",
                    backgroundSize: "30px 30px",
                  }}
                ></div>
                <motion.div
                  className="relative z-10 bg-white p-8 rounded-2xl shadow-xl w-full max-w-md"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-center mb-6">
                    <div className="text-sm font-bold text-brand-600 uppercase tracking-wider">
                      Ilustração de Medição
                    </div>
                  </div>
                  <div className="relative aspect-video border-4 border-stone-200 rounded-2xl flex items-center justify-center bg-stone-50 overflow-hidden shadow-xl">
                    <img 
                      src={siteImages.medicao} 
                      alt="Ilustração de Medição" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Environmental Commitment */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-10">
          <Leaf className="w-96 h-96" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Compromisso Ambiental
              </h2>
              <p className="text-brand-100 text-lg mb-8">
                Toda nossa madeira é proveniente de áreas de reflorestamento
                certificadas, contribuindo para a preservação do meio ambiente.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="bg-brand-600 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">
                    Madeira 100% de áreas de reflorestamento certificadas
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand-600 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">
                    Recurso renovável com ciclo sustentável do cultivo à
                    colheita
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand-600 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">
                    Retira e retém dióxido de carbono da atmosfera
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="bg-brand-600 p-2 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium">
                    Diminui a pressão sobre matas nativas brasileiras
                  </span>
                </li>
              </ul>
            </motion.div>
            <motion.div
              className="w-full"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src={siteImages.sust1}
                alt="Reflorestamento"
                className="rounded-3xl aspect-[16/10] w-full object-cover shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nossa Estrutura e Produtos
            </h2>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Conheça um pouco mais sobre o nosso processo de tratamento e a
              qualidade da madeira que entregamos.
            </p>
          </div>

          {/* Gallery Tabs Header Hint */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" /> CLIQUE ABAIXO PARA VER AS FOTOS:
            </span>
          </div>

          {/* Gallery Tabs */}
          <div className="p-2 bg-stone-50 rounded-2xl border border-stone-200 shadow-sm max-w-3xl mx-auto flex flex-wrap justify-center gap-2 mb-12">
            {[
              { id: "rural", label: "Construção Rural", icon: <Fence className="w-4 h-4" /> },
              { id: "civil", label: "Construção Civil", icon: <Hammer className="w-4 h-4" /> },
              { id: "paisagismo", label: "Paisagismo", icon: <Sprout className="w-4 h-4" /> },
              { id: "ideias", label: "Nossas Madeiras", icon: <TreePine className="w-4 h-4" /> },
            ].map((tab) => {
              const isActive = activeGalleryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveGalleryTab(tab.id as any)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer transform hover:scale-[1.03] active:scale-[0.97] ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 hover:border-stone-300 hover:text-brand-700"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-stone-400 group-hover:text-brand-500 transition-colors"}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {siteImages.gallery[activeGalleryTab].map((item, idx) => (
              <motion.div
                key={item.id}
                className="relative aspect-square rounded-2xl overflow-hidden shadow-md group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                <img
                  src={item.url}
                  alt={`Galeria ${activeGalleryTab} ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
            {siteImages.gallery[activeGalleryTab].length === 0 && (
              <div className="col-span-full py-12 text-center text-stone-500">
                Nenhuma imagem nesta categoria.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Solicite seu Orçamento
              </h2>
              <p className="text-lg text-stone-600 mb-10">
                Preencha o formulário ou entre em contato diretamente. Nossa
                equipe está pronta para atender você com as melhores soluções em
                eucalipto tratado.
              </p>

              <div className="space-y-6 mb-10">
                <a 
                  href="https://wa.me/5515996854945" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="bg-brand-100 p-4 rounded-full text-brand-600 group-hover:bg-brand-200 transition-colors">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 font-medium">
                      Telefone / WhatsApp
                    </div>
                    <div className="text-lg font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                      (15) 3283-1253 / (15) 99685-4945
                    </div>
                  </div>
                </a>
                <a 
                  href="mailto:vendas@eucalyptustratados.com.br"
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="bg-brand-100 p-4 rounded-full text-brand-600 group-hover:bg-brand-200 transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 font-medium">
                      Email
                    </div>
                    <div className="text-lg font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                      vendas@eucalyptustratados.com.br
                    </div>
                  </div>
                </a>
                <a 
                  href="https://maps.app.goo.gl/6pimRc4R7dyMVghZ7?g_st=ic"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 group cursor-pointer"
                >
                  <div className="bg-brand-100 p-4 rounded-full text-brand-600 group-hover:bg-brand-200 transition-colors">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 font-medium">
                      Endereço
                    </div>
                    <div className="text-lg font-bold text-stone-900 group-hover:text-brand-600 transition-colors">
                      Estrada do Moinho Km 2.1, Laranjal Paulista
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-stone-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <form 
                className="space-y-6" 
                action="https://formsubmit.co/madeiratratada@icloud.com" 
                method="POST"
                onSubmit={() => {
                  if (typeof window !== 'undefined' && (window as any).dataLayer) {
                    (window as any).dataLayer.push({ event: 'form_submission', form_name: 'orcamento' });
                  }
                }}
              >
                {/* Configurações do FormSubmit */}
                <input type="hidden" name="_subject" value="Novo Orçamento pelo Site!" />
                <input type="hidden" name="_template" value="table" />
                <input type="hidden" name="_captcha" value="false" />
                
                <div>
                  <label
                    htmlFor="nome"
                    className="block text-sm font-medium text-stone-700 mb-2"
                  >
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="telefone"
                      className="block text-sm font-medium text-stone-700 mb-2"
                    >
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      name="telefone"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                      placeholder="(15) 99685-4945"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-stone-700 mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="cidade"
                    className="block text-sm font-medium text-stone-700 mb-2"
                  >
                    Cidade
                  </label>
                  <input
                    type="text"
                    id="cidade"
                    name="cidade"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    placeholder="Sua cidade"
                  />
                </div>
                <div>
                  <label
                    htmlFor="mensagem"
                    className="block text-sm font-medium text-stone-700 mb-2"
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
                    placeholder="Descreva o que você precisa... (medidas, quantidade, aplicação)"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-600 transition-colors shadow-md"
                >
                  Enviar Mensagem
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#183e26] text-stone-300 py-12 border-t border-[#143320] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="text-sm">Qualidade e confiabilidade desde 1992</div>
            <div className="text-sm flex items-center gap-2">
              © 2026 Eucalyptus Tratados. Todos os direitos reservados.
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="opacity-10 hover:opacity-100 transition-opacity p-1"
                title="Acesso Restrito"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsAdminLoggedIn(true)}
      />

      <CatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
      />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/5515996854945?text=Olá! Gostaria de solicitar um orçamento."
        onClick={(e) => {
          e.preventDefault();
          if (typeof window !== 'undefined' && (window as any).dataLayer) {
            (window as any).dataLayer.push({ event: 'whatsapp_click', source: 'floating_button' });
          }
          window.open('https://wa.me/5515996854945?text=Olá! Gostaria de solicitar um orçamento.', '_blank');
        }}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#128C7E] transition-all hover:scale-110 flex items-center justify-center group"
        title="Falar com um vendedor"
      >
        <svg
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <span className="absolute right-full mr-3 bg-white text-stone-900 px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-stone-100 pointer-events-none">
          Falar com um vendedor
        </span>
      </a>
    </div>
  );
}
