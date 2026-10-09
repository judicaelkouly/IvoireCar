import { Bus} from "lucide-react";

export default function Footer (){
    return (
        <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Bus className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-white">
              Ivoire<span className="text-orange-500">Car</span>
            </span>
          </a>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le réseau centralisé de réservation de transport interurbain et d'expédition de fret. Sécurité, ponctualité et traçabilité.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Voyageurs & Fret</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Acheter un billet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Expédier un colis</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Suivi du trajet</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Gares & Horaires</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Paiement Sécurisé</h4>
              <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-400">
                <span className="px-2 py-1 bg-slate-800 rounded">Wave</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Orange Money</span>
                <span className="px-2 py-1 bg-slate-800 rounded">MTN MoMo</span>
                <span className="px-2 py-1 bg-slate-800 rounded">Carte CB</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">Assistance 24/7</h4>
              <div className="p-3 bg-slate-800 rounded-xl">
                <div className="text-[10px] uppercase text-orange-400 font-bold">Centre d'appel</div>
                <div className="text-sm font-bold text-white mt-0.5">+225 01 02 03 04</div>
                <div className="text-[11px] text-slate-400">support@ivoireCar.net</div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© 2026 IvoireCar. Tous droits réservés.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300">Mentions légales</a>
              <a href="#" className="hover:text-slate-300">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </footer>
    )
}