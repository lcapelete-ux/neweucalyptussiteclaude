import React, { useState, useEffect } from "react";
import { LogOut, Image as ImageIcon, Plus, Trash2, Edit2, LayoutTemplate, Loader2, X, Check, ZoomIn, GripVertical, BarChart2, Globe, Users, Calendar, Megaphone, ToggleLeft, ToggleRight, Database, ArrowRight } from "lucide-react";
import { SiteImages, OperationType, handleSupabaseError, GalleryItem } from "../App";
import { supabase, uploadImage, formatSupabaseError } from "../supabase";
import imageCompression from "browser-image-compression";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  format, 
  subDays, 
  startOfDay, 
  isWithinInterval, 
  subMonths, 
  subWeeks,
  eachDayOfInterval,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AdminDashboardProps {
  onLogout: () => void;
  siteImages: SiteImages;
  setSiteImages: React.Dispatch<React.SetStateAction<SiteImages>>;
  refreshSiteContent: () => Promise<void>;
  refreshGallery: () => Promise<void>;
  userEmail?: string;
}

type GalleryCategory = "rural" | "civil" | "paisagismo" | "ideias";

interface SortableGalleryItemProps {
  item: GalleryItem;
  loading: string | null;
  handleEditGalleryImage: (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => Promise<void> | void;
  handleRemoveGalleryImage: (id: string) => Promise<void> | void;
  activeGalleryCategory: string;
}

const SortableGalleryItem: React.FC<SortableGalleryItemProps> = ({ 
  item, 
  loading, 
  handleEditGalleryImage, 
  handleRemoveGalleryImage,
  activeGalleryCategory 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100"
    >
      <img
        src={item.url}
        alt={`Galeria ${activeGalleryCategory}`}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-2 left-2 p-1.5 bg-black/40 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
        {loading === item.id ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <>
            <label 
              className="p-2 bg-white text-stone-900 rounded-full hover:bg-brand-50 transition-colors cursor-pointer"
              title="Editar Imagem"
            >
              <Edit2 className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleEditGalleryImage(item.id)}
                disabled={!!loading}
              />
            </label>
            <button 
              onClick={() => handleRemoveGalleryImage(item.id)}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remover"
              disabled={!!loading}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard({ 
  onLogout, 
  siteImages, 
  setSiteImages,
  refreshSiteContent,
  refreshGallery,
  userEmail = "fazendajt@gmail.com"
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"principais" | "galeria" | "analytics" | "promo">("principais");

  const [activeGalleryCategory, setActiveGalleryCategory] = useState<GalleryCategory>("rural");
  const [activeMainCategory, setActiveMainCategory] = useState<keyof Omit<SiteImages, "gallery" | "_allSiteContent">>("hero");
  const [loading, setLoading] = useState<string | null>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Fetch visits data when analytics tab is active
  useEffect(() => {
    if (activeTab === "analytics") {
      const fetchVisits = async () => {
        setIsAnalyticsLoading(true);
        try {
          if (supabase) {
            // Limit to 1000 most recent visits
            const { data, error } = await supabase
              .from('visits')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(1000);
            
            if (error) throw error;
            
            const validData = data || [];
            const formattedVisits = validData
              .map(v => ({
                ...v,
                timestamp: v.created_at ? new Date(v.created_at) : new Date()
              }))
              .filter(v => !isNaN(v.timestamp.getTime()));
              
            setVisits(formattedVisits);
          }
        } catch (error) {
          console.error("Error fetching visits from Supabase:", error);
          toast.error("Erro ao carregar dados de acessos.");
        } finally {
          setIsAnalyticsLoading(false);
        }
      };
      
      fetchVisits();
    }
  }, [activeTab]);

  // Cropping State
  const [cropImage, setCropImage] = useState<{
    url: string;
    type: "main" | "gallery";
    category: string;
    aspect: number;
    originalAspect: number;
  } | null>(null);
  const [currentAspect, setCurrentAspect] = useState<number>(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const isExpectedAdmin = userEmail === "fazendajt@gmail.com";

  useEffect(() => {
    if (userEmail && !isExpectedAdmin) {
      toast.error(`Atenção: Você está logado como ${userEmail}, mas as permissões de edição são restritas ao administrador oficial.`, { duration: 6000 });
    }
  }, [userEmail, isExpectedAdmin]);

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.7, // Lower target to ensure base64 fits in 1MB
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    try {
      console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      const compressed = await imageCompression(file, options);
      console.log(`Compressed size: ${(compressed.size / 1024 / 1024).toFixed(2)}MB`);
      return compressed;
    } catch (error) {
      console.error("Compression error:", error);
      return file;
    }
  };

  const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateMainImage = (key: keyof SiteImages) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Set aspect ratio based on the section
        let aspect = 16 / 9; // Default for banners
        if (key === "medicao") aspect = 16 / 9; // Match site container
        if (key === "about") aspect = 4 / 3;
        if (key === "sust1") aspect = 16 / 9;
        if (key === "promotion" as any) aspect = 4 / 5;

        setCropImage({
          url: reader.result as string,
          type: "main",
          category: key,
          aspect,
          originalAspect: aspect
        });
        setCurrentAspect(aspect);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleAddGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImage({
          url: reader.result as string,
          type: "gallery",
          category: activeGalleryCategory,
          aspect: 1, // Square for gallery
          originalAspect: 1
        });
        setCurrentAspect(1);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const categoryItems = siteImages.gallery[activeGalleryCategory];
      const oldIndex = categoryItems.findIndex((item: GalleryItem) => item.id === active.id);
      const newIndex = categoryItems.findIndex((item: GalleryItem) => item.id === over.id);

      const newOrder = arrayMove(categoryItems, oldIndex, newIndex);

      // Optimistic update
      setSiteImages((prev) => ({
        ...prev,
        gallery: {
          ...prev.gallery,
          [activeGalleryCategory]: newOrder,
        },
      }));

      const toastId = toast.loading("Salvando nova ordem...");
      if (!supabase) {
        toast.error("Supabase não configurado.", { id: toastId });
        return;
      }
      
      try {
        // Supabase doesn't have a direct batch update, so we do it in parallel
        const updatePromises = newOrder.map((item: GalleryItem, index: number) => 
          supabase.from('gallery').update({ order: index }).eq('id', item.id)
        );
        
        await Promise.all(updatePromises);
        
        await refreshGallery();
        toast.success("Ordem atualizada!", { id: toastId });
      } catch (error) {
        toast.error("Erro ao salvar ordem.", { id: toastId });
        console.error(error);
      }
    }
  };

  const executeUpload = async (base64Url: string) => {
    if (!cropImage) return;

    const { type, category } = cropImage;
    const toastId = toast.loading("Finalizando upload...");
    
    if (!supabase) {
      toast.error("Supabase não configurado. O upload foi bloqueado.", { id: toastId });
      setCropImage(null);
      return;
    }
    
    try {
      let finalUrl = "";
      
      try {
        finalUrl = await uploadImage(base64Url, type === "main" ? "site" : "gallery");
      } catch (e: any) {
        console.error("Supabase Storage error:", e);
        const formatted = formatSupabaseError(e);
        toast.error(formatted, { id: toastId, duration: 6000 });
        throw e;
      }

      if (type === "main") {
        const key = category as keyof SiteImages;
        const uploadId = `upload-${key}-${Date.now()}`;
        setLoading(uploadId);

        // 1. Add to Supabase
        const { error } = await supabase
          .from('site_content')
          .insert([{ url: finalUrl, type: key, active: true }]);
        
        if (error) throw error;

        // 2. Deactivate others
        await supabase
          .from('site_content')
          .update({ active: false })
          .eq('type', key)
          .neq('url', finalUrl);
        
        await refreshSiteContent();
        toast.success("Imagem atualizada!", { id: toastId });
      } else {
        setLoading("new-gallery");
        const currentCategoryItems = siteImages.gallery[category as GalleryCategory];
        
        const { error } = await supabase
          .from('gallery')
          .insert([{ 
            url: finalUrl, 
            category: category, 
            order: currentCategoryItems.length 
          }]);
        
        if (error) throw error;
        
        await refreshGallery();
        toast.success("Adicionado à galeria!", { id: toastId });
      }
    } catch (error: any) {
      toast.error(formatSupabaseError(error), { id: toastId, duration: 6000 });
      console.error(error);
    } finally {
      setLoading(null);
      setCropImage(null);
    }
  };

  const onCropComplete = (_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleConfirmCrop = async () => {
    if (!cropImage || !croppedAreaPixels) return;
    
    const toastId = toast.loading("Enquadrando imagem...");
    try {
      const croppedImage = await getCroppedImg(cropImage.url, croppedAreaPixels);
      if (croppedImage) {
        toast.dismiss(toastId);
        await executeUpload(croppedImage);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro ao enquadrar imagem.", { id: toastId });
    }
  };

  const handleRemoveGalleryImage = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta imagem?")) {
      setLoading(id);
      const toastId = toast.loading("Removendo imagem...");
      if (!supabase) {
        toast.error("Supabase não configurado.", { id: toastId });
        setLoading(null);
        return;
      }
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) throw error;
        await refreshGallery();
        toast.success("Imagem removida.", { id: toastId });
      } catch (error) {
        toast.error("Erro ao remover imagem.", { id: toastId });
        console.error(error);
      } finally {
        setLoading(null);
      }
    }
  };

  const handleEditGalleryImage = (id: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoading(id);
      const toastId = toast.loading("Atualizando imagem...");
      if (!supabase) {
        toast.error("Supabase não configurado.", { id: toastId });
        setLoading(null);
        return;
      }
      try {
        const compressedFile = await compressImage(file);
        const newUrl = await fileToBase64(compressedFile);

        const finalUrl = await uploadImage(newUrl, "gallery");
        const { error } = await supabase.from('gallery').update({ url: finalUrl }).eq('id', id);
        if (error) throw error;
        
        await refreshGallery();
        toast.success("Imagem atualizada!", { id: toastId });
      } catch (error) {
        toast.error("Erro ao atualizar imagem.", { id: toastId });
        console.error(error);
      } finally {
        setLoading(null);
      }
    }
    e.target.value = '';
  };

  const handleSetActiveMainImage = async (id: string, type: string) => {
    setLoading(id);
    const toastId = toast.loading("Ativando imagem...");
    if (!supabase) {
      toast.error("Supabase não configurado.", { id: toastId });
      setLoading(null);
      return;
    }
    try {
      // 1. Deactivate others
      await supabase.from('site_content').update({ active: false }).eq('type', type);
      // 2. Activate this one
      await supabase.from('site_content').update({ active: true }).eq('id', id);
      
      await refreshSiteContent();
      toast.success("Imagem ativada no site!", { id: toastId });
    } catch (error) {
      toast.error("Erro ao ativar imagem.", { id: toastId });
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const handleRemoveMainImage = async (id: string) => {
    if (window.confirm("Tem certeza que deseja remover esta versão? O site voltará para a imagem anterior ou a padrão.")) {
      setLoading(id);
      const toastId = toast.loading("Removendo...");
      if (!supabase) {
        toast.error("Supabase não configurado.", { id: toastId });
        setLoading(null);
        return;
      }
      try {
        const { error } = await supabase.from('site_content').delete().eq('id', id);
        if (error) throw error;
        await refreshSiteContent();
        toast.success("Removido com sucesso!", { id: toastId });
      } catch (error) {
        toast.error("Erro ao remover.", { id: toastId });
        console.error(error);
      } finally {
        setLoading(null);
      }
    }
  };

  const handleTogglePromo = async () => {
    const promo = siteImages.promotion;
    if (!promo?.id) {
      toast.error("Nenhuma imagem de promoção configurada.");
      return;
    }

    const newStatus = !promo.active;
    const toastId = toast.loading(newStatus ? "Ativando..." : "Desativando...");
    if (!supabase) {
      toast.error("Supabase não configurado.", { id: toastId });
      return;
    }
    try {
      await supabase.from('site_content').update({ active: newStatus }).eq('id', promo.id);
      await refreshSiteContent();
      toast.success(newStatus ? "Promoção ativada!" : "Promoção desativada", { id: toastId });
    } catch (error) {
      toast.error("Erro ao alterar status.", { id: toastId });
      console.error(error);
    }
  };

  const handleSelectPromoFromHistory = async (id: string) => {
    const toastId = toast.loading("Alterando promoção...");
    if (!supabase) {
      toast.error("Supabase não configurado.", { id: toastId });
      return;
    }
    try {
      // 1. Deactivate current active promotion
      await supabase.from('site_content').update({ active: false }).eq('type', 'promotion');
      // 2. Activate selected promotion
      await supabase.from('site_content').update({ active: true }).eq('id', id);
      
      await refreshSiteContent();
      toast.success("Promoção alterada!", { id: toastId });
    } catch (error) {
      toast.error("Erro ao selecionar promoção.", { id: toastId });
      console.error(error);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta promoção do histórico?")) {
      const toastId = toast.loading("Excluindo...");
      if (!supabase) {
        toast.error("Supabase não configurado.", { id: toastId });
        return;
      }
      try {
        await supabase.from('site_content').delete().eq('id', id);
        await refreshSiteContent();
        toast.success("Excluído com sucesso!", { id: toastId });
      } catch (error) {
        toast.error("Erro ao excluir.", { id: toastId });
        console.error(error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-sans text-stone-800 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-white flex flex-col">
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-xl font-bold text-brand-400">Painel Admin</h2>
          <p className="text-sm text-stone-400 mt-1">Gestão de Conteúdo</p>
          {userEmail && (
            <p className="text-[10px] text-stone-500 mt-2 truncate opacity-60" title={userEmail}>
              Logado como: {userEmail}
            </p>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("principais")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "principais"
                ? "bg-brand-600 text-white"
                : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            <LayoutTemplate className="w-5 h-5" />
            Imagens Principais
          </button>
          <button
            onClick={() => setActiveTab("galeria")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "galeria"
                ? "bg-brand-600 text-white"
                : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            Galeria de Fotos
          </button>
          <button
            onClick={() => setActiveTab("promo")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "promo"
                ? "bg-brand-600 text-white"
                : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            <Megaphone className="w-5 h-5" />
            Promoção / Pop-up
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === "analytics"
                ? "bg-brand-600 text-white"
                : "text-stone-300 hover:bg-stone-800"
            }`}
          >
            <BarChart2 className="w-5 h-5" />
            Relatórios de Acesso
          </button>
        </nav>
        <div className="p-4 border-t border-stone-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-400 hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-stone-900">
              {activeTab === "principais" ? "Imagens Principais do Site" : activeTab === "galeria" ? "Gestão da Galeria" : activeTab === "promo" ? "Promoção e Pop-up" : "Relatórios de Acessos"}
            </h1>
            {activeTab !== "analytics" && activeTab !== "promo" && (
              <label className="bg-brand-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-600 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50">
                {loading?.includes("upload") || loading === "new-gallery" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {loading?.includes("upload") || loading === "new-gallery" ? "Enviando..." : "Nova Imagem"}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={activeTab === "principais" ? handleUpdateMainImage(activeMainCategory) : handleAddGalleryImage}
                  disabled={!!loading}
                />
              </label>
            )}
          </div>

          {activeTab === "promo" && (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-stone-900">Promoção Ativa</h2>
                    <p className="text-stone-500 text-sm">Esta é a imagem que aparece no pop-up do site.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleTogglePromo}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        siteImages.promotion?.active 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      {siteImages.promotion?.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                      {siteImages.promotion?.active ? "Ativo" : "Inativo"}
                    </button>
                    {siteImages.promotion?.id && (
                      <button
                        onClick={() => handleDeletePromo(siteImages.promotion!.id!)}
                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        title="Excluir promoção ativa"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {siteImages.promotion?.url ? (
                  <div className="relative group rounded-xl overflow-hidden border border-stone-200 max-w-sm mx-auto">
                    <img 
                      src={siteImages.promotion.url} 
                      alt="Promoção" 
                      className="w-full aspect-[4/5] object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <label className="p-3 bg-white text-stone-900 rounded-full cursor-pointer hover:scale-110 transition-transform">
                        <Edit2 className="w-6 h-6" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleUpdateMainImage('promotion' as any)}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-200 rounded-2xl p-12 text-center">
                    <Megaphone className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-500 mb-6">Nenhuma imagem de promoção configurada.</p>
                    <label className="bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors cursor-pointer inline-flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Configurar Promoção
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleUpdateMainImage('promotion' as any)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Promo History */}
              <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h2 className="text-xl font-bold text-stone-900 mb-2">Histórico de Promoções</h2>
                <p className="text-stone-500 text-sm mb-8">Selecione uma imagem antiga para reativar ou exclua do histórico.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {siteImages._allSiteContent?.filter(item => item.type === 'promotion').map((item) => (
                    <div key={item.id} className={`relative group rounded-lg overflow-hidden border-2 transition-all ${item.active ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-stone-200'}`}>
                      <img 
                        src={item.url} 
                        alt="Histórico" 
                        className="w-full aspect-[4/5] object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                        {!item.active && (
                          <button
                            onClick={() => handleSelectPromoFromHistory(item.id)}
                            className="w-full py-1.5 bg-brand-500 text-white text-xs font-bold rounded hover:bg-brand-600 transition-colors"
                          >
                            Ativar
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePromo(item.id)}
                          className="w-full py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                      {item.active && (
                        <div className="absolute top-2 right-2 bg-brand-500 text-white p-1 rounded-full shadow-lg">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new to history button */}
                  <label className="border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center aspect-[4/5] cursor-pointer hover:border-brand-400 hover:bg-stone-50 transition-all group">
                    <Plus className="w-8 h-8 text-stone-300 group-hover:text-brand-500 transition-colors" />
                    <span className="text-[10px] text-stone-400 mt-2 font-bold uppercase">Nova Promo</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleUpdateMainImage('promotion' as any)}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "analytics" ? (
            <div className="space-y-8">
              {isAnalyticsLoading ? (
                <div className="bg-white rounded-2xl p-12 flex flex-col items-center justify-center border border-stone-200 shadow-sm">
                  <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
                  <p className="text-stone-500 font-medium">Carregando dados analíticos...</p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                          <Users className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-stone-500 font-medium">Total de Acessos</p>
                          <h3 className="text-2xl font-bold text-stone-900">{visits.length}</h3>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400">Desde o início do rastreamento</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-green-100 p-3 rounded-xl text-green-600">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-stone-500 font-medium">Hoje</p>
                          <h3 className="text-2xl font-bold text-stone-900">
                            {visits.filter(v => isSameDay(v.timestamp, new Date())).length}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400">Acessos nas últimas 24h</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm text-stone-500 font-medium">Regiões Ativas</p>
                          <h3 className="text-2xl font-bold text-stone-900">
                            {new Set(visits.map(v => v.region || 'Desconhecido')).size}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs text-stone-400">Diversidade geográfica</p>
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Access Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <h3 className="text-lg font-bold text-stone-900 mb-6">Acessos Diários (Últimos 7 dias)</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={
                            eachDayOfInterval({
                              start: subDays(new Date(), 6),
                              end: new Date()
                            }).map(day => ({
                              name: format(day, 'dd/MM'),
                              acessos: visits.filter(v => isSameDay(v.timestamp, day)).length
                            }))
                          }>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                              cursor={{fill: '#f8fafc'}}
                            />
                            <Bar dataKey="acessos" fill="#A1C913" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Regions Pie Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                      <h3 className="text-lg font-bold text-stone-900 mb-6">Distribuição por Região</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={
                                Object.entries(
                                  visits.reduce((acc: any, v) => {
                                    const reg = v.region || 'Desconhecido';
                                    acc[reg] = (acc[reg] || 0) + 1;
                                    return acc;
                                  }, {})
                                )
                                .map(([name, value]) => ({ name, value: value as number }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 5)
                              }
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {['#A1C913', '#A07855', '#3b82f6', '#8b5cf6', '#f59e0b'].map((color, index) => (
                                <Cell key={`cell-${index}`} fill={color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="mt-4 space-y-2">
                        {Object.entries(
                          visits.reduce((acc: any, v) => {
                            const reg = v.region || 'Desconhecido';
                            acc[reg] = (acc[reg] || 0) + 1;
                            return acc;
                          }, {})
                        )
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 3)
                        .map(([name, value], idx) => (
                          <div key={name} className="flex justify-between items-center text-sm">
                            <span className="text-stone-600 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#A1C913', '#A07855', '#3b82f6'][idx]}}></div>
                              {name}
                            </span>
                            <span className="font-bold text-stone-900">{value as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly Access Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm lg:col-span-2">
                      <h3 className="text-lg font-bold text-stone-900 mb-6">Acessos Mensais (Últimos 6 meses)</h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={
                            Array.from({length: 6}).map((_, i) => {
                              const date = subMonths(new Date(), 5 - i);
                              return {
                                name: format(date, 'MMM', { locale: ptBR }),
                                acessos: visits.filter(v => 
                                  isWithinInterval(v.timestamp, {
                                    start: startOfMonth(date),
                                    end: endOfMonth(date)
                                  })
                                ).length
                              };
                            })
                          }>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            />
                            <Line type="monotone" dataKey="acessos" stroke="#A1C913" strokeWidth={3} dot={{r: 6, fill: '#A1C913', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 8}} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Recent Visits Table */}
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-stone-100">
                      <h3 className="text-lg font-bold text-stone-900">Acessos Recentes</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
                          <tr>
                            <th className="px-6 py-4 font-semibold">Data/Hora</th>
                            <th className="px-6 py-4 font-semibold">Cidade/Região</th>
                            <th className="px-6 py-4 font-semibold">País</th>
                            <th className="px-6 py-4 font-semibold">Dispositivo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {visits.slice(0, 10).map((visit) => (
                            <tr key={visit.id} className="hover:bg-stone-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-stone-900">
                                {format(visit.timestamp, 'dd/MM/yyyy HH:mm')}
                              </td>
                              <td className="px-6 py-4 text-sm text-stone-600">
                                {(visit.city || 'Desconhecido')}, {(visit.region || 'Desconhecido')}
                              </td>
                              <td className="px-6 py-4 text-sm text-stone-600">
                                {visit.country || 'Desconhecido'}
                              </td>
                              <td className="px-6 py-4 text-sm text-stone-400 truncate max-w-[200px]" title={visit.user_agent || ''}>
                                {(visit.user_agent || '').includes('Mobi') ? 'Mobile' : 'Desktop'}
                              </td>
                            </tr>
                          ))}
                          {visits.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">
                                Nenhum acesso registrado ainda.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
              {activeTab === "principais" ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
                  {[
                    { id: "hero", label: "Banner Principal" },
                    { id: "about", label: "Seção Sobre" },
                    { id: "sust1", label: "Sustentabilidade" },
                    { id: "medicao", label: "Ilustração Medição" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveMainCategory(tab.id as any)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeMainCategory === tab.id
                          ? "bg-brand-100 text-brand-700"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Current Active Preview */}
                  <div className="col-span-full mb-4">
                    <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-2">Imagem Ativa no Site</h3>
                    <div className="relative rounded-xl overflow-hidden border-4 border-brand-500 aspect-video bg-stone-100 shadow-lg">
                      <img
                        src={siteImages[activeMainCategory] as string}
                        alt="Ativa"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 right-4 bg-brand-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        ATIVA
                      </div>
                    </div>
                  </div>

                  <h3 className="col-span-full text-sm font-bold text-stone-500 uppercase tracking-wider -mb-2">Histórico de Uploads</h3>
                  
                  {siteImages._allSiteContent?.filter(item => item.type === activeMainCategory).map((item: any, idx) => (
                    <div
                      key={item.id}
                      className={`group relative rounded-xl overflow-hidden border-2 aspect-video bg-stone-100 transition-all ${
                        item.active ? "border-brand-500 ring-2 ring-brand-500/20" : "border-stone-200"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={`Versão ${idx}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        {loading === item.id ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <>
                            {!item.active && (
                              <button 
                                onClick={() => handleSetActiveMainImage(item.id, item.type)}
                                className="px-4 py-2 bg-brand-500 text-white rounded-full hover:bg-brand-600 transition-colors shadow-lg font-bold text-sm"
                                disabled={!!loading}
                              >
                                Ativar
                              </button>
                            )}
                            <button 
                              onClick={() => handleRemoveMainImage(item.id)}
                              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              title="Remover esta versão"
                              disabled={!!loading}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                      {item.active && (
                        <div className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                          ATIVA
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded">
                        {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                  
                  {(!siteImages._allSiteContent || siteImages._allSiteContent.filter(item => item.type === activeMainCategory).length === 0) && (
                    <div className="col-span-full py-12 text-center text-stone-500 bg-stone-50 rounded-xl border-2 border-dashed border-stone-200">
                      Nenhum upload personalizado encontrado para esta seção. O site está usando a imagem padrão.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
                  {[
                    { id: "rural", label: "Construção Rural" },
                    { id: "civil", label: "Construção Civil" },
                    { id: "paisagismo", label: "Paisagismo" },
                    { id: "ideias", label: "Nossas Madeiras" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveGalleryCategory(tab.id as GalleryCategory)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeGalleryCategory === tab.id
                          ? "bg-brand-100 text-brand-700"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={siteImages.gallery[activeGalleryCategory].map(i => i.id)}
                      strategy={rectSortingStrategy}
                    >
                      {siteImages.gallery[activeGalleryCategory].map((item) => (
                        <SortableGalleryItem
                          key={item.id}
                          item={item}
                          loading={loading}
                          handleEditGalleryImage={handleEditGalleryImage}
                          handleRemoveGalleryImage={handleRemoveGalleryImage}
                          activeGalleryCategory={activeGalleryCategory}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  {siteImages.gallery[activeGalleryCategory].length === 0 && (
                    <div className="col-span-full py-12 text-center text-stone-500">
                      Nenhuma imagem nesta categoria. Clique em "Nova Imagem" para adicionar.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>

      {/* Cropping Modal */}
      {cropImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
          <div className="p-4 flex justify-between items-center bg-stone-900 border-b border-stone-800">
            <div className="flex items-center gap-6">
              <div>
                <h3 className="text-white font-bold">Enquadrar Imagem</h3>
                <p className="text-stone-400 text-xs">Arraste para ajustar o enquadramento perfeito</p>
              </div>
              
              <div className="flex bg-stone-800 p-1 rounded-lg border border-stone-700">
                <button 
                  onClick={() => setCurrentAspect(cropImage.originalAspect)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currentAspect === cropImage.originalAspect 
                      ? "bg-brand-500 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Padrão Site
                </button>
                <button 
                  onClick={() => setCurrentAspect(730/550)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currentAspect === 730/550 
                      ? "bg-brand-500 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Horizontal (730x550)
                </button>
                <button 
                  onClick={() => setCurrentAspect(9/16)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currentAspect === 9/16 
                      ? "bg-brand-500 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Celular (9:16)
                </button>
                <button 
                  onClick={() => setCurrentAspect(3/4)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    currentAspect === 3/4 
                      ? "bg-brand-500 text-white shadow-sm" 
                      : "text-stone-400 hover:text-white"
                  }`}
                >
                  Retrato (3:4)
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setCropImage(null)}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancelar
              </button>
              <button 
                onClick={handleConfirmCrop}
                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-2 font-bold"
              >
                <Check className="w-4 h-4" /> Confirmar Enquadramento
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative bg-stone-950">
            <Cropper
              image={cropImage.url}
              crop={crop}
              zoom={zoom}
              aspect={currentAspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="p-6 bg-stone-900 border-t border-stone-800 flex items-center justify-center gap-6">
            <div className="flex items-center gap-4 w-full max-w-md">
              <ZoomIn className="w-5 h-5 text-stone-400" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="text-white text-sm font-mono w-8">{zoom.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
