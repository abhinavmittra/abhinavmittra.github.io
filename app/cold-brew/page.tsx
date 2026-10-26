import type { Metadata, Viewport } from 'next';
import { ColdBrewStudio } from '@/components/cold-brew/ColdBrewStudio';
import './cold-brew.css';

export const metadata: Metadata={
  title:'A•WAKE Cold Brew · Home-brewed in Jaipur',
  description:'A•WAKE Classic, Fresh Cinnamon and Star Anise cold brew, home-brewed in small batches in Jaipur. ₹199 each. Choose a flavour and order on WhatsApp.'
};
export const viewport: Viewport={themeColor:'#15191d'};
export default function ColdBrewPage(){return <ColdBrewStudio/>;}
