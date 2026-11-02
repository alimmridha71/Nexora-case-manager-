import { getServiceSupabase } from '@/lib/supabase';
import { Mail, Phone, Award } from 'lucide-react';

export const revalidate = 60;

export default async function AttorneysPage() {
  let attorneysData: any[] | null = null;
  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = getServiceSupabase();
      const { data } = await supabase.from('attorneys').select('*').eq('status', 'active');
      attorneysData = data;
    }
  } catch (err) {
    console.error('Attorneys fetch fallback:', err);
  }

  const attorneys = attorneysData && attorneysData.length > 0 ? attorneysData : [
    {
      slug: 'eleanor-vance',
      name: 'Eleanor Vance, Esq.',
      title: 'Senior Managing Partner',
      specialization: 'Corporate & Cross-Border M&A',
      bio: 'Former federal prosecutor with over 22 years of high-stakes corporate litigation advocacy before appellate circuits.',
      email: 'e.vance@nexoralaw.com',
      phone: '+1-800-555-0199',
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    },
    {
      slug: 'marcus-sterling',
      name: 'Marcus Sterling, J.D.',
      title: 'Partner & Head of Trial Practice',
      specialization: 'White Collar & Criminal Defense',
      bio: 'Renowned courtroom trial lawyer specializing in federal regulatory inquiries and high-stakes criminal defense.',
      email: 'm.sterling@nexoralaw.com',
      phone: '+1-800-555-0198',
      image_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800',
    },
    {
      slug: 'sophia-chen',
      name: 'Sophia Chen, LL.M.',
      title: 'Partner — Intellectual Property',
      specialization: 'Patent Litigation & Tech Law',
      bio: 'Advises Fortune 500 enterprises on multinational patent infringement defense and proprietary trade secret protection.',
      email: 's.chen@nexoralaw.com',
      phone: '+1-800-555-0197',
      image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs uppercase tracking-widest text-gold border border-gold/30">
          <Award className="w-4 h-4" />
          <span>Chambers Partners &amp; Counsel</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white">Attorneys of Distinction</h1>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Distinguished legal scholars, former federal prosecutors, and seasoned trial advocates committed to vigorous client representation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {attorneys.map((attorney) => (
          <div
            key={attorney.slug}
            className="glass-panel rounded-3xl overflow-hidden border border-neutral-800 hover:border-gold/50 transition-all flex flex-col group"
          >
            <div className="h-72 w-full overflow-hidden bg-neutral-900 relative">
              <img
                src={attorney.image_url}
                alt={attorney.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent"></div>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-gold block mb-1">
                  {attorney.specialization}
                </span>
                <h3 className="font-serif font-bold text-xl text-white group-hover:text-gold transition-colors">
                  {attorney.name}
                </h3>
                <p className="text-neutral-500 text-xs font-medium mt-0.5">{attorney.title}</p>
                <p className="text-neutral-400 text-xs leading-relaxed mt-3">{attorney.bio}</p>
              </div>

              <div className="pt-4 border-t border-neutral-900 space-y-2 text-xs text-neutral-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gold" />
                  <span className="font-mono text-[11px]">{attorney.email}</span>
                </div>
                {attorney.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold" />
                    <span className="font-mono text-[11px]">{attorney.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
