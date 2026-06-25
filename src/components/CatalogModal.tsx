import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Ruler, Weight, ChevronRight } from "lucide-react";

interface CatalogItem {
  name: string;
  weight: string;
}

interface CatalogCategory {
  title: string;
  items: CatalogItem[];
}

const catalogData: CatalogCategory[] = [
  {
    title: "Mourões (2,20m)",
    items: [
      { name: "Refugo 2,20m (4 a 6)", weight: "7kg" },
      { name: "Mourão Fino 2,20m (6 a 8)", weight: "11kg" },
      { name: "Mourão Médio 2,20m (8 a 10)", weight: "20kg" },
      { name: "Mourão Grosso 2,20m (10 a 12)", weight: "33kg" },
      { name: "Lasca 2,20m", weight: "25kg" },
      { name: "Mourão Super Grosso 2,20m (12 a 14)", weight: "50kg" },
    ],
  },
  {
    title: "Esticadores (2,50m)",
    items: [
      { name: "Esticador Extra Fino 2,50m (10 a 12)", weight: "33kg" },
      { name: "Esticador Fino 2,50m (12 a 14)", weight: "50kg" },
      { name: "Esticador Médio 2,50m (14 a 16)", weight: "68kg" },
      { name: "Esticador MEIO Grosso 2,50m (16 a 18)", weight: "90kg" },
      { name: "Esticador Grosso 2,50m (18 a 20)", weight: "90kg" },
      { name: "Esticador Super Grosso 2,50m (20 a 22)", weight: "120kg" },
      { name: "Esticador Super Grosso 2,50m (22 a 25)", weight: "145kg" },
      { name: "Esticador Hiper Grosso 2,50m (25 a 28)", weight: "180kg" },
      { name: "Esticador Hiper Grosso 2,50m (28 a 30)", weight: "200kg" },
      { name: "Esticador Mega Grosso 2,50m (30 a 32)", weight: "230kg" },
    ],
  },
  {
    title: "Palanques (3,20m a 7m)",
    items: [
      { name: "Palanque Extra Fino 3,20m (10 a 12)", weight: "40kg" },
      { name: "Palanque Fino 3,20m (12 a 14)", weight: "60kg" },
      { name: "Palanque Médio 3,20m (14 a 16)", weight: "80kg" },
      { name: "Palanque Grosso 3,20m (16 a 18)", weight: "115kg" },
      { name: "Palanque Grosso 3,20m (18 a 20)", weight: "130kg" },
      { name: "Palanque Super Grosso 3,20m (20 a 22)", weight: "150kg" },
      { name: "Palanque Super Grosso 3,20m (22 a 25)", weight: "170kg" },
      { name: "Palanque 3,20m (25 a 28)", weight: "210kg" },
      { name: "Palanque 3,20m (28 a 30)", weight: "270kg" },
      { name: "Palanque 3,20m (30 a 32)", weight: "300kg" },
      { name: "Palanque Super Fino 4m (10 a 12)", weight: "55kg" },
      { name: "Palanque Extra Fino 4m (12 a 14)", weight: "80kg" },
      { name: "Palanque Fino 4m (14 a 16)", weight: "105kg" },
      { name: "Palanque Médio 4m (16 a 18)", weight: "145kg" },
      { name: "Palanque Médio 4m (18 a 20)", weight: "175kg" },
      { name: "Palanque Grosso 4m (20 a 22)", weight: "190kg" },
      { name: "Palanque Grosso 4m (22 a 25)", weight: "250kg" },
      { name: "Palanque S. Grosso 4m (25 a 28)", weight: "350kg" },
      { name: "Palanque S. Grosso 4m (28 a 30)", weight: "500kg" },
      { name: "Palanque S. Grosso 4m (30 a 32)", weight: "550kg" },
      { name: "Palanque Super Fino 5m (10 a 12)", weight: "68kg" },
      { name: "Palanque Extra Fino 5m (12 a 14)", weight: "90kg" },
      { name: "Palanque Fino 5m (14 a 16)", weight: "130kg" },
      { name: "Palanque Médio 5m (16 a 18)", weight: "190kg" },
      { name: "Palanque Médio 5m (18 a 20)", weight: "210kg" },
      { name: "Palanque Grosso 5m (20 a 22)", weight: "235kg" },
      { name: "Palanque Grosso 5m (22 a 25)", weight: "280kg" },
      { name: "Palanque S. Grosso 5m (25 a 28)", weight: "350kg" },
      { name: "Palanque S. Grosso 5m (28 a 30)", weight: "400kg" },
      { name: "Palanque S. Grosso 5m (30 a 32)", weight: "450kg" },
      { name: "Palanque Super Fino 6m (10 a 12)", weight: "81kg" },
      { name: "Palanque Extra Fino 6m (12 a 14)", weight: "100kg" },
      { name: "Palanque Fino 6m (14 a 16)", weight: "180kg" },
      { name: "Palanque Médio 6m (16 a 18)", weight: "240kg" },
      { name: "Palanque Médio 6m (18 a 20)", weight: "330kg" },
      { name: "Palanque Grosso 6m (20 a 22)", weight: "400kg" },
      { name: "Palanque Grosso 6m (22 a 25)", weight: "450kg" },
      { name: "Palanque S. Grosso 6m (25 a 28)", weight: "550kg" },
      { name: "Palanque S. Grosso 6m (28 a 30)", weight: "600kg" },
      { name: "Palanque S. Grosso 6m (30 a 32)", weight: "650kg" },
      { name: "Palanque Super Fino 7m (10 a 12)", weight: "95kg" },
      { name: "Palanque Extra Fino 7m (12 a 14)", weight: "115kg" },
      { name: "Palanque Fino 7m (14 a 16)", weight: "210kg" },
      { name: "Palanque Médio 7m (16 a 18)", weight: "280kg" },
      { name: "Palanque Grosso 7m (18 a 20)", weight: "385kg" },
      { name: "Palanque Grosso 7m (20 a 22)", weight: "550kg" },
      { name: "Palanque Grosso 7m (22 a 25)", weight: "660kg" },
      { name: "Palanque Grosso 7m (25 a 28)", weight: "700kg" },
      { name: "Palanque Grosso 7m (28 a 30)", weight: "800kg" },
      { name: "Palanque Grosso 7m (30 a 32)", weight: "900kg" },
    ],
  },
  {
    title: "Postes (8m a 12m)",
    items: [
      { name: "Poste Fino 8m (10 a 12)", weight: "120kg" },
      { name: "Poste Médio 8m (12 a 14)", weight: "160kg" },
      { name: "Poste Grosso 8m (14 a 16)", weight: "210kg" },
      { name: "Poste Grosso 8m (16 a 18)", weight: "300kg" },
      { name: "Poste Grosso 8m (18 a 20)", weight: "380kg" },
      { name: "Poste Grosso 8m (20 a 22)", weight: "480kg" },
      { name: "Poste Grosso 8m (22 a 25)", weight: "600kg" },
      { name: "Poste Grosso 8m (25 a 28)", weight: "750kg" },
      { name: "Poste Grosso 8m (28 a 30)", weight: "850kg" },
      { name: "Poste Grosso 8m (30 a 32)", weight: "950kg" },
      { name: "Poste Médio 9m (12 a 14)", weight: "180kg" },
      { name: "Poste Grosso 9m (14 a 16)", weight: "240kg" },
      { name: "Poste Grosso 9m (16 a 18)", weight: "350kg" },
      { name: "Poste Grosso 9m (18 a 20)", weight: "420kg" },
      { name: "Poste Grosso 9m (20 a 22)", weight: "550kg" },
      { name: "Poste Grosso 9m (22 a 25)", weight: "680kg" },
      { name: "Poste Grosso 9m (25 a 28)", weight: "850kg" },
      { name: "Poste Grosso 9m (28 a 30)", weight: "950kg" },
      { name: "Poste Grosso 9m (30 a 32)", weight: "1100kg" },
      { name: "Poste Médio 10m (12 a 14)", weight: "200kg" },
      { name: "Poste Grosso 10m (14 a 16)", weight: "270kg" },
      { name: "Poste Grosso 10m (16 a 18)", weight: "380kg" },
      { name: "Poste Grosso 10m (18 a 20)", weight: "460kg" },
      { name: "Poste Grosso 10m (20 a 22)", weight: "600kg" },
      { name: "Poste Grosso 10m (22 a 25)", weight: "750kg" },
      { name: "Poste Grosso 10m (25 a 28)", weight: "900kg" },
      { name: "Poste Grosso 10m (28 a 30)", weight: "1050kg" },
      { name: "Poste Grosso 10m (30 a 32)", weight: "1200kg" },
      { name: "Poste Médio 11m (12 a 14)", weight: "220kg" },
      { name: "Poste Grosso 11m (14 a 16)", weight: "300kg" },
      { name: "Poste Grosso 11m (16 a 18)", weight: "420kg" },
      { name: "Poste Grosso 11m (18 a 20)", weight: "500kg" },
      { name: "Poste Grosso 11m (20 a 22)", weight: "650kg" },
      { name: "Poste Grosso 11m (22 a 25)", weight: "800kg" },
      { name: "Poste Grosso 11m (25 a 28)", weight: "1000kg" },
      { name: "Poste Grosso 11m (28 a 30)", weight: "1150kg" },
      { name: "Poste Grosso 11m (30 a 32)", weight: "1300kg" },
      { name: "Poste Médio 12m (12 a 14)", weight: "240kg" },
      { name: "Poste Grosso 12m (14 a 16)", weight: "330kg" },
      { name: "Poste Grosso 12m (16 a 18)", weight: "450kg" },
      { name: "Poste Grosso 12m (18 a 20)", weight: "550kg" },
      { name: "Poste Grosso 12m (20 a 22)", weight: "700kg" },
      { name: "Poste Grosso 12m (22 a 25)", weight: "850kg" },
      { name: "Poste Grosso 12m (25 a 28)", weight: "1100kg" },
      { name: "Poste Grosso 12m (28 a 30)", weight: "1250kg" },
      { name: "Poste Grosso 12m (30 a 32)", weight: "1400kg" },
    ],
  },
  {
    title: "Varas (2,50m a 8m)",
    items: [
      { name: "Vara 2,50 (4 a 6)", weight: "10kg" },
      { name: "Vara 2,50 (6 a 8)", weight: "18kg" },
      { name: "Vara 2,50 (8 a 10)", weight: "24kg" },
      { name: "Vara 3,20 (4 a 6)", weight: "12kg" },
      { name: "Vara 3,20 (6 a 8)", weight: "18kg" },
      { name: "Vara 3,20 (8 a 10)", weight: "30kg" },
      { name: "Vara 4m (4 a 6)", weight: "15kg" },
      { name: "Vara 4m (6 a 8)", weight: "25kg" },
      { name: "Vara 4m (8 a 10)", weight: "40kg" },
      { name: "Vara 5m (6 a 8)", weight: "29kg" },
      { name: "Vara 5m (8 a 10)", weight: "46kg" },
      { name: "Vara 6m (6 a 8)", weight: "36kg" },
      { name: "Vara 6m (8 a 10)", weight: "60kg" },
      { name: "Vara 6m (10 a 12)", weight: "81kg" },
      { name: "Vara 7m (8 a 10)", weight: "70kg" },
      { name: "Vara 8m (8 a 10)", weight: "80kg" },
      { name: "Vara 8m (10 a 12)", weight: "120kg" },
    ],
  },
  {
    title: "Ripão, Balancim e Outros",
    items: [
      { name: "Balancim 1,20m", weight: "1.5kg" },
      { name: "Ripão CITRIODORA (3x15) metro", weight: "5.5kg" },
      { name: "Ripão DUNIS (3x15) metro", weight: "0kg" },
      { name: "Ripão DUNIS (3x20) metro", weight: "0kg" },
      { name: "Ripão DUNIS (3x12) metro", weight: "4.5kg" },
      { name: "Ripão DUNIS (3x10) metro", weight: "2.5kg" },
      { name: "BIRIRA (2 a 4) (metro linear)", weight: "0kg" },
      { name: "Esteira de Bambu Tratado 1x1,50", weight: "0kg" },
    ],
  },
  {
    title: "Madeira Serrada (Metro)",
    items: [
      { name: "CAIBRÃO 5X7", weight: "0kg" },
      { name: "CAIBRO 5X5", weight: "0kg" },
      { name: "TERÇA 5X11", weight: "0kg" },
      { name: "VIGA 5X15", weight: "0kg" },
      { name: "PRANCHA 5X20", weight: "0kg" },
      { name: "PRANCHA 5X25", weight: "0kg" },
      { name: "PRANCHA 5X30", weight: "0kg" },
      { name: "RIPA 2,5X5", weight: "0kg" },
    ],
  },
];

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CatalogModal({ isOpen, onClose }: CatalogModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 bg-[#183e26] text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <Ruler className="text-[#A1C913]" /> Catálogo de Medidas
                </h2>
                <p className="text-brand-200 text-sm mt-1">Consulte os pesos e dimensões padrão de nossos produtos</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {catalogData.map((category, idx) => (
                  <motion.div
                    key={category.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
                      <div className="w-2 h-6 bg-[#A1C913] rounded-full" />
                      <h3 className="text-xl font-bold text-stone-900">{category.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      {category.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex justify-between items-center p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ChevronRight className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="text-stone-700 font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-500 bg-white px-3 py-1 rounded-full border border-stone-200 shadow-sm">
                            <Weight className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">{item.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Note */}
              <div className="mt-12 p-6 bg-brand-50 rounded-2xl border border-brand-100">
                <h4 className="font-bold text-brand-800 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" /> Observações Importantes
                </h4>
                <ul className="text-sm text-brand-700 space-y-2">
                  <li>• O diâmetro é medido na PONTA de cada peça, sendo a BASE naturalmente mais grossa.</li>
                  <li>• Pesos são aproximados e podem variar conforme a umidade da madeira.</li>
                  <li>• Madeira de Eucalipto Citriodora tratada em autoclave com CCA.</li>
                  <li>• Padrões de qualidade seguindo as normas ABNT e NBR 9480.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#183e26] text-white rounded-full font-bold hover:bg-[#122e1c] transition-colors shadow-lg"
              >
                Fechar Catálogo
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { ShieldCheck } from "lucide-react";
