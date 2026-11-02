import { CONFIG } from '@/lib/config';
import FirmHome from '@/components/home/FirmHome';
import ProductHome from '@/components/home/ProductHome';

// HOME_MODE=product (default) shows the software landing page; HOME_MODE=firm shows the firm's own site.
export default function HomePage() {
  return CONFIG.site.homeMode === 'firm' ? <FirmHome /> : <ProductHome />;
}
