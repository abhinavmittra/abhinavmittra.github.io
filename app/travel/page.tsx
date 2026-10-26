import type {Metadata} from 'next';
import {TravelAtlas} from '@/components/travel/TravelAtlas';
import './travel.css';
export const metadata:Metadata={title:'29 countries · Abhinav’s travel map',description:'A personal map of 29 countries visited over four years. Explore the flags, turn the globe, and see where the next trip might lead.'};
export default function TravelPage(){return <TravelAtlas/>;}
